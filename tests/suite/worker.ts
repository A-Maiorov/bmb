import "./sut";
import type { ISutWorkerCommand, ISutWorkerResponse } from "./sutWorkerFacade";

BrowserMessageBroker.traceBroadcasts = true;
BrowserMessageBroker.traceMessages = true;

BrowserMessageBroker.senderId = self.name;

self.postMessage("ready");
console.log(`Worker "${self.name}" is ready`);

self.onmessage = async (ev) => {
  const cmd = ev.data as ISutWorkerCommand;

  if (cmd.channelName == undefined) {
    throw Error("Invalid command");
  }

  switch (cmd.command) {
    case "setup.reply": {
      SUT.setup.reply(
        cmd.channelName,
        cmd.args.settings,
        cmd.args.replyValue,
        cmd.args.delayMs
      );
      self.postMessage({
        command: `${cmd.channelName}:${cmd.command}`,
        timestamp: cmd.timestamp,
      } as ISutWorkerResponse);
      break;
    }
    case "setup.request": {
      SUT.setup.request(cmd.channelName, cmd.args.settings);
      self.postMessage({
        command: `${cmd.channelName}:${cmd.command}`,
        timestamp: cmd.timestamp,
      } as ISutWorkerResponse);
      break;
    }
    case "setup.channel": {
      SUT.setup.channel(cmd.channelName, cmd.args.settings);
      self.postMessage({
        command: `${cmd.channelName}:${cmd.command}`,
        timestamp: cmd.timestamp,
      } as ISutWorkerResponse);
      break;
    }
    case "setup.nextMessagePromise": {
      SUT.setup.nextMessagePromiseForChannel(cmd.channelName);
      self.postMessage({
        command: `${cmd.channelName}:${cmd.command}`,
        timestamp: cmd.timestamp,
      } as ISutWorkerResponse);
      break;
    }
    case "channel.nextMessage": {
      const data = await SUT.channel(
        cmd.channelName
      ).getNextMessagePromiseValue();
      self.postMessage({
        command: `${cmd.channelName}:${cmd.command}`,
        timestamp: cmd.timestamp,
        data,
      } as ISutWorkerResponse);
      break;
    }

    case "channel.currentState": {
      const data = await SUT.channel(cmd.channelName).getCurrentState();

      self.postMessage({
        command: `${cmd.channelName}:${cmd.command}`,
        timestamp: cmd.timestamp,
        data,
      } as ISutWorkerResponse);
      break;
    }
    case "channel.sendMessage": {
      SUT.channel(cmd.channelName).sendMessage(cmd.args);
      break;
    }
    case "channel.sendRequest": {
      const data = SUT.channel(cmd.channelName).sendRequest(cmd.args);
      self.postMessage({
        command: `${cmd.channelName}:${cmd.command}`,
        timestamp: cmd.timestamp,
        data,
      } as ISutWorkerResponse);
      break;
    }
  }
};
