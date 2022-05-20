import { BMB } from "browser-message-broker";
import { expect } from "@open-wc/testing";

describe("Browser Message Broker subscriber", () => {
  let received = false;

  //   BMB.Subscribe<TestMsg>(TestMsg.name, (x) => {
  //     received = true;
  //     receivedPayload = x.payload;
  //   });

  //   before(async () => {
  //     await BMB.Publish(TestMsg.name, new TestMsg());
  //   });

  //   it("should receive response from another component in current context", async () => {
  //     type TReq = { reqPayload: string };
  //     type TRep = { respPayload: string };

  //     //requester
  //     const req: TReq = { reqPayload: "this is request" };
  //     const reply = await BMB.Request<TRep>("reqRespTest", req);

  //     //respondent
  //     BMB.Reply<TReq>("reqRespTest", (req: TReq) => {});
  //   });
});
