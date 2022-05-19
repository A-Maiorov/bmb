import {
  IBroadcastEnvelope,
  IBroadcastSyncEnvelope,
  IBroker,
  IBrokerState,
  Subscription,
  THandler,
} from "./Types";

const BROADCAST_SYNC = "broadcast-sync";
const BROWSER_MESSAGE_BROKER = "browser-message-broker";

function isBroadcastSync(e: IBroadcastEnvelope): e is IBroadcastSyncEnvelope {
  return e.subsKey === BROADCAST_SYNC;
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

class Broker implements IBroker {
  trace: boolean = false;
  senderId = senderId;
  state = new Map<string, any>();
  subscribers = new Map<string, THandler[]>();
  braodcasts = new Set<string>();
  private __bcChannel = new BroadcastChannel(BROWSER_MESSAGE_BROKER);

  constructor() {
    if (globalThis.constructor.name === "Window") {
      const ev = new CustomEvent("bmb-ready", { detail: this });
      globalThis.document.dispatchEvent(ev);
    }
    this.__bcChannel.onmessage = this.handleBroadcast.bind(this);
    this.__bcChannel.onmessageerror = this.handleBroadcastError.bind(this);

    this.sendBrokerState = debounce(this.__sendBrokerState.bind(this), 2);

    this.sendBrokerState();
  }

  private handleBroadcastError(ev: MessageEvent<IBroadcastEnvelope>) {
    throw Error("BROADCAST FAILED: " + ev.data);
  }

  private sendBrokerState: (
    targetId?: string,
    filterBroadcasts?: string[]
  ) => void;
  private __sendBrokerState(targetId?: string, filterBroadcasts?: string[]) {
    let currentBroadcasts = Array.from(this.braodcasts.keys());

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
      subsKey: BROADCAST_SYNC,
      senderCtx: globalThis.constructor.name,
      senderId,
      targetId,
      msg: state,
    };

    this.__bcChannel.postMessage(ev);

    if (this.trace)
      if (targetId == undefined)
        console.log("[Broadcast sync requested]", ev, this);
      else console.log("[Broadcast sync responded]", targetId, ev, this);
  }

  private handleBroadcastSync(ev: IBroadcastSyncEnvelope) {
    if (isSyncReq(ev))
      return this.sendBrokerState(ev.senderId, ev.msg.broadcasts);
    if (isSyncResp(ev)) {
      for (const s of Object.entries(ev.msg.availableState)) {
        if (
          this.braodcasts.has(s[0]) &&
          this.state.has(s[0]) &&
          this.state.get(s[0]) == undefined
        ) {
          this.__notifySubscribers(s[0], s[1], ev.senderId);
        }
        if (this.trace)
          console.log("[Broadcast sync responce handled]", ev, this);
      }
    }
  }

  private handleBroadcast(ev: MessageEvent<IBroadcastEnvelope>) {
    if (this.trace) console.log("[Broadcast received]", ev.data, this);

    if (ev.data.targetId != undefined && ev.data.targetId !== senderId) {
      if (this.trace) console.log("[Broadcast ignored]", ev.data, this);
      return;
    }

    if (isBroadcastSync(ev.data)) return this.handleBroadcastSync(ev.data);

    this.__notifySubscribers(ev.data.subsKey, ev.data.msg, ev.data.senderId);
    if (this.trace) console.log("[Broadcast handled]", ev.data, this);
  }

  /**
   * Bridge pub/sub messages to broadcast channel
   * @param subsKey
   * @returns {Subscription}
   */
  private __configureBroadcast(subscription: Subscription<any>): void {
    if (!subscription.key) {
      throw new Error(`Invalid subscription`);
    }
    this.braodcasts.add(subscription.key);
    const originalDispose = subscription.dispose;
    subscription.dispose = () => {
      originalDispose();
      this.braodcasts.delete(subscription.key);
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

  async Broadcast(subsKey: string, msg: unknown, targetId?: string) {
    if (this.trace) console.log("[Message broadcasted]", subsKey, msg, this);

    const envelope: IBroadcastEnvelope = {
      subsKey,
      senderCtx: globalThis.constructor.name,
      senderId: senderId,
      targetId: targetId,
      msg,
    };
    this.__bcChannel.postMessage(envelope);
  }

  async Publish(subsKey: string, msg: unknown, targetId?: string) {
    if (this.trace) console.log("[Message published]", subsKey, msg, this);
    await this.__notifySubscribers(subsKey, msg, senderId);

    if (!this.braodcasts.has(subsKey)) return;

    const envelope: IBroadcastEnvelope = {
      subsKey,
      senderCtx: globalThis.constructor.name,
      senderId: senderId,
      targetId: targetId,
      msg,
    };

    this.__bcChannel.postMessage(envelope);
  }

  private __nextMessageAwaters = new Map<
    string,
    { promise: Promise<unknown>; resolve: (msg: unknown) => unknown }
  >();

  async nextMessage<T = unknown>(subsKey: string): Promise<T> {
    const a = this.__nextMessageAwaters.get(subsKey);
    if (a) return a.promise as Promise<T>;

    const newA: {
      promise: Promise<unknown>;
      resolve: (msg: unknown) => void;
    } = {
      promise: undefined as unknown as Promise<T>,
      resolve: undefined as unknown as (msg: unknown) => void,
    };
    newA.promise = new Promise((res: (msg: unknown) => void) => {
      newA.resolve = res;
    });

    this.__nextMessageAwaters.set(subsKey, newA);

    return newA.promise as Promise<T>;
  }

  Subscribe<T>(
    key: string,
    handler?: THandler<T>,
    enableBroadcast = false,
    enableCaching = true
  ): Subscription<T> {
    const subs = this.subscribers.get(key) || [];
    const hdl = handler as (msg: unknown) => void;
    subs.push(hdl);
    this.subscribers.set(key, subs);

    const subscription: Subscription<T> = {
      key: key,
      isCached: false,
      dispose: () => {
        subs.splice(subs.indexOf(hdl), 1);
        subscription.isDisposed = true;
      },
      publish: (msg, targetId?: string) => this.Publish(key, msg, targetId),
      isDisposed: false,
    };

    if (enableBroadcast) this.__configureBroadcast(subscription);
    if (enableCaching) this.state.set(key, undefined);

    if (this.trace) console.log("[Subscribe]", subscription, this);
    return subscription;
  }

  private async __notifySubscribers(
    subsKey: string,
    msg: unknown,
    sId: string
  ) {
    const handlers = this.subscribers.get(subsKey) || [];

    const allSubscribersPromises: Promise<void>[] = [];
    for (const h of handlers) {
      if (!h) continue;
      allSubscribersPromises.push(Promise.resolve(h(msg, sId)));
      if (this.trace) console.log("[Handler called]", h, this);
    }

    await Promise.all(allSubscribersPromises);

    if (this.state.has(subsKey)) this.state.set(subsKey, msg);

    this.__handleAwaiter(subsKey, msg);

    if (this.trace) console.log("[Message handled]", subsKey, msg, this);
  }

  private __handleAwaiter(subsKey: string, msg: unknown) {
    const awaiter = this.__nextMessageAwaters.get(subsKey);
    if (!awaiter) return;

    awaiter.resolve(msg);

    this.__nextMessageAwaters.delete(subsKey);
  }
}

globalThis.BrowserMessageBroker =
  globalThis.BrowserMessageBroker || new Broker();

export const BMB = globalThis.BrowserMessageBroker;
export type { IBroker, Subscription } from "./Types";
