import { decorateProperty } from "@lit/reactive-element/decorators/base.js";
import { PubSubChannel } from "browser-message-broker";
import { THandler } from "browser-message-broker/dist/Types";
import { ReactiveElement } from "lit";

type channelsCollection = {
  channel: PubSubChannel;
  handlerName: PropertyKey;
}[];

export function subscribe<T>(channel: PubSubChannel<T>) {
  let origConnCbk: Function | null = null;
  let origDisconCbk: Function | null = null;

  return decorateProperty({
    finisher: (
      ctor: typeof ReactiveElement,
      name: PropertyKey
    ) => {
      origConnCbk = ctor.prototype.connectedCallback;
      origDisconCbk = ctor.prototype.disconnectedCallback;

      if (
        //@ts-ignore
        ctor.prototype["__bmbChannels"] === undefined &&
        //@ts-ignore
        ctor.prototype["__bmbSubscriptionsDisposers"] ===
          undefined
      )
        Object.assign(ctor.prototype as any, {
          __bmbSubscriptionsDisposers: new Map<
            string,
            Function
          >(),
          __bmbChannels: [],
          connectedCallback: function () {
            origConnCbk?.bind(this)();

            for (let c of this
              .__bmbChannels as channelsCollection) {
              const handler = //@ts-ignore
                this[c.handlerName].bind(this);

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
        ctor.prototype as unknown as {
          __bmbChannels: channelsCollection;
        }
      ).__bmbChannels.push({ channel, handlerName: name });
    },
  });
}
