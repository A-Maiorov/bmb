import { runTests } from "@web/test-runner-mocha";
import { expect } from "@open-wc/testing";
import { BMB } from "browser-message-broker";
import {
  PUB_SUB_REQUEST_SUBSCRIPTION_KEY,
  PUB_SUB_RESPONSE_SUBSCRIPTION_KEY,
  REQ_REP_CHANNEL_NAME,
} from "./constants";

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

function setup() {
  //wait for worker
  testWorker.onmessage = (m) => {
    if (m.data == "ready") {
      _resolveWorkerIsReady();
    }
  };

  //Configure subscription to ask worker to send response via PUB-SUB channel
  BMB.Subscribe(PUB_SUB_REQUEST_SUBSCRIPTION_KEY, undefined, true);

  //Configure subscription to receive response message from worker via PUB-SUB channel
  BMB.Subscribe<testMsg>(
    PUB_SUB_RESPONSE_SUBSCRIPTION_KEY,
    (m) => {
      const el = document.getElementById("test");
      if (el) {
        el.innerHTML = m.payload;
      }
      _resolveResponseReceived();
    },
    true
  );
}

export function test() {
  runTests(async () => {
    setup();

    describe("Broadcast messages to/from WebWorker", () => {
      it("Should eventually receive and display response from WebWorker via pub-sub channel", async () => {
        await workerIsReady;

        BMB.Publish(PUB_SUB_REQUEST_SUBSCRIPTION_KEY, { payload: "request" });

        await responseReceived;

        const el = document.getElementById("test");
        expect(el).lightDom.to.equal("response");
      });

      it("Should eventually receive and display response from WebWorker via request-reply channel", async () => {
        const response = await BMB.Request<{ payload: string }>(
          REQ_REP_CHANNEL_NAME,
          {
            payload: "request",
          },
          true
        );

        expect(response).to.be.not.undefined;
        expect(response?.payload).to.equal("requestresponse");
      });
    });
  });
}
