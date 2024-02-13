import {
  ChannelType,
  IBroadcastEnvelope,
  IBroadcastSyncEnvelope,
  IBroker,
  IBrokerState,
  ChannelSettings,
  ReqSubscription,
  Subscription,
  THandler,
} from "./Types";

const BROADCAST_SYNC = "broadcast-sync";
const BROWSER_MESSAGE_BROKER = "browser-message-broker";

function isBroadcastSync(e: IBroadcastEnvelope): e is IBroadcastSyncEnvelope {
  return e.channelName === BROADCAST_SYNC;
}

function isSyncReq(e: IBroadcastEnvelope) {
  return e.senderId != undefined && e.targetId == undefined;
}
function isSyncResp(e: IBroadcastEnvelope) {
  return e.senderId != undefined && e.targetId != undefined;
}

export const senderId = Math.random().toString(36).substring(2, 9);

function debounce<T extends Function>(func: T, timeout = 1) {
  let timer: number;
  return (...args: unknown[]) => {
    clearTimeout(timer);
    timer = setTimeout(() => {
      func(...args);
    }, timeout);
  };
}

const channelSettings = new Map<string, ChannelSettings>();

class Broker implements IBroker {
  trace: boolean = false;
  senderId = senderId;
  state = new Map<string, any>();
  subscribers = new Map<string, THandler[]>();
  broadcasts = new Set<string>();
  private __bcChannel = new BroadcastChannel(BROWSER_MESSAGE_BROKER);

  private log(message: string, channel: string, ...data: unknown[]) {
    if (this.trace || channelSettings.get(channel)?.trace) {
      console.groupCollapsed(
        `[${globalThis.constructor.name}(${this.senderId})-${channel}] ${message}`
      );
      console.log(data);
      console.trace();
      console.groupEnd();
    }
  }

  constructor() {
    this.__bcChannel.onmessage = this.handleBroadcast.bind(this);
    this.__bcChannel.onmessageerror = this.handleBroadcastError.bind(this);

    setTimeout(() => {
      this.__sendBrokerState(undefined, undefined); // always send initial sync request
    }, 0);

    this.sendBrokerState = debounce(this.__sendBrokerState.bind(this), 2);
  }

  ConfigureChannel(
    channelName: string,
    broadcast: boolean,
    cache: boolean,
    trace: boolean
  ): void {
    channelSettings.set(channelName, {
      broadcast: broadcast,
      cache: cache,
      trace,
    });

    if (cache) this.state.set(channelName, undefined);
    if (broadcast) this.broadcasts.add(channelName);
  }

  private handleBroadcastError(ev: MessageEvent<IBroadcastEnvelope>) {
    throw Error("BROADCAST FAILED: " + ev.data);
  }

  private sendBrokerState: (
    targetId?: string,
    filterBroadcasts?: string[]
  ) => void;
  private __sendBrokerState(targetId?: string, filterBroadcasts?: string[]) {
    let currentBroadcasts = Array.from(this.broadcasts.keys());

    if (filterBroadcasts && filterBroadcasts.length > 0) {
      currentBroadcasts = currentBroadcasts.filter((k) =>
        filterBroadcasts.includes(k)
      );
    }

    const availableState: { [x: string]: any } = {};
    for (const x of this.state) {
      if (!x[1]) continue;
      if (!currentBroadcasts.includes(x[0])) continue;
      availableState[x[0]] = x[1];
    }

    const state: IBrokerState = {
      id: senderId,
      availableState,
      broadcasts: currentBroadcasts,
    };

    const ev: IBroadcastSyncEnvelope = {
      channelName: BROADCAST_SYNC,
      senderCtx: globalThis.constructor.name,
      senderId,
      targetId,
      msg: state,
      channelType: "sync",
    };

    this.__bcChannel.postMessage(ev);

    if (targetId == undefined)
      this.log("Broadcast sync requested", "", {
        brokerState: state,
      });
    else
      this.log("Broadcast sync responded", "", {
        targetId,
        brokerState: state,
      });
  }

  private handleBroadcastSync(ev: IBroadcastSyncEnvelope) {
    if (isSyncReq(ev))
      return this.sendBrokerState(ev.senderId, ev.msg.broadcasts);
    if (isSyncResp(ev)) {
      for (const s of Object.entries(ev.msg.availableState)) {
        if (
          this.broadcasts.has(s[0]) &&
          this.state.has(s[0]) &&
          this.state.get(s[0]) == undefined
        ) {
          this.__notifySubscribers(s[0], s[1], ev.senderId);
        }

        this.log("Broadcast sync response handled", "", ev.msg);
      }
    }
  }

