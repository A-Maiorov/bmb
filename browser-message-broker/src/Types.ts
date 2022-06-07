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
export type THandler<T = unknown> = (
  msg: T,
  senderId?: string
) => void | Promise<void>;

export interface IBroker {
  state: Map<string, any>;
  subscribers: Map<string, THandler[]>;
  trace: boolean;
  braodcasts: Set<string>;
  GetState<IStateItem>(channelName: string): IStateItem | undefined;
  ConfigureChannel(
    channelName: string,
    enableBroadcast: boolean,
    enableCaching: boolean,
    trace: boolean
  ): void;
  Subscribe<T>(
    channelName: string,
    handler?: THandler<T>,
    enableBroadcast?: boolean,
    enableCaching?: boolean
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
    enableBroadcast?: boolean
  ): Promise<TRep> | Promise<undefined>;
  Reply<TReq = unknown, TRep = unknown>(
    channelName: string,
    handler: (req: TReq) => TRep,
    enableBroadcast?: boolean
  ): ReqSubscription;
}

export type ChannelType = "pubSub" | "req" | "rep" | "sync";
export interface IBroadcastEnvelope<T = unknown> {
  senderId: string;
  targetId?: string;
  channelName: string;
  senderCtx: string;
  msg: T;
  channelType: ChannelType;
}

export interface IBrokerState {
  id: string;
  broadcasts: string[];
  availableState: { [x: string]: any };
}

export interface IBroadcastSyncEnvelope
  extends IBroadcastEnvelope<IBrokerState> {
  channelName: "broadcast-sync";
  msg: IBrokerState;
}
declare global {
  var BrowserMessageBroker: IBroker;
}
