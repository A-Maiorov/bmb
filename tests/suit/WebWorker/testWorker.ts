import { BMB } from "browser-message-broker";

const responseToWindow = BMB.Subscribe("testResp").broadcast();

const requestFromWindow = BMB.Subscribe("testReq", (_) => {
  BMB.Publish("testResp", { payload: "response" });
}).broadcast();

//let window know that worker is ready and execute test
postMessage("ready");
