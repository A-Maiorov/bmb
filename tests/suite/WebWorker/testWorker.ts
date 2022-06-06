import { BMB } from "browser-message-broker";
import {
  PUB_SUB_REQUEST_SUBSCRIPTION_KEY,
  PUB_SUB_RESPONSE_SUBSCRIPTION_KEY,
  REQ_REP_CHANNEL_NAME,
} from "./constants";

const pubSubChannelToWindow = BMB.Subscribe(
  PUB_SUB_RESPONSE_SUBSCRIPTION_KEY,
  undefined,
  true
);

BMB.Subscribe(
  PUB_SUB_REQUEST_SUBSCRIPTION_KEY,
  (_) => {
    pubSubChannelToWindow.publish({ payload: "response" });
  },
  true
);

BMB.Reply(
  REQ_REP_CHANNEL_NAME,
  (req: { payload: string }) => {
    return { payload: req.payload + "response" };
  },
  true
);

//let window know that worker is ready and execute test
postMessage("ready");