  private handleBroadcast(ev: MessageEvent<IBroadcastEnvelope>) {
    this.log("Broadcast received", ev.data.channelName, ev.data);

    if (ev.data.targetId != undefined && ev.data.targetId !== senderId) {
      this.log("Broadcast ignored (different targetId)", ev.data.channelName);
      return;
    }

    if (isBroadcastSync(ev.data)) return this.handleBroadcastSync(ev.data);

    switch (ev.data.channelType) {
      case "pubSub":
        this.__notifySubscribers(
          ev.data.channelName,
          ev.data.msg,
          ev.data.senderId
        );
        break;
      case "req":
        this.bridgeRequest(ev.data.channelName, ev.data.msg, ev.data.senderId);
        break;
      case "rep":
        const req = this.broadcastedRequests.get(ev.data.channelName);
        if (!req) return;

        req.resolve(ev.data.msg);
        this.broadcastedRequests.delete(ev.data.channelName);

        break;
    }

    this.log("Broadcast handled", ev.data.channelName, ev.data);
  }

  /**
   * Bridge pub/sub messages to broadcast channel
   * @param subsKey
   * @returns {Subscription}
   */
  private __configureBroadcast(subscription: Subscription<any>): void {
    if (!subscription.channelName) {
      throw new Error(`Invalid subscription`);
    }
    this.broadcasts.add(subscription.channelName);
    const originalDispose = subscription.dispose;
    subscription.dispose = () => {
      originalDispose();
      this.broadcasts.delete(subscription.channelName);
    };
    subscription.isBroadcast = true;

    this.sendBrokerState();
  }

  GetState<T>(subsKey: string): T | undefined {
    if (subsKey) {
      return this.state.get(subsKey) as T;
    } else {
      return undefined;
    }
  }

  async Broadcast(channelName: string, msg: unknown, targetId?: string) {
    this._broadcast(channelName, msg, "pubSub", targetId);
  }

  private async _broadcast(
    channelName: string,
    msg: unknown,
    channelType: ChannelType,
    targetId?: string
  ) {
    const settings = channelSettings.get(channelName);

    this.log(
      `Message broadcasted (${channelType}) to ${targetId || "all brokers"}`,
      channelName,
      msg
    );

    const _msg = await Promise.resolve(msg);
    const envelope: IBroadcastEnvelope = {
      channelName: channelName,
      senderCtx: globalThis.constructor.name,
      senderId: senderId,
      targetId: targetId,
      msg: _msg,
      channelType,
    };

    if (settings?.cache) this.state.set(channelName, msg);

    this.__bcChannel.postMessage(envelope);
  }

  async Publish(channelName: string, msg: unknown, targetId?: string) {
    this.log(`Message published`, channelName, msg);
    await this.__notifySubscribers(channelName, msg, senderId);

    if (!this.broadcasts.has(channelName)) return;

    this._broadcast(channelName, msg, "pubSub", targetId);
  }

  private __nextMessageAwaiters = new Map<
    string,
    {
      promise: Promise<unknown>;
      resolve: (msg: unknown) => unknown;
    }
  >();

  async nextMessage<T = unknown>(subsKey: string): Promise<T> {
    const a = this.__nextMessageAwaiters.get(subsKey);
    if (a) return a.promise as Promise<T>;

    const newAwaiter: {
      promise: Promise<unknown>;
      resolve: (msg: unknown) => void;
    } = {
      promise: undefined as unknown as Promise<T>,
      resolve: undefined as unknown as (msg: unknown) => void,
    };
    newAwaiter.promise = new Promise((res: (msg: unknown) => void) => {
      newAwaiter.resolve = res;
    });

    this.__nextMessageAwaiters.set(subsKey, newAwaiter);

    return newAwaiter.promise as Promise<T>;
  }

