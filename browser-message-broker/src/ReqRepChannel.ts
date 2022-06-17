import { BMB } from "./Broker";
import { ChannelSettings, IReqRepChannel } from "./Types";

const reqRepChannels = new Map<string, ReqRepChannel>();

export class ReqRepChannel<TReq = unknown, TRep = unknown>
  implements IReqRepChannel<TReq, TRep>
{
  async request(msg: TReq): Promise<TRep | undefined> {
    return BMB.Request<TRep>(
      this.name,
      msg,
      this.settings.enableBroadcast
    );
  }

  reply(handler: (req: TReq) => TRep) {
    return BMB.Reply<TReq, TRep>(
      this.name,
      handler,
      this.settings.enableBroadcast
    ).dispose;
  }

  readonly type: "reqRep" = "reqRep";

  settings: ChannelSettings = {};

  dispose() {
    BMB.requestListeners.delete(this.name);
    reqRepChannels.delete(this.name);
  }

  readonly name: string = "";

  static getOrCreate<TReq = unknown, TRep = unknown>(
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
      settings.enableBroadcast || false,
      settings.enableCaching || false,
      settings.trace || false
    );
    const channel = new ReqRepChannel<TReq, TRep>(
      name,
      settings
    );
    reqRepChannels.set(name, channel);
    return channel;
  }
  private constructor(
    name: string,
    settings: ChannelSettings
  ) {
    this.name = name;
    this.settings = settings;
  }
}
