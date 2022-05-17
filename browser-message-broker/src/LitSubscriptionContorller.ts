import { ReactiveController, ReactiveControllerHost } from "lit";
import { IBroker, Subscription, THandler } from "./Types";

let BMB = globalThis.BrowserMessageBroker;

let resolveBroker: (b: IBroker) => void = () => {};
let bmbReady = Promise.resolve(BMB);
if (!BMB && globalThis.constructor.name === "Window") {
  bmbReady = new Promise<IBroker>((res) => {
    resolveBroker = res;
  });
  const handler = ((e: CustomEvent<IBroker>) => {
    BMB = e.detail;
    resolveBroker(BMB);
    globalThis.document.removeEventListener("bmb-ready", handler);
  }) as EventListenerOrEventListenerObject;
  globalThis.document.addEventListener("bmb-ready", handler);
}

export class SubscriptionContorller<T> implements ReactiveController {
  private __host: ReactiveControllerHost;
  private __subsKey: string;

  public state: T | undefined;
  public subscription: Subscription<T> | undefined;
  private __enableBroadcast: boolean;
  private __customHandler?: THandler<T>;
  private __enableCaching: boolean;
  constructor(
    host: ReactiveControllerHost,
    subsKey: string,
    enableBroadcast: boolean = false,
    enableCaching: boolean = true,
    customHandler?: THandler<T>
  ) {
    host.addController(this);
    this.__host = host;
    this.__subsKey = subsKey;
    this.__enableBroadcast = enableBroadcast;
    this.__enableCaching = enableCaching;
    this.__customHandler = customHandler;
    this.configure();
  }

  private async configure() {
    const bmb = await bmbReady;
    this.state = bmb.GetState(this.__subsKey);
    this.__host.requestUpdate();
  }

  private async __defaultHandler(msg: T | undefined) {
    this.state = msg;
    this.__host.requestUpdate();
  }

  async hostConnected() {
    await bmbReady;

    this.subscription = BMB.Subscribe<T>(
      this.__subsKey,
      this.__customHandler || (this.__defaultHandler.bind(this) as THandler<T>),
      this.__enableBroadcast,
      this.__enableCaching
    );
  }

  async hostDisconnected() {
    this.dispose();
  }

  async dispose() {
    await bmbReady;
    this.subscription?.dispose();
  }
}
