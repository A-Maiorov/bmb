import { ReqRepChannel } from "browser-message-broker";
import { expect } from "@open-wc/testing";

describe("Browser Message Broker subscriber", () => {
  it("should receive response from another component in current context", async () => {
    type TReq = { reqPayload: string };
    type TRep = { respPayload: string };

    const requestStr = "request";
    const responseStr = "response";
    const channelName = "reqRespTest";

    //Arrange listener before making request
    const channel = ReqRepChannel.for<TReq, TRep>(
      channelName,
      {}
    );
    channel.reply((req: TReq) => {
      return {
        respPayload: req.reqPayload + responseStr,
      } as TRep;
    });

    const req: TReq = { reqPayload: requestStr };
    const reply = await channel.request(req);

    expect(reply).to.be.not.undefined;
    expect((reply as TRep).respPayload).to.equal(
      requestStr + responseStr
    );
  });
});
