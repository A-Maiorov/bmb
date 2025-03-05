export type Disposer = () => void;
export interface IChannel {
  type: "pubSub" | "reqRep";
  dispose: () => void;
  name: string;
  settings: ChannelSettings;
}
export type ChannelSettings = {
  broadcast?: boolean;
  cache?: boolean;
  trace?: boolean;
} & {};
export interface IPubSubChannel<TMsg> extends IChannel {
  send: (msg: TMsg, targetId?: string) => Promise<void>;
  subscribe(handler: THandler<TMsg>): Disposer;
  getState: () => TMsg | undefined;
  nextMessage: () => Promise<TMsg>;
  type: "pubSub";
  senderId: string;
}

export interface IReqRepChannel<TReq = unknown, TRep = unknown>
  extends IChannel {
  request: (msg: TReq, targetId?: string) => Promise<TRep | undefined>;
  reply: (handler: (req: TReq) => TRep) => Disposer;
  type: "reqRep";
  senderId: string;
}

export interface Subscription<T> {
  dispose: () => void;
  publish: (msg: T, targetId?: string) => Promise<void>;
  channelName: string;
  isCached: boolean;
  isDisposed?: boolean;
  isBroadcast?: boolean;
}
export interface ReqSubscription<TReq = unknown, TRep = unknown> {
  channelName: string;
  isDisposed: boolean;
  isBroadcast?: boolean;
  handler: (r: TReq, targetId?: string) => TRep;
  dispose: () => void;
}
export type THandler<T = any> = (
  msg: T,
  senderId?: string
) => void | Promise<void>;

export interface IBroker {
  state: Map<string, any>;
  subscribers: Map<string, THandler[]>;
  requestListeners: Map<string, ReqSubscription>;
  senderId: string;
  trace: boolean;
  traceBroadcasts: boolean;
  traceMessages: boolean;
  broadcasts: Set<string>;
  GetState<IStateItem>(channelName: string): IStateItem | undefined;

  ConfigureChannel(
    channelName: string,
    broadcast: boolean,
    cache: boolean,
    trace: boolean
  ): void;
  Subscribe<T>(
    channelName: string,
    handler?: THandler<T>,
    broadcast?: boolean,
    cache?: boolean
  ): Subscription<T>;
  Publish<T = unknown>(
    subsKey: string,
    msg?: T,
    targetId?: string
  ): Promise<void>;
  Broadcast<T = unknown>(
    channelName: string,
    msg?: T,
    targetId?: string
  ): Promise<void>;
  nextMessage<T>(subsKey: string): Promise<T>;
  Request<TRep = unknown>(
    channelName: string,
    requestData: unknown,
    broadcast?: boolean
  ): Promise<TRep> | Promise<undefined>;
  Reply<TReq = unknown, TRep = unknown>(
    channelName: string,
    handler: (req: TReq) => TRep | Promise<TRep>,
    broadcast?: boolean
  ): ReqSubscription;
}

export type ChannelType = "pubSub" | "req" | "rep"; // | "sync";
export interface IBroadcastEnvelope<T = any> {
  senderId: string;
  targetId?: string;
  channelName: string;
  senderCtx: string;
  msg: T;
  channelType: ChannelType;
}

// export interface IBrokerState {
//   id: string;
//   broadcasts: string[];
//   availableState: { [x: string]: any };
//   reqAwaiters: { channelName: string; requestData: unknown }[];
// }

// export interface IBroadcastSyncEnvelope
//   extends IBroadcastEnvelope<IBrokerState> {
//   channelName: "broadcast-sync";
//   msg: IBrokerState;
// }

declare global {
  var BrowserMessageBroker: IBroker;
}
