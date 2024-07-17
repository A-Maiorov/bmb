// ../browser-message-broker/dist/Module.js
var b = /* @__PURE__ */ new Map();
var w = class d {
  constructor(e, s) {
    this.type = "reqRep";
    this.settings = {};
    this.name = "";
    this.senderId = a.senderId;
    this.name = e, this.settings = s;
  }
  async request(e) {
    return a.Request(this.name, e, this.settings.broadcast);
  }
  reply(e) {
    return a.Reply(this.name, e, this.settings.broadcast).dispose;
  }
  dispose() {
    a.requestListeners.delete(this.name), b.delete(this.name);
  }
  static for(e, s) {
    if (!s) {
      let n = b.get(e);
      if (!n)
        throw Error("Can't find channel settings");
      return n;
    }
    a.ConfigureChannel(e, s.broadcast || false, s.cache || false, s.trace || false);
    let t = new d(e, s);
    return b.set(e, t), t;
  }
};
var m = "broadcast-sync";
var R = "browser-message-broker";
function q(d3) {
  return d3.channelName === m;
}
function k(d3) {
  return d3.senderId != null && d3.targetId == null;
}
function B(d3) {
  return d3.senderId != null && d3.targetId != null;
}
var h = Math.random().toString(36).substring(2, 9);
function M(d3, e = 1) {
  let s;
  return (...t) => {
    clearTimeout(s), s = setTimeout(() => {
      d3(...t);
    }, e);
  };
}
var l = /* @__PURE__ */ new Map();
var f = class {
  constructor() {
    this.trace = false;
    this.traceBroadcasts = false;
    this.traceMessages = false;
    this.senderId = h;
    this.state = /* @__PURE__ */ new Map();
    this.subscribers = /* @__PURE__ */ new Map();
    this.broadcasts = /* @__PURE__ */ new Set();
    this.__bcChannel = new BroadcastChannel(R);
    this.__nextMessageAwaiters = /* @__PURE__ */ new Map();
    this.broadcastedRequests = /* @__PURE__ */ new Map();
    this.requestListeners = /* @__PURE__ */ new Map();
    this.activeNotifications = /* @__PURE__ */ new Set();
    this.__bcChannel.onmessage = this.handleBroadcast.bind(this), this.__bcChannel.onmessageerror = this.handleBroadcastError.bind(this), setTimeout(() => {
      this.__sendBrokerState(void 0, void 0);
    }, 0), this.sendBrokerState = M(this.__sendBrokerState.bind(this), 2);
  }
  log(e, s, t) {
    let n = l.get(s);
    (this.trace || n?.trace || n?.broadcast && this.traceBroadcasts || !n?.broadcast && this.traceMessages) && (console.groupCollapsed(`[${globalThis.constructor.name}(${this.senderId})-${s}] ${e}`), console.log(t), console.trace(), console.groupEnd());
  }
  ConfigureChannel(e, s, t, n) {
    l.set(e, { broadcast: s, cache: t, trace: n }), t && !this.state.has(e) && this.state.set(e, void 0), s && this.broadcasts.add(e);
  }
  handleBroadcastError(e) {
    throw Error("BROADCAST FAILED: " + e.data);
  }
  __sendBrokerState(e, s) {
    let t = Array.from(this.broadcasts.keys());
    s && s.length > 0 && (t = t.filter((i) => s.includes(i)));
    let n = {};
    for (let i of this.state)
      i[1] && t.includes(i[0]) && (n[i[0]] = i[1]);
    let r = { id: h, availableState: n, broadcasts: t, reqAwaiters: Array.from(this.broadcastedRequests.entries()).map((i) => ({ channelName: i[0], requestData: i[1].requestData })) }, o = { channelName: m, senderCtx: globalThis.constructor.name, senderId: h, targetId: e, msg: r, channelType: "sync" };
    this.__bcChannel.postMessage(o), e == null ? this.log("Broadcast sync requested", "", { brokerState: r }) : this.log("Broadcast sync responded", "", { targetId: e, brokerState: r });
  }
  handleBroadcastSync(e) {
    if (k(e))
      return this.sendBrokerState(e.senderId, e.msg.broadcasts);
    if (B(e)) {
      for (let s of Object.entries(e.msg.availableState))
        this.broadcasts.has(s[0]) && this.state.has(s[0]) && this.state.get(s[0]) == null && !this.activeNotifications.has(s[0]) && this.__notifySubscribers(s[0], s[1], e.senderId);
      for (let s of e.msg.reqAwaiters)
        this.requestListeners.has(s.channelName) && this.broadcasts.has(s.channelName) && this.requestListeners.get(s.channelName)?.handler(s.requestData, e.senderId);
      this.log("Broadcast sync response received", "", e.msg);
    }
  }
  handleBroadcast(e) {
    if (this.log("Broadcast received", e.data.channelName, e.data), e.data.targetId != null && e.data.targetId !== h) {
      this.log("Broadcast ignored (different targetId)", e.data.channelName);
      return;
    }
    if (q(e.data))
      return this.handleBroadcastSync(e.data);
    switch (e.data.channelType) {
      case "pubSub":
        this.__notifySubscribers(e.data.channelName, e.data.msg, e.data.senderId);
        break;
      case "req":
        this.bridgeRequest(e.data.channelName, e.data.msg, e.data.senderId);
        break;
      case "rep":
        let s = this.broadcastedRequests.get(e.data.channelName);
        if (!s)
          return;
        s.resolve(e.data.msg), this.broadcastedRequests.delete(e.data.channelName);
        break;
    }
    this.log("Broadcast handled", e.data.channelName, e.data);
  }
  __configureBroadcast(e) {
    if (!e.channelName)
      throw new Error("Invalid subscription");
    this.broadcasts.add(e.channelName);
    let s = e.dispose;
    e.dispose = () => {
      s(), this.broadcasts.delete(e.channelName);
    }, e.isBroadcast = true, this.sendBrokerState();
  }
  GetState(e) {
    if (e)
      return this.state.get(e);
  }
  async Broadcast(e, s, t) {
    this._broadcast(e, s, "pubSub", t);
  }
  async _broadcast(e, s, t, n) {
    let r = l.get(e);
    this.log(`Message broadcasted (${t}) to ${n || "all brokers"}`, e, { message: s });
    let o = await Promise.resolve(s), i = { channelName: e, senderCtx: globalThis.constructor.name, senderId: h, targetId: n, msg: o, channelType: t };
    r?.cache && this.state.set(e, s), this.__bcChannel.postMessage(i);
  }
  async Publish(e, s, t) {
    this.log("Message published", e, { message: s }), await this.__notifySubscribers(e, s, h), this.broadcasts.has(e) && this._broadcast(e, s, "pubSub", t);
  }
  async nextMessage(e) {
    let s = this.__nextMessageAwaiters.get(e);
    if (s)
      return s.promise;
    let t = { promise: void 0, resolve: void 0 };
    return t.promise = new Promise((n) => {
      t.resolve = n;
    }), this.__nextMessageAwaiters.set(e, t), t.promise;
  }
  Subscribe(e, s, t = false, n = true) {
    let r = l.get(e), o = false;
    r && (t = r.broadcast || false, n = r.cache || true);
    let i = this.subscribers.get(e) || [], u = s;
    i.push(u), this.subscribers.set(e, i);
    let g = { channelName: e, isCached: false, dispose: () => {
      let c = this.subscribers.get(e);
      if (c == null)
        return;
      let p = c.indexOf(u);
      p !== -1 && c.splice(p, 1);
    }, publish: (c, p) => this.Publish(e, c, p), isDisposed: false };
    if (t && this.__configureBroadcast(g), n) {
      this.state.has(e) || this.state.set(e, void 0);
      let c = this.state.get(e);
      c && u(c);
    }
    return this.activeNotifications.has(e) && this.nextMessage(e).then((c) => u(c)), g;
  }
  bridgeRequest(e, s, t) {
    let n = this.requestListeners.get(e);
    return n ? n.handler(s, t) : Promise.resolve(void 0);
  }
  Request(e, s, t = false, n) {
    if (t) {
      this._broadcast(e, s, "req", n);
      let r = this.broadcastedRequests.get(e);
      r && r.resolve(void 0);
      let o, u = { promise: new Promise((g) => o = g), resolve: o, requestData: s };
      return this.broadcastedRequests.set(e, u), u.promise;
    } else {
      let r = this.requestListeners.get(e);
      return r ? r.handler(s) : Promise.resolve(void 0);
    }
  }
  Reply(e, s, t = false) {
    if (t) {
      let i = s;
      s = (u, g) => this._broadcast(e, i(u), "rep", g);
    }
    let n = this.requestListeners, r = { channelName: e, get isDisposed() {
      return n.has(e);
    }, isBroadcast: t, handler: s, dispose: void 0 };
    r.dispose = () => {
      r.isDisposed = true, this.requestListeners.get(e) === r && this.requestListeners.delete(e);
    };
    let o = this.requestListeners.get(e);
    return o && (o.isDisposed = true, console.warn("Request listener has been replaced: " + e)), this.requestListeners.set(e, r), r;
  }
  async __notifySubscribers(e, s, t) {
    this.activeNotifications.add(e);
    let n = this.subscribers.get(e) || [], r = [];
    for (let o of n)
      o && (r.push(Promise.resolve(o(s, t))), this.log("Handler called", e, { handler: o, message: s }));
    await Promise.all(r), l.get(e)?.cache && this.state.set(e, s), this.__handleAwaiter(e, s), this.activeNotifications.delete(e), this.log("Message handled", e, { message: s, handlers: n, broker: this });
  }
  __handleAwaiter(e, s) {
    let t = this.__nextMessageAwaiters.get(e);
    t && (t.resolve(s), this.__nextMessageAwaiters.delete(e));
  }
};
globalThis.BrowserMessageBroker ?? (globalThis.BrowserMessageBroker = new f());
var a = globalThis.BrowserMessageBroker;
var T = /* @__PURE__ */ new Map();
var S = class d2 {
  constructor(e, s) {
    this.senderId = a.senderId;
    this.type = "pubSub";
    this.dispose = () => {
      a.subscribers.delete(this.name), T.delete(this.name);
    };
    this.name = "";
    this.settings = {};
    this.name = e, this.settings = s;
  }
  static for(e, s) {
    if (!s) {
      let n = T.get(e);
      if (!n)
        throw Error("Can't find channel settings");
      return n;
    }
    a.ConfigureChannel(e, s.broadcast || false, s.cache || false, s.trace || false);
    let t = new d2(e, s);
    return T.set(e, t), t;
  }
  async send(e, s) {
    a.Publish(this.name, e, s);
  }
  static async publish(e, s, t) {
    a.Publish(e, s, t);
  }
  static async broadcast(e, s, t) {
    a.Broadcast(e, s, t);
  }
  subscribe(e) {
    return a.Subscribe(this.name, e, this.settings.broadcast, this.settings.cache).dispose;
  }
  getState() {
    return a.GetState(this.name);
  }
  static GetState(e) {
    return a.GetState(e);
  }
  nextMessage() {
    return a.nextMessage(this.name);
  }
  static nextMessage(e) {
    return a.nextMessage(e);
  }
};

