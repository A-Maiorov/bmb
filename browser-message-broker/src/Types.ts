export interface Subscription<T> {
  dispose: () => void;
  publish: (msg: T, targetId?: string) => Promise<void>;
  key: string;
  isCached: boolean;
  isDisposed?: boolean;
  isBroadcast?: boolean;
}
export type THandler<T = unknown> = (
  msg: T,
  senderId: string
) => void | Promise<void>;

export interface IBroker {
  state: Map<string, any>;
  subscribers: Map<string, THandler[]>;
  trace: boolean;
  braodcasts: Set<string>;
  GetState<IStateItem>(subsKey: string): IStateItem | undefined;
  Subscribe<T>(
    subsKey: string,
    handler?: THandler<T>,
    enableBroadcast?: boolean,
    enableCaching?: boolean
  ): Subscription<T>;
  Publish: (subsKey: string, msg: unknown, targetId?: string) => Promise<void>;
  nextMessage<T>(subsKey: string): Promise<T>;
}

export interface IBroadcastEnvelope<T = unknown> {
  senderId: string;
  targetId?: string;
  subsKey: string;
  senderCtx: string;
  msg: T;
}

export interface IBrokerState {
  id: string;
  broadcasts: string[];
  availableState: { [x: string]: any };
}

export interface IBroadcastSyncEnvelope
  extends IBroadcastEnvelope<IBrokerState> {
  subsKey: "broadcast-sync";
  msg: IBrokerState;
}
declare global {
  var BrowserMessageBroker: IBroker;
}
