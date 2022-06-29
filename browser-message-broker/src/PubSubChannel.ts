import { BMB } from "./Broker";
import {
  Disposer,
  ChannelSettings,
  IPubSubChannel,
  THandler,
} from "./Types";

const pubSubChannels = new Map<string, PubSubChannel>();

export class PubSubChannel<TMsg = any>
  implements IPubSubChannel<TMsg>
{
  static for<TMsg>(
    name: string,
    settings?: ChannelSettings
  ): PubSubChannel<TMsg> {
    if (!settings) {
      const c = pubSubChannels.get(name);
      if (!c) throw Error("Can't find channel settings");
      return c as PubSubChannel<TMsg>;
    }

    BMB.ConfigureChannel(
      name,
      settings.broadcast || false,
      settings.cache || false,
      settings.trace || false
    );
    const channel = new PubSubChannel<TMsg>(name, settings);
    pubSubChannels.set(name, channel);
    return channel;
  }

  private constructor(
    name: string,
    settings: ChannelSettings
  ) {
    this.name = name;
    this.settings = settings;
  }

  async send(msg: TMsg, targetId?: string): Promise<void> {
    BMB.Publish(this.name, msg, targetId);
  }
  static async publish<TMsg = any>(
    name: string,
    msg: TMsg,
    targetId?: string
  ) {
    BMB.Publish(name, msg, targetId);
  }
  static async broadcast<TMsg = any>(
    name: string,
    msg: TMsg,
    targetId?: string
  ) {
    BMB.Broadcast<TMsg>(name, msg, targetId);
  }

  subscribe(handler: THandler<TMsg>): Disposer {
    const s = BMB.Subscribe(
      this.name,
      handler,
      this.settings.broadcast,
      this.settings.cache
    );
    return s.dispose;
  }

  getState(): TMsg | undefined {
    return BMB.GetState(this.name);
  }
  static GetState<TMsg>(name: string) {
    return BMB.GetState<TMsg>(name);
  }

  nextMessage(): Promise<TMsg> {
    return BMB.nextMessage(this.name);
  }

  static nextMessage<TMsg>(name: string): Promise<TMsg> {
    return BMB.nextMessage(name);
  }

  readonly type = "pubSub";
  readonly dispose = () => {
    BMB.subscribers.delete(this.name);
    pubSubChannels.delete(this.name);
  };

  readonly name: string = "";
  readonly settings: ChannelSettings = {};
}
