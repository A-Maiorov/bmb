import { PubSubChannel } from "./PubSubChannel";
import { THandler } from "./Types";

type channelsCollection = {
  channel: PubSubChannel;
  handlerName: PropertyKey;
}[];

export function subscribe<T>(channel: PubSubChannel<T>) {
  let origConnCbk: Function | null = null;
  let origDisconCbk: Function | null = null;

  //@ts-ignore
  return (ctor, name) => {
    origConnCbk = ctor.connectedCallback;
    origDisconCbk = ctor.disconnectedCallback;

    if (
      ctor["__bmbChannels"] === undefined &&
      ctor["__bmbSubscriptionsDisposers"] === undefined
    )
      Object.assign(ctor as any, {
        __bmbSubscriptionsDisposers: new Map<
          string,
          Function
        >(),
        __bmbChannels: [],
        connectedCallback: function () {
          origConnCbk?.bind(this)();

          for (let c of this
            .__bmbChannels as channelsCollection) {
            //@ts-ignore
            const handler = this[c.handlerName].bind(this);

            this.__bmbSubscriptionsDisposers.set(
              `${
                c.channel.name
              }-${c.handlerName.toString()}`,
              c.channel.subscribe(handler as THandler<T>)
            );
          }
        },
        disconnectedCallback: function () {
          origDisconCbk?.bind(this)();
          for (let key of this.__bmbSubscriptionsDisposers.keys())
            this.__bmbSubscriptionsDisposers.get(key)?.();
        },
      });

    (
      ctor as unknown as {
        __bmbChannels: channelsCollection;
      }
    ).__bmbChannels.push({ channel, handlerName: name });
  };
}
