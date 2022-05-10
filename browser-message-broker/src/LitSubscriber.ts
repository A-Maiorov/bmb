import { ReactiveController, ReactiveControllerHost } from "lit";
import type { Subscription } from "./Module";
const BMB = globalThis.BrowserMessageBroker;
if (!BMB) {
  throw Error("Cant find browser-message-broker");
}
export class LitSubscriber<T> implements ReactiveController {
  private __host: ReactiveControllerHost;
  private __subsKey: string;

  public state: T | undefined;
  private subscription: Subscription | undefined;

  constructor(host: ReactiveControllerHost, subsKey: string) {
    host.addController(this);
    this.__host = host;
    this.__subsKey = subsKey;
    this.state = BMB.GetState(subsKey);
  }

  hostConnected() {
    this.subscription = BMB.Subscribe<T>(this.__subsKey, (msg: T) => {
      this.state = msg;
      return this.__host.requestUpdate();
    });
  }

  hostDisconnected() {
    this.subscription?.dispose();
  }
}
