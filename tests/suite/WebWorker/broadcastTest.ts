import { runTests } from "@web/test-runner-mocha";
import { expect } from "@open-wc/testing";
import {
  ReqRepChannel,
  PubSubChannel,
} from "browser-message-broker";
import {
  PUB_SUB_REQUEST_SUBSCRIPTION_KEY,
  PUB_SUB_RESPONSE_SUBSCRIPTION_KEY,
  REQ_REP_CHANNEL_NAME,
} from "./constants";

//this url is relative to browser
var testWorker = new Worker(
  "suite/WebWorker/testWorker.js"
);

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

  //Configure channel to receive response message from worker via PUB-SUB channel
  PubSubChannel.getOrCreate<testMsg>(
    PUB_SUB_RESPONSE_SUBSCRIPTION_KEY,
    {
      enableBroadcast: true,
    }
  ).subscribe((m) => {
    const el = document.getElementById("test");
    if (el) {
      el.innerHTML = m.payload;
    }
    _resolveResponseReceived();
  });
}

export function test() {
  runTests(async () => {
    setup();

    describe("Broadcast messages to/from WebWorker", () => {
      it("Should eventually receive and display response from WebWorker via pub-sub channel", async () => {
        await workerIsReady;

        // Broadcast message to worker using short syntax (automatically created channel)
        PubSubChannel.broadcast(
          PUB_SUB_REQUEST_SUBSCRIPTION_KEY,
          {
            payload: "request",
          }
        );

        await responseReceived;

        const el = document.getElementById("test");
        expect(el).lightDom.to.equal("response");
      });

      it("Should eventually receive and display response from WebWorker via request-reply channel", async () => {
        await workerIsReady;

        type TMsg = {
          payload: string;
        };
        const response = await ReqRepChannel.getOrCreate<
          TMsg,
          TMsg
        >(REQ_REP_CHANNEL_NAME, {
          enableBroadcast: true,
        }).request({
          payload: "request",
        });

        expect(response).to.be.not.undefined;
        expect(response?.payload).to.equal(
          "requestresponse"
        );
      });
    });
  });
}
