import { runTests } from "@web/test-runner-mocha";
import { expect } from "@open-wc/testing";
import { BMB } from "browser-message-broker";

//this url is relative to browser
var testWorker = new Worker("suite/WebWorker/testWorker.js");

interface testMsg {
  payload: string;
}

let _resolveWorkerIsReady: () => void;
const workerIsReady = new Promise<void>((res) => {
  _resolveWorkerIsReady = res;
});

let _resolveResponseReceived: () => void;
const responseReceived = new Promise<void>((res) => {
  _resolveResponseReceived = res;
});

const REQUEST_SUBSCRIPTION_KEY = "testReq";
const RESPONSE_SUBSCRIPTION_KEY = "testResp";

function setup() {
  //wait for worker
  testWorker.onmessage = (m) => {
    if (m.data == "ready") {
      _resolveWorkerIsReady();
    }
  };

  //Configure subscription to ask worker to send response
  BMB.Subscribe(REQUEST_SUBSCRIPTION_KEY).enableBroadcast();

  //Configure subscription to receive response message from worker
  BMB.Subscribe<testMsg>(RESPONSE_SUBSCRIPTION_KEY, (m) => {
    const el = document.getElementById("test");
    if (el) {
      el.innerHTML = m.payload;
    }
    _resolveResponseReceived();
  }).enableBroadcast();
}

export function test() {
  runTests(async () => {
    setup();
    describe("Broadcast messages to/from WebWorker", () => {
      it("Should eventually receive and display response from WebWorker", async () => {
        await workerIsReady;

        BMB.Publish("testReq", { payload: "request" });

        await responseReceived;

        const el = document.getElementById("test");
        expect(el).lightDom.to.equal("response");
      });
    });
  });
}
