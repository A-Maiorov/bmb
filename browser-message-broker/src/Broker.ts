export interface Subscription {
  dispose: () => void;
  broadcast: () => void;
  key: string;
  isDisposed?: boolean;
  isBroadcast?: boolean;
}

export interface IBroker {
  state: Map<string, Object>;
  subscribers: Map<string, ((msg: unknown) => void | Promise<void>)[]>;
  braodcasts: Map<string, BroadcastChannel>;
  GetState<T>(subsKey: string): T | undefined;
  Subscribe<T>(
    subsKey: string,
    handler?: (msg: T) => void,
    configureBroadcast?: boolean
  ): Subscription;
  Publish(subsKey: string, msg: Object): Promise<void>;
}
declare global {
  var BrowserMessageBroker: IBroker;
}

class Broker implements IBroker {
  state = new Map<string, Object>();
  subscribers = new Map<string, ((msg: unknown) => void | Promise<void>)[]>();
  braodcasts = new Map<string, BroadcastChannel>();
  /**
   * Creates BroadcastChannel and automatically bridges pub/sub messages to this channel
   * @param subsKey
   * @returns {Subscription}
   */
  private __configureBroadcast(subscription: Subscription): void {
    if (!subscription.key) {
      throw new Error(`Invalid subscription`);
    }
    const bc = new BroadcastChannel(subscription.key);
    bc.onmessage = (ev) => {
      this.__notifySubscribers(subscription.key, ev.data);
    };
    bc.onmessageerror = (ev) => {
      throw Error("Broadcast failed: " + ev.data);
    };

    this.braodcasts.set(subscription.key, bc);

    subscription.dispose = () => {
      bc.close();
      subscription.dispose();
      this.braodcasts.delete(subscription.key);
    };
    subscription.isBroadcast = true;
  }

  GetState<T>(subsKey: string): T | undefined {
    if (subsKey) {
      return this.state.get(subsKey) as T;
    } else {
      return undefined;
    }
  }

  private async __notifySubscribers(subsKey: string, msg: Object) {
    const handlers = this.subscribers.get(subsKey) || [];

    const allSubscribersPromises: Promise<void>[] = [];
    for await (const h of handlers) {
      const res = h(msg);
      allSubscribersPromises.push(Promise.resolve(res));
    }

    await Promise.all(allSubscribersPromises);
    this.state.set(subsKey, msg);
  }

  async Publish(subsKey: string, msg: Object) {
    await this.__notifySubscribers(subsKey, msg);
    const bc = this.braodcasts.get(subsKey);
    if (bc) bc.postMessage(msg);
  }

  Subscribe<T>(
    key: string,
    handler: (msg: T) => void = () => {}
  ): Subscription {
    const subs = this.subscribers.get(key) || [];
    const hdl = handler as (msg: unknown) => void;
    subs.push(hdl);
    this.subscribers.set(key, subs);
    const subscription: Subscription = {
      key: key,
      dispose: () => {
        subs.splice(subs.indexOf(hdl), 1);
        subscription.isDisposed = true;
      },
      broadcast: () => {},
      isDisposed: false,
    };
    subscription.broadcast = () => {
      this.__configureBroadcast(subscription);
      return subscription;
    };

    return subscription;
  }
}

globalThis.BrowserMessageBroker =
  globalThis.BrowserMessageBroker || new Broker();

export const BMB = globalThis.BrowserMessageBroker;
