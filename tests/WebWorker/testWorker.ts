import { PubSubChannel, ReqRepChannel } from "browser-message-broker";
import {
  PUB_SUB_CHANNEL_NAME,
  REQ_REP_CHANNEL_NAME,
  type TestMsg,
} from "./types";

PubSubChannel.for<TestMsg>(PUB_SUB_CHANNEL_NAME, {
  broadcast: true,
}).subscribe((_) => {
  PubSubChannel.broadcast(PUB_SUB_CHANNEL_NAME, {
    payload: "response",
  });
});

ReqRepChannel.for<{ payload: string }, { payload: string }>(
  REQ_REP_CHANNEL_NAME,
  {
    broadcast: true,
  }
).reply((req) => {
  return { payload: req.payload + "response" };
});

//let window know that worker is ready and execute test
postMessage("ready");
