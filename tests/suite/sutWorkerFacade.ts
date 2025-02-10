import type { ChannelSettings } from "browser-message-broker/dist/Types";
import type { TestSuite } from "./sut";

const workers = new Map<string, SutWorkerFacade>();

export interface ISutWorkerCommand {
  command: string;
  timestamp: number;
  channelName?: string;
  args?:
    | {
        name: string;
        settings: ChannelSettings;
      }
    | any;
}
export interface ISutWorkerResponse {
  command: string;
  timestamp: number;
  data?: any;
  error?: string;
}

export interface IPendingCommand {
  data: ISutWorkerCommand;
  status: "sent" | "received" | "error";
  reply?: {
    error?: string;
    data?: any;
  };
}

export class SutWorkerFacade implements TestSuite {
  worker(): SutWorkerFacade {
    throw Error("Method not allowed");
  }
  private _worker!: Worker;
  private isReady!: Promise<void>;
  constructor(name: string) {
    let sutWrap = workers.get(name);

    if (sutWrap != undefined) return sutWrap;

    const _w = new Worker("/dist/worker.js", {
      name,
    });

    let resolveIsReady: () => void;
    this.isReady = new Promise<void>((res) => {
      resolveIsReady = res;
    });

    _w.onmessage = (ev) => {
      if (ev.data === "ready") {
        resolveIsReady();
        return;
      }

      const resp = ev.data as ISutWorkerResponse;

      const cmd = (this.commands[resp.command] ?? [])?.find(
        (x) => x.data.timestamp === resp.timestamp
      );

      if (cmd != undefined) {
        cmd.status = "received";
        cmd.reply = {
          data: resp.data,
          error: resp.error,
        };
      }
    };

    _w.onerror = (ev) => {
      throw new Error(ev.message);
    };

    this._worker = _w;

    workers.set(name, this);
  }

  private commands: Record<string, IPendingCommand[]> = {};

  private async sendCommand(cmd: ISutWorkerCommand) {
    await this.isReady;

    const cmdName = `${cmd.channelName}:${cmd.command}`;
    const cc = this.commands[cmdName] ?? [];
    const pendingCmd: IPendingCommand = {
      data: cmd,
      status: "sent",
      reply: undefined,
    };

    this.commands[cmdName] = [...cc, pendingCmd];
    this._worker.postMessage(cmd);

    return pendingCmd;
  }

  private async sendRequest(
    channelName: string,
    commandName: string,
    timeout = 2000
  ) {
    await this.isReady;
    const cmd: ISutWorkerCommand = {
      command: commandName,
      timestamp: Date.now(),
      channelName,
    };

    let _res: (v: unknown) => void;
    const prom = new Promise<unknown>((res) => {
      _res = res;
    });

    const pendingCmd = await this.sendCommand(cmd);

    const _ts = Date.now() + timeout;

    const interval = setInterval(() => {
      if (Date.now() >= _ts) {
        clearInterval(interval);
        throw new Error(`No response after ${timeout}ms`);
      }

      if (pendingCmd.status === "sent") return;

      clearInterval(interval);

      if (
        pendingCmd.status === "error" ||
        pendingCmd.reply?.error != undefined
      ) {
        throw new Error(
          "Error from worker: " + (pendingCmd.reply?.error ?? "unknown")
        );
      }

      _res(pendingCmd.reply?.data);
    }, 3);

    return prom;
  }

  setup = {
    channel: (name: string, settings?: ChannelSettings) =>
      this.sendCommand({
        command: "setup.channel",
        timestamp: Date.now(),
        channelName: name,
        args: { name, settings },
      } as ISutWorkerCommand),

    channelSubscription: (channelName: string, subscriptionName: string) => "",

    nextMessagePromiseForChannel: (name: string) =>
      this.sendCommand({
        command: "setup.nextMessagePromise",
        timestamp: Date.now(),
        channelName: name,
      } as ISutWorkerCommand),

    existingStateForChannel: (name: string, state: unknown) =>
      this.sendCommand({
        command: "setup.existingStateForChannel",
        timestamp: Date.now(),
        channelName: name,
        args: state,
      } as ISutWorkerCommand),
  };

  channel(name: string) {
    return {
      getNextMessagePromiseValue: (timeout = 2000) =>
        this.sendRequest(name, "channel.nextMessage", timeout),

      getLatestSubscriberState: (subscriptionName: string) =>
        Promise.resolve() as Promise<unknown>,

      getCurrentState: async (timeout = 2000) =>
        this.sendRequest(name, "channel.currentState", timeout),

      sendMessage: (x: never) =>
        this.sendCommand({
          command: "channel.sendMessage",
          timestamp: Date.now(),
          channelName: name,
          args: x,
        }),
    };
  }
}
