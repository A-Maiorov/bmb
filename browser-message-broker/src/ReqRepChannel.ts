import { BMB } from "./Broker";
import { ChannelSettings, IReqRepChannel } from "./Types";

const reqRepChannels = new Map<string, ReqRepChannel>();

export class ReqRepChannel<TReq = unknown, TRep = unknown>
  implements IReqRepChannel<TReq, TRep>
{
  async request(msg?: TReq): Promise<TRep | undefined> {
    return BMB.Request<TRep>(this.name, msg, this.settings.broadcast);
  }

  reply(handler: (req: TReq) => TRep | Promise<TRep>) {
    return BMB.Reply<TReq, TRep>(this.name, handler, this.settings.broadcast)
      .dispose;
  }

  readonly type: "reqRep" = "reqRep";

  settings: ChannelSettings = {};

  dispose() {
    BMB.requestListeners.delete(this.name);
    reqRepChannels.delete(this.name);
  }

  readonly name: string = "";

  static for<TReq = unknown, TRep = unknown>(
    name: string,
    settings?: ChannelSettings
  ): ReqRepChannel<TReq, TRep> {
    if (!settings) {
      const c = reqRepChannels.get(name);
      if (!c) throw Error("Can't find channel settings");
      return c as ReqRepChannel<TReq, TRep>;
    }

    BMB.ConfigureChannel(
      name,
      settings.broadcast || false,
      settings.cache || false,
      settings.trace || false
    );
    const channel = new ReqRepChannel<TReq, TRep>(name, settings);
    reqRepChannels.set(name, channel);
    return channel;
  }
  private constructor(name: string, settings: ChannelSettings) {
    this.name = name;
    this.settings = settings;
  }
  senderId = BMB.senderId;
}