// suite/WebWorker/constants.ts
var PUB_SUB_REQUEST_SUBSCRIPTION_KEY = "testReq";
var PUB_SUB_RESPONSE_SUBSCRIPTION_KEY = "testResp";
var REQ_REP_CHANNEL_NAME = "reqRepChannel";

// suite/WebWorker/testWorker.ts
S.for(PUB_SUB_REQUEST_SUBSCRIPTION_KEY, {
  broadcast: true
}).subscribe((_) => {
  S.broadcast(
    PUB_SUB_RESPONSE_SUBSCRIPTION_KEY,
    { payload: "response" }
  );
});
w.for(
  REQ_REP_CHANNEL_NAME,
  {
    broadcast: true
  }
).reply((req) => {
  return { payload: req.payload + "response" };
});
postMessage("ready");
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsiLi4vLi4vLi4vYnJvd3Nlci1tZXNzYWdlLWJyb2tlci9zcmMvUmVxUmVwQ2hhbm5lbC50cyIsICIuLi8uLi8uLi9icm93c2VyLW1lc3NhZ2UtYnJva2VyL3NyYy9Ccm9rZXIudHMiLCAiLi4vLi4vLi4vYnJvd3Nlci1tZXNzYWdlLWJyb2tlci9zcmMvUHViU3ViQ2hhbm5lbC50cyIsICJjb25zdGFudHMudHMiLCAidGVzdFdvcmtlci50cyJdLAogICJzb3VyY2VzQ29udGVudCI6IFsiaW1wb3J0IHsgQk1CIH0gZnJvbSBcIi4vQnJva2VyXCI7XG5pbXBvcnQgeyBDaGFubmVsU2V0dGluZ3MsIElSZXFSZXBDaGFubmVsIH0gZnJvbSBcIi4vVHlwZXNcIjtcblxuY29uc3QgcmVxUmVwQ2hhbm5lbHMgPSBuZXcgTWFwPHN0cmluZywgUmVxUmVwQ2hhbm5lbD4oKTtcblxuZXhwb3J0IGNsYXNzIFJlcVJlcENoYW5uZWw8VFJlcSA9IHVua25vd24sIFRSZXAgPSB1bmtub3duPlxuICBpbXBsZW1lbnRzIElSZXFSZXBDaGFubmVsPFRSZXEsIFRSZXA+XG57XG4gIGFzeW5jIHJlcXVlc3QobXNnPzogVFJlcSk6IFByb21pc2U8VFJlcCB8IHVuZGVmaW5lZD4ge1xuICAgIHJldHVybiBCTUIuUmVxdWVzdDxUUmVwPih0aGlzLm5hbWUsIG1zZywgdGhpcy5zZXR0aW5ncy5icm9hZGNhc3QpO1xuICB9XG5cbiAgcmVwbHkoaGFuZGxlcjogKHJlcTogVFJlcSkgPT4gVFJlcCB8IFByb21pc2U8VFJlcD4pIHtcbiAgICByZXR1cm4gQk1CLlJlcGx5PFRSZXEsIFRSZXA+KHRoaXMubmFtZSwgaGFuZGxlciwgdGhpcy5zZXR0aW5ncy5icm9hZGNhc3QpXG4gICAgICAuZGlzcG9zZTtcbiAgfVxuXG4gIHJlYWRvbmx5IHR5cGU6IFwicmVxUmVwXCIgPSBcInJlcVJlcFwiO1xuXG4gIHNldHRpbmdzOiBDaGFubmVsU2V0dGluZ3MgPSB7fTtcblxuICBkaXNwb3NlKCkge1xuICAgIEJNQi5yZXF1ZXN0TGlzdGVuZXJzLmRlbGV0ZSh0aGlzLm5hbWUpO1xuICAgIHJlcVJlcENoYW5uZWxzLmRlbGV0ZSh0aGlzLm5hbWUpO1xuICB9XG5cbiAgcmVhZG9ubHkgbmFtZTogc3RyaW5nID0gXCJcIjtcblxuICBzdGF0aWMgZm9yPFRSZXEgPSB1bmtub3duLCBUUmVwID0gdW5rbm93bj4oXG4gICAgbmFtZTogc3RyaW5nLFxuICAgIHNldHRpbmdzPzogQ2hhbm5lbFNldHRpbmdzXG4gICk6IFJlcVJlcENoYW5uZWw8VFJlcSwgVFJlcD4ge1xuICAgIGlmICghc2V0dGluZ3MpIHtcbiAgICAgIGNvbnN0IGMgPSByZXFSZXBDaGFubmVscy5nZXQobmFtZSk7XG4gICAgICBpZiAoIWMpIHRocm93IEVycm9yKFwiQ2FuJ3QgZmluZCBjaGFubmVsIHNldHRpbmdzXCIpO1xuICAgICAgcmV0dXJuIGMgYXMgUmVxUmVwQ2hhbm5lbDxUUmVxLCBUUmVwPjtcbiAgICB9XG5cbiAgICBCTUIuQ29uZmlndXJlQ2hhbm5lbChcbiAgICAgIG5hbWUsXG4gICAgICBzZXR0aW5ncy5icm9hZGNhc3QgfHwgZmFsc2UsXG4gICAgICBzZXR0aW5ncy5jYWNoZSB8fCBmYWxzZSxcbiAgICAgIHNldHRpbmdzLnRyYWNlIHx8IGZhbHNlXG4gICAgKTtcbiAgICBjb25zdCBjaGFubmVsID0gbmV3IFJlcVJlcENoYW5uZWw8VFJlcSwgVFJlcD4obmFtZSwgc2V0dGluZ3MpO1xuICAgIHJlcVJlcENoYW5uZWxzLnNldChuYW1lLCBjaGFubmVsKTtcbiAgICByZXR1cm4gY2hhbm5lbDtcbiAgfVxuICBwcml2YXRlIGNvbnN0cnVjdG9yKG5hbWU6IHN0cmluZywgc2V0dGluZ3M6IENoYW5uZWxTZXR0aW5ncykge1xuICAgIHRoaXMubmFtZSA9IG5hbWU7XG4gICAgdGhpcy5zZXR0aW5ncyA9IHNldHRpbmdzO1xuICB9XG4gIHNlbmRlcklkID0gQk1CLnNlbmRlcklkO1xufVxuIiwgImltcG9ydCB7XG4gIENoYW5uZWxUeXBlLFxuICBJQnJvYWRjYXN0RW52ZWxvcGUsXG4gIElCcm9hZGNhc3RTeW5jRW52ZWxvcGUsXG4gIElCcm9rZXIsXG4gIElCcm9rZXJTdGF0ZSxcbiAgQ2hhbm5lbFNldHRpbmdzLFxuICBSZXFTdWJzY3JpcHRpb24sXG4gIFN1YnNjcmlwdGlvbixcbiAgVEhhbmRsZXIsXG59IGZyb20gXCIuL1R5cGVzXCI7XG5cbmNvbnN0IEJST0FEQ0FTVF9TWU5DID0gXCJicm9hZGNhc3Qtc3luY1wiO1xuY29uc3QgQlJPV1NFUl9NRVNTQUdFX0JST0tFUiA9IFwiYnJvd3Nlci1tZXNzYWdlLWJyb2tlclwiO1xuXG5mdW5jdGlvbiBpc0Jyb2FkY2FzdFN5bmMoZTogSUJyb2FkY2FzdEVudmVsb3BlKTogZSBpcyBJQnJvYWRjYXN0U3luY0VudmVsb3BlIHtcbiAgcmV0dXJuIGUuY2hhbm5lbE5hbWUgPT09IEJST0FEQ0FTVF9TWU5DO1xufVxuXG5mdW5jdGlvbiBpc1N5bmNSZXEoZTogSUJyb2FkY2FzdEVudmVsb3BlKSB7XG4gIHJldHVybiBlLnNlbmRlcklkICE9IHVuZGVmaW5lZCAmJiBlLnRhcmdldElkID09IHVuZGVmaW5lZDtcbn1cbmZ1bmN0aW9uIGlzU3luY1Jlc3AoZTogSUJyb2FkY2FzdEVudmVsb3BlKSB7XG4gIHJldHVybiBlLnNlbmRlcklkICE9IHVuZGVmaW5lZCAmJiBlLnRhcmdldElkICE9IHVuZGVmaW5lZDtcbn1cblxuZXhwb3J0IGNvbnN0IHNlbmRlcklkID0gTWF0aC5yYW5kb20oKS50b1N0cmluZygzNikuc3Vic3RyaW5nKDIsIDkpO1xuXG5mdW5jdGlvbiBkZWJvdW5jZTxUIGV4dGVuZHMgRnVuY3Rpb24+KGZ1bmM6IFQsIHRpbWVvdXQgPSAxKSB7XG4gIGxldCB0aW1lcjogbnVtYmVyO1xuICByZXR1cm4gKC4uLmFyZ3M6IHVua25vd25bXSkgPT4ge1xuICAgIGNsZWFyVGltZW91dCh0aW1lcik7XG4gICAgdGltZXIgPSBzZXRUaW1lb3V0KCgpID0+IHtcbiAgICAgIGZ1bmMoLi4uYXJncyk7XG4gICAgfSwgdGltZW91dCk7XG4gIH07XG59XG5cbmNvbnN0IGNoYW5uZWxTZXR0aW5ncyA9IG5ldyBNYXA8c3RyaW5nLCBDaGFubmVsU2V0dGluZ3M+KCk7XG5cbmNsYXNzIEJyb2tlciBpbXBsZW1lbnRzIElCcm9rZXIge1xuICB0cmFjZTogYm9vbGVhbiA9IGZhbHNlO1xuICB0cmFjZUJyb2FkY2FzdHM6IGJvb2xlYW4gPSBmYWxzZTtcbiAgdHJhY2VNZXNzYWdlczogYm9vbGVhbiA9IGZhbHNlO1xuICBzZW5kZXJJZCA9IHNlbmRlcklkO1xuICBzdGF0ZSA9IG5ldyBNYXA8c3RyaW5nLCBhbnk+KCk7XG4gIHN1YnNjcmliZXJzID0gbmV3IE1hcDxzdHJpbmcsIFRIYW5kbGVyW10+KCk7XG4gIGJyb2FkY2FzdHMgPSBuZXcgU2V0PHN0cmluZz4oKTtcbiAgcHJpdmF0ZSBfX2JjQ2hhbm5lbCA9IG5ldyBCcm9hZGNhc3RDaGFubmVsKEJST1dTRVJfTUVTU0FHRV9CUk9LRVIpO1xuXG4gIHByaXZhdGUgbG9nKG1lc3NhZ2U6IHN0cmluZywgY2hhbm5lbDogc3RyaW5nLCBkYXRhPzogdW5rbm93bikge1xuICAgIGNvbnN0IGMgPSBjaGFubmVsU2V0dGluZ3MuZ2V0KGNoYW5uZWwpO1xuICAgIGlmIChcbiAgICAgIHRoaXMudHJhY2UgfHxcbiAgICAgIGM/LnRyYWNlIHx8XG4gICAgICAoYz8uYnJvYWRjYXN0ICYmIHRoaXMudHJhY2VCcm9hZGNhc3RzKSB8fFxuICAgICAgKCFjPy5icm9hZGNhc3QgJiYgdGhpcy50cmFjZU1lc3NhZ2VzKVxuICAgICkge1xuICAgICAgY29uc29sZS5ncm91cENvbGxhcHNlZChcbiAgICAgICAgYFske2dsb2JhbFRoaXMuY29uc3RydWN0b3IubmFtZX0oJHt0aGlzLnNlbmRlcklkfSktJHtjaGFubmVsfV0gJHttZXNzYWdlfWBcbiAgICAgICk7XG4gICAgICBjb25zb2xlLmxvZyhkYXRhKTtcbiAgICAgIGNvbnNvbGUudHJhY2UoKTtcbiAgICAgIGNvbnNvbGUuZ3JvdXBFbmQoKTtcbiAgICB9XG4gIH1cblxuICBjb25zdHJ1Y3RvcigpIHtcbiAgICB0aGlzLl9fYmNDaGFubmVsLm9ubWVzc2FnZSA9IHRoaXMuaGFuZGxlQnJvYWRjYXN0LmJpbmQodGhpcyk7XG4gICAgdGhpcy5fX2JjQ2hhbm5lbC5vbm1lc3NhZ2VlcnJvciA9IHRoaXMuaGFuZGxlQnJvYWRjYXN0RXJyb3IuYmluZCh0aGlzKTtcblxuICAgIHNldFRpbWVvdXQoKCkgPT4ge1xuICAgICAgdGhpcy5fX3NlbmRCcm9rZXJTdGF0ZSh1bmRlZmluZWQsIHVuZGVmaW5lZCk7IC8vIGFsd2F5cyBzZW5kIGluaXRpYWwgc3luYyByZXF1ZXN0XG4gICAgfSwgMCk7XG5cbiAgICB0aGlzLnNlbmRCcm9rZXJTdGF0ZSA9IGRlYm91bmNlKHRoaXMuX19zZW5kQnJva2VyU3RhdGUuYmluZCh0aGlzKSwgMik7XG4gIH1cblxuICBDb25maWd1cmVDaGFubmVsKFxuICAgIGNoYW5uZWxOYW1lOiBzdHJpbmcsXG4gICAgYnJvYWRjYXN0OiBib29sZWFuLFxuICAgIGNhY2hlOiBib29sZWFuLFxuICAgIHRyYWNlOiBib29sZWFuXG4gICk6IHZvaWQge1xuICAgIGNoYW5uZWxTZXR0aW5ncy5zZXQoY2hhbm5lbE5hbWUsIHtcbiAgICAgIGJyb2FkY2FzdDogYnJvYWRjYXN0LFxuICAgICAgY2FjaGU6IGNhY2hlLFxuICAgICAgdHJhY2UsXG4gICAgfSk7XG5cbiAgICBpZiAoY2FjaGUgJiYgIXRoaXMuc3RhdGUuaGFzKGNoYW5uZWxOYW1lKSlcbiAgICAgIHRoaXMuc3RhdGUuc2V0KGNoYW5uZWxOYW1lLCB1bmRlZmluZWQpO1xuICAgIGlmIChicm9hZGNhc3QpIHRoaXMuYnJvYWRjYXN0cy5hZGQoY2hhbm5lbE5hbWUpO1xuICB9XG5cbiAgcHJpdmF0ZSBoYW5kbGVCcm9hZGNhc3RFcnJvcihldjogTWVzc2FnZUV2ZW50PElCcm9hZGNhc3RFbnZlbG9wZT4pIHtcbiAgICB0aHJvdyBFcnJvcihcIkJST0FEQ0FTVCBGQUlMRUQ6IFwiICsgZXYuZGF0YSk7XG4gIH1cblxuICBwcml2YXRlIHNlbmRCcm9rZXJTdGF0ZTogKFxuICAgIHRhcmdldElkPzogc3RyaW5nLFxuICAgIGZpbHRlckJyb2FkY2FzdHM/OiBzdHJpbmdbXVxuICApID0+IHZvaWQ7XG4gIHByaXZhdGUgX19zZW5kQnJva2VyU3RhdGUodGFyZ2V0SWQ/OiBzdHJpbmcsIGZpbHRlckJyb2FkY2FzdHM/OiBzdHJpbmdbXSkge1xuICAgIGxldCBjdXJyZW50QnJvYWRjYXN0cyA9IEFycmF5LmZyb20odGhpcy5icm9hZGNhc3RzLmtleXMoKSk7XG5cbiAgICBpZiAoZmlsdGVyQnJvYWRjYXN0cyAmJiBmaWx0ZXJCcm9hZGNhc3RzLmxlbmd0aCA+IDApIHtcbiAgICAgIGN1cnJlbnRCcm9hZGNhc3RzID0gY3VycmVudEJyb2FkY2FzdHMuZmlsdGVyKChrKSA9PlxuICAgICAgICBmaWx0ZXJCcm9hZGNhc3RzLmluY2x1ZGVzKGspXG4gICAgICApO1xuICAgIH1cblxuICAgIGNvbnN0IGF2YWlsYWJsZVN0YXRlOiB7IFt4OiBzdHJpbmddOiBhbnkgfSA9IHt9O1xuICAgIGZvciAoY29uc3QgeCBvZiB0aGlzLnN0YXRlKSB7XG4gICAgICBpZiAoIXhbMV0pIGNvbnRpbnVlO1xuICAgICAgaWYgKCFjdXJyZW50QnJvYWRjYXN0cy5pbmNsdWRlcyh4WzBdKSkgY29udGludWU7XG4gICAgICBhdmFpbGFibGVTdGF0ZVt4WzBdXSA9IHhbMV07XG4gICAgfVxuXG4gICAgY29uc3Qgc3RhdGU6IElCcm9rZXJTdGF0ZSA9IHtcbiAgICAgIGlkOiBzZW5kZXJJZCxcbiAgICAgIGF2YWlsYWJsZVN0YXRlLFxuICAgICAgYnJvYWRjYXN0czogY3VycmVudEJyb2FkY2FzdHMsXG4gICAgICByZXFBd2FpdGVyczogQXJyYXkuZnJvbSh0aGlzLmJyb2FkY2FzdGVkUmVxdWVzdHMuZW50cmllcygpKS5tYXAoKHgpID0+ICh7XG4gICAgICAgIGNoYW5uZWxOYW1lOiB4WzBdLFxuICAgICAgICByZXF1ZXN0RGF0YTogeFsxXS5yZXF1ZXN0RGF0YSxcbiAgICAgIH0pKSxcbiAgICB9O1xuXG4gICAgY29uc3QgZXY6IElCcm9hZGNhc3RTeW5jRW52ZWxvcGUgPSB7XG4gICAgICBjaGFubmVsTmFtZTogQlJPQURDQVNUX1NZTkMsXG4gICAgICBzZW5kZXJDdHg6IGdsb2JhbFRoaXMuY29uc3RydWN0b3IubmFtZSxcbiAgICAgIHNlbmRlcklkLFxuICAgICAgdGFyZ2V0SWQsXG4gICAgICBtc2c6IHN0YXRlLFxuICAgICAgY2hhbm5lbFR5cGU6IFwic3luY1wiLFxuICAgIH07XG5cbiAgICB0aGlzLl9fYmNDaGFubmVsLnBvc3RNZXNzYWdlKGV2KTtcblxuICAgIGlmICh0YXJnZXRJZCA9PSB1bmRlZmluZWQpXG4gICAgICB0aGlzLmxvZyhcIkJyb2FkY2FzdCBzeW5jIHJlcXVlc3RlZFwiLCBcIlwiLCB7XG4gICAgICAgIGJyb2tlclN0YXRlOiBzdGF0ZSxcbiAgICAgIH0pO1xuICAgIGVsc2VcbiAgICAgIHRoaXMubG9nKFwiQnJvYWRjYXN0IHN5bmMgcmVzcG9uZGVkXCIsIFwiXCIsIHtcbiAgICAgICAgdGFyZ2V0SWQsXG4gICAgICAgIGJyb2tlclN0YXRlOiBzdGF0ZSxcbiAgICAgIH0pO1xuICB9XG5cbiAgcHJpdmF0ZSBoYW5kbGVCcm9hZGNhc3RTeW5jKGV2OiBJQnJvYWRjYXN0U3luY0VudmVsb3BlKSB7XG4gICAgaWYgKGlzU3luY1JlcShldikpXG4gICAgICByZXR1cm4gdGhpcy5zZW5kQnJva2VyU3RhdGUoZXYuc2VuZGVySWQsIGV2Lm1zZy5icm9hZGNhc3RzKTtcbiAgICBpZiAoaXNTeW5jUmVzcChldikpIHtcbiAgICAgIGZvciAoY29uc3QgcyBvZiBPYmplY3QuZW50cmllcyhldi5tc2cuYXZhaWxhYmxlU3RhdGUpKSB7XG4gICAgICAgIGlmIChcbiAgICAgICAgICB0aGlzLmJyb2FkY2FzdHMuaGFzKHNbMF0pICYmXG4gICAgICAgICAgdGhpcy5zdGF0ZS5oYXMoc1swXSkgJiZcbiAgICAgICAgICB0aGlzLnN0YXRlLmdldChzWzBdKSA9PSB1bmRlZmluZWQgJiZcbiAgICAgICAgICAhdGhpcy5hY3RpdmVOb3RpZmljYXRpb25zLmhhcyhzWzBdKVxuICAgICAgICApIHtcbiAgICAgICAgICB0aGlzLl9fbm90aWZ5U3Vic2NyaWJlcnMoc1swXSwgc1sxXSwgZXYuc2VuZGVySWQpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICBmb3IgKGNvbnN0IHMgb2YgZXYubXNnLnJlcUF3YWl0ZXJzKSB7XG4gICAgICAgIGlmIChcbiAgICAgICAgICB0aGlzLnJlcXVlc3RMaXN0ZW5lcnMuaGFzKHMuY2hhbm5lbE5hbWUpICYmXG4gICAgICAgICAgdGhpcy5icm9hZGNhc3RzLmhhcyhzLmNoYW5uZWxOYW1lKVxuICAgICAgICApIHtcbiAgICAgICAgICBjb25zdCByZXFMaXN0ZW5lciA9IHRoaXMucmVxdWVzdExpc3RlbmVycy5nZXQocy5jaGFubmVsTmFtZSk7XG4gICAgICAgICAgcmVxTGlzdGVuZXI/LmhhbmRsZXIocy5yZXF1ZXN0RGF0YSwgZXYuc2VuZGVySWQpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICB0aGlzLmxvZyhcIkJyb2FkY2FzdCBzeW5jIHJlc3BvbnNlIHJlY2VpdmVkXCIsIFwiXCIsIGV2Lm1zZyk7XG4gICAgfVxuICB9XG5cbiAgcHJpdmF0ZSBoYW5kbGVCcm9hZGNhc3QoZXY6IE1lc3NhZ2VFdmVudDxJQnJvYWRjYXN0RW52ZWxvcGU+KSB7XG4gICAgdGhpcy5sb2coXCJCcm9hZGNhc3QgcmVjZWl2ZWRcIiwgZXYuZGF0YS5jaGFubmVsTmFtZSwgZXYuZGF0YSk7XG5cbiAgICBpZiAoZXYuZGF0YS50YXJnZXRJZCAhPSB1bmRlZmluZWQgJiYgZXYuZGF0YS50YXJnZXRJZCAhPT0gc2VuZGVySWQpIHtcbiAgICAgIHRoaXMubG9nKFwiQnJvYWRjYXN0IGlnbm9yZWQgKGRpZmZlcmVudCB0YXJnZXRJZClcIiwgZXYuZGF0YS5jaGFubmVsTmFtZSk7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgaWYgKGlzQnJvYWRjYXN0U3luYyhldi5kYXRhKSkgcmV0dXJuIHRoaXMuaGFuZGxlQnJvYWRjYXN0U3luYyhldi5kYXRhKTtcblxuICAgIHN3aXRjaCAoZXYuZGF0YS5jaGFubmVsVHlwZSkge1xuICAgICAgY2FzZSBcInB1YlN1YlwiOlxuICAgICAgICB0aGlzLl9fbm90aWZ5U3Vic2NyaWJlcnMoXG4gICAgICAgICAgZXYuZGF0YS5jaGFubmVsTmFtZSxcbiAgICAgICAgICBldi5kYXRhLm1zZyxcbiAgICAgICAgICBldi5kYXRhLnNlbmRlcklkXG4gICAgICAgICk7XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSBcInJlcVwiOlxuICAgICAgICB0aGlzLmJyaWRnZVJlcXVlc3QoZXYuZGF0YS5jaGFubmVsTmFtZSwgZXYuZGF0YS5tc2csIGV2LmRhdGEuc2VuZGVySWQpO1xuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgXCJyZXBcIjpcbiAgICAgICAgY29uc3QgcmVxID0gdGhpcy5icm9hZGNhc3RlZFJlcXVlc3RzLmdldChldi5kYXRhLmNoYW5uZWxOYW1lKTtcbiAgICAgICAgaWYgKCFyZXEpIHJldHVybjtcblxuICAgICAgICByZXEucmVzb2x2ZShldi5kYXRhLm1zZyk7XG4gICAgICAgIHRoaXMuYnJvYWRjYXN0ZWRSZXF1ZXN0cy5kZWxldGUoZXYuZGF0YS5jaGFubmVsTmFtZSk7XG5cbiAgICAgICAgYnJlYWs7XG4gICAgfVxuXG4gICAgdGhpcy5sb2coXCJCcm9hZGNhc3QgaGFuZGxlZFwiLCBldi5kYXRhLmNoYW5uZWxOYW1lLCBldi5kYXRhKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBCcmlkZ2UgcHViL3N1YiBtZXNzYWdlcyB0byBicm9hZGNhc3QgY2hhbm5lbFxuICAgKiBAcGFyYW0gc3Vic0tleVxuICAgKiBAcmV0dXJucyB7U3Vic2NyaXB0aW9ufVxuICAgKi9cbiAgcHJpdmF0ZSBfX2NvbmZpZ3VyZUJyb2FkY2FzdChzdWJzY3JpcHRpb246IFN1YnNjcmlwdGlvbjxhbnk+KTogdm9pZCB7XG4gICAgaWYgKCFzdWJzY3JpcHRpb24uY2hhbm5lbE5hbWUpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcihgSW52YWxpZCBzdWJzY3JpcHRpb25gKTtcbiAgICB9XG4gICAgdGhpcy5icm9hZGNhc3RzLmFkZChzdWJzY3JpcHRpb24uY2hhbm5lbE5hbWUpO1xuICAgIGNvbnN0IG9yaWdpbmFsRGlzcG9zZSA9IHN1YnNjcmlwdGlvbi5kaXNwb3NlO1xuICAgIHN1YnNjcmlwdGlvbi5kaXNwb3NlID0gKCkgPT4ge1xuICAgICAgb3JpZ2luYWxEaXNwb3NlKCk7XG4gICAgICB0aGlzLmJyb2FkY2FzdHMuZGVsZXRlKHN1YnNjcmlwdGlvbi5jaGFubmVsTmFtZSk7XG4gICAgfTtcbiAgICBzdWJzY3JpcHRpb24uaXNCcm9hZGNhc3QgPSB0cnVlO1xuXG4gICAgdGhpcy5zZW5kQnJva2VyU3RhdGUoKTtcbiAgfVxuXG4gIEdldFN0YXRlPFQ+KHN1YnNLZXk6IHN0cmluZyk6IFQgfCB1bmRlZmluZWQge1xuICAgIGlmIChzdWJzS2V5KSB7XG4gICAgICByZXR1cm4gdGhpcy5zdGF0ZS5nZXQoc3Vic0tleSkgYXMgVDtcbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIHVuZGVmaW5lZDtcbiAgICB9XG4gIH1cblxuICBhc3luYyBCcm9hZGNhc3QoY2hhbm5lbE5hbWU6IHN0cmluZywgbXNnOiB1bmtub3duLCB0YXJnZXRJZD86IHN0cmluZykge1xuICAgIHRoaXMuX2Jyb2FkY2FzdChjaGFubmVsTmFtZSwgbXNnLCBcInB1YlN1YlwiLCB0YXJnZXRJZCk7XG4gIH1cblxuICBwcml2YXRlIGFzeW5jIF9icm9hZGNhc3QoXG4gICAgY2hhbm5lbE5hbWU6IHN0cmluZyxcbiAgICBtc2c6IHVua25vd24sXG4gICAgY2hhbm5lbFR5cGU6IENoYW5uZWxUeXBlLFxuICAgIHRhcmdldElkPzogc3RyaW5nXG4gICkge1xuICAgIGNvbnN0IHNldHRpbmdzID0gY2hhbm5lbFNldHRpbmdzLmdldChjaGFubmVsTmFtZSk7XG5cbiAgICB0aGlzLmxvZyhcbiAgICAgIGBNZXNzYWdlIGJyb2FkY2FzdGVkICgke2NoYW5uZWxUeXBlfSkgdG8gJHt0YXJnZXRJZCB8fCBcImFsbCBicm9rZXJzXCJ9YCxcbiAgICAgIGNoYW5uZWxOYW1lLFxuICAgICAgeyBtZXNzYWdlOiBtc2cgfVxuICAgICk7XG5cbiAgICBjb25zdCBfbXNnID0gYXdhaXQgUHJvbWlzZS5yZXNvbHZlKG1zZyk7XG4gICAgY29uc3QgZW52ZWxvcGU6IElCcm9hZGNhc3RFbnZlbG9wZSA9IHtcbiAgICAgIGNoYW5uZWxOYW1lOiBjaGFubmVsTmFtZSxcbiAgICAgIHNlbmRlckN0eDogZ2xvYmFsVGhpcy5jb25zdHJ1Y3Rvci5uYW1lLFxuICAgICAgc2VuZGVySWQ6IHNlbmRlcklkLFxuICAgICAgdGFyZ2V0SWQ6IHRhcmdldElkLFxuICAgICAgbXNnOiBfbXNnLFxuICAgICAgY2hhbm5lbFR5cGUsXG4gICAgfTtcblxuICAgIGlmIChzZXR0aW5ncz8uY2FjaGUpIHRoaXMuc3RhdGUuc2V0KGNoYW5uZWxOYW1lLCBtc2cpO1xuXG4gICAgdGhpcy5fX2JjQ2hhbm5lbC5wb3N0TWVzc2FnZShlbnZlbG9wZSk7XG4gIH1cblxuICBhc3luYyBQdWJsaXNoKGNoYW5uZWxOYW1lOiBzdHJpbmcsIG1zZzogdW5rbm93biwgdGFyZ2V0SWQ/OiBzdHJpbmcpIHtcbiAgICB0aGlzLmxvZyhgTWVzc2FnZSBwdWJsaXNoZWRgLCBjaGFubmVsTmFtZSwgeyBtZXNzYWdlOiBtc2cgfSk7XG4gICAgYXdhaXQgdGhpcy5fX25vdGlmeVN1YnNjcmliZXJzKGNoYW5uZWxOYW1lLCBtc2csIHNlbmRlcklkKTtcblxuICAgIGlmICghdGhpcy5icm9hZGNhc3RzLmhhcyhjaGFubmVsTmFtZSkpIHJldHVybjtcblxuICAgIHRoaXMuX2Jyb2FkY2FzdChjaGFubmVsTmFtZSwgbXNnLCBcInB1YlN1YlwiLCB0YXJnZXRJZCk7XG4gIH1cblxuICBwcml2YXRlIF9fbmV4dE1lc3NhZ2VBd2FpdGVycyA9IG5ldyBNYXA8XG4gICAgc3RyaW5nLFxuICAgIHtcbiAgICAgIHByb21pc2U6IFByb21pc2U8dW5rbm93bj47XG4gICAgICByZXNvbHZlOiAobXNnOiB1bmtub3duKSA9PiB1bmtub3duO1xuICAgIH1cbiAgPigpO1xuXG4gIGFzeW5jIG5leHRNZXNzYWdlPFQgPSB1bmtub3duPihzdWJzS2V5OiBzdHJpbmcpOiBQcm9taXNlPFQ+IHtcbiAgICBjb25zdCBhID0gdGhpcy5fX25leHRNZXNzYWdlQXdhaXRlcnMuZ2V0KHN1YnNLZXkpO1xuICAgIGlmIChhKSByZXR1cm4gYS5wcm9taXNlIGFzIFByb21pc2U8VD47XG5cbiAgICBjb25zdCBuZXdBd2FpdGVyOiB7XG4gICAgICBwcm9taXNlOiBQcm9taXNlPHVua25vd24+O1xuICAgICAgcmVzb2x2ZTogKG1zZzogdW5rbm93bikgPT4gdm9pZDtcbiAgICB9ID0ge1xuICAgICAgcHJvbWlzZTogdW5kZWZpbmVkIGFzIHVua25vd24gYXMgUHJvbWlzZTxUPixcbiAgICAgIHJlc29sdmU6IHVuZGVmaW5lZCBhcyB1bmtub3duIGFzIChtc2c6IHVua25vd24pID0+IHZvaWQsXG4gICAgfTtcbiAgICBuZXdBd2FpdGVyLnByb21pc2UgPSBuZXcgUHJvbWlzZSgocmVzOiAobXNnOiB1bmtub3duKSA9PiB2b2lkKSA9PiB7XG4gICAgICBuZXdBd2FpdGVyLnJlc29sdmUgPSByZXM7XG4gICAgfSk7XG5cbiAgICB0aGlzLl9fbmV4dE1lc3NhZ2VBd2FpdGVycy5zZXQoc3Vic0tleSwgbmV3QXdhaXRlcik7XG5cbiAgICByZXR1cm4gbmV3QXdhaXRlci5wcm9taXNlIGFzIFByb21pc2U8VD47XG4gIH1cblxuICBTdWJzY3JpYmU8VD4oXG4gICAgY2hhbm5lbE5hbWU6IHN0cmluZyxcbiAgICBoYW5kbGVyPzogVEhhbmRsZXI8VD4sXG4gICAgYnJvYWRjYXN0ID0gZmFsc2UsXG4gICAgY2FjaGUgPSB0cnVlXG4gICk6IFN1YnNjcmlwdGlvbjxUPiB7XG4gICAgY29uc3Qgc2V0dGluZ3MgPSBjaGFubmVsU2V0dGluZ3MuZ2V0KGNoYW5uZWxOYW1lKTtcbiAgICBjb25zdCBzZXR0aW5nc092ZXJyaWRkZW4gPSBmYWxzZTtcbiAgICBpZiAoc2V0dGluZ3MpIHtcbiAgICAgIGJyb2FkY2FzdCA9IHNldHRpbmdzLmJyb2FkY2FzdCB8fCBmYWxzZTtcbiAgICAgIGNhY2hlID0gc2V0dGluZ3MuY2FjaGUgfHwgdHJ1ZTtcbiAgICAgIHNldHRpbmdzT3ZlcnJpZGRlbjtcbiAgICB9XG5cbiAgICBjb25zdCBzdWJzID0gdGhpcy5zdWJzY3JpYmVycy5nZXQoY2hhbm5lbE5hbWUpIHx8IFtdO1xuICAgIGNvbnN0IGhkbCA9IGhhbmRsZXIgYXMgKG1zZzogdW5rbm93bikgPT4gdm9pZDtcbiAgICBzdWJzLnB1c2goaGRsKTtcbiAgICB0aGlzLnN1YnNjcmliZXJzLnNldChjaGFubmVsTmFtZSwgc3Vicyk7XG5cbiAgICBjb25zdCBzdWJzY3JpcHRpb246IFN1YnNjcmlwdGlvbjxUPiA9IHtcbiAgICAgIGNoYW5uZWxOYW1lOiBjaGFubmVsTmFtZSxcbiAgICAgIGlzQ2FjaGVkOiBmYWxzZSxcbiAgICAgIGRpc3Bvc2U6ICgpID0+IHtcbiAgICAgICAgY29uc3QgX3N1YnMgPSB0aGlzLnN1YnNjcmliZXJzLmdldChjaGFubmVsTmFtZSk7XG5cbiAgICAgICAgaWYgKF9zdWJzID09IHVuZGVmaW5lZCkgcmV0dXJuO1xuICAgICAgICBjb25zdCBpID0gX3N1YnMuaW5kZXhPZihoZGwpO1xuXG4gICAgICAgIGlmIChpID09PSAtMSkgcmV0dXJuO1xuICAgICAgICBfc3Vicy5zcGxpY2UoaSwgMSk7XG4gICAgICB9LFxuICAgICAgcHVibGlzaDogKG1zZywgdGFyZ2V0SWQ/OiBzdHJpbmcpID0+XG4gICAgICAgIHRoaXMuUHVibGlzaChjaGFubmVsTmFtZSwgbXNnLCB0YXJnZXRJZCksXG4gICAgICBpc0Rpc3Bvc2VkOiBmYWxzZSxcbiAgICB9O1xuXG4gICAgaWYgKGJyb2FkY2FzdCkgdGhpcy5fX2NvbmZpZ3VyZUJyb2FkY2FzdChzdWJzY3JpcHRpb24pO1xuICAgIGlmIChjYWNoZSkge1xuICAgICAgaWYgKCF0aGlzLnN0YXRlLmhhcyhjaGFubmVsTmFtZSkpIHRoaXMuc3RhdGUuc2V0KGNoYW5uZWxOYW1lLCB1bmRlZmluZWQpO1xuICAgICAgY29uc3Qgc3RhdGUgPSB0aGlzLnN0YXRlLmdldChjaGFubmVsTmFtZSk7XG4gICAgICBpZiAoc3RhdGUpIGhkbChzdGF0ZSk7XG4gICAgfVxuICAgIGlmICh0aGlzLmFjdGl2ZU5vdGlmaWNhdGlvbnMuaGFzKGNoYW5uZWxOYW1lKSlcbiAgICAgIHRoaXMubmV4dE1lc3NhZ2UoY2hhbm5lbE5hbWUpLnRoZW4oKHgpID0+IGhkbCh4KSk7XG5cbiAgICByZXR1cm4gc3Vic2NyaXB0aW9uO1xuICB9XG5cbiAgcHJpdmF0ZSBicmlkZ2VSZXF1ZXN0KFxuICAgIGNoYW5uZWxOYW1lOiBzdHJpbmcsXG4gICAgcmVxdWVzdERhdGE6IHVua25vd24sXG4gICAgc2VuZGVySWQ6IHN0cmluZ1xuICApIHtcbiAgICBjb25zdCBsaXN0ZW5lciA9IHRoaXMucmVxdWVzdExpc3RlbmVycy5nZXQoY2hhbm5lbE5hbWUpO1xuXG4gICAgaWYgKCFsaXN0ZW5lcikgcmV0dXJuIFByb21pc2UucmVzb2x2ZSh1bmRlZmluZWQpO1xuXG4gICAgcmV0dXJuIGxpc3RlbmVyLmhhbmRsZXIocmVxdWVzdERhdGEsIHNlbmRlcklkKSBhcyBQcm9taXNlPHVua25vd24+O1xuICB9XG5cbiAgUmVxdWVzdDxUUmVwID0gdW5rbm93bj4oXG4gICAgY2hhbm5lbE5hbWU6IHN0cmluZyxcbiAgICByZXF1ZXN0RGF0YTogdW5rbm93bixcbiAgICBicm9hZGNhc3QgPSBmYWxzZSxcbiAgICB0YXJnZXRJZD86IHN0cmluZ1xuICApOiBQcm9taXNlPFRSZXA+IHwgUHJvbWlzZTx1bmRlZmluZWQ+IHtcbiAgICBpZiAoIWJyb2FkY2FzdCkge1xuICAgICAgY29uc3QgbGlzdGVuZXIgPSB0aGlzLnJlcXVlc3RMaXN0ZW5lcnMuZ2V0KGNoYW5uZWxOYW1lKTtcbiAgICAgIGlmICghbGlzdGVuZXIpIHJldHVybiBQcm9taXNlLnJlc29sdmUodW5kZWZpbmVkKTtcbiAgICAgIHJldHVybiBsaXN0ZW5lci5oYW5kbGVyKHJlcXVlc3REYXRhKSBhcyBQcm9taXNlPFRSZXA+O1xuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLl9icm9hZGNhc3QoY2hhbm5lbE5hbWUsIHJlcXVlc3REYXRhLCBcInJlcVwiLCB0YXJnZXRJZCk7XG4gICAgICBjb25zdCByZXEgPSB0aGlzLmJyb2FkY2FzdGVkUmVxdWVzdHMuZ2V0KGNoYW5uZWxOYW1lKTtcbiAgICAgIGlmIChyZXEpIHJlcS5yZXNvbHZlKHVuZGVmaW5lZCk7XG5cbiAgICAgIGxldCByZXNvbHZlID0gdW5kZWZpbmVkIGFzIHVua25vd24gYXMgKHI6IHVua25vd24pID0+IHZvaWQ7XG4gICAgICBjb25zdCBwcm9taXNlID0gbmV3IFByb21pc2U8VFJlcD4oXG4gICAgICAgIChyZXMpID0+IChyZXNvbHZlID0gcmVzIGFzIChyOiB1bmtub3duKSA9PiB2b2lkKVxuICAgICAgKTtcbiAgICAgIGNvbnN0IGJyZXEgPSB7XG4gICAgICAgIHByb21pc2UsXG4gICAgICAgIHJlc29sdmUsXG4gICAgICAgIHJlcXVlc3REYXRhLFxuICAgICAgfTtcbiAgICAgIHRoaXMuYnJvYWRjYXN0ZWRSZXF1ZXN0cy5zZXQoY2hhbm5lbE5hbWUsIGJyZXEpO1xuICAgICAgcmV0dXJuIGJyZXEucHJvbWlzZTtcbiAgICB9XG4gIH1cbiAgcHJpdmF0ZSBicm9hZGNhc3RlZFJlcXVlc3RzID0gbmV3IE1hcDxcbiAgICBzdHJpbmcsXG4gICAge1xuICAgICAgcHJvbWlzZTogUHJvbWlzZTx1bmtub3duPjtcbiAgICAgIHJlc29sdmU6IChyOiB1bmtub3duKSA9PiB2b2lkO1xuICAgICAgcmVxdWVzdERhdGE6IHVua25vd247XG4gICAgfVxuICA+KCk7XG5cbiAgUmVwbHk8VFJlcSA9IHVua25vd24sIFRSZXAgPSB1bmtub3duPihcbiAgICBjaGFubmVsTmFtZTogc3RyaW5nLFxuICAgIGhhbmRsZXI6IChyZXE6IFRSZXEpID0+IFRSZXAsXG4gICAgYnJvYWRjYXN0ID0gZmFsc2VcbiAgKSB7XG4gICAgaWYgKGJyb2FkY2FzdCkge1xuICAgICAgY29uc3Qgb3JpZ0hhbmRsZXIgPSBoYW5kbGVyO1xuICAgICAgaGFuZGxlciA9ICgobXNnOiBUUmVxLCB0YXJnZXRJZDogc3RyaW5nKSA9PlxuICAgICAgICB0aGlzLl9icm9hZGNhc3QoXG4gICAgICAgICAgY2hhbm5lbE5hbWUsXG4gICAgICAgICAgb3JpZ0hhbmRsZXIobXNnKSxcbiAgICAgICAgICBcInJlcFwiLFxuICAgICAgICAgIHRhcmdldElkXG4gICAgICAgICkpIGFzIHVua25vd24gYXMgKHJlcTogVFJlcSkgPT4gVFJlcDtcbiAgICB9XG4gICAgY29uc3QgcmVxTGlzdGVuZXJzID0gdGhpcy5yZXF1ZXN0TGlzdGVuZXJzO1xuICAgIGNvbnN0IHN1YnM6IFJlcVN1YnNjcmlwdGlvbiA9IHtcbiAgICAgIGNoYW5uZWxOYW1lLFxuICAgICAgZ2V0IGlzRGlzcG9zZWQoKSB7XG4gICAgICAgIHJldHVybiByZXFMaXN0ZW5lcnMuaGFzKGNoYW5uZWxOYW1lKTtcbiAgICAgIH0sXG4gICAgICBpc0Jyb2FkY2FzdDogYnJvYWRjYXN0LFxuICAgICAgaGFuZGxlcjogaGFuZGxlciBhcyAocjogdW5rbm93bikgPT4gdW5rbm93bixcbiAgICAgIGRpc3Bvc2U6IHVuZGVmaW5lZCBhcyB1bmtub3duIGFzICgpID0+IHZvaWQsXG4gICAgfTtcblxuICAgIHN1YnMuZGlzcG9zZSA9ICgpID0+IHtcbiAgICAgIHN1YnMuaXNEaXNwb3NlZCA9IHRydWU7XG4gICAgICBjb25zdCBjdXJyZW50TGlzdGVuZXIgPSB0aGlzLnJlcXVlc3RMaXN0ZW5lcnMuZ2V0KGNoYW5uZWxOYW1lKTtcbiAgICAgIGlmIChjdXJyZW50TGlzdGVuZXIgPT09IHN1YnMpIHRoaXMucmVxdWVzdExpc3RlbmVycy5kZWxldGUoY2hhbm5lbE5hbWUpO1xuICAgIH07XG5cbiAgICBjb25zdCBjdXJyZW50TGlzdGVuZXIgPSB0aGlzLnJlcXVlc3RMaXN0ZW5lcnMuZ2V0KGNoYW5uZWxOYW1lKTtcbiAgICBpZiAoY3VycmVudExpc3RlbmVyKSB7XG4gICAgICBjdXJyZW50TGlzdGVuZXIuaXNEaXNwb3NlZCA9IHRydWU7XG4gICAgICBjb25zb2xlLndhcm4oXCJSZXF1ZXN0IGxpc3RlbmVyIGhhcyBiZWVuIHJlcGxhY2VkOiBcIiArIGNoYW5uZWxOYW1lKTtcbiAgICB9XG4gICAgdGhpcy5yZXF1ZXN0TGlzdGVuZXJzLnNldChjaGFubmVsTmFtZSwgc3Vicyk7XG4gICAgcmV0dXJuIHN1YnM7XG4gIH1cblxuICByZXF1ZXN0TGlzdGVuZXJzID0gbmV3IE1hcDxzdHJpbmcsIFJlcVN1YnNjcmlwdGlvbj4oKTtcblxuICBwcml2YXRlIGFjdGl2ZU5vdGlmaWNhdGlvbnMgPSBuZXcgU2V0PHN0cmluZz4oKTtcblxuICBwcml2YXRlIGFzeW5jIF9fbm90aWZ5U3Vic2NyaWJlcnMoXG4gICAgY2hhbm5lbE5hbWU6IHN0cmluZyxcbiAgICBtc2c6IHVua25vd24sXG4gICAgc0lkOiBzdHJpbmdcbiAgKSB7XG4gICAgdGhpcy5hY3RpdmVOb3RpZmljYXRpb25zLmFkZChjaGFubmVsTmFtZSk7XG4gICAgY29uc3QgaGFuZGxlcnMgPSB0aGlzLnN1YnNjcmliZXJzLmdldChjaGFubmVsTmFtZSkgfHwgW107XG5cbiAgICBjb25zdCBhbGxTdWJzY3JpYmVyc1Byb21pc2VzOiBQcm9taXNlPHZvaWQ+W10gPSBbXTtcbiAgICBmb3IgKGNvbnN0IGggb2YgaGFuZGxlcnMpIHtcbiAgICAgIGlmICghaCkgY29udGludWU7XG4gICAgICBhbGxTdWJzY3JpYmVyc1Byb21pc2VzLnB1c2goUHJvbWlzZS5yZXNvbHZlKGgobXNnLCBzSWQpKSk7XG4gICAgICB0aGlzLmxvZyhcIkhhbmRsZXIgY2FsbGVkXCIsIGNoYW5uZWxOYW1lLCB7IGhhbmRsZXI6IGgsIG1lc3NhZ2U6IG1zZyB9KTtcbiAgICB9XG5cbiAgICBhd2FpdCBQcm9taXNlLmFsbChhbGxTdWJzY3JpYmVyc1Byb21pc2VzKTtcblxuICAgIGlmIChjaGFubmVsU2V0dGluZ3MuZ2V0KGNoYW5uZWxOYW1lKT8uY2FjaGUpXG4gICAgICB0aGlzLnN0YXRlLnNldChjaGFubmVsTmFtZSwgbXNnKTtcblxuICAgIHRoaXMuX19oYW5kbGVBd2FpdGVyKGNoYW5uZWxOYW1lLCBtc2cpO1xuICAgIHRoaXMuYWN0aXZlTm90aWZpY2F0aW9ucy5kZWxldGUoY2hhbm5lbE5hbWUpO1xuXG4gICAgdGhpcy5sb2coXCJNZXNzYWdlIGhhbmRsZWRcIiwgY2hhbm5lbE5hbWUsIHtcbiAgICAgIG1lc3NhZ2U6IG1zZyxcbiAgICAgIGhhbmRsZXJzLFxuICAgICAgYnJva2VyOiB0aGlzLFxuICAgIH0pO1xuICB9XG5cbiAgcHJpdmF0ZSBfX2hhbmRsZUF3YWl0ZXIoc3Vic0tleTogc3RyaW5nLCBtc2c6IHVua25vd24pIHtcbiAgICBjb25zdCBhd2FpdGVyID0gdGhpcy5fX25leHRNZXNzYWdlQXdhaXRlcnMuZ2V0KHN1YnNLZXkpO1xuICAgIGlmICghYXdhaXRlcikgcmV0dXJuO1xuXG4gICAgYXdhaXRlci5yZXNvbHZlKG1zZyk7XG5cbiAgICB0aGlzLl9fbmV4dE1lc3NhZ2VBd2FpdGVycy5kZWxldGUoc3Vic0tleSk7XG4gIH1cbn1cblxuZ2xvYmFsVGhpcy5Ccm93c2VyTWVzc2FnZUJyb2tlciA/Pz0gbmV3IEJyb2tlcigpO1xuXG5leHBvcnQgY29uc3QgQk1CID0gZ2xvYmFsVGhpcy5Ccm93c2VyTWVzc2FnZUJyb2tlcjtcbmV4cG9ydCAqIGZyb20gXCIuL1B1YlN1YkNoYW5uZWxcIjtcbmV4cG9ydCAqIGZyb20gXCIuL1JlcVJlcENoYW5uZWxcIjtcbiIsICJpbXBvcnQgeyBCTUIgfSBmcm9tIFwiLi9Ccm9rZXJcIjtcbmltcG9ydCB7IERpc3Bvc2VyLCBDaGFubmVsU2V0dGluZ3MsIElQdWJTdWJDaGFubmVsLCBUSGFuZGxlciB9IGZyb20gXCIuL1R5cGVzXCI7XG5cbmNvbnN0IHB1YlN1YkNoYW5uZWxzID0gbmV3IE1hcDxzdHJpbmcsIFB1YlN1YkNoYW5uZWw+KCk7XG5cbmV4cG9ydCBjbGFzcyBQdWJTdWJDaGFubmVsPFRNc2cgPSBhbnk+IGltcGxlbWVudHMgSVB1YlN1YkNoYW5uZWw8VE1zZz4ge1xuICBzdGF0aWMgZm9yPFRNc2c+KFxuICAgIG5hbWU6IHN0cmluZyxcbiAgICBzZXR0aW5ncz86IENoYW5uZWxTZXR0aW5nc1xuICApOiBQdWJTdWJDaGFubmVsPFRNc2c+IHtcbiAgICBpZiAoIXNldHRpbmdzKSB7XG4gICAgICBjb25zdCBjID0gcHViU3ViQ2hhbm5lbHMuZ2V0KG5hbWUpO1xuICAgICAgaWYgKCFjKSB0aHJvdyBFcnJvcihcIkNhbid0IGZpbmQgY2hhbm5lbCBzZXR0aW5nc1wiKTtcbiAgICAgIHJldHVybiBjIGFzIFB1YlN1YkNoYW5uZWw8VE1zZz47XG4gICAgfVxuXG4gICAgQk1CLkNvbmZpZ3VyZUNoYW5uZWwoXG4gICAgICBuYW1lLFxuICAgICAgc2V0dGluZ3MuYnJvYWRjYXN0IHx8IGZhbHNlLFxuICAgICAgc2V0dGluZ3MuY2FjaGUgfHwgZmFsc2UsXG4gICAgICBzZXR0aW5ncy50cmFjZSB8fCBmYWxzZVxuICAgICk7XG4gICAgY29uc3QgY2hhbm5lbCA9IG5ldyBQdWJTdWJDaGFubmVsPFRNc2c+KG5hbWUsIHNldHRpbmdzKTtcbiAgICBwdWJTdWJDaGFubmVscy5zZXQobmFtZSwgY2hhbm5lbCk7XG4gICAgcmV0dXJuIGNoYW5uZWw7XG4gIH1cblxuICBwcml2YXRlIGNvbnN0cnVjdG9yKG5hbWU6IHN0cmluZywgc2V0dGluZ3M6IENoYW5uZWxTZXR0aW5ncykge1xuICAgIHRoaXMubmFtZSA9IG5hbWU7XG4gICAgdGhpcy5zZXR0aW5ncyA9IHNldHRpbmdzO1xuICB9XG4gIHNlbmRlcklkID0gQk1CLnNlbmRlcklkO1xuXG4gIGFzeW5jIHNlbmQobXNnOiBUTXNnLCB0YXJnZXRJZD86IHN0cmluZyk6IFByb21pc2U8dm9pZD4ge1xuICAgIEJNQi5QdWJsaXNoKHRoaXMubmFtZSwgbXNnLCB0YXJnZXRJZCk7XG4gIH1cbiAgc3RhdGljIGFzeW5jIHB1Ymxpc2g8VE1zZyA9IGFueT4obmFtZTogc3RyaW5nLCBtc2c6IFRNc2csIHRhcmdldElkPzogc3RyaW5nKSB7XG4gICAgQk1CLlB1Ymxpc2gobmFtZSwgbXNnLCB0YXJnZXRJZCk7XG4gIH1cbiAgc3RhdGljIGFzeW5jIGJyb2FkY2FzdDxUTXNnID0gYW55PihcbiAgICBuYW1lOiBzdHJpbmcsXG4gICAgbXNnOiBUTXNnLFxuICAgIHRhcmdldElkPzogc3RyaW5nXG4gICkge1xuICAgIEJNQi5Ccm9hZGNhc3Q8VE1zZz4obmFtZSwgbXNnLCB0YXJnZXRJZCk7XG4gIH1cblxuICBzdWJzY3JpYmUoaGFuZGxlcjogVEhhbmRsZXI8VE1zZz4pOiBEaXNwb3NlciB7XG4gICAgY29uc3QgcyA9IEJNQi5TdWJzY3JpYmUoXG4gICAgICB0aGlzLm5hbWUsXG4gICAgICBoYW5kbGVyLFxuICAgICAgdGhpcy5zZXR0aW5ncy5icm9hZGNhc3QsXG4gICAgICB0aGlzLnNldHRpbmdzLmNhY2hlXG4gICAgKTtcbiAgICByZXR1cm4gcy5kaXNwb3NlO1xuICB9XG5cbiAgZ2V0U3RhdGUoKTogVE1zZyB8IHVuZGVmaW5lZCB7XG4gICAgcmV0dXJuIEJNQi5HZXRTdGF0ZSh0aGlzLm5hbWUpO1xuICB9XG4gIHN0YXRpYyBHZXRTdGF0ZTxUTXNnPihuYW1lOiBzdHJpbmcpIHtcbiAgICByZXR1cm4gQk1CLkdldFN0YXRlPFRNc2c+KG5hbWUpO1xuICB9XG5cbiAgbmV4dE1lc3NhZ2UoKTogUHJvbWlzZTxUTXNnPiB7XG4gICAgcmV0dXJuIEJNQi5uZXh0TWVzc2FnZSh0aGlzLm5hbWUpO1xuICB9XG5cbiAgc3RhdGljIG5leHRNZXNzYWdlPFRNc2c+KG5hbWU6IHN0cmluZyk6IFByb21pc2U8VE1zZz4ge1xuICAgIHJldHVybiBCTUIubmV4dE1lc3NhZ2UobmFtZSk7XG4gIH1cblxuICByZWFkb25seSB0eXBlID0gXCJwdWJTdWJcIjtcbiAgcmVhZG9ubHkgZGlzcG9zZSA9ICgpID0+IHtcbiAgICBCTUIuc3Vic2NyaWJlcnMuZGVsZXRlKHRoaXMubmFtZSk7XG4gICAgcHViU3ViQ2hhbm5lbHMuZGVsZXRlKHRoaXMubmFtZSk7XG4gIH07XG5cbiAgcmVhZG9ubHkgbmFtZTogc3RyaW5nID0gXCJcIjtcbiAgcmVhZG9ubHkgc2V0dGluZ3M6IENoYW5uZWxTZXR0aW5ncyA9IHt9O1xufVxuIiwgImV4cG9ydCBjb25zdCBQVUJfU1VCX1JFUVVFU1RfU1VCU0NSSVBUSU9OX0tFWSA9IFwidGVzdFJlcVwiO1xuZXhwb3J0IGNvbnN0IFBVQl9TVUJfUkVTUE9OU0VfU1VCU0NSSVBUSU9OX0tFWSA9IFwidGVzdFJlc3BcIjtcbmV4cG9ydCBjb25zdCBSRVFfUkVQX0NIQU5ORUxfTkFNRSA9IFwicmVxUmVwQ2hhbm5lbFwiO1xuIiwgImltcG9ydCB7XG4gIFB1YlN1YkNoYW5uZWwsXG4gIFJlcVJlcENoYW5uZWwsXG59IGZyb20gXCJicm93c2VyLW1lc3NhZ2UtYnJva2VyXCI7XG5pbXBvcnQge1xuICBQVUJfU1VCX1JFUVVFU1RfU1VCU0NSSVBUSU9OX0tFWSxcbiAgUFVCX1NVQl9SRVNQT05TRV9TVUJTQ1JJUFRJT05fS0VZLFxuICBSRVFfUkVQX0NIQU5ORUxfTkFNRSxcbn0gZnJvbSBcIi4vY29uc3RhbnRzXCI7XG5cblB1YlN1YkNoYW5uZWwuZm9yKFBVQl9TVUJfUkVRVUVTVF9TVUJTQ1JJUFRJT05fS0VZLCB7XG4gIGJyb2FkY2FzdDogdHJ1ZSxcbn0pLnN1YnNjcmliZSgoXykgPT4ge1xuICBQdWJTdWJDaGFubmVsLmJyb2FkY2FzdChcbiAgICBQVUJfU1VCX1JFU1BPTlNFX1NVQlNDUklQVElPTl9LRVksXG4gICAgeyBwYXlsb2FkOiBcInJlc3BvbnNlXCIgfVxuICApO1xufSk7XG5cblJlcVJlcENoYW5uZWwuZm9yPHsgcGF5bG9hZDogc3RyaW5nIH0sIHsgcGF5bG9hZDogc3RyaW5nIH0+KFxuICBSRVFfUkVQX0NIQU5ORUxfTkFNRSxcbiAge1xuICAgIGJyb2FkY2FzdDogdHJ1ZSxcbiAgfVxuKS5yZXBseSgocmVxKSA9PiB7XG4gIHJldHVybiB7IHBheWxvYWQ6IHJlcS5wYXlsb2FkICsgXCJyZXNwb25zZVwiIH07XG59KTtcblxuLy9sZXQgd2luZG93IGtub3cgdGhhdCB3b3JrZXIgaXMgcmVhZHkgYW5kIGV4ZWN1dGUgdGVzdFxucG9zdE1lc3NhZ2UoXCJyZWFkeVwiKTtcbiJdLAogICJtYXBwaW5ncyI6ICI7QUFHQSxJQUFNQSxJQUFpQixvQkFBSTtBQUEzQixJQUVhQyxJQUFOLE1BQU1DLEVBRWI7RUF5Q1UsWUFBWUMsR0FBY0MsR0FBMkI7QUEvQjdELFNBQVMsT0FBaUI7QUFFMUIsU0FBQSxXQUE0QixDQUFDO0FBTzdCLFNBQVMsT0FBZTtBQTBCeEIsU0FBQSxXQUFXQyxFQUFJO0FBSGIsU0FBSyxPQUFPRixHQUNaLEtBQUssV0FBV0M7RUFDbEI7RUEzQ0EsTUFBTSxRQUFRRSxHQUF1QztBQUNuRCxXQUFPRCxFQUFJLFFBQWMsS0FBSyxNQUFNQyxHQUFLLEtBQUssU0FBUyxTQUFTO0VBQ2xFO0VBRUEsTUFBTUMsR0FBOEM7QUFDbEQsV0FBT0YsRUFBSSxNQUFrQixLQUFLLE1BQU1FLEdBQVMsS0FBSyxTQUFTLFNBQVMsRUFDckU7RUFDTDtFQU1BLFVBQVU7QUFDUkYsTUFBSSxpQkFBaUIsT0FBTyxLQUFLLElBQUksR0FDckNMLEVBQWUsT0FBTyxLQUFLLElBQUk7RUFDakM7RUFJQSxPQUFPLElBQ0xHLEdBQ0FDLEdBQzJCO0FBQzNCLFFBQUksQ0FBQ0EsR0FBVTtBQUNiLFVBQU1JLElBQUlSLEVBQWUsSUFBSUcsQ0FBSTtBQUNqQyxVQUFJLENBQUNLO0FBQUcsY0FBTSxNQUFN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RCxZQUFZLE9BQU87IiwKICAibmFtZXMiOiBbInJlcVJlcENoYW5uZWxzIiwgIlJlcVJlcENoYW5uZWwiLCAiX1JlcVJlcENoYW5uZWwiLCAibmFtZSIsICJzZXR0aW5ncyIsICJCTUIiLCAibXNnIiwgImhhbmRsZXIiLCAiYyIsICJjaGFubmVsIiwgIkJST0FEQ0FTVF9TWU5DIiwgIkJST1dTRVJfTUVTU0FHRV9CUk9LRVIiLCAiaXNCcm9hZGNhc3RTeW5jIiwgImUiLCAiaXNTeW5jUmVxIiwgImlzU3luY1Jlc3AiLCAic2VuZGVySWQiLCAiZGVib3VuY2UiLCAiZnVuYyIsICJ0aW1lb3V0IiwgInRpbWVyIiwgImFyZ3MiLCAiY2hhbm5lbFNldHRpbmdzIiwgIkJyb2tlciIsICJtZXNzYWdlIiwgImRhdGEiLCAiY2hhbm5lbE5hbWUiLCAiYnJvYWRjYXN0IiwgImNhY2hlIiwgInRyYWNlIiwgImV2IiwgInRhcmdldElkIiwgImZpbHRlckJyb2FkY2FzdHMiLCAiY3VycmVudEJyb2FkY2FzdHMiLCAiayIsICJhdmFpbGFibGVTdGF0ZSIsICJ4IiwgInN0YXRlIiwgInJlcSIsICJzdWJzY3JpcHRpb24iLCAib3JpZ2luYWxEaXNwb3NlIiwgInN1YnNLZXkiLCAiY2hhbm5lbFR5cGUiLCAiX21zZyIsICJlbnZlbG9wZSIsICJhIiwgIm5ld0F3YWl0ZXIiLCAicmVzIiwgInNldHRpbmdzT3ZlcnJpZGRlbiIsICJzdWJzIiwgImhkbCIsICJfc3VicyIsICJpIiwgInJlcXVlc3REYXRhIiwgImxpc3RlbmVyIiwgInJlc29sdmUiLCAiYnJlcSIsICJvcmlnSGFuZGxlciIsICJyZXFMaXN0ZW5lcnMiLCAiY3VycmVudExpc3RlbmVyIiwgInNJZCIsICJoYW5kbGVycyIsICJhbGxTdWJzY3JpYmVyc1Byb21pc2VzIiwgImgiLCAiYXdhaXRlciIsICJwdWJTdWJDaGFubmVscyIsICJQdWJTdWJDaGFubmVsIiwgIl9QdWJTdWJDaGFubmVsIl0KfQo=
