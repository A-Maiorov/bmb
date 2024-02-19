// ../browser-message-broker/dist/Module.js
var b = /* @__PURE__ */ new Map();
var w = class d {
  constructor(e, s) {
    this.type = "reqRep";
    this.settings = {};
    this.name = "";
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
var l = Math.random().toString(36).substring(2, 9);
function M(d3, e = 1) {
  let s;
  return (...t) => {
    clearTimeout(s), s = setTimeout(() => {
      d3(...t);
    }, e);
  };
}
var h = /* @__PURE__ */ new Map();
var f = class {
  constructor() {
    this.trace = false;
    this.traceBroadcasts = false;
    this.traceMessages = false;
    this.senderId = l;
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
    let n = h.get(s);
    (this.trace || n?.trace || n?.broadcast && this.traceBroadcasts || !n?.broadcast && this.traceMessages) && (console.groupCollapsed(`[${globalThis.constructor.name}(${this.senderId})-${s}] ${e}`), console.log(t), console.trace(), console.groupEnd());
  }
  ConfigureChannel(e, s, t, n) {
    h.set(e, { broadcast: s, cache: t, trace: n }), t && !this.state.has(e) && this.state.set(e, void 0), s && this.broadcasts.add(e);
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
    let r = { id: l, availableState: n, broadcasts: t, reqAwaiters: Array.from(this.broadcastedRequests.entries()).map((i) => ({ channelName: i[0], requestData: i[1].requestData })) }, o = { channelName: m, senderCtx: globalThis.constructor.name, senderId: l, targetId: e, msg: r, channelType: "sync" };
    this.__bcChannel.postMessage(o), e == null ? this.log("Broadcast sync requested", "", { brokerState: r }) : this.log("Broadcast sync responded", "", { targetId: e, brokerState: r });
  }
  handleBroadcastSync(e) {
    if (k(e))
      return this.sendBrokerState(e.senderId, e.msg.broadcasts);
    if (B(e)) {
      for (let s of Object.entries(e.msg.availableState))
        this.broadcasts.has(s[0]) && this.state.has(s[0]) && this.state.get(s[0]) == null && this.__notifySubscribers(s[0], s[1], e.senderId);
      for (let s of e.msg.reqAwaiters)
        this.requestListeners.has(s.channelName) && this.broadcasts.has(s.channelName) && this.requestListeners.get(s.channelName)?.handler(s.requestData, e.senderId);
      this.log("Broadcast sync response received", "", e.msg);
    }
  }
  handleBroadcast(e) {
    if (this.log("Broadcast received", e.data.channelName, e.data), e.data.targetId != null && e.data.targetId !== l) {
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
    let r = h.get(e);
    this.log(`Message broadcasted (${t}) to ${n || "all brokers"}`, e, { message: s });
    let o = await Promise.resolve(s), i = { channelName: e, senderCtx: globalThis.constructor.name, senderId: l, targetId: n, msg: o, channelType: t };
    r?.cache && this.state.set(e, s), this.__bcChannel.postMessage(i);
  }
  async Publish(e, s, t) {
    this.log("Message published", e, { message: s }), await this.__notifySubscribers(e, s, l), this.broadcasts.has(e) && this._broadcast(e, s, "pubSub", t);
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
    let r = h.get(e), o = false;
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
    await Promise.all(r), h.get(e)?.cache && this.state.set(e, s), this.__handleAwaiter(e, s), this.activeNotifications.delete(e), this.log("Message handled", e, { message: s, handlers: n, broker: this });
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
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsiLi4vLi4vLi4vYnJvd3Nlci1tZXNzYWdlLWJyb2tlci9zcmMvUmVxUmVwQ2hhbm5lbC50cyIsICIuLi8uLi8uLi9icm93c2VyLW1lc3NhZ2UtYnJva2VyL3NyYy9Ccm9rZXIudHMiLCAiLi4vLi4vLi4vYnJvd3Nlci1tZXNzYWdlLWJyb2tlci9zcmMvUHViU3ViQ2hhbm5lbC50cyIsICJjb25zdGFudHMudHMiLCAidGVzdFdvcmtlci50cyJdLAogICJzb3VyY2VzQ29udGVudCI6IFsiaW1wb3J0IHsgQk1CIH0gZnJvbSBcIi4vQnJva2VyXCI7XG5pbXBvcnQgeyBDaGFubmVsU2V0dGluZ3MsIElSZXFSZXBDaGFubmVsIH0gZnJvbSBcIi4vVHlwZXNcIjtcblxuY29uc3QgcmVxUmVwQ2hhbm5lbHMgPSBuZXcgTWFwPHN0cmluZywgUmVxUmVwQ2hhbm5lbD4oKTtcblxuZXhwb3J0IGNsYXNzIFJlcVJlcENoYW5uZWw8VFJlcSA9IHVua25vd24sIFRSZXAgPSB1bmtub3duPlxuICBpbXBsZW1lbnRzIElSZXFSZXBDaGFubmVsPFRSZXEsIFRSZXA+XG57XG4gIGFzeW5jIHJlcXVlc3QobXNnPzogVFJlcSk6IFByb21pc2U8VFJlcCB8IHVuZGVmaW5lZD4ge1xuICAgIHJldHVybiBCTUIuUmVxdWVzdDxUUmVwPihcbiAgICAgIHRoaXMubmFtZSxcbiAgICAgIG1zZyxcbiAgICAgIHRoaXMuc2V0dGluZ3MuYnJvYWRjYXN0XG4gICAgKTtcbiAgfVxuXG4gIHJlcGx5KGhhbmRsZXI6IChyZXE6IFRSZXEpID0+IFRSZXAgfCBQcm9taXNlPFRSZXA+KSB7XG4gICAgcmV0dXJuIEJNQi5SZXBseTxUUmVxLCBUUmVwPihcbiAgICAgIHRoaXMubmFtZSxcbiAgICAgIGhhbmRsZXIsXG4gICAgICB0aGlzLnNldHRpbmdzLmJyb2FkY2FzdFxuICAgICkuZGlzcG9zZTtcbiAgfVxuXG4gIHJlYWRvbmx5IHR5cGU6IFwicmVxUmVwXCIgPSBcInJlcVJlcFwiO1xuXG4gIHNldHRpbmdzOiBDaGFubmVsU2V0dGluZ3MgPSB7fTtcblxuICBkaXNwb3NlKCkge1xuICAgIEJNQi5yZXF1ZXN0TGlzdGVuZXJzLmRlbGV0ZSh0aGlzLm5hbWUpO1xuICAgIHJlcVJlcENoYW5uZWxzLmRlbGV0ZSh0aGlzLm5hbWUpO1xuICB9XG5cbiAgcmVhZG9ubHkgbmFtZTogc3RyaW5nID0gXCJcIjtcblxuICBzdGF0aWMgZm9yPFRSZXEgPSB1bmtub3duLCBUUmVwID0gdW5rbm93bj4oXG4gICAgbmFtZTogc3RyaW5nLFxuICAgIHNldHRpbmdzPzogQ2hhbm5lbFNldHRpbmdzXG4gICk6IFJlcVJlcENoYW5uZWw8VFJlcSwgVFJlcD4ge1xuICAgIGlmICghc2V0dGluZ3MpIHtcbiAgICAgIGNvbnN0IGMgPSByZXFSZXBDaGFubmVscy5nZXQobmFtZSk7XG4gICAgICBpZiAoIWMpIHRocm93IEVycm9yKFwiQ2FuJ3QgZmluZCBjaGFubmVsIHNldHRpbmdzXCIpO1xuICAgICAgcmV0dXJuIGMgYXMgUmVxUmVwQ2hhbm5lbDxUUmVxLCBUUmVwPjtcbiAgICB9XG5cbiAgICBCTUIuQ29uZmlndXJlQ2hhbm5lbChcbiAgICAgIG5hbWUsXG4gICAgICBzZXR0aW5ncy5icm9hZGNhc3QgfHwgZmFsc2UsXG4gICAgICBzZXR0aW5ncy5jYWNoZSB8fCBmYWxzZSxcbiAgICAgIHNldHRpbmdzLnRyYWNlIHx8IGZhbHNlXG4gICAgKTtcbiAgICBjb25zdCBjaGFubmVsID0gbmV3IFJlcVJlcENoYW5uZWw8VFJlcSwgVFJlcD4oXG4gICAgICBuYW1lLFxuICAgICAgc2V0dGluZ3NcbiAgICApO1xuICAgIHJlcVJlcENoYW5uZWxzLnNldChuYW1lLCBjaGFubmVsKTtcbiAgICByZXR1cm4gY2hhbm5lbDtcbiAgfVxuICBwcml2YXRlIGNvbnN0cnVjdG9yKFxuICAgIG5hbWU6IHN0cmluZyxcbiAgICBzZXR0aW5nczogQ2hhbm5lbFNldHRpbmdzXG4gICkge1xuICAgIHRoaXMubmFtZSA9IG5hbWU7XG4gICAgdGhpcy5zZXR0aW5ncyA9IHNldHRpbmdzO1xuICB9XG59XG4iLCAiaW1wb3J0IHtcbiAgQ2hhbm5lbFR5cGUsXG4gIElCcm9hZGNhc3RFbnZlbG9wZSxcbiAgSUJyb2FkY2FzdFN5bmNFbnZlbG9wZSxcbiAgSUJyb2tlcixcbiAgSUJyb2tlclN0YXRlLFxuICBDaGFubmVsU2V0dGluZ3MsXG4gIFJlcVN1YnNjcmlwdGlvbixcbiAgU3Vic2NyaXB0aW9uLFxuICBUSGFuZGxlcixcbn0gZnJvbSBcIi4vVHlwZXNcIjtcblxuY29uc3QgQlJPQURDQVNUX1NZTkMgPSBcImJyb2FkY2FzdC1zeW5jXCI7XG5jb25zdCBCUk9XU0VSX01FU1NBR0VfQlJPS0VSID0gXCJicm93c2VyLW1lc3NhZ2UtYnJva2VyXCI7XG5cbmZ1bmN0aW9uIGlzQnJvYWRjYXN0U3luYyhlOiBJQnJvYWRjYXN0RW52ZWxvcGUpOiBlIGlzIElCcm9hZGNhc3RTeW5jRW52ZWxvcGUge1xuICByZXR1cm4gZS5jaGFubmVsTmFtZSA9PT0gQlJPQURDQVNUX1NZTkM7XG59XG5cbmZ1bmN0aW9uIGlzU3luY1JlcShlOiBJQnJvYWRjYXN0RW52ZWxvcGUpIHtcbiAgcmV0dXJuIGUuc2VuZGVySWQgIT0gdW5kZWZpbmVkICYmIGUudGFyZ2V0SWQgPT0gdW5kZWZpbmVkO1xufVxuZnVuY3Rpb24gaXNTeW5jUmVzcChlOiBJQnJvYWRjYXN0RW52ZWxvcGUpIHtcbiAgcmV0dXJuIGUuc2VuZGVySWQgIT0gdW5kZWZpbmVkICYmIGUudGFyZ2V0SWQgIT0gdW5kZWZpbmVkO1xufVxuXG5leHBvcnQgY29uc3Qgc2VuZGVySWQgPSBNYXRoLnJhbmRvbSgpLnRvU3RyaW5nKDM2KS5zdWJzdHJpbmcoMiwgOSk7XG5cbmZ1bmN0aW9uIGRlYm91bmNlPFQgZXh0ZW5kcyBGdW5jdGlvbj4oZnVuYzogVCwgdGltZW91dCA9IDEpIHtcbiAgbGV0IHRpbWVyOiBudW1iZXI7XG4gIHJldHVybiAoLi4uYXJnczogdW5rbm93bltdKSA9PiB7XG4gICAgY2xlYXJUaW1lb3V0KHRpbWVyKTtcbiAgICB0aW1lciA9IHNldFRpbWVvdXQoKCkgPT4ge1xuICAgICAgZnVuYyguLi5hcmdzKTtcbiAgICB9LCB0aW1lb3V0KTtcbiAgfTtcbn1cblxuY29uc3QgY2hhbm5lbFNldHRpbmdzID0gbmV3IE1hcDxzdHJpbmcsIENoYW5uZWxTZXR0aW5ncz4oKTtcblxuY2xhc3MgQnJva2VyIGltcGxlbWVudHMgSUJyb2tlciB7XG4gIHRyYWNlOiBib29sZWFuID0gZmFsc2U7XG4gIHRyYWNlQnJvYWRjYXN0czogYm9vbGVhbiA9IGZhbHNlO1xuICB0cmFjZU1lc3NhZ2VzOiBib29sZWFuID0gZmFsc2U7XG4gIHNlbmRlcklkID0gc2VuZGVySWQ7XG4gIHN0YXRlID0gbmV3IE1hcDxzdHJpbmcsIGFueT4oKTtcbiAgc3Vic2NyaWJlcnMgPSBuZXcgTWFwPHN0cmluZywgVEhhbmRsZXJbXT4oKTtcbiAgYnJvYWRjYXN0cyA9IG5ldyBTZXQ8c3RyaW5nPigpO1xuICBwcml2YXRlIF9fYmNDaGFubmVsID0gbmV3IEJyb2FkY2FzdENoYW5uZWwoQlJPV1NFUl9NRVNTQUdFX0JST0tFUik7XG5cbiAgcHJpdmF0ZSBsb2cobWVzc2FnZTogc3RyaW5nLCBjaGFubmVsOiBzdHJpbmcsIGRhdGE/OiB1bmtub3duKSB7XG4gICAgY29uc3QgYyA9IGNoYW5uZWxTZXR0aW5ncy5nZXQoY2hhbm5lbCk7XG4gICAgaWYgKFxuICAgICAgdGhpcy50cmFjZSB8fFxuICAgICAgYz8udHJhY2UgfHxcbiAgICAgIChjPy5icm9hZGNhc3QgJiYgdGhpcy50cmFjZUJyb2FkY2FzdHMpIHx8XG4gICAgICAoIWM/LmJyb2FkY2FzdCAmJiB0aGlzLnRyYWNlTWVzc2FnZXMpXG4gICAgKSB7XG4gICAgICBjb25zb2xlLmdyb3VwQ29sbGFwc2VkKFxuICAgICAgICBgWyR7Z2xvYmFsVGhpcy5jb25zdHJ1Y3Rvci5uYW1lfSgke3RoaXMuc2VuZGVySWR9KS0ke2NoYW5uZWx9XSAke21lc3NhZ2V9YFxuICAgICAgKTtcbiAgICAgIGNvbnNvbGUubG9nKGRhdGEpO1xuICAgICAgY29uc29sZS50cmFjZSgpO1xuICAgICAgY29uc29sZS5ncm91cEVuZCgpO1xuICAgIH1cbiAgfVxuXG4gIGNvbnN0cnVjdG9yKCkge1xuICAgIHRoaXMuX19iY0NoYW5uZWwub25tZXNzYWdlID0gdGhpcy5oYW5kbGVCcm9hZGNhc3QuYmluZCh0aGlzKTtcbiAgICB0aGlzLl9fYmNDaGFubmVsLm9ubWVzc2FnZWVycm9yID0gdGhpcy5oYW5kbGVCcm9hZGNhc3RFcnJvci5iaW5kKHRoaXMpO1xuXG4gICAgc2V0VGltZW91dCgoKSA9PiB7XG4gICAgICB0aGlzLl9fc2VuZEJyb2tlclN0YXRlKHVuZGVmaW5lZCwgdW5kZWZpbmVkKTsgLy8gYWx3YXlzIHNlbmQgaW5pdGlhbCBzeW5jIHJlcXVlc3RcbiAgICB9LCAwKTtcblxuICAgIHRoaXMuc2VuZEJyb2tlclN0YXRlID0gZGVib3VuY2UodGhpcy5fX3NlbmRCcm9rZXJTdGF0ZS5iaW5kKHRoaXMpLCAyKTtcbiAgfVxuXG4gIENvbmZpZ3VyZUNoYW5uZWwoXG4gICAgY2hhbm5lbE5hbWU6IHN0cmluZyxcbiAgICBicm9hZGNhc3Q6IGJvb2xlYW4sXG4gICAgY2FjaGU6IGJvb2xlYW4sXG4gICAgdHJhY2U6IGJvb2xlYW5cbiAgKTogdm9pZCB7XG4gICAgY2hhbm5lbFNldHRpbmdzLnNldChjaGFubmVsTmFtZSwge1xuICAgICAgYnJvYWRjYXN0OiBicm9hZGNhc3QsXG4gICAgICBjYWNoZTogY2FjaGUsXG4gICAgICB0cmFjZSxcbiAgICB9KTtcblxuICAgIGlmIChjYWNoZSAmJiAhdGhpcy5zdGF0ZS5oYXMoY2hhbm5lbE5hbWUpKVxuICAgICAgdGhpcy5zdGF0ZS5zZXQoY2hhbm5lbE5hbWUsIHVuZGVmaW5lZCk7XG4gICAgaWYgKGJyb2FkY2FzdCkgdGhpcy5icm9hZGNhc3RzLmFkZChjaGFubmVsTmFtZSk7XG4gIH1cblxuICBwcml2YXRlIGhhbmRsZUJyb2FkY2FzdEVycm9yKGV2OiBNZXNzYWdlRXZlbnQ8SUJyb2FkY2FzdEVudmVsb3BlPikge1xuICAgIHRocm93IEVycm9yKFwiQlJPQURDQVNUIEZBSUxFRDogXCIgKyBldi5kYXRhKTtcbiAgfVxuXG4gIHByaXZhdGUgc2VuZEJyb2tlclN0YXRlOiAoXG4gICAgdGFyZ2V0SWQ/OiBzdHJpbmcsXG4gICAgZmlsdGVyQnJvYWRjYXN0cz86IHN0cmluZ1tdXG4gICkgPT4gdm9pZDtcbiAgcHJpdmF0ZSBfX3NlbmRCcm9rZXJTdGF0ZSh0YXJnZXRJZD86IHN0cmluZywgZmlsdGVyQnJvYWRjYXN0cz86IHN0cmluZ1tdKSB7XG4gICAgbGV0IGN1cnJlbnRCcm9hZGNhc3RzID0gQXJyYXkuZnJvbSh0aGlzLmJyb2FkY2FzdHMua2V5cygpKTtcblxuICAgIGlmIChmaWx0ZXJCcm9hZGNhc3RzICYmIGZpbHRlckJyb2FkY2FzdHMubGVuZ3RoID4gMCkge1xuICAgICAgY3VycmVudEJyb2FkY2FzdHMgPSBjdXJyZW50QnJvYWRjYXN0cy5maWx0ZXIoKGspID0+XG4gICAgICAgIGZpbHRlckJyb2FkY2FzdHMuaW5jbHVkZXMoaylcbiAgICAgICk7XG4gICAgfVxuXG4gICAgY29uc3QgYXZhaWxhYmxlU3RhdGU6IHsgW3g6IHN0cmluZ106IGFueSB9ID0ge307XG4gICAgZm9yIChjb25zdCB4IG9mIHRoaXMuc3RhdGUpIHtcbiAgICAgIGlmICgheFsxXSkgY29udGludWU7XG4gICAgICBpZiAoIWN1cnJlbnRCcm9hZGNhc3RzLmluY2x1ZGVzKHhbMF0pKSBjb250aW51ZTtcbiAgICAgIGF2YWlsYWJsZVN0YXRlW3hbMF1dID0geFsxXTtcbiAgICB9XG5cbiAgICBjb25zdCBzdGF0ZTogSUJyb2tlclN0YXRlID0ge1xuICAgICAgaWQ6IHNlbmRlcklkLFxuICAgICAgYXZhaWxhYmxlU3RhdGUsXG4gICAgICBicm9hZGNhc3RzOiBjdXJyZW50QnJvYWRjYXN0cyxcbiAgICAgIHJlcUF3YWl0ZXJzOiBBcnJheS5mcm9tKHRoaXMuYnJvYWRjYXN0ZWRSZXF1ZXN0cy5lbnRyaWVzKCkpLm1hcCgoeCkgPT4gKHtcbiAgICAgICAgY2hhbm5lbE5hbWU6IHhbMF0sXG4gICAgICAgIHJlcXVlc3REYXRhOiB4WzFdLnJlcXVlc3REYXRhLFxuICAgICAgfSkpLFxuICAgIH07XG5cbiAgICBjb25zdCBldjogSUJyb2FkY2FzdFN5bmNFbnZlbG9wZSA9IHtcbiAgICAgIGNoYW5uZWxOYW1lOiBCUk9BRENBU1RfU1lOQyxcbiAgICAgIHNlbmRlckN0eDogZ2xvYmFsVGhpcy5jb25zdHJ1Y3Rvci5uYW1lLFxuICAgICAgc2VuZGVySWQsXG4gICAgICB0YXJnZXRJZCxcbiAgICAgIG1zZzogc3RhdGUsXG4gICAgICBjaGFubmVsVHlwZTogXCJzeW5jXCIsXG4gICAgfTtcblxuICAgIHRoaXMuX19iY0NoYW5uZWwucG9zdE1lc3NhZ2UoZXYpO1xuXG4gICAgaWYgKHRhcmdldElkID09IHVuZGVmaW5lZClcbiAgICAgIHRoaXMubG9nKFwiQnJvYWRjYXN0IHN5bmMgcmVxdWVzdGVkXCIsIFwiXCIsIHtcbiAgICAgICAgYnJva2VyU3RhdGU6IHN0YXRlLFxuICAgICAgfSk7XG4gICAgZWxzZVxuICAgICAgdGhpcy5sb2coXCJCcm9hZGNhc3Qgc3luYyByZXNwb25kZWRcIiwgXCJcIiwge1xuICAgICAgICB0YXJnZXRJZCxcbiAgICAgICAgYnJva2VyU3RhdGU6IHN0YXRlLFxuICAgICAgfSk7XG4gIH1cblxuICBwcml2YXRlIGhhbmRsZUJyb2FkY2FzdFN5bmMoZXY6IElCcm9hZGNhc3RTeW5jRW52ZWxvcGUpIHtcbiAgICBpZiAoaXNTeW5jUmVxKGV2KSlcbiAgICAgIHJldHVybiB0aGlzLnNlbmRCcm9rZXJTdGF0ZShldi5zZW5kZXJJZCwgZXYubXNnLmJyb2FkY2FzdHMpO1xuICAgIGlmIChpc1N5bmNSZXNwKGV2KSkge1xuICAgICAgZm9yIChjb25zdCBzIG9mIE9iamVjdC5lbnRyaWVzKGV2Lm1zZy5hdmFpbGFibGVTdGF0ZSkpIHtcbiAgICAgICAgaWYgKFxuICAgICAgICAgIHRoaXMuYnJvYWRjYXN0cy5oYXMoc1swXSkgJiZcbiAgICAgICAgICB0aGlzLnN0YXRlLmhhcyhzWzBdKSAmJlxuICAgICAgICAgIHRoaXMuc3RhdGUuZ2V0KHNbMF0pID09IHVuZGVmaW5lZFxuICAgICAgICApIHtcbiAgICAgICAgICB0aGlzLl9fbm90aWZ5U3Vic2NyaWJlcnMoc1swXSwgc1sxXSwgZXYuc2VuZGVySWQpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICBmb3IgKGNvbnN0IHMgb2YgZXYubXNnLnJlcUF3YWl0ZXJzKSB7XG4gICAgICAgIGlmIChcbiAgICAgICAgICB0aGlzLnJlcXVlc3RMaXN0ZW5lcnMuaGFzKHMuY2hhbm5lbE5hbWUpICYmXG4gICAgICAgICAgdGhpcy5icm9hZGNhc3RzLmhhcyhzLmNoYW5uZWxOYW1lKVxuICAgICAgICApIHtcbiAgICAgICAgICBjb25zdCByZXFMaXN0ZW5lciA9IHRoaXMucmVxdWVzdExpc3RlbmVycy5nZXQocy5jaGFubmVsTmFtZSk7XG4gICAgICAgICAgcmVxTGlzdGVuZXI/LmhhbmRsZXIocy5yZXF1ZXN0RGF0YSwgZXYuc2VuZGVySWQpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICB0aGlzLmxvZyhcIkJyb2FkY2FzdCBzeW5jIHJlc3BvbnNlIHJlY2VpdmVkXCIsIFwiXCIsIGV2Lm1zZyk7XG4gICAgfVxuICB9XG5cbiAgcHJpdmF0ZSBoYW5kbGVCcm9hZGNhc3QoZXY6IE1lc3NhZ2VFdmVudDxJQnJvYWRjYXN0RW52ZWxvcGU+KSB7XG4gICAgdGhpcy5sb2coXCJCcm9hZGNhc3QgcmVjZWl2ZWRcIiwgZXYuZGF0YS5jaGFubmVsTmFtZSwgZXYuZGF0YSk7XG5cbiAgICBpZiAoZXYuZGF0YS50YXJnZXRJZCAhPSB1bmRlZmluZWQgJiYgZXYuZGF0YS50YXJnZXRJZCAhPT0gc2VuZGVySWQpIHtcbiAgICAgIHRoaXMubG9nKFwiQnJvYWRjYXN0IGlnbm9yZWQgKGRpZmZlcmVudCB0YXJnZXRJZClcIiwgZXYuZGF0YS5jaGFubmVsTmFtZSk7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgaWYgKGlzQnJvYWRjYXN0U3luYyhldi5kYXRhKSkgcmV0dXJuIHRoaXMuaGFuZGxlQnJvYWRjYXN0U3luYyhldi5kYXRhKTtcblxuICAgIHN3aXRjaCAoZXYuZGF0YS5jaGFubmVsVHlwZSkge1xuICAgICAgY2FzZSBcInB1YlN1YlwiOlxuICAgICAgICB0aGlzLl9fbm90aWZ5U3Vic2NyaWJlcnMoXG4gICAgICAgICAgZXYuZGF0YS5jaGFubmVsTmFtZSxcbiAgICAgICAgICBldi5kYXRhLm1zZyxcbiAgICAgICAgICBldi5kYXRhLnNlbmRlcklkXG4gICAgICAgICk7XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSBcInJlcVwiOlxuICAgICAgICB0aGlzLmJyaWRnZVJlcXVlc3QoZXYuZGF0YS5jaGFubmVsTmFtZSwgZXYuZGF0YS5tc2csIGV2LmRhdGEuc2VuZGVySWQpO1xuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgXCJyZXBcIjpcbiAgICAgICAgY29uc3QgcmVxID0gdGhpcy5icm9hZGNhc3RlZFJlcXVlc3RzLmdldChldi5kYXRhLmNoYW5uZWxOYW1lKTtcbiAgICAgICAgaWYgKCFyZXEpIHJldHVybjtcblxuICAgICAgICByZXEucmVzb2x2ZShldi5kYXRhLm1zZyk7XG4gICAgICAgIHRoaXMuYnJvYWRjYXN0ZWRSZXF1ZXN0cy5kZWxldGUoZXYuZGF0YS5jaGFubmVsTmFtZSk7XG5cbiAgICAgICAgYnJlYWs7XG4gICAgfVxuXG4gICAgdGhpcy5sb2coXCJCcm9hZGNhc3QgaGFuZGxlZFwiLCBldi5kYXRhLmNoYW5uZWxOYW1lLCBldi5kYXRhKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBCcmlkZ2UgcHViL3N1YiBtZXNzYWdlcyB0byBicm9hZGNhc3QgY2hhbm5lbFxuICAgKiBAcGFyYW0gc3Vic0tleVxuICAgKiBAcmV0dXJucyB7U3Vic2NyaXB0aW9ufVxuICAgKi9cbiAgcHJpdmF0ZSBfX2NvbmZpZ3VyZUJyb2FkY2FzdChzdWJzY3JpcHRpb246IFN1YnNjcmlwdGlvbjxhbnk+KTogdm9pZCB7XG4gICAgaWYgKCFzdWJzY3JpcHRpb24uY2hhbm5lbE5hbWUpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcihgSW52YWxpZCBzdWJzY3JpcHRpb25gKTtcbiAgICB9XG4gICAgdGhpcy5icm9hZGNhc3RzLmFkZChzdWJzY3JpcHRpb24uY2hhbm5lbE5hbWUpO1xuICAgIGNvbnN0IG9yaWdpbmFsRGlzcG9zZSA9IHN1YnNjcmlwdGlvbi5kaXNwb3NlO1xuICAgIHN1YnNjcmlwdGlvbi5kaXNwb3NlID0gKCkgPT4ge1xuICAgICAgb3JpZ2luYWxEaXNwb3NlKCk7XG4gICAgICB0aGlzLmJyb2FkY2FzdHMuZGVsZXRlKHN1YnNjcmlwdGlvbi5jaGFubmVsTmFtZSk7XG4gICAgfTtcbiAgICBzdWJzY3JpcHRpb24uaXNCcm9hZGNhc3QgPSB0cnVlO1xuXG4gICAgdGhpcy5zZW5kQnJva2VyU3RhdGUoKTtcbiAgfVxuXG4gIEdldFN0YXRlPFQ+KHN1YnNLZXk6IHN0cmluZyk6IFQgfCB1bmRlZmluZWQge1xuICAgIGlmIChzdWJzS2V5KSB7XG4gICAgICByZXR1cm4gdGhpcy5zdGF0ZS5nZXQoc3Vic0tleSkgYXMgVDtcbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIHVuZGVmaW5lZDtcbiAgICB9XG4gIH1cblxuICBhc3luYyBCcm9hZGNhc3QoY2hhbm5lbE5hbWU6IHN0cmluZywgbXNnOiB1bmtub3duLCB0YXJnZXRJZD86IHN0cmluZykge1xuICAgIHRoaXMuX2Jyb2FkY2FzdChjaGFubmVsTmFtZSwgbXNnLCBcInB1YlN1YlwiLCB0YXJnZXRJZCk7XG4gIH1cblxuICBwcml2YXRlIGFzeW5jIF9icm9hZGNhc3QoXG4gICAgY2hhbm5lbE5hbWU6IHN0cmluZyxcbiAgICBtc2c6IHVua25vd24sXG4gICAgY2hhbm5lbFR5cGU6IENoYW5uZWxUeXBlLFxuICAgIHRhcmdldElkPzogc3RyaW5nXG4gICkge1xuICAgIGNvbnN0IHNldHRpbmdzID0gY2hhbm5lbFNldHRpbmdzLmdldChjaGFubmVsTmFtZSk7XG5cbiAgICB0aGlzLmxvZyhcbiAgICAgIGBNZXNzYWdlIGJyb2FkY2FzdGVkICgke2NoYW5uZWxUeXBlfSkgdG8gJHt0YXJnZXRJZCB8fCBcImFsbCBicm9rZXJzXCJ9YCxcbiAgICAgIGNoYW5uZWxOYW1lLFxuICAgICAgeyBtZXNzYWdlOiBtc2cgfVxuICAgICk7XG5cbiAgICBjb25zdCBfbXNnID0gYXdhaXQgUHJvbWlzZS5yZXNvbHZlKG1zZyk7XG4gICAgY29uc3QgZW52ZWxvcGU6IElCcm9hZGNhc3RFbnZlbG9wZSA9IHtcbiAgICAgIGNoYW5uZWxOYW1lOiBjaGFubmVsTmFtZSxcbiAgICAgIHNlbmRlckN0eDogZ2xvYmFsVGhpcy5jb25zdHJ1Y3Rvci5uYW1lLFxuICAgICAgc2VuZGVySWQ6IHNlbmRlcklkLFxuICAgICAgdGFyZ2V0SWQ6IHRhcmdldElkLFxuICAgICAgbXNnOiBfbXNnLFxuICAgICAgY2hhbm5lbFR5cGUsXG4gICAgfTtcblxuICAgIGlmIChzZXR0aW5ncz8uY2FjaGUpIHRoaXMuc3RhdGUuc2V0KGNoYW5uZWxOYW1lLCBtc2cpO1xuXG4gICAgdGhpcy5fX2JjQ2hhbm5lbC5wb3N0TWVzc2FnZShlbnZlbG9wZSk7XG4gIH1cblxuICBhc3luYyBQdWJsaXNoKGNoYW5uZWxOYW1lOiBzdHJpbmcsIG1zZzogdW5rbm93biwgdGFyZ2V0SWQ/OiBzdHJpbmcpIHtcbiAgICB0aGlzLmxvZyhgTWVzc2FnZSBwdWJsaXNoZWRgLCBjaGFubmVsTmFtZSwgeyBtZXNzYWdlOiBtc2cgfSk7XG4gICAgYXdhaXQgdGhpcy5fX25vdGlmeVN1YnNjcmliZXJzKGNoYW5uZWxOYW1lLCBtc2csIHNlbmRlcklkKTtcblxuICAgIGlmICghdGhpcy5icm9hZGNhc3RzLmhhcyhjaGFubmVsTmFtZSkpIHJldHVybjtcblxuICAgIHRoaXMuX2Jyb2FkY2FzdChjaGFubmVsTmFtZSwgbXNnLCBcInB1YlN1YlwiLCB0YXJnZXRJZCk7XG4gIH1cblxuICBwcml2YXRlIF9fbmV4dE1lc3NhZ2VBd2FpdGVycyA9IG5ldyBNYXA8XG4gICAgc3RyaW5nLFxuICAgIHtcbiAgICAgIHByb21pc2U6IFByb21pc2U8dW5rbm93bj47XG4gICAgICByZXNvbHZlOiAobXNnOiB1bmtub3duKSA9PiB1bmtub3duO1xuICAgIH1cbiAgPigpO1xuXG4gIGFzeW5jIG5leHRNZXNzYWdlPFQgPSB1bmtub3duPihzdWJzS2V5OiBzdHJpbmcpOiBQcm9taXNlPFQ+IHtcbiAgICBjb25zdCBhID0gdGhpcy5fX25leHRNZXNzYWdlQXdhaXRlcnMuZ2V0KHN1YnNLZXkpO1xuICAgIGlmIChhKSByZXR1cm4gYS5wcm9taXNlIGFzIFByb21pc2U8VD47XG5cbiAgICBjb25zdCBuZXdBd2FpdGVyOiB7XG4gICAgICBwcm9taXNlOiBQcm9taXNlPHVua25vd24+O1xuICAgICAgcmVzb2x2ZTogKG1zZzogdW5rbm93bikgPT4gdm9pZDtcbiAgICB9ID0ge1xuICAgICAgcHJvbWlzZTogdW5kZWZpbmVkIGFzIHVua25vd24gYXMgUHJvbWlzZTxUPixcbiAgICAgIHJlc29sdmU6IHVuZGVmaW5lZCBhcyB1bmtub3duIGFzIChtc2c6IHVua25vd24pID0+IHZvaWQsXG4gICAgfTtcbiAgICBuZXdBd2FpdGVyLnByb21pc2UgPSBuZXcgUHJvbWlzZSgocmVzOiAobXNnOiB1bmtub3duKSA9PiB2b2lkKSA9PiB7XG4gICAgICBuZXdBd2FpdGVyLnJlc29sdmUgPSByZXM7XG4gICAgfSk7XG5cbiAgICB0aGlzLl9fbmV4dE1lc3NhZ2VBd2FpdGVycy5zZXQoc3Vic0tleSwgbmV3QXdhaXRlcik7XG5cbiAgICByZXR1cm4gbmV3QXdhaXRlci5wcm9taXNlIGFzIFByb21pc2U8VD47XG4gIH1cblxuICBTdWJzY3JpYmU8VD4oXG4gICAgY2hhbm5lbE5hbWU6IHN0cmluZyxcbiAgICBoYW5kbGVyPzogVEhhbmRsZXI8VD4sXG4gICAgYnJvYWRjYXN0ID0gZmFsc2UsXG4gICAgY2FjaGUgPSB0cnVlXG4gICk6IFN1YnNjcmlwdGlvbjxUPiB7XG4gICAgY29uc3Qgc2V0dGluZ3MgPSBjaGFubmVsU2V0dGluZ3MuZ2V0KGNoYW5uZWxOYW1lKTtcbiAgICBjb25zdCBzZXR0aW5nc092ZXJyaWRkZW4gPSBmYWxzZTtcbiAgICBpZiAoc2V0dGluZ3MpIHtcbiAgICAgIGJyb2FkY2FzdCA9IHNldHRpbmdzLmJyb2FkY2FzdCB8fCBmYWxzZTtcbiAgICAgIGNhY2hlID0gc2V0dGluZ3MuY2FjaGUgfHwgdHJ1ZTtcbiAgICAgIHNldHRpbmdzT3ZlcnJpZGRlbjtcbiAgICB9XG5cbiAgICBjb25zdCBzdWJzID0gdGhpcy5zdWJzY3JpYmVycy5nZXQoY2hhbm5lbE5hbWUpIHx8IFtdO1xuICAgIGNvbnN0IGhkbCA9IGhhbmRsZXIgYXMgKG1zZzogdW5rbm93bikgPT4gdm9pZDtcbiAgICBzdWJzLnB1c2goaGRsKTtcbiAgICB0aGlzLnN1YnNjcmliZXJzLnNldChjaGFubmVsTmFtZSwgc3Vicyk7XG5cbiAgICBjb25zdCBzdWJzY3JpcHRpb246IFN1YnNjcmlwdGlvbjxUPiA9IHtcbiAgICAgIGNoYW5uZWxOYW1lOiBjaGFubmVsTmFtZSxcbiAgICAgIGlzQ2FjaGVkOiBmYWxzZSxcbiAgICAgIGRpc3Bvc2U6ICgpID0+IHtcbiAgICAgICAgY29uc3QgX3N1YnMgPSB0aGlzLnN1YnNjcmliZXJzLmdldChjaGFubmVsTmFtZSk7XG5cbiAgICAgICAgaWYgKF9zdWJzID09IHVuZGVmaW5lZCkgcmV0dXJuO1xuICAgICAgICBjb25zdCBpID0gX3N1YnMuaW5kZXhPZihoZGwpO1xuXG4gICAgICAgIGlmIChpID09PSAtMSkgcmV0dXJuO1xuICAgICAgICBfc3Vicy5zcGxpY2UoaSwgMSk7XG4gICAgICB9LFxuICAgICAgcHVibGlzaDogKG1zZywgdGFyZ2V0SWQ/OiBzdHJpbmcpID0+XG4gICAgICAgIHRoaXMuUHVibGlzaChjaGFubmVsTmFtZSwgbXNnLCB0YXJnZXRJZCksXG4gICAgICBpc0Rpc3Bvc2VkOiBmYWxzZSxcbiAgICB9O1xuXG4gICAgaWYgKGJyb2FkY2FzdCkgdGhpcy5fX2NvbmZpZ3VyZUJyb2FkY2FzdChzdWJzY3JpcHRpb24pO1xuICAgIGlmIChjYWNoZSkge1xuICAgICAgaWYgKCF0aGlzLnN0YXRlLmhhcyhjaGFubmVsTmFtZSkpIHRoaXMuc3RhdGUuc2V0KGNoYW5uZWxOYW1lLCB1bmRlZmluZWQpO1xuICAgICAgY29uc3Qgc3RhdGUgPSB0aGlzLnN0YXRlLmdldChjaGFubmVsTmFtZSk7XG4gICAgICBpZiAoc3RhdGUpIGhkbChzdGF0ZSk7XG4gICAgfVxuICAgIGlmICh0aGlzLmFjdGl2ZU5vdGlmaWNhdGlvbnMuaGFzKGNoYW5uZWxOYW1lKSlcbiAgICAgIHRoaXMubmV4dE1lc3NhZ2UoY2hhbm5lbE5hbWUpLnRoZW4oKHgpID0+IGhkbCh4KSk7XG5cbiAgICByZXR1cm4gc3Vic2NyaXB0aW9uO1xuICB9XG5cbiAgcHJpdmF0ZSBicmlkZ2VSZXF1ZXN0KFxuICAgIGNoYW5uZWxOYW1lOiBzdHJpbmcsXG4gICAgcmVxdWVzdERhdGE6IHVua25vd24sXG4gICAgc2VuZGVySWQ6IHN0cmluZ1xuICApIHtcbiAgICBjb25zdCBsaXN0ZW5lciA9IHRoaXMucmVxdWVzdExpc3RlbmVycy5nZXQoY2hhbm5lbE5hbWUpO1xuXG4gICAgaWYgKCFsaXN0ZW5lcikgcmV0dXJuIFByb21pc2UucmVzb2x2ZSh1bmRlZmluZWQpO1xuXG4gICAgcmV0dXJuIGxpc3RlbmVyLmhhbmRsZXIocmVxdWVzdERhdGEsIHNlbmRlcklkKSBhcyBQcm9taXNlPHVua25vd24+O1xuICB9XG5cbiAgUmVxdWVzdDxUUmVwID0gdW5rbm93bj4oXG4gICAgY2hhbm5lbE5hbWU6IHN0cmluZyxcbiAgICByZXF1ZXN0RGF0YTogdW5rbm93bixcbiAgICBicm9hZGNhc3QgPSBmYWxzZSxcbiAgICB0YXJnZXRJZD86IHN0cmluZ1xuICApOiBQcm9taXNlPFRSZXA+IHwgUHJvbWlzZTx1bmRlZmluZWQ+IHtcbiAgICBpZiAoIWJyb2FkY2FzdCkge1xuICAgICAgY29uc3QgbGlzdGVuZXIgPSB0aGlzLnJlcXVlc3RMaXN0ZW5lcnMuZ2V0KGNoYW5uZWxOYW1lKTtcbiAgICAgIGlmICghbGlzdGVuZXIpIHJldHVybiBQcm9taXNlLnJlc29sdmUodW5kZWZpbmVkKTtcbiAgICAgIHJldHVybiBsaXN0ZW5lci5oYW5kbGVyKHJlcXVlc3REYXRhKSBhcyBQcm9taXNlPFRSZXA+O1xuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLl9icm9hZGNhc3QoY2hhbm5lbE5hbWUsIHJlcXVlc3REYXRhLCBcInJlcVwiLCB0YXJnZXRJZCk7XG4gICAgICBjb25zdCByZXEgPSB0aGlzLmJyb2FkY2FzdGVkUmVxdWVzdHMuZ2V0KGNoYW5uZWxOYW1lKTtcbiAgICAgIGlmIChyZXEpIHJlcS5yZXNvbHZlKHVuZGVmaW5lZCk7XG5cbiAgICAgIGxldCByZXNvbHZlID0gdW5kZWZpbmVkIGFzIHVua25vd24gYXMgKHI6IHVua25vd24pID0+IHZvaWQ7XG4gICAgICBjb25zdCBwcm9taXNlID0gbmV3IFByb21pc2U8VFJlcD4oXG4gICAgICAgIChyZXMpID0+IChyZXNvbHZlID0gcmVzIGFzIChyOiB1bmtub3duKSA9PiB2b2lkKVxuICAgICAgKTtcbiAgICAgIGNvbnN0IGJyZXEgPSB7XG4gICAgICAgIHByb21pc2UsXG4gICAgICAgIHJlc29sdmUsXG4gICAgICAgIHJlcXVlc3REYXRhLFxuICAgICAgfTtcbiAgICAgIHRoaXMuYnJvYWRjYXN0ZWRSZXF1ZXN0cy5zZXQoY2hhbm5lbE5hbWUsIGJyZXEpO1xuICAgICAgcmV0dXJuIGJyZXEucHJvbWlzZTtcbiAgICB9XG4gIH1cbiAgcHJpdmF0ZSBicm9hZGNhc3RlZFJlcXVlc3RzID0gbmV3IE1hcDxcbiAgICBzdHJpbmcsXG4gICAge1xuICAgICAgcHJvbWlzZTogUHJvbWlzZTx1bmtub3duPjtcbiAgICAgIHJlc29sdmU6IChyOiB1bmtub3duKSA9PiB2b2lkO1xuICAgICAgcmVxdWVzdERhdGE6IHVua25vd247XG4gICAgfVxuICA+KCk7XG5cbiAgUmVwbHk8VFJlcSA9IHVua25vd24sIFRSZXAgPSB1bmtub3duPihcbiAgICBjaGFubmVsTmFtZTogc3RyaW5nLFxuICAgIGhhbmRsZXI6IChyZXE6IFRSZXEpID0+IFRSZXAsXG4gICAgYnJvYWRjYXN0ID0gZmFsc2VcbiAgKSB7XG4gICAgaWYgKGJyb2FkY2FzdCkge1xuICAgICAgY29uc3Qgb3JpZ0hhbmRsZXIgPSBoYW5kbGVyO1xuICAgICAgaGFuZGxlciA9ICgobXNnOiBUUmVxLCB0YXJnZXRJZDogc3RyaW5nKSA9PlxuICAgICAgICB0aGlzLl9icm9hZGNhc3QoXG4gICAgICAgICAgY2hhbm5lbE5hbWUsXG4gICAgICAgICAgb3JpZ0hhbmRsZXIobXNnKSxcbiAgICAgICAgICBcInJlcFwiLFxuICAgICAgICAgIHRhcmdldElkXG4gICAgICAgICkpIGFzIHVua25vd24gYXMgKHJlcTogVFJlcSkgPT4gVFJlcDtcbiAgICB9XG4gICAgY29uc3QgcmVxTGlzdGVuZXJzID0gdGhpcy5yZXF1ZXN0TGlzdGVuZXJzO1xuICAgIGNvbnN0IHN1YnM6IFJlcVN1YnNjcmlwdGlvbiA9IHtcbiAgICAgIGNoYW5uZWxOYW1lLFxuICAgICAgZ2V0IGlzRGlzcG9zZWQoKSB7XG4gICAgICAgIHJldHVybiByZXFMaXN0ZW5lcnMuaGFzKGNoYW5uZWxOYW1lKTtcbiAgICAgIH0sXG4gICAgICBpc0Jyb2FkY2FzdDogYnJvYWRjYXN0LFxuICAgICAgaGFuZGxlcjogaGFuZGxlciBhcyAocjogdW5rbm93bikgPT4gdW5rbm93bixcbiAgICAgIGRpc3Bvc2U6IHVuZGVmaW5lZCBhcyB1bmtub3duIGFzICgpID0+IHZvaWQsXG4gICAgfTtcblxuICAgIHN1YnMuZGlzcG9zZSA9ICgpID0+IHtcbiAgICAgIHN1YnMuaXNEaXNwb3NlZCA9IHRydWU7XG4gICAgICBjb25zdCBjdXJyZW50TGlzdGVuZXIgPSB0aGlzLnJlcXVlc3RMaXN0ZW5lcnMuZ2V0KGNoYW5uZWxOYW1lKTtcbiAgICAgIGlmIChjdXJyZW50TGlzdGVuZXIgPT09IHN1YnMpIHRoaXMucmVxdWVzdExpc3RlbmVycy5kZWxldGUoY2hhbm5lbE5hbWUpO1xuICAgIH07XG5cbiAgICBjb25zdCBjdXJyZW50TGlzdGVuZXIgPSB0aGlzLnJlcXVlc3RMaXN0ZW5lcnMuZ2V0KGNoYW5uZWxOYW1lKTtcbiAgICBpZiAoY3VycmVudExpc3RlbmVyKSB7XG4gICAgICBjdXJyZW50TGlzdGVuZXIuaXNEaXNwb3NlZCA9IHRydWU7XG4gICAgICBjb25zb2xlLndhcm4oXCJSZXF1ZXN0IGxpc3RlbmVyIGhhcyBiZWVuIHJlcGxhY2VkOiBcIiArIGNoYW5uZWxOYW1lKTtcbiAgICB9XG4gICAgdGhpcy5yZXF1ZXN0TGlzdGVuZXJzLnNldChjaGFubmVsTmFtZSwgc3Vicyk7XG4gICAgcmV0dXJuIHN1YnM7XG4gIH1cblxuICByZXF1ZXN0TGlzdGVuZXJzID0gbmV3IE1hcDxzdHJpbmcsIFJlcVN1YnNjcmlwdGlvbj4oKTtcblxuICBwcml2YXRlIGFjdGl2ZU5vdGlmaWNhdGlvbnMgPSBuZXcgU2V0PHN0cmluZz4oKTtcblxuICBwcml2YXRlIGFzeW5jIF9fbm90aWZ5U3Vic2NyaWJlcnMoXG4gICAgY2hhbm5lbE5hbWU6IHN0cmluZyxcbiAgICBtc2c6IHVua25vd24sXG4gICAgc0lkOiBzdHJpbmdcbiAgKSB7XG4gICAgdGhpcy5hY3RpdmVOb3RpZmljYXRpb25zLmFkZChjaGFubmVsTmFtZSk7XG4gICAgY29uc3QgaGFuZGxlcnMgPSB0aGlzLnN1YnNjcmliZXJzLmdldChjaGFubmVsTmFtZSkgfHwgW107XG5cbiAgICBjb25zdCBhbGxTdWJzY3JpYmVyc1Byb21pc2VzOiBQcm9taXNlPHZvaWQ+W10gPSBbXTtcbiAgICBmb3IgKGNvbnN0IGggb2YgaGFuZGxlcnMpIHtcbiAgICAgIGlmICghaCkgY29udGludWU7XG4gICAgICBhbGxTdWJzY3JpYmVyc1Byb21pc2VzLnB1c2goUHJvbWlzZS5yZXNvbHZlKGgobXNnLCBzSWQpKSk7XG4gICAgICB0aGlzLmxvZyhcIkhhbmRsZXIgY2FsbGVkXCIsIGNoYW5uZWxOYW1lLCB7IGhhbmRsZXI6IGgsIG1lc3NhZ2U6IG1zZyB9KTtcbiAgICB9XG5cbiAgICBhd2FpdCBQcm9taXNlLmFsbChhbGxTdWJzY3JpYmVyc1Byb21pc2VzKTtcblxuICAgIGlmIChjaGFubmVsU2V0dGluZ3MuZ2V0KGNoYW5uZWxOYW1lKT8uY2FjaGUpXG4gICAgICB0aGlzLnN0YXRlLnNldChjaGFubmVsTmFtZSwgbXNnKTtcblxuICAgIHRoaXMuX19oYW5kbGVBd2FpdGVyKGNoYW5uZWxOYW1lLCBtc2cpO1xuICAgIHRoaXMuYWN0aXZlTm90aWZpY2F0aW9ucy5kZWxldGUoY2hhbm5lbE5hbWUpO1xuXG4gICAgdGhpcy5sb2coXCJNZXNzYWdlIGhhbmRsZWRcIiwgY2hhbm5lbE5hbWUsIHtcbiAgICAgIG1lc3NhZ2U6IG1zZyxcbiAgICAgIGhhbmRsZXJzLFxuICAgICAgYnJva2VyOiB0aGlzLFxuICAgIH0pO1xuICB9XG5cbiAgcHJpdmF0ZSBfX2hhbmRsZUF3YWl0ZXIoc3Vic0tleTogc3RyaW5nLCBtc2c6IHVua25vd24pIHtcbiAgICBjb25zdCBhd2FpdGVyID0gdGhpcy5fX25leHRNZXNzYWdlQXdhaXRlcnMuZ2V0KHN1YnNLZXkpO1xuICAgIGlmICghYXdhaXRlcikgcmV0dXJuO1xuXG4gICAgYXdhaXRlci5yZXNvbHZlKG1zZyk7XG5cbiAgICB0aGlzLl9fbmV4dE1lc3NhZ2VBd2FpdGVycy5kZWxldGUoc3Vic0tleSk7XG4gIH1cbn1cblxuZ2xvYmFsVGhpcy5Ccm93c2VyTWVzc2FnZUJyb2tlciA/Pz0gbmV3IEJyb2tlcigpO1xuXG5leHBvcnQgY29uc3QgQk1CID0gZ2xvYmFsVGhpcy5Ccm93c2VyTWVzc2FnZUJyb2tlcjtcbmV4cG9ydCAqIGZyb20gXCIuL1B1YlN1YkNoYW5uZWxcIjtcbmV4cG9ydCAqIGZyb20gXCIuL1JlcVJlcENoYW5uZWxcIjtcbiIsICJpbXBvcnQgeyBCTUIgfSBmcm9tIFwiLi9Ccm9rZXJcIjtcbmltcG9ydCB7XG4gIERpc3Bvc2VyLFxuICBDaGFubmVsU2V0dGluZ3MsXG4gIElQdWJTdWJDaGFubmVsLFxuICBUSGFuZGxlcixcbn0gZnJvbSBcIi4vVHlwZXNcIjtcblxuY29uc3QgcHViU3ViQ2hhbm5lbHMgPSBuZXcgTWFwPHN0cmluZywgUHViU3ViQ2hhbm5lbD4oKTtcblxuZXhwb3J0IGNsYXNzIFB1YlN1YkNoYW5uZWw8VE1zZyA9IGFueT5cbiAgaW1wbGVtZW50cyBJUHViU3ViQ2hhbm5lbDxUTXNnPlxue1xuICBzdGF0aWMgZm9yPFRNc2c+KFxuICAgIG5hbWU6IHN0cmluZyxcbiAgICBzZXR0aW5ncz86IENoYW5uZWxTZXR0aW5nc1xuICApOiBQdWJTdWJDaGFubmVsPFRNc2c+IHtcbiAgICBpZiAoIXNldHRpbmdzKSB7XG4gICAgICBjb25zdCBjID0gcHViU3ViQ2hhbm5lbHMuZ2V0KG5hbWUpO1xuICAgICAgaWYgKCFjKSB0aHJvdyBFcnJvcihcIkNhbid0IGZpbmQgY2hhbm5lbCBzZXR0aW5nc1wiKTtcbiAgICAgIHJldHVybiBjIGFzIFB1YlN1YkNoYW5uZWw8VE1zZz47XG4gICAgfVxuXG4gICAgQk1CLkNvbmZpZ3VyZUNoYW5uZWwoXG4gICAgICBuYW1lLFxuICAgICAgc2V0dGluZ3MuYnJvYWRjYXN0IHx8IGZhbHNlLFxuICAgICAgc2V0dGluZ3MuY2FjaGUgfHwgZmFsc2UsXG4gICAgICBzZXR0aW5ncy50cmFjZSB8fCBmYWxzZVxuICAgICk7XG4gICAgY29uc3QgY2hhbm5lbCA9IG5ldyBQdWJTdWJDaGFubmVsPFRNc2c+KG5hbWUsIHNldHRpbmdzKTtcbiAgICBwdWJTdWJDaGFubmVscy5zZXQobmFtZSwgY2hhbm5lbCk7XG4gICAgcmV0dXJuIGNoYW5uZWw7XG4gIH1cblxuICBwcml2YXRlIGNvbnN0cnVjdG9yKFxuICAgIG5hbWU6IHN0cmluZyxcbiAgICBzZXR0aW5nczogQ2hhbm5lbFNldHRpbmdzXG4gICkge1xuICAgIHRoaXMubmFtZSA9IG5hbWU7XG4gICAgdGhpcy5zZXR0aW5ncyA9IHNldHRpbmdzO1xuICB9XG5cbiAgYXN5bmMgc2VuZChtc2c6IFRNc2csIHRhcmdldElkPzogc3RyaW5nKTogUHJvbWlzZTx2b2lkPiB7XG4gICAgQk1CLlB1Ymxpc2godGhpcy5uYW1lLCBtc2csIHRhcmdldElkKTtcbiAgfVxuICBzdGF0aWMgYXN5bmMgcHVibGlzaDxUTXNnID0gYW55PihcbiAgICBuYW1lOiBzdHJpbmcsXG4gICAgbXNnOiBUTXNnLFxuICAgIHRhcmdldElkPzogc3RyaW5nXG4gICkge1xuICAgIEJNQi5QdWJsaXNoKG5hbWUsIG1zZywgdGFyZ2V0SWQpO1xuICB9XG4gIHN0YXRpYyBhc3luYyBicm9hZGNhc3Q8VE1zZyA9IGFueT4oXG4gICAgbmFtZTogc3RyaW5nLFxuICAgIG1zZzogVE1zZyxcbiAgICB0YXJnZXRJZD86IHN0cmluZ1xuICApIHtcbiAgICBCTUIuQnJvYWRjYXN0PFRNc2c+KG5hbWUsIG1zZywgdGFyZ2V0SWQpO1xuICB9XG5cbiAgc3Vic2NyaWJlKGhhbmRsZXI6IFRIYW5kbGVyPFRNc2c+KTogRGlzcG9zZXIge1xuICAgIGNvbnN0IHMgPSBCTUIuU3Vic2NyaWJlKFxuICAgICAgdGhpcy5uYW1lLFxuICAgICAgaGFuZGxlcixcbiAgICAgIHRoaXMuc2V0dGluZ3MuYnJvYWRjYXN0LFxuICAgICAgdGhpcy5zZXR0aW5ncy5jYWNoZVxuICAgICk7XG4gICAgcmV0dXJuIHMuZGlzcG9zZTtcbiAgfVxuXG4gIGdldFN0YXRlKCk6IFRNc2cgfCB1bmRlZmluZWQge1xuICAgIHJldHVybiBCTUIuR2V0U3RhdGUodGhpcy5uYW1lKTtcbiAgfVxuICBzdGF0aWMgR2V0U3RhdGU8VE1zZz4obmFtZTogc3RyaW5nKSB7XG4gICAgcmV0dXJuIEJNQi5HZXRTdGF0ZTxUTXNnPihuYW1lKTtcbiAgfVxuXG4gIG5leHRNZXNzYWdlKCk6IFByb21pc2U8VE1zZz4ge1xuICAgIHJldHVybiBCTUIubmV4dE1lc3NhZ2UodGhpcy5uYW1lKTtcbiAgfVxuXG4gIHN0YXRpYyBuZXh0TWVzc2FnZTxUTXNnPihuYW1lOiBzdHJpbmcpOiBQcm9taXNlPFRNc2c+IHtcbiAgICByZXR1cm4gQk1CLm5leHRNZXNzYWdlKG5hbWUpO1xuICB9XG5cbiAgcmVhZG9ubHkgdHlwZSA9IFwicHViU3ViXCI7XG4gIHJlYWRvbmx5IGRpc3Bvc2UgPSAoKSA9PiB7XG4gICAgQk1CLnN1YnNjcmliZXJzLmRlbGV0ZSh0aGlzLm5hbWUpO1xuICAgIHB1YlN1YkNoYW5uZWxzLmRlbGV0ZSh0aGlzLm5hbWUpO1xuICB9O1xuXG4gIHJlYWRvbmx5IG5hbWU6IHN0cmluZyA9IFwiXCI7XG4gIHJlYWRvbmx5IHNldHRpbmdzOiBDaGFubmVsU2V0dGluZ3MgPSB7fTtcbn1cbiIsICJleHBvcnQgY29uc3QgUFVCX1NVQl9SRVFVRVNUX1NVQlNDUklQVElPTl9LRVkgPSBcInRlc3RSZXFcIjtcbmV4cG9ydCBjb25zdCBQVUJfU1VCX1JFU1BPTlNFX1NVQlNDUklQVElPTl9LRVkgPSBcInRlc3RSZXNwXCI7XG5leHBvcnQgY29uc3QgUkVRX1JFUF9DSEFOTkVMX05BTUUgPSBcInJlcVJlcENoYW5uZWxcIjtcbiIsICJpbXBvcnQge1xuICBQdWJTdWJDaGFubmVsLFxuICBSZXFSZXBDaGFubmVsLFxufSBmcm9tIFwiYnJvd3Nlci1tZXNzYWdlLWJyb2tlclwiO1xuaW1wb3J0IHtcbiAgUFVCX1NVQl9SRVFVRVNUX1NVQlNDUklQVElPTl9LRVksXG4gIFBVQl9TVUJfUkVTUE9OU0VfU1VCU0NSSVBUSU9OX0tFWSxcbiAgUkVRX1JFUF9DSEFOTkVMX05BTUUsXG59IGZyb20gXCIuL2NvbnN0YW50c1wiO1xuXG5QdWJTdWJDaGFubmVsLmZvcihQVUJfU1VCX1JFUVVFU1RfU1VCU0NSSVBUSU9OX0tFWSwge1xuICBicm9hZGNhc3Q6IHRydWUsXG59KS5zdWJzY3JpYmUoKF8pID0+IHtcbiAgUHViU3ViQ2hhbm5lbC5icm9hZGNhc3QoXG4gICAgUFVCX1NVQl9SRVNQT05TRV9TVUJTQ1JJUFRJT05fS0VZLFxuICAgIHsgcGF5bG9hZDogXCJyZXNwb25zZVwiIH1cbiAgKTtcbn0pO1xuXG5SZXFSZXBDaGFubmVsLmZvcjx7IHBheWxvYWQ6IHN0cmluZyB9LCB7IHBheWxvYWQ6IHN0cmluZyB9PihcbiAgUkVRX1JFUF9DSEFOTkVMX05BTUUsXG4gIHtcbiAgICBicm9hZGNhc3Q6IHRydWUsXG4gIH1cbikucmVwbHkoKHJlcSkgPT4ge1xuICByZXR1cm4geyBwYXlsb2FkOiByZXEucGF5bG9hZCArIFwicmVzcG9uc2VcIiB9O1xufSk7XG5cbi8vbGV0IHdpbmRvdyBrbm93IHRoYXQgd29ya2VyIGlzIHJlYWR5IGFuZCBleGVjdXRlIHRlc3RcbnBvc3RNZXNzYWdlKFwicmVhZHlcIik7XG4iXSwKICAibWFwcGluZ3MiOiAiO0FBR0EsSUFBTUEsSUFBaUIsb0JBQUk7QUFBM0IsSUFFYUMsSUFBTixNQUFNQyxFQUViO0VBbURVLFlBQ05DLEdBQ0FDLEdBQ0E7QUFyQ0YsU0FBUyxPQUFpQjtBQUUxQixTQUFBLFdBQTRCLENBQUM7QUFPN0IsU0FBUyxPQUFlO0FBNkJ0QixTQUFLLE9BQU9ELEdBQ1osS0FBSyxXQUFXQztFQUNsQjtFQXhEQSxNQUFNLFFBQVFDLEdBQXVDO0FBQ25ELFdBQU9DLEVBQUksUUFDVCxLQUFLLE1BQ0xELEdBQ0EsS0FBSyxTQUFTLFNBQ2hCO0VBQ0Y7RUFFQSxNQUFNRSxHQUE4QztBQUNsRCxXQUFPRCxFQUFJLE1BQ1QsS0FBSyxNQUNMQyxHQUNBLEtBQUssU0FBUyxTQUNoQixFQUFFO0VBQ0o7RUFNQSxVQUFVO0FBQ1JELE1BQUksaUJBQWlCLE9BQU8sS0FBSyxJQUFJLEdBQ3JDTixFQUFlLE9BQU8sS0FBSyxJQUFJO0VBQ2pDO0VBSUEsT0FBTyxJQUNMRyxHQUNBQyxHQUMyQjtBQUMzQixRQUFJLENBQUNBLEdBQVU7QUFDYixVQUFNSSxJQUFJUixFQUFlLElBQUlHLENBQUk7QUFDakMsVUFBSSxDQUFDSztBQUFHLGNBQU0sTUFBTSw2QkFBNkI7QUFDakQsYUFBT0E7SUFDVDtBQUVBRixNQUFJLGlCQUNGSCxHQUNBQyxFQUFTLGFBQWEsT0FDdEJBLEVBQVMsU0FBUyxPQUNsQkEsRUFBUyxTQUFTLEtBQ3BCO0FBQ0EsUUFBTUssSUFBVSxJQUFJUCxFQUNsQkMsR0FDQUMsQ0FDRjtBQUNBLFdBQUFKLEVBQWUsSUFBSUcsR0FBTU0sQ0FBTyxHQUN6QkE7RUFDVDtBQVFGO0FDckRBLElBQU1DLElBQWlCO0FBQXZCLElBQ01DLElBQXlCO0FBRS9CLFNBQVNDLEVBQWdCQyxJQUFvRDtBQUMzRSxTQUFPQSxHQUFFLGdCQUFnQkg7QUFDM0I7QUFFQSxTQUFTSSxFQUFVRCxJQUF1QjtBQUN4QyxTQUFPQSxHQUFFLFlBQVksUUFBYUEsR0FBRSxZQUFZO0FBQ2xEO0FBQ0EsU0FBU0UsRUFBV0YsSUFBdUI7QUFDekMsU0FBT0EsR0FBRSxZQUFZLFFBQWFBLEdBQUUsWUFBWTtBQUNsRDtBQUVPLElBQU1HLElBQVcsS0FBSyxPQUFPLEVBQUUsU0FBUyxFQUFFLEVBQUUsVUFBVSxHQUFHLENBQUM7QUFFakUsU0FBU0MsRUFBNkJDLElBQVNDLElBQVUsR0FBRztBQUMxRCxNQUFJQztBQUNKLFNBQU8sSUFBSUMsTUFBb0I7QUFDN0IsaUJBQWFELENBQUssR0FDbEJBLElBQVEsV0FBVyxNQUFNO0FBQ3ZCRixNQUFBQSxHQUFLLEdBQUdHLENBQUk7SUFDZCxHQUFHRixDQUFPO0VBQ1o7QUFDRjtBQUVBLElBQU1HLElBQWtCLG9CQUFJO0FBQTVCLElBRU1DLElBQU4sTUFBZ0M7RUEyQjlCLGNBQWM7QUExQmQsU0FBQSxRQUFpQjtBQUNqQixTQUFBLGtCQUEyQjtBQUMzQixTQUFBLGdCQUF5QjtBQUN6QixTQUFBLFdBQVdQO0FBQ1gsU0FBQSxRQUFRLG9CQUFJO0FBQ1osU0FBQSxjQUFjLG9CQUFJO0FBQ2xCLFNBQUEsYUFBYSxvQkFBSTtBQUNqQixTQUFRLGNBQWMsSUFBSSxpQkFBaUJMLENBQXNCO0FBeU9qRSxTQUFRLHdCQUF3QixvQkFBSTtBQW9IcEMsU0FBUSxzQkFBc0Isb0JBQUk7QUFrRGxDLFNBQUEsbUJBQW1CLG9CQUFJO0FBRXZCLFNBQVEsc0JBQXNCLG9CQUFJO0FBN1hoQyxTQUFLLFlBQVksWUFBWSxLQUFLLGdCQUFnQixLQUFLLElBQUksR0FDM0QsS0FBSyxZQUFZLGlCQUFpQixLQUFLLHFCQUFxQixLQUFLLElBQUksR0FFckUsV0FBVyxNQUFNO0FBQ2YsV0FBSyxrQkFBa0IsUUFBVyxNQUFTO0lBQzdDLEdBQUcsQ0FBQyxHQUVKLEtBQUssa0JBQWtCTSxFQUFTLEtBQUssa0JBQWtCLEtBQUssSUFBSSxHQUFHLENBQUM7RUFDdEU7RUExQlEsSUFBSU8sR0FBaUJmLEdBQWlCZ0IsR0FBZ0I7QUFDNUQsUUFBTWpCLElBQUljLEVBQWdCLElBQUliLENBQU87QUFBQSxLQUVuQyxLQUFLLFNBQ0xELEdBQUcsU0FDRkEsR0FBRyxhQUFhLEtBQUssbUJBQ3JCLENBQUNBLEdBQUcsYUFBYSxLQUFLLG1CQUV2QixRQUFRLGVBQ04sSUFBSSxXQUFXLFlBQVksSUFBSSxJQUFJLEtBQUssUUFBUSxLQUFLQyxDQUFPLEtBQUtlLENBQU8sRUFDMUUsR0FDQSxRQUFRLElBQUlDLENBQUksR0FDaEIsUUFBUSxNQUFNLEdBQ2QsUUFBUSxTQUFTO0VBRXJCO0VBYUEsaUJBQ0VDLEdBQ0FDLEdBQ0FDLEdBQ0FDLEdBQ007QUFDTlAsTUFBZ0IsSUFBSUksR0FBYSxFQUMvQixXQUFXQyxHQUNYLE9BQU9DLEdBQ1AsT0FBQUMsRUFDRixDQUFDLEdBRUdELEtBQVMsQ0FBQyxLQUFLLE1BQU0sSUFBSUYsQ0FBVyxLQUN0QyxLQUFLLE1BQU0sSUFBSUEsR0FBYSxNQUFTLEdBQ25DQyxLQUFXLEtBQUssV0FBVyxJQUFJRCxDQUFXO0VBQ2hEO0VBRVEscUJBQXFCSSxHQUFzQztBQUNqRSxVQUFNLE1BQU0sdUJBQXVCQSxFQUFHLElBQUk7RUFDNUM7RUFNUSxrQkFBa0JDLEdBQW1CQyxHQUE2QjtBQUN4RSxRQUFJQyxJQUFvQixNQUFNLEtBQUssS0FBSyxXQUFXLEtBQUssQ0FBQztBQUVyREQsU0FBb0JBLEVBQWlCLFNBQVMsTUFDaERDLElBQW9CQSxFQUFrQixPQUFRQyxPQUM1Q0YsRUFBaUIsU0FBU0UsQ0FBQyxDQUM3QjtBQUdGLFFBQU1DLElBQXVDLENBQUM7QUFDOUMsYUFBV0MsS0FBSyxLQUFLO0FBQ2RBLFFBQUUsQ0FBQyxLQUNISCxFQUFrQixTQUFTRyxFQUFFLENBQUMsQ0FBQyxNQUNwQ0QsRUFBZUMsRUFBRSxDQUFDLENBQUMsSUFBSUEsRUFBRSxDQUFDO0FBRzVCLFFBQU1DLElBQXNCLEVBQzFCLElBQUlyQixHQUNKLGdCQUFBbUIsR0FDQSxZQUFZRixHQUNaLGFBQWEsTUFBTSxLQUFLLEtBQUssb0JBQW9CLFFBQVEsQ0FBQyxFQUFFLElBQUtHLFFBQU8sRUFDdEUsYUFBYUEsRUFBRSxDQUFDLEdBQ2hCLGFBQWFBLEVBQUUsQ0FBQyxFQUFFLFlBQ3BCLEVBQUUsRUFDSixHQUVNTixJQUE2QixFQUNqQyxhQUFhcEIsR0FDYixXQUFXLFdBQVcsWUFBWSxNQUNsQyxVQUFBTSxHQUNBLFVBQUFlLEdBQ0EsS0FBS00sR0FDTCxhQUFhLE9BQ2Y7QUFFQSxTQUFLLFlBQVksWUFBWVAsQ0FBRSxHQUUzQkMsS0FBWSxPQUNkLEtBQUssSUFBSSw0QkFBNEIsSUFBSSxFQUN2QyxhQUFhTSxFQUNmLENBQUMsSUFFRCxLQUFLLElBQUksNEJBQTRCLElBQUksRUFDdkMsVUFBQU4sR0FDQSxhQUFhTSxFQUNmLENBQUM7RUFDTDtFQUVRLG9CQUFvQlAsR0FBNEI7QUFDdEQsUUFBSWhCLEVBQVVnQixDQUFFO0FBQ2QsYUFBTyxLQUFLLGdCQUFnQkEsRUFBRyxVQUFVQSxFQUFHLElBQUksVUFBVTtBQUM1RCxRQUFJZixFQUFXZSxDQUFFLEdBQUc7QUFDbEIsZUFBVyxLQUFLLE9BQU8sUUFBUUEsRUFBRyxJQUFJLGNBQWM7QUFFaEQsYUFBSyxXQUFXLElBQUksRUFBRSxDQUFDLENBQUMsS0FDeEIsS0FBSyxNQUFNLElBQUksRUFBRSxDQUFDLENBQUMsS0FDbkIsS0FBSyxNQUFNLElBQUksRUFBRSxDQUFDLENBQUMsS0FBSyxRQUV4QixLQUFLLG9CQUFvQixFQUFFLENBQUMsR0FBRyxFQUFFLENBQUMsR0FBR0EsRUFBRyxRQUFRO0FBR3BELGVBQVcsS0FBS0EsRUFBRyxJQUFJO0FBRW5CLGFBQUssaUJBQWlCLElBQUksRUFBRSxXQUFXLEtBQ3ZDLEtBQUssV0FBVyxJQUFJLEVBQUUsV0FBVyxLQUViLEtBQUssaUJBQWlCLElBQUksRUFBRSxXQUFXLEdBQzlDLFFBQVEsRUFBRSxhQUFhQSxFQUFHLFFBQVE7QUFHbkQsV0FBSyxJQUFJLG9DQUFvQyxJQUFJQSxFQUFHLEdBQUc7SUFDekQ7RUFDRjtFQUVRLGdCQUFnQkEsR0FBc0M7QUFHNUQsUUFGQSxLQUFLLElBQUksc0JBQXNCQSxFQUFHLEtBQUssYUFBYUEsRUFBRyxJQUFJLEdBRXZEQSxFQUFHLEtBQUssWUFBWSxRQUFhQSxFQUFHLEtBQUssYUFBYWQsR0FBVTtBQUNsRSxXQUFLLElBQUksMENBQTBDYyxFQUFHLEtBQUssV0FBVztBQUN0RTtJQUNGO0FBRUEsUUFBSWxCLEVBQWdCa0IsRUFBRyxJQUFJO0FBQUcsYUFBTyxLQUFLLG9CQUFvQkEsRUFBRyxJQUFJO0FBRXJFLFlBQVFBLEVBQUcsS0FBSyxhQUFhO01BQzNCLEtBQUs7QUFDSCxhQUFLLG9CQUNIQSxFQUFHLEtBQUssYUFDUkEsRUFBRyxLQUFLLEtBQ1JBLEVBQUcsS0FBSyxRQUNWO0FBQ0E7TUFDRixLQUFLO0FBQ0gsYUFBSyxjQUFjQSxFQUFHLEtBQUssYUFBYUEsRUFBRyxLQUFLLEtBQUtBLEVBQUcsS0FBSyxRQUFRO0FBQ3JFO01BQ0YsS0FBSztBQUNILFlBQU1RLElBQU0sS0FBSyxvQkFBb0IsSUFBSVIsRUFBRyxLQUFLLFdBQVc7QUFDNUQsWUFBSSxDQUFDUTtBQUFLO0FBRVZBLFVBQUksUUFBUVIsRUFBRyxLQUFLLEdBQUcsR0FDdkIsS0FBSyxvQkFBb0IsT0FBT0EsRUFBRyxLQUFLLFdBQVc7QUFFbkQ7SUFDSjtBQUVBLFNBQUssSUFBSSxxQkFBcUJBLEVBQUcsS0FBSyxhQUFhQSxFQUFHLElBQUk7RUFDNUQ7RUFPUSxxQkFBcUJTLEdBQXVDO0FBQ2xFLFFBQUksQ0FBQ0EsRUFBYTtBQUNoQixZQUFNLElBQUksTUFBTSxzQkFBc0I7QUFFeEMsU0FBSyxXQUFXLElBQUlBLEVBQWEsV0FBVztBQUM1QyxRQUFNQyxJQUFrQkQsRUFBYTtBQUNyQ0EsTUFBYSxVQUFVLE1BQU07QUFDM0JDLFFBQWdCLEdBQ2hCLEtBQUssV0FBVyxPQUFPRCxFQUFhLFdBQVc7SUFDakQsR0FDQUEsRUFBYSxjQUFjLE1BRTNCLEtBQUssZ0JBQWdCO0VBQ3ZCO0VBRUEsU0FBWUUsR0FBZ0M7QUFDMUMsUUFBSUE7QUFDRixhQUFPLEtBQUssTUFBTSxJQUFJQSxDQUFPO0VBSWpDO0VBRUEsTUFBTSxVQUFVZixHQUFxQnJCLEdBQWMwQixHQUFtQjtBQUNwRSxTQUFLLFdBQVdMLEdBQWFyQixHQUFLLFVBQVUwQixDQUFRO0VBQ3REO0VBRUEsTUFBYyxXQUNaTCxHQUNBckIsR0FDQXFDLEdBQ0FYLEdBQ0E7QUFDQSxRQUFNM0IsSUFBV2tCLEVBQWdCLElBQUlJLENBQVc7QUFFaEQsU0FBSyxJQUNILHdCQUF3QmdCLENBQVcsUUFBUVgsS0FBWSxhQUFhLElBQ3BFTCxHQUNBLEVBQUUsU0FBU3JCLEVBQUksQ0FDakI7QUFFQSxRQUFNc0MsSUFBTyxNQUFNLFFBQVEsUUFBUXRDLENBQUcsR0FDaEN1QyxJQUErQixFQUNuQyxhQUFhbEIsR0FDYixXQUFXLFdBQVcsWUFBWSxNQUNsQyxVQUFVVixHQUNWLFVBQVVlLEdBQ1YsS0FBS1ksR0FDTCxhQUFBRCxFQUNGO0FBRUl0QyxPQUFVLFNBQU8sS0FBSyxNQUFNLElBQUlzQixHQUFhckIsQ0FBRyxHQUVwRCxLQUFLLFlBQVksWUFBWXVDLENBQVE7RUFDdkM7RUFFQSxNQUFNLFFBQVFsQixHQUFxQnJCLEdBQWMwQixHQUFtQjtBQUNsRSxTQUFLLElBQUkscUJBQXFCTCxHQUFhLEVBQUUsU0FBU3JCLEVBQUksQ0FBQyxHQUMzRCxNQUFNLEtBQUssb0JBQW9CcUIsR0FBYXJCLEdBQUtXLENBQVEsR0FFcEQsS0FBSyxXQUFXLElBQUlVLENBQVcsS0FFcEMsS0FBSyxXQUFXQSxHQUFhckIsR0FBSyxVQUFVMEIsQ0FBUTtFQUN0RDtFQVVBLE1BQU0sWUFBeUJVLEdBQTZCO0FBQzFELFFBQU1JLElBQUksS0FBSyxzQkFBc0IsSUFBSUosQ0FBTztBQUNoRCxRQUFJSTtBQUFHLGFBQU9BLEVBQUU7QUFFaEIsUUFBTUMsSUFHRixFQUNGLFNBQVMsUUFDVCxTQUFTLE9BQ1g7QUFDQSxXQUFBQSxFQUFXLFVBQVUsSUFBSSxRQUFTQyxPQUFnQztBQUNoRUQsUUFBVyxVQUFVQztJQUN2QixDQUFDLEdBRUQsS0FBSyxzQkFBc0IsSUFBSU4sR0FBU0ssQ0FBVSxHQUUzQ0EsRUFBVztFQUNwQjtFQUVBLFVBQ0VwQixHQUNBbkIsR0FDQW9CLElBQVksT0FDWkMsSUFBUSxNQUNTO0FBQ2pCLFFBQU14QixJQUFXa0IsRUFBZ0IsSUFBSUksQ0FBVyxHQUMxQ3NCLElBQXFCO0FBQ3ZCNUMsVUFDRnVCLElBQVl2QixFQUFTLGFBQWEsT0FDbEN3QixJQUFReEIsRUFBUyxTQUFTO0FBSTVCLFFBQU02QyxJQUFPLEtBQUssWUFBWSxJQUFJdkIsQ0FBVyxLQUFLLENBQUMsR0FDN0N3QixJQUFNM0M7QUFDWjBDLE1BQUssS0FBS0MsQ0FBRyxHQUNiLEtBQUssWUFBWSxJQUFJeEIsR0FBYXVCLENBQUk7QUFFdEMsUUFBTVYsSUFBZ0MsRUFDcEMsYUFBYWIsR0FDYixVQUFVLE9BQ1YsU0FBUyxNQUFNO0FBQ2IsVUFBTXlCLElBQVEsS0FBSyxZQUFZLElBQUl6QixDQUFXO0FBRTlDLFVBQUl5QixLQUFTO0FBQVc7QUFDeEIsVUFBTUMsSUFBSUQsRUFBTSxRQUFRRCxDQUFHO0FBRXZCRSxZQUFNLE1BQ1ZELEVBQU0sT0FBT0MsR0FBRyxDQUFDO0lBQ25CLEdBQ0EsU0FBUyxDQUFDL0MsR0FBSzBCLE1BQ2IsS0FBSyxRQUFRTCxHQUFhckIsR0FBSzBCLENBQVEsR0FDekMsWUFBWSxNQUNkO0FBR0EsUUFESUosS0FBVyxLQUFLLHFCQUFxQlksQ0FBWSxHQUNqRFgsR0FBTztBQUNKLFdBQUssTUFBTSxJQUFJRixDQUFXLEtBQUcsS0FBSyxNQUFNLElBQUlBLEdBQWEsTUFBUztBQUN2RSxVQUFNVyxJQUFRLEtBQUssTUFBTSxJQUFJWCxDQUFXO0FBQ3BDVyxXQUFPYSxFQUFJYixDQUFLO0lBQ3RCO0FBQ0EsV0FBSSxLQUFLLG9CQUFvQixJQUFJWCxDQUFXLEtBQzFDLEtBQUssWUFBWUEsQ0FBVyxFQUFFLEtBQU1VLE9BQU1jLEVBQUlkLENBQUMsQ0FBQyxHQUUzQ0c7RUFDVDtFQUVRLGNBQ05iLEdBQ0EyQixHQUNBckMsR0FDQTtBQUNBLFFBQU1zQyxJQUFXLEtBQUssaUJBQWlCLElBQUk1QixDQUFXO0FBRXRELFdBQUs0QixJQUVFQSxFQUFTLFFBQVFELEdBQWFyQyxDQUFRLElBRnZCLFFBQVEsUUFBUSxNQUFTO0VBR2pEO0VBRUEsUUFDRVUsR0FDQTJCLEdBQ0ExQixJQUFZLE9BQ1pJLEdBQ29DO0FBQ3BDLFFBQUtKLEdBSUU7QUFDTCxXQUFLLFdBQVdELEdBQWEyQixHQUFhLE9BQU90QixDQUFRO0FBQ3pELFVBQU1PLElBQU0sS0FBSyxvQkFBb0IsSUFBSVosQ0FBVztBQUNoRFksV0FBS0EsRUFBSSxRQUFRLE1BQVM7QUFFOUIsVUFBSWlCLEdBSUVDLElBQU8sRUFDWCxTQUpjLElBQUksUUFDakJULE9BQVNRLElBQVVSLENBQ3RCLEdBR0UsU0FBQVEsR0FDQSxhQUFBRixFQUNGO0FBQ0EsYUFBQSxLQUFLLG9CQUFvQixJQUFJM0IsR0FBYThCLENBQUksR0FDdkNBLEVBQUs7SUFDZCxPQXBCZ0I7QUFDZCxVQUFNRixJQUFXLEtBQUssaUJBQWlCLElBQUk1QixDQUFXO0FBQ3RELGFBQUs0QixJQUNFQSxFQUFTLFFBQVFELENBQVcsSUFEYixRQUFRLFFBQVEsTUFBUztJQUVqRDtFQWlCRjtFQVVBLE1BQ0UzQixHQUNBbkIsR0FDQW9CLElBQVksT0FDWjtBQUNBLFFBQUlBLEdBQVc7QUFDYixVQUFNOEIsSUFBY2xEO0FBQ3BCQSxVQUFXLENBQUNGLEdBQVcwQixNQUNyQixLQUFLLFdBQ0hMLEdBQ0ErQixFQUFZcEQsQ0FBRyxHQUNmLE9BQ0EwQixDQUNGO0lBQ0o7QUFDQSxRQUFNMkIsSUFBZSxLQUFLLGtCQUNwQlQsSUFBd0IsRUFDNUIsYUFBQXZCLEdBQ0EsSUFBSSxhQUFhO0FBQ2YsYUFBT2dDLEVBQWEsSUFBSWhDLENBQVc7SUFDckMsR0FDQSxhQUFhQyxHQUNiLFNBQVNwQixHQUNULFNBQVMsT0FDWDtBQUVBMEMsTUFBSyxVQUFVLE1BQU07QUFDbkJBLFFBQUssYUFBYSxNQUNNLEtBQUssaUJBQWlCLElBQUl2QixDQUFXLE1BQ3JDdUIsS0FBTSxLQUFLLGlCQUFpQixPQUFPdkIsQ0FBVztJQUN4RTtBQUVBLFFBQU1pQyxJQUFrQixLQUFLLGlCQUFpQixJQUFJakMsQ0FBVztBQUM3RCxXQUFJaUMsTUFDRkEsRUFBZ0IsYUFBYSxNQUM3QixRQUFRLEtBQUsseUNBQXlDakMsQ0FBVyxJQUVuRSxLQUFLLGlCQUFpQixJQUFJQSxHQUFhdUIsQ0FBSSxHQUNwQ0E7RUFDVDtFQU1BLE1BQWMsb0JBQ1p2QixHQUNBckIsR0FDQXVELEdBQ0E7QUFDQSxTQUFLLG9CQUFvQixJQUFJbEMsQ0FBVztBQUN4QyxRQUFNbUMsSUFBVyxLQUFLLFlBQVksSUFBSW5DLENBQVcsS0FBSyxDQUFDLEdBRWpEb0MsSUFBMEMsQ0FBQztBQUNqRCxhQUFXQyxLQUFLRjtBQUNURSxZQUNMRCxFQUF1QixLQUFLLFFBQVEsUUFBUUMsRUFBRTFELEdBQUt1RCxDQUFHLENBQUMsQ0FBQyxHQUN4RCxLQUFLLElBQUksa0JBQWtCbEMsR0FBYSxFQUFFLFNBQVNxQyxHQUFHLFNBQVMxRCxFQUFJLENBQUM7QUFHdEUsVUFBTSxRQUFRLElBQUl5RCxDQUFzQixHQUVwQ3hDLEVBQWdCLElBQUlJLENBQVcsR0FBRyxTQUNwQyxLQUFLLE1BQU0sSUFBSUEsR0FBYXJCLENBQUcsR0FFakMsS0FBSyxnQkFBZ0JxQixHQUFhckIsQ0FBRyxHQUNyQyxLQUFLLG9CQUFvQixPQUFPcUIsQ0FBVyxHQUUzQyxLQUFLLElBQUksbUJBQW1CQSxHQUFhLEVBQ3ZDLFNBQVNyQixHQUNULFVBQUF3RCxHQUNBLFFBQVEsS0FDVixDQUFDO0VBQ0g7RUFFUSxnQkFBZ0JwQixHQUFpQnBDLEdBQWM7QUFDckQsUUFBTTJELElBQVUsS0FBSyxzQkFBc0IsSUFBSXZCLENBQU87QUFDakR1QixVQUVMQSxFQUFRLFFBQVEzRCxDQUFHLEdBRW5CLEtBQUssc0JBQXNCLE9BQU9vQyxDQUFPO0VBQzNDO0FBQ0Y7QUFFQSxXQUFXLHlCQUFYLFdBQVcsdUJBQXlCLElBQUlsQjtBQUVqQyxJQUFNakIsSUFBTSxXQUFXO0FDcmU5QixJQUFNMkQsSUFBaUIsb0JBQUk7QUFBM0IsSUFFYUMsSUFBTixNQUFNQyxHQUViO0VBc0JVLFlBQ05oRSxHQUNBQyxHQUNBO0FBZ0RGLFNBQVMsT0FBTztBQUNoQixTQUFTLFVBQVUsTUFBTTtBQUN2QkUsUUFBSSxZQUFZLE9BQU8sS0FBSyxJQUFJLEdBQ2hDMkQsRUFBZSxPQUFPLEtBQUssSUFBSTtJQUNqQztBQUVBLFNBQVMsT0FBZTtBQUN4QixTQUFTLFdBQTRCLENBQUM7QUF0RHBDLFNBQUssT0FBTzlELEdBQ1osS0FBSyxXQUFXQztFQUNsQjtFQTNCQSxPQUFPLElBQ0xELEdBQ0FDLEdBQ3FCO0FBQ3JCLFFBQUksQ0FBQ0EsR0FBVTtBQUNiLFVBQU1JLElBQUl5RCxFQUFlLElBQUk5RCxDQUFJO0FBQ2pDLFVBQUksQ0FBQ0s7QUFBRyxjQUFNLE1BQU0sNkJBQTZCO0FBQ2pELGFBQU9BO0lBQ1Q7QUFFQUYsTUFBSSxpQkFDRkgsR0FDQUMsRUFBUyxhQUFhLE9BQ3RCQSxFQUFTLFNBQVMsT0FDbEJBLEVBQVMsU0FBUyxLQUNwQjtBQUNBLFFBQU1LLElBQVUsSUFBSTBELEdBQW9CaEUsR0FBTUMsQ0FBUTtBQUN0RCxXQUFBNkQsRUFBZSxJQUFJOUQsR0FBTU0sQ0FBTyxHQUN6QkE7RUFDVDtFQVVBLE1BQU0sS0FBS0osR0FBVzBCLEdBQWtDO0FBQ3REekIsTUFBSSxRQUFRLEtBQUssTUFBTUQsR0FBSzBCLENBQVE7RUFDdEM7RUFDQSxhQUFhLFFBQ1g1QixHQUNBRSxHQUNBMEIsR0FDQTtBQUNBekIsTUFBSSxRQUFRSCxHQUFNRSxHQUFLMEIsQ0FBUTtFQUNqQztFQUNBLGFBQWEsVUFDWDVCLEdBQ0FFLEdBQ0EwQixHQUNBO0FBQ0F6QixNQUFJLFVBQWdCSCxHQUFNRSxHQUFLMEIsQ0FBUTtFQUN6QztFQUVBLFVBQVV4QixHQUFtQztBQU8zQyxXQU5VRCxFQUFJLFVBQ1osS0FBSyxNQUNMQyxHQUNBLEtBQUssU0FBUyxXQUNkLEtBQUssU0FBUyxLQUNoQixFQUNTO0VBQ1g7RUFFQSxXQUE2QjtBQUMzQixXQUFPRCxFQUFJLFNBQVMsS0FBSyxJQUFJO0VBQy9CO0VBQ0EsT0FBTyxTQUFlSCxHQUFjO0FBQ2xDLFdBQU9HLEVBQUksU0FBZUgsQ0FBSTtFQUNoQztFQUVBLGNBQTZCO0FBQzNCLFdBQU9HLEVBQUksWUFBWSxLQUFLLElBQUk7RUFDbEM7RUFFQSxPQUFPLFlBQWtCSCxHQUE2QjtBQUNwRCxXQUFPRyxFQUFJLFlBQVlILENBQUk7RUFDN0I7QUFVRjs7O0FDN0ZPLElBQU0sbUNBQW1DO0FBQ3pDLElBQU0sb0NBQW9DO0FBQzFDLElBQU0sdUJBQXVCOzs7QUNRcEMsRUFBYyxJQUFJLGtDQUFrQztBQUFBLEVBQ2xELFdBQVc7QUFDYixDQUFDLEVBQUUsVUFBVSxDQUFDLE1BQU07QUFDbEIsSUFBYztBQUFBLElBQ1o7QUFBQSxJQUNBLEVBQUUsU0FBUyxXQUFXO0FBQUEsRUFDeEI7QUFDRixDQUFDO0FBRUQsRUFBYztBQUFBLEVBQ1o7QUFBQSxFQUNBO0FBQUEsSUFDRSxXQUFXO0FBQUEsRUFDYjtBQUNGLEVBQUUsTUFBTSxDQUFDLFFBQVE7QUFDZixTQUFPLEVBQUUsU0FBUyxJQUFJLFVBQVUsV0FBVztBQUM3QyxDQUFDO0FBR0QsWUFBWSxPQUFPOyIsCiAgIm5hbWVzIjogWyJyZXFSZXBDaGFubmVscyIsICJSZXFSZXBDaGFubmVsIiwgIl9SZXFSZXBDaGFubmVsIiwgIm5hbWUiLCAic2V0dGluZ3MiLCAibXNnIiwgIkJNQiIsICJoYW5kbGVyIiwgImMiLCAiY2hhbm5lbCIsICJCUk9BRENBU1RfU1lOQyIsICJCUk9XU0VSX01FU1NBR0VfQlJPS0VSIiwgImlzQnJvYWRjYXN0U3luYyIsICJlIiwgImlzU3luY1JlcSIsICJpc1N5bmNSZXNwIiwgInNlbmRlcklkIiwgImRlYm91bmNlIiwgImZ1bmMiLCAidGltZW91dCIsICJ0aW1lciIsICJhcmdzIiwgImNoYW5uZWxTZXR0aW5ncyIsICJCcm9rZXIiLCAibWVzc2FnZSIsICJkYXRhIiwgImNoYW5uZWxOYW1lIiwgImJyb2FkY2FzdCIsICJjYWNoZSIsICJ0cmFjZSIsICJldiIsICJ0YXJnZXRJZCIsICJmaWx0ZXJCcm9hZGNhc3RzIiwgImN1cnJlbnRCcm9hZGNhc3RzIiwgImsiLCAiYXZhaWxhYmxlU3RhdGUiLCAieCIsICJzdGF0ZSIsICJyZXEiLCAic3Vic2NyaXB0aW9uIiwgIm9yaWdpbmFsRGlzcG9zZSIsICJzdWJzS2V5IiwgImNoYW5uZWxUeXBlIiwgIl9tc2ciLCAiZW52ZWxvcGUiLCAiYSIsICJuZXdBd2FpdGVyIiwgInJlcyIsICJzZXR0aW5nc092ZXJyaWRkZW4iLCAic3VicyIsICJoZGwiLCAiX3N1YnMiLCAiaSIsICJyZXF1ZXN0RGF0YSIsICJsaXN0ZW5lciIsICJyZXNvbHZlIiwgImJyZXEiLCAib3JpZ0hhbmRsZXIiLCAicmVxTGlzdGVuZXJzIiwgImN1cnJlbnRMaXN0ZW5lciIsICJzSWQiLCAiaGFuZGxlcnMiLCAiYWxsU3Vic2NyaWJlcnNQcm9taXNlcyIsICJoIiwgImF3YWl0ZXIiLCAicHViU3ViQ2hhbm5lbHMiLCAiUHViU3ViQ2hhbm5lbCIsICJfUHViU3ViQ2hhbm5lbCJdCn0K