  Subscribe<T>(
    channelName: string,
    handler?: THandler<T>,
    broadcast = false,
    cache = true
  ): Subscription<T> {
    const settings = channelSettings.get(channelName);
    const settingsOverridden = false;
    if (settings) {
      broadcast = settings.broadcast || false;
      cache = settings.cache || true;
      settingsOverridden;
    }

    const subs = this.subscribers.get(channelName) || [];
    const hdl = handler as (msg: unknown) => void;
    subs.push(hdl);
    this.subscribers.set(channelName, subs);

    const subscription: Subscription<T> = {
      channelName: channelName,
      isCached: false,
      dispose: () => {
        const _subs = this.subscribers.get(channelName);

        if (_subs == undefined) return;
        const i = _subs.indexOf(hdl);

        if (i === -1) return;
        _subs.splice(i, 1);
      },
      publish: (msg, targetId?: string) =>
        this.Publish(channelName, msg, targetId),
      isDisposed: false,
    };

    if (broadcast) this.__configureBroadcast(subscription);
    if (cache) this.state.set(channelName, undefined);

    return subscription;
  }

  private bridgeRequest(
    channelName: string,
    requestData: unknown,
    senderId: string
  ) {
    const listener = this.requestListeners.get(channelName);

    if (!listener) return Promise.resolve(undefined);

    return listener.handler(requestData, senderId) as Promise<unknown>;
  }

  Request<TRep = unknown>(
    channelName: string,
    requestData: unknown,
    broadcast = false,
    targetId?: string
  ): Promise<TRep> | Promise<undefined> {
    if (!broadcast) {
      const listener = this.requestListeners.get(channelName);
      if (!listener) return Promise.resolve(undefined);
      return listener.handler(requestData) as Promise<TRep>;
    } else {
      this._broadcast(channelName, requestData, "req", targetId);
      const req = this.broadcastedRequests.get(channelName);
      if (req) req.resolve(undefined);

      let resolve = undefined as unknown as (r: unknown) => void;
      const promise = new Promise<TRep>(
        (res) => (resolve = res as (r: unknown) => void)
      );
      const breq = {
        promise,
        resolve,
      };
      this.broadcastedRequests.set(channelName, breq);
      return breq.promise;
    }
  }
  private broadcastedRequests = new Map<
    string,
    {
      promise: Promise<unknown>;
      resolve: (r: unknown) => void;
    }
  >();

  Reply<TReq = unknown, TRep = unknown>(
    channelName: string,
    handler: (req: TReq) => TRep,
    broadcast = false
  ) {
    if (broadcast) {
      const origHandler = handler;
      handler = ((msg: TReq, targetId: string) =>
        this._broadcast(
          channelName,
          origHandler(msg),
          "rep",
          targetId
        )) as unknown as (req: TReq) => TRep;
    }
    const reqListeners = this.requestListeners;
    const subs: ReqSubscription = {
      channelName,
      get isDisposed() {
        return reqListeners.has(channelName);
      },
      isBroadcast: broadcast,
      handler: handler as (r: unknown) => unknown,
      dispose: undefined as unknown as () => void,
    };

    subs.dispose = () => {
      subs.isDisposed = true;
      const currentListener = this.requestListeners.get(channelName);
      if (currentListener === subs) this.requestListeners.delete(channelName);
    };

    const currentListener = this.requestListeners.get(channelName);
    if (currentListener) {
      currentListener.isDisposed = true;
      console.warn("Request listener has been replaced: " + channelName);
    }
    this.requestListeners.set(channelName, subs);
    return subs;
  }

  requestListeners = new Map<string, ReqSubscription>();

  private async __notifySubscribers(
    channelName: string,
    msg: unknown,
    sId: string
  ) {
    const handlers = this.subscribers.get(channelName) || [];

    const allSubscribersPromises: Promise<void>[] = [];
    for (const h of handlers) {
      if (!h) continue;
      allSubscribersPromises.push(Promise.resolve(h(msg, sId)));
      this.log("Handler called", channelName, h);
    }

    await Promise.all(allSubscribersPromises);

    if (channelSettings.get(channelName)?.cache)
      this.state.set(channelName, msg);

    this.__handleAwaiter(channelName, msg);

    this.log("Message handled", channelName, msg, this);
  }

  private __handleAwaiter(subsKey: string, msg: unknown) {
    const awaiter = this.__nextMessageAwaiters.get(subsKey);
    if (!awaiter) return;

    awaiter.resolve(msg);

    this.__nextMessageAwaiters.delete(subsKey);
  }
}

globalThis.BrowserMessageBroker =
  globalThis.BrowserMessageBroker || new Broker();

export const BMB = globalThis.BrowserMessageBroker;
export * from "./PubSubChannel";
export * from "./ReqRepChannel";
