import { PubSubChannel } from "browser-message-broker";
import type { ChannelSettings } from "browser-message-broker/dist/Types";
import { SutWorkerFacade } from "./sutWorkerFacade";

const psChannels = new Map<string, PubSubChannel>();

const nextMessagePromises = new Map<string, Promise<any>>();

const subscriptionValue = new Map<string, unknown>();

const sut = {
  setup: {
    channel(name: string, settings?: ChannelSettings) {
      psChannels.set(name, PubSubChannel.for(name, settings));
    },
    channelSubscription(channelName: string, subscriptionName: string) {
      const channel = psChannels.get(channelName);
      if (!channel) {
        throw new Error(`Channel "${channelName}" is not configured`);
      }

      channel.subscribe((x) => {
        subscriptionValue.set(`${channelName}-${subscriptionName}`, x);
        console.log(
          `Set:  ${channelName}-${subscriptionName}`,
          x,
          subscriptionValue
        );
      });
    },
    nextMessagePromiseForChannel(name: string) {
      const channel = psChannels.get(name);
      if (!channel) {
        throw new Error(`Channel "${name}" is not configured`);
      }
      nextMessagePromises.set(name, channel.nextMessage());
    },
    existingStateForChannel(name: string, state: unknown) {
      const channel = psChannels.get(name);
      if (!channel) {
        throw new Error(`Channel "${name}" is not configured`);
      }
      BrowserMessageBroker.state.set(name, state);
    },
  },
  channel(name: string) {
    return {
      async getNextMessagePromiseValue() {
        const x = nextMessagePromises.get(name);
        if (x == undefined) {
          throw new Error(
            `Next message promise for channel "${name}" is not configured`
          );
        }
        return x;
      },
      async getLatestSubscriberState(subscriptionName: string) {
        console.log("Get: " + `${name}-${subscriptionName}`, subscriptionValue);
        return subscriptionValue.get(`${name}-${subscriptionName}`);
      },
      async getCurrentState() {
        const ch = psChannels.get(name);
        if (ch == undefined) {
          throw new Error(`Channel "${name}" is not configured`);
        }
        return ch.getState();
      },

      async sendMessage(x: unknown): Promise<any> {
        const ch = psChannels.get(name);
        if (ch == undefined) {
          throw new Error(`Channel "${name}" is not configured`);
        }
        await ch.send(x);
      },
    };
  },

  worker: (name: string) => {
    return new SutWorkerFacade(name);
  },
};

export type TestSuite = typeof sut;

declare global {
  var SUT: TestSuite;
}
globalThis.SUT = sut;
