import { BMB } from "browser-message-broker";

const responseToWindow = BMB.Subscribe("testResp", undefined, true);

const requestFromWindow = BMB.Subscribe(
  "testReq",
  (_) => {
    BMB.Publish("testResp", { payload: "response" });
  },
  true
);

//let window know that worker is ready and execute test
postMessage("ready");
