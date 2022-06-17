import {
  PubSubChannel,
  ReqRepChannel,
} from "browser-message-broker";
import {
  PUB_SUB_REQUEST_SUBSCRIPTION_KEY,
  PUB_SUB_RESPONSE_SUBSCRIPTION_KEY,
  REQ_REP_CHANNEL_NAME,
} from "./constants";

PubSubChannel.getOrCreate(
  PUB_SUB_REQUEST_SUBSCRIPTION_KEY,
  {
    enableBroadcast: true,
  }
).subscribe((_) => {
  PubSubChannel.broadcast(
    PUB_SUB_RESPONSE_SUBSCRIPTION_KEY,
    { payload: "response" }
  );
});

ReqRepChannel.getOrCreate<
  { payload: string },
  { payload: string }
>(REQ_REP_CHANNEL_NAME, {
  enableBroadcast: true,
}).reply((req) => {
  return { payload: req.payload + "response" };
});

//let window know that worker is ready and execute test
postMessage("ready");
