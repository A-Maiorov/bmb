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
    return i.Request(this.name, e, this.settings.broadcast);
  }
  reply(e) {
    return i.Reply(this.name, e, this.settings.broadcast).dispose;
  }
  dispose() {
    i.requestListeners.delete(this.name), b.delete(this.name);
  }
  static for(e, s) {
    if (!s) {
      let n = b.get(e);
      if (!n)
        throw Error("Can't find channel settings");
      return n;
    }
    i.ConfigureChannel(e, s.broadcast || false, s.cache || false, s.trace || false);
    let t = new d(e, s);
    return b.set(e, t), t;
  }
};
var S = "broadcast-sync";
var m = "browser-message-broker";
function k(d3) {
  return d3.channelName === S;
}
function B(d3) {
  return d3.senderId != null && d3.targetId == null;
}
function q(d3) {
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
    this.__bcChannel = new BroadcastChannel(m);
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
    s && s.length > 0 && (t = t.filter((o) => s.includes(o)));
    let n = {};
    for (let o of this.state)
      o[1] && t.includes(o[0]) && (n[o[0]] = o[1]);
    let r = { id: l, availableState: n, broadcasts: t }, a = { channelName: S, senderCtx: globalThis.constructor.name, senderId: l, targetId: e, msg: r, channelType: "sync" };
    this.__bcChannel.postMessage(a), e == null ? this.log("Broadcast sync requested", "", { brokerState: r }) : this.log("Broadcast sync responded", "", { targetId: e, brokerState: r });
  }
  handleBroadcastSync(e) {
    if (B(e))
      return this.sendBrokerState(e.senderId, e.msg.broadcasts);
    if (q(e))
      for (let s of Object.entries(e.msg.availableState))
        this.broadcasts.has(s[0]) && this.state.has(s[0]) && this.state.get(s[0]) == null && this.__notifySubscribers(s[0], s[1], e.senderId), this.log("Broadcast sync response handled", "", e.msg);
  }
  handleBroadcast(e) {
    if (this.log("Broadcast received", e.data.channelName, e.data), e.data.targetId != null && e.data.targetId !== l) {
      this.log("Broadcast ignored (different targetId)", e.data.channelName);
      return;
    }
    if (k(e.data))
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
    let a = await Promise.resolve(s), o = { channelName: e, senderCtx: globalThis.constructor.name, senderId: l, targetId: n, msg: a, channelType: t };
    r?.cache && this.state.set(e, s), this.__bcChannel.postMessage(o);
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
    let r = h.get(e), a = false;
    r && (t = r.broadcast || false, n = r.cache || true);
    let o = this.subscribers.get(e) || [], u = s;
    o.push(u), this.subscribers.set(e, o);
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
      let a, u = { promise: new Promise((g) => a = g), resolve: a };
      return this.broadcastedRequests.set(e, u), u.promise;
    } else {
      let r = this.requestListeners.get(e);
      return r ? r.handler(s) : Promise.resolve(void 0);
    }
  }
  Reply(e, s, t = false) {
    if (t) {
      let o = s;
      s = (u, g) => this._broadcast(e, o(u), "rep", g);
    }
    let n = this.requestListeners, r = { channelName: e, get isDisposed() {
      return n.has(e);
    }, isBroadcast: t, handler: s, dispose: void 0 };
    r.dispose = () => {
      r.isDisposed = true, this.requestListeners.get(e) === r && this.requestListeners.delete(e);
    };
    let a = this.requestListeners.get(e);
    return a && (a.isDisposed = true, console.warn("Request listener has been replaced: " + e)), this.requestListeners.set(e, r), r;
  }
  async __notifySubscribers(e, s, t) {
    this.activeNotifications.add(e);
    let n = this.subscribers.get(e) || [], r = [];
    for (let a of n)
      a && (r.push(Promise.resolve(a(s, t))), this.log("Handler called", e, { handler: a, message: s }));
    await Promise.all(r), h.get(e)?.cache && this.state.set(e, s), this.__handleAwaiter(e, s), this.activeNotifications.delete(e), this.log("Message handled", e, { message: s, handlers: n, broker: this });
  }
  __handleAwaiter(e, s) {
    let t = this.__nextMessageAwaiters.get(e);
    t && (t.resolve(s), this.__nextMessageAwaiters.delete(e));
  }
};
globalThis.BrowserMessageBroker ?? (globalThis.BrowserMessageBroker = new f());
var i = globalThis.BrowserMessageBroker;
var T = /* @__PURE__ */ new Map();
var R = class d2 {
  constructor(e, s) {
    this.type = "pubSub";
    this.dispose = () => {
      i.subscribers.delete(this.name), T.delete(this.name);
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
    i.ConfigureChannel(e, s.broadcast || false, s.cache || false, s.trace || false);
    let t = new d2(e, s);
    return T.set(e, t), t;
  }
  async send(e, s) {
    i.Publish(this.name, e, s);
  }
  static async publish(e, s, t) {
    i.Publish(e, s, t);
  }
  static async broadcast(e, s, t) {
    i.Broadcast(e, s, t);
  }
  subscribe(e) {
    return i.Subscribe(this.name, e, this.settings.broadcast, this.settings.cache).dispose;
  }
  getState() {
    return i.GetState(this.name);
  }
  static GetState(e) {
    return i.GetState(e);
  }
  nextMessage() {
    return i.nextMessage(this.name);
  }
  static nextMessage(e) {
    return i.nextMessage(e);
  }
};

// suite/WebWorker/constants.ts
var PUB_SUB_REQUEST_SUBSCRIPTION_KEY = "testReq";
var PUB_SUB_RESPONSE_SUBSCRIPTION_KEY = "testResp";
var REQ_REP_CHANNEL_NAME = "reqRepChannel";

// suite/WebWorker/testWorker.ts
R.for(PUB_SUB_REQUEST_SUBSCRIPTION_KEY, {
  broadcast: true
}).subscribe((_) => {
  R.broadcast(
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
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsiLi4vLi4vLi4vYnJvd3Nlci1tZXNzYWdlLWJyb2tlci9zcmMvUmVxUmVwQ2hhbm5lbC50cyIsICIuLi8uLi8uLi9icm93c2VyLW1lc3NhZ2UtYnJva2VyL3NyYy9Ccm9rZXIudHMiLCAiLi4vLi4vLi4vYnJvd3Nlci1tZXNzYWdlLWJyb2tlci9zcmMvUHViU3ViQ2hhbm5lbC50cyIsICJjb25zdGFudHMudHMiLCAidGVzdFdvcmtlci50cyJdLAogICJzb3VyY2VzQ29udGVudCI6IFsiaW1wb3J0IHsgQk1CIH0gZnJvbSBcIi4vQnJva2VyXCI7XG5pbXBvcnQgeyBDaGFubmVsU2V0dGluZ3MsIElSZXFSZXBDaGFubmVsIH0gZnJvbSBcIi4vVHlwZXNcIjtcblxuY29uc3QgcmVxUmVwQ2hhbm5lbHMgPSBuZXcgTWFwPHN0cmluZywgUmVxUmVwQ2hhbm5lbD4oKTtcblxuZXhwb3J0IGNsYXNzIFJlcVJlcENoYW5uZWw8VFJlcSA9IHVua25vd24sIFRSZXAgPSB1bmtub3duPlxuICBpbXBsZW1lbnRzIElSZXFSZXBDaGFubmVsPFRSZXEsIFRSZXA+XG57XG4gIGFzeW5jIHJlcXVlc3QobXNnPzogVFJlcSk6IFByb21pc2U8VFJlcCB8IHVuZGVmaW5lZD4ge1xuICAgIHJldHVybiBCTUIuUmVxdWVzdDxUUmVwPihcbiAgICAgIHRoaXMubmFtZSxcbiAgICAgIG1zZyxcbiAgICAgIHRoaXMuc2V0dGluZ3MuYnJvYWRjYXN0XG4gICAgKTtcbiAgfVxuXG4gIHJlcGx5KGhhbmRsZXI6IChyZXE6IFRSZXEpID0+IFRSZXAgfCBQcm9taXNlPFRSZXA+KSB7XG4gICAgcmV0dXJuIEJNQi5SZXBseTxUUmVxLCBUUmVwPihcbiAgICAgIHRoaXMubmFtZSxcbiAgICAgIGhhbmRsZXIsXG4gICAgICB0aGlzLnNldHRpbmdzLmJyb2FkY2FzdFxuICAgICkuZGlzcG9zZTtcbiAgfVxuXG4gIHJlYWRvbmx5IHR5cGU6IFwicmVxUmVwXCIgPSBcInJlcVJlcFwiO1xuXG4gIHNldHRpbmdzOiBDaGFubmVsU2V0dGluZ3MgPSB7fTtcblxuICBkaXNwb3NlKCkge1xuICAgIEJNQi5yZXF1ZXN0TGlzdGVuZXJzLmRlbGV0ZSh0aGlzLm5hbWUpO1xuICAgIHJlcVJlcENoYW5uZWxzLmRlbGV0ZSh0aGlzLm5hbWUpO1xuICB9XG5cbiAgcmVhZG9ubHkgbmFtZTogc3RyaW5nID0gXCJcIjtcblxuICBzdGF0aWMgZm9yPFRSZXEgPSB1bmtub3duLCBUUmVwID0gdW5rbm93bj4oXG4gICAgbmFtZTogc3RyaW5nLFxuICAgIHNldHRpbmdzPzogQ2hhbm5lbFNldHRpbmdzXG4gICk6IFJlcVJlcENoYW5uZWw8VFJlcSwgVFJlcD4ge1xuICAgIGlmICghc2V0dGluZ3MpIHtcbiAgICAgIGNvbnN0IGMgPSByZXFSZXBDaGFubmVscy5nZXQobmFtZSk7XG4gICAgICBpZiAoIWMpIHRocm93IEVycm9yKFwiQ2FuJ3QgZmluZCBjaGFubmVsIHNldHRpbmdzXCIpO1xuICAgICAgcmV0dXJuIGMgYXMgUmVxUmVwQ2hhbm5lbDxUUmVxLCBUUmVwPjtcbiAgICB9XG5cbiAgICBCTUIuQ29uZmlndXJlQ2hhbm5lbChcbiAgICAgIG5hbWUsXG4gICAgICBzZXR0aW5ncy5icm9hZGNhc3QgfHwgZmFsc2UsXG4gICAgICBzZXR0aW5ncy5jYWNoZSB8fCBmYWxzZSxcbiAgICAgIHNldHRpbmdzLnRyYWNlIHx8IGZhbHNlXG4gICAgKTtcbiAgICBjb25zdCBjaGFubmVsID0gbmV3IFJlcVJlcENoYW5uZWw8VFJlcSwgVFJlcD4oXG4gICAgICBuYW1lLFxuICAgICAgc2V0dGluZ3NcbiAgICApO1xuICAgIHJlcVJlcENoYW5uZWxzLnNldChuYW1lLCBjaGFubmVsKTtcbiAgICByZXR1cm4gY2hhbm5lbDtcbiAgfVxuICBwcml2YXRlIGNvbnN0cnVjdG9yKFxuICAgIG5hbWU6IHN0cmluZyxcbiAgICBzZXR0aW5nczogQ2hhbm5lbFNldHRpbmdzXG4gICkge1xuICAgIHRoaXMubmFtZSA9IG5hbWU7XG4gICAgdGhpcy5zZXR0aW5ncyA9IHNldHRpbmdzO1xuICB9XG59XG4iLCAiaW1wb3J0IHtcbiAgQ2hhbm5lbFR5cGUsXG4gIElCcm9hZGNhc3RFbnZlbG9wZSxcbiAgSUJyb2FkY2FzdFN5bmNFbnZlbG9wZSxcbiAgSUJyb2tlcixcbiAgSUJyb2tlclN0YXRlLFxuICBDaGFubmVsU2V0dGluZ3MsXG4gIFJlcVN1YnNjcmlwdGlvbixcbiAgU3Vic2NyaXB0aW9uLFxuICBUSGFuZGxlcixcbn0gZnJvbSBcIi4vVHlwZXNcIjtcblxuY29uc3QgQlJPQURDQVNUX1NZTkMgPSBcImJyb2FkY2FzdC1zeW5jXCI7XG5jb25zdCBCUk9XU0VSX01FU1NBR0VfQlJPS0VSID0gXCJicm93c2VyLW1lc3NhZ2UtYnJva2VyXCI7XG5cbmZ1bmN0aW9uIGlzQnJvYWRjYXN0U3luYyhlOiBJQnJvYWRjYXN0RW52ZWxvcGUpOiBlIGlzIElCcm9hZGNhc3RTeW5jRW52ZWxvcGUge1xuICByZXR1cm4gZS5jaGFubmVsTmFtZSA9PT0gQlJPQURDQVNUX1NZTkM7XG59XG5cbmZ1bmN0aW9uIGlzU3luY1JlcShlOiBJQnJvYWRjYXN0RW52ZWxvcGUpIHtcbiAgcmV0dXJuIGUuc2VuZGVySWQgIT0gdW5kZWZpbmVkICYmIGUudGFyZ2V0SWQgPT0gdW5kZWZpbmVkO1xufVxuZnVuY3Rpb24gaXNTeW5jUmVzcChlOiBJQnJvYWRjYXN0RW52ZWxvcGUpIHtcbiAgcmV0dXJuIGUuc2VuZGVySWQgIT0gdW5kZWZpbmVkICYmIGUudGFyZ2V0SWQgIT0gdW5kZWZpbmVkO1xufVxuXG5leHBvcnQgY29uc3Qgc2VuZGVySWQgPSBNYXRoLnJhbmRvbSgpLnRvU3RyaW5nKDM2KS5zdWJzdHJpbmcoMiwgOSk7XG5cbmZ1bmN0aW9uIGRlYm91bmNlPFQgZXh0ZW5kcyBGdW5jdGlvbj4oZnVuYzogVCwgdGltZW91dCA9IDEpIHtcbiAgbGV0IHRpbWVyOiBudW1iZXI7XG4gIHJldHVybiAoLi4uYXJnczogdW5rbm93bltdKSA9PiB7XG4gICAgY2xlYXJUaW1lb3V0KHRpbWVyKTtcbiAgICB0aW1lciA9IHNldFRpbWVvdXQoKCkgPT4ge1xuICAgICAgZnVuYyguLi5hcmdzKTtcbiAgICB9LCB0aW1lb3V0KTtcbiAgfTtcbn1cblxuY29uc3QgY2hhbm5lbFNldHRpbmdzID0gbmV3IE1hcDxzdHJpbmcsIENoYW5uZWxTZXR0aW5ncz4oKTtcblxuY2xhc3MgQnJva2VyIGltcGxlbWVudHMgSUJyb2tlciB7XG4gIHRyYWNlOiBib29sZWFuID0gZmFsc2U7XG4gIHRyYWNlQnJvYWRjYXN0czogYm9vbGVhbiA9IGZhbHNlO1xuICB0cmFjZU1lc3NhZ2VzOiBib29sZWFuID0gZmFsc2U7XG4gIHNlbmRlcklkID0gc2VuZGVySWQ7XG4gIHN0YXRlID0gbmV3IE1hcDxzdHJpbmcsIGFueT4oKTtcbiAgc3Vic2NyaWJlcnMgPSBuZXcgTWFwPHN0cmluZywgVEhhbmRsZXJbXT4oKTtcbiAgYnJvYWRjYXN0cyA9IG5ldyBTZXQ8c3RyaW5nPigpO1xuICBwcml2YXRlIF9fYmNDaGFubmVsID0gbmV3IEJyb2FkY2FzdENoYW5uZWwoQlJPV1NFUl9NRVNTQUdFX0JST0tFUik7XG5cbiAgcHJpdmF0ZSBsb2cobWVzc2FnZTogc3RyaW5nLCBjaGFubmVsOiBzdHJpbmcsIGRhdGE/OiB1bmtub3duKSB7XG4gICAgY29uc3QgYyA9IGNoYW5uZWxTZXR0aW5ncy5nZXQoY2hhbm5lbCk7XG4gICAgaWYgKFxuICAgICAgdGhpcy50cmFjZSB8fFxuICAgICAgYz8udHJhY2UgfHxcbiAgICAgIChjPy5icm9hZGNhc3QgJiYgdGhpcy50cmFjZUJyb2FkY2FzdHMpIHx8XG4gICAgICAoIWM/LmJyb2FkY2FzdCAmJiB0aGlzLnRyYWNlTWVzc2FnZXMpXG4gICAgKSB7XG4gICAgICBjb25zb2xlLmdyb3VwQ29sbGFwc2VkKFxuICAgICAgICBgWyR7Z2xvYmFsVGhpcy5jb25zdHJ1Y3Rvci5uYW1lfSgke3RoaXMuc2VuZGVySWR9KS0ke2NoYW5uZWx9XSAke21lc3NhZ2V9YFxuICAgICAgKTtcbiAgICAgIGNvbnNvbGUubG9nKGRhdGEpO1xuICAgICAgY29uc29sZS50cmFjZSgpO1xuICAgICAgY29uc29sZS5ncm91cEVuZCgpO1xuICAgIH1cbiAgfVxuXG4gIGNvbnN0cnVjdG9yKCkge1xuICAgIHRoaXMuX19iY0NoYW5uZWwub25tZXNzYWdlID0gdGhpcy5oYW5kbGVCcm9hZGNhc3QuYmluZCh0aGlzKTtcbiAgICB0aGlzLl9fYmNDaGFubmVsLm9ubWVzc2FnZWVycm9yID0gdGhpcy5oYW5kbGVCcm9hZGNhc3RFcnJvci5iaW5kKHRoaXMpO1xuXG4gICAgc2V0VGltZW91dCgoKSA9PiB7XG4gICAgICB0aGlzLl9fc2VuZEJyb2tlclN0YXRlKHVuZGVmaW5lZCwgdW5kZWZpbmVkKTsgLy8gYWx3YXlzIHNlbmQgaW5pdGlhbCBzeW5jIHJlcXVlc3RcbiAgICB9LCAwKTtcblxuICAgIHRoaXMuc2VuZEJyb2tlclN0YXRlID0gZGVib3VuY2UodGhpcy5fX3NlbmRCcm9rZXJTdGF0ZS5iaW5kKHRoaXMpLCAyKTtcbiAgfVxuXG4gIENvbmZpZ3VyZUNoYW5uZWwoXG4gICAgY2hhbm5lbE5hbWU6IHN0cmluZyxcbiAgICBicm9hZGNhc3Q6IGJvb2xlYW4sXG4gICAgY2FjaGU6IGJvb2xlYW4sXG4gICAgdHJhY2U6IGJvb2xlYW5cbiAgKTogdm9pZCB7XG4gICAgY2hhbm5lbFNldHRpbmdzLnNldChjaGFubmVsTmFtZSwge1xuICAgICAgYnJvYWRjYXN0OiBicm9hZGNhc3QsXG4gICAgICBjYWNoZTogY2FjaGUsXG4gICAgICB0cmFjZSxcbiAgICB9KTtcblxuICAgIGlmIChjYWNoZSAmJiAhdGhpcy5zdGF0ZS5oYXMoY2hhbm5lbE5hbWUpKVxuICAgICAgdGhpcy5zdGF0ZS5zZXQoY2hhbm5lbE5hbWUsIHVuZGVmaW5lZCk7XG4gICAgaWYgKGJyb2FkY2FzdCkgdGhpcy5icm9hZGNhc3RzLmFkZChjaGFubmVsTmFtZSk7XG4gIH1cblxuICBwcml2YXRlIGhhbmRsZUJyb2FkY2FzdEVycm9yKGV2OiBNZXNzYWdlRXZlbnQ8SUJyb2FkY2FzdEVudmVsb3BlPikge1xuICAgIHRocm93IEVycm9yKFwiQlJPQURDQVNUIEZBSUxFRDogXCIgKyBldi5kYXRhKTtcbiAgfVxuXG4gIHByaXZhdGUgc2VuZEJyb2tlclN0YXRlOiAoXG4gICAgdGFyZ2V0SWQ/OiBzdHJpbmcsXG4gICAgZmlsdGVyQnJvYWRjYXN0cz86IHN0cmluZ1tdXG4gICkgPT4gdm9pZDtcbiAgcHJpdmF0ZSBfX3NlbmRCcm9rZXJTdGF0ZSh0YXJnZXRJZD86IHN0cmluZywgZmlsdGVyQnJvYWRjYXN0cz86IHN0cmluZ1tdKSB7XG4gICAgbGV0IGN1cnJlbnRCcm9hZGNhc3RzID0gQXJyYXkuZnJvbSh0aGlzLmJyb2FkY2FzdHMua2V5cygpKTtcblxuICAgIGlmIChmaWx0ZXJCcm9hZGNhc3RzICYmIGZpbHRlckJyb2FkY2FzdHMubGVuZ3RoID4gMCkge1xuICAgICAgY3VycmVudEJyb2FkY2FzdHMgPSBjdXJyZW50QnJvYWRjYXN0cy5maWx0ZXIoKGspID0+XG4gICAgICAgIGZpbHRlckJyb2FkY2FzdHMuaW5jbHVkZXMoaylcbiAgICAgICk7XG4gICAgfVxuXG4gICAgY29uc3QgYXZhaWxhYmxlU3RhdGU6IHsgW3g6IHN0cmluZ106IGFueSB9ID0ge307XG4gICAgZm9yIChjb25zdCB4IG9mIHRoaXMuc3RhdGUpIHtcbiAgICAgIGlmICgheFsxXSkgY29udGludWU7XG4gICAgICBpZiAoIWN1cnJlbnRCcm9hZGNhc3RzLmluY2x1ZGVzKHhbMF0pKSBjb250aW51ZTtcbiAgICAgIGF2YWlsYWJsZVN0YXRlW3hbMF1dID0geFsxXTtcbiAgICB9XG5cbiAgICBjb25zdCBzdGF0ZTogSUJyb2tlclN0YXRlID0ge1xuICAgICAgaWQ6IHNlbmRlcklkLFxuICAgICAgYXZhaWxhYmxlU3RhdGUsXG4gICAgICBicm9hZGNhc3RzOiBjdXJyZW50QnJvYWRjYXN0cyxcbiAgICB9O1xuXG4gICAgY29uc3QgZXY6IElCcm9hZGNhc3RTeW5jRW52ZWxvcGUgPSB7XG4gICAgICBjaGFubmVsTmFtZTogQlJPQURDQVNUX1NZTkMsXG4gICAgICBzZW5kZXJDdHg6IGdsb2JhbFRoaXMuY29uc3RydWN0b3IubmFtZSxcbiAgICAgIHNlbmRlcklkLFxuICAgICAgdGFyZ2V0SWQsXG4gICAgICBtc2c6IHN0YXRlLFxuICAgICAgY2hhbm5lbFR5cGU6IFwic3luY1wiLFxuICAgIH07XG5cbiAgICB0aGlzLl9fYmNDaGFubmVsLnBvc3RNZXNzYWdlKGV2KTtcblxuICAgIGlmICh0YXJnZXRJZCA9PSB1bmRlZmluZWQpXG4gICAgICB0aGlzLmxvZyhcIkJyb2FkY2FzdCBzeW5jIHJlcXVlc3RlZFwiLCBcIlwiLCB7XG4gICAgICAgIGJyb2tlclN0YXRlOiBzdGF0ZSxcbiAgICAgIH0pO1xuICAgIGVsc2VcbiAgICAgIHRoaXMubG9nKFwiQnJvYWRjYXN0IHN5bmMgcmVzcG9uZGVkXCIsIFwiXCIsIHtcbiAgICAgICAgdGFyZ2V0SWQsXG4gICAgICAgIGJyb2tlclN0YXRlOiBzdGF0ZSxcbiAgICAgIH0pO1xuICB9XG5cbiAgcHJpdmF0ZSBoYW5kbGVCcm9hZGNhc3RTeW5jKGV2OiBJQnJvYWRjYXN0U3luY0VudmVsb3BlKSB7XG4gICAgaWYgKGlzU3luY1JlcShldikpXG4gICAgICByZXR1cm4gdGhpcy5zZW5kQnJva2VyU3RhdGUoZXYuc2VuZGVySWQsIGV2Lm1zZy5icm9hZGNhc3RzKTtcbiAgICBpZiAoaXNTeW5jUmVzcChldikpIHtcbiAgICAgIGZvciAoY29uc3QgcyBvZiBPYmplY3QuZW50cmllcyhldi5tc2cuYXZhaWxhYmxlU3RhdGUpKSB7XG4gICAgICAgIGlmIChcbiAgICAgICAgICB0aGlzLmJyb2FkY2FzdHMuaGFzKHNbMF0pICYmXG4gICAgICAgICAgdGhpcy5zdGF0ZS5oYXMoc1swXSkgJiZcbiAgICAgICAgICB0aGlzLnN0YXRlLmdldChzWzBdKSA9PSB1bmRlZmluZWRcbiAgICAgICAgKSB7XG4gICAgICAgICAgdGhpcy5fX25vdGlmeVN1YnNjcmliZXJzKHNbMF0sIHNbMV0sIGV2LnNlbmRlcklkKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHRoaXMubG9nKFwiQnJvYWRjYXN0IHN5bmMgcmVzcG9uc2UgaGFuZGxlZFwiLCBcIlwiLCBldi5tc2cpO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIHByaXZhdGUgaGFuZGxlQnJvYWRjYXN0KGV2OiBNZXNzYWdlRXZlbnQ8SUJyb2FkY2FzdEVudmVsb3BlPikge1xuICAgIHRoaXMubG9nKFwiQnJvYWRjYXN0IHJlY2VpdmVkXCIsIGV2LmRhdGEuY2hhbm5lbE5hbWUsIGV2LmRhdGEpO1xuXG4gICAgaWYgKGV2LmRhdGEudGFyZ2V0SWQgIT0gdW5kZWZpbmVkICYmIGV2LmRhdGEudGFyZ2V0SWQgIT09IHNlbmRlcklkKSB7XG4gICAgICB0aGlzLmxvZyhcIkJyb2FkY2FzdCBpZ25vcmVkIChkaWZmZXJlbnQgdGFyZ2V0SWQpXCIsIGV2LmRhdGEuY2hhbm5lbE5hbWUpO1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIGlmIChpc0Jyb2FkY2FzdFN5bmMoZXYuZGF0YSkpIHJldHVybiB0aGlzLmhhbmRsZUJyb2FkY2FzdFN5bmMoZXYuZGF0YSk7XG5cbiAgICBzd2l0Y2ggKGV2LmRhdGEuY2hhbm5lbFR5cGUpIHtcbiAgICAgIGNhc2UgXCJwdWJTdWJcIjpcbiAgICAgICAgdGhpcy5fX25vdGlmeVN1YnNjcmliZXJzKFxuICAgICAgICAgIGV2LmRhdGEuY2hhbm5lbE5hbWUsXG4gICAgICAgICAgZXYuZGF0YS5tc2csXG4gICAgICAgICAgZXYuZGF0YS5zZW5kZXJJZFxuICAgICAgICApO1xuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgXCJyZXFcIjpcbiAgICAgICAgdGhpcy5icmlkZ2VSZXF1ZXN0KGV2LmRhdGEuY2hhbm5lbE5hbWUsIGV2LmRhdGEubXNnLCBldi5kYXRhLnNlbmRlcklkKTtcbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlIFwicmVwXCI6XG4gICAgICAgIGNvbnN0IHJlcSA9IHRoaXMuYnJvYWRjYXN0ZWRSZXF1ZXN0cy5nZXQoZXYuZGF0YS5jaGFubmVsTmFtZSk7XG4gICAgICAgIGlmICghcmVxKSByZXR1cm47XG5cbiAgICAgICAgcmVxLnJlc29sdmUoZXYuZGF0YS5tc2cpO1xuICAgICAgICB0aGlzLmJyb2FkY2FzdGVkUmVxdWVzdHMuZGVsZXRlKGV2LmRhdGEuY2hhbm5lbE5hbWUpO1xuXG4gICAgICAgIGJyZWFrO1xuICAgIH1cblxuICAgIHRoaXMubG9nKFwiQnJvYWRjYXN0IGhhbmRsZWRcIiwgZXYuZGF0YS5jaGFubmVsTmFtZSwgZXYuZGF0YSk7XG4gIH1cblxuICAvKipcbiAgICogQnJpZGdlIHB1Yi9zdWIgbWVzc2FnZXMgdG8gYnJvYWRjYXN0IGNoYW5uZWxcbiAgICogQHBhcmFtIHN1YnNLZXlcbiAgICogQHJldHVybnMge1N1YnNjcmlwdGlvbn1cbiAgICovXG4gIHByaXZhdGUgX19jb25maWd1cmVCcm9hZGNhc3Qoc3Vic2NyaXB0aW9uOiBTdWJzY3JpcHRpb248YW55Pik6IHZvaWQge1xuICAgIGlmICghc3Vic2NyaXB0aW9uLmNoYW5uZWxOYW1lKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoYEludmFsaWQgc3Vic2NyaXB0aW9uYCk7XG4gICAgfVxuICAgIHRoaXMuYnJvYWRjYXN0cy5hZGQoc3Vic2NyaXB0aW9uLmNoYW5uZWxOYW1lKTtcbiAgICBjb25zdCBvcmlnaW5hbERpc3Bvc2UgPSBzdWJzY3JpcHRpb24uZGlzcG9zZTtcbiAgICBzdWJzY3JpcHRpb24uZGlzcG9zZSA9ICgpID0+IHtcbiAgICAgIG9yaWdpbmFsRGlzcG9zZSgpO1xuICAgICAgdGhpcy5icm9hZGNhc3RzLmRlbGV0ZShzdWJzY3JpcHRpb24uY2hhbm5lbE5hbWUpO1xuICAgIH07XG4gICAgc3Vic2NyaXB0aW9uLmlzQnJvYWRjYXN0ID0gdHJ1ZTtcblxuICAgIHRoaXMuc2VuZEJyb2tlclN0YXRlKCk7XG4gIH1cblxuICBHZXRTdGF0ZTxUPihzdWJzS2V5OiBzdHJpbmcpOiBUIHwgdW5kZWZpbmVkIHtcbiAgICBpZiAoc3Vic0tleSkge1xuICAgICAgcmV0dXJuIHRoaXMuc3RhdGUuZ2V0KHN1YnNLZXkpIGFzIFQ7XG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiB1bmRlZmluZWQ7XG4gICAgfVxuICB9XG5cbiAgYXN5bmMgQnJvYWRjYXN0KGNoYW5uZWxOYW1lOiBzdHJpbmcsIG1zZzogdW5rbm93biwgdGFyZ2V0SWQ/OiBzdHJpbmcpIHtcbiAgICB0aGlzLl9icm9hZGNhc3QoY2hhbm5lbE5hbWUsIG1zZywgXCJwdWJTdWJcIiwgdGFyZ2V0SWQpO1xuICB9XG5cbiAgcHJpdmF0ZSBhc3luYyBfYnJvYWRjYXN0KFxuICAgIGNoYW5uZWxOYW1lOiBzdHJpbmcsXG4gICAgbXNnOiB1bmtub3duLFxuICAgIGNoYW5uZWxUeXBlOiBDaGFubmVsVHlwZSxcbiAgICB0YXJnZXRJZD86IHN0cmluZ1xuICApIHtcbiAgICBjb25zdCBzZXR0aW5ncyA9IGNoYW5uZWxTZXR0aW5ncy5nZXQoY2hhbm5lbE5hbWUpO1xuXG4gICAgdGhpcy5sb2coXG4gICAgICBgTWVzc2FnZSBicm9hZGNhc3RlZCAoJHtjaGFubmVsVHlwZX0pIHRvICR7dGFyZ2V0SWQgfHwgXCJhbGwgYnJva2Vyc1wifWAsXG4gICAgICBjaGFubmVsTmFtZSxcbiAgICAgIHsgbWVzc2FnZTogbXNnIH1cbiAgICApO1xuXG4gICAgY29uc3QgX21zZyA9IGF3YWl0IFByb21pc2UucmVzb2x2ZShtc2cpO1xuICAgIGNvbnN0IGVudmVsb3BlOiBJQnJvYWRjYXN0RW52ZWxvcGUgPSB7XG4gICAgICBjaGFubmVsTmFtZTogY2hhbm5lbE5hbWUsXG4gICAgICBzZW5kZXJDdHg6IGdsb2JhbFRoaXMuY29uc3RydWN0b3IubmFtZSxcbiAgICAgIHNlbmRlcklkOiBzZW5kZXJJZCxcbiAgICAgIHRhcmdldElkOiB0YXJnZXRJZCxcbiAgICAgIG1zZzogX21zZyxcbiAgICAgIGNoYW5uZWxUeXBlLFxuICAgIH07XG5cbiAgICBpZiAoc2V0dGluZ3M/LmNhY2hlKSB0aGlzLnN0YXRlLnNldChjaGFubmVsTmFtZSwgbXNnKTtcblxuICAgIHRoaXMuX19iY0NoYW5uZWwucG9zdE1lc3NhZ2UoZW52ZWxvcGUpO1xuICB9XG5cbiAgYXN5bmMgUHVibGlzaChjaGFubmVsTmFtZTogc3RyaW5nLCBtc2c6IHVua25vd24sIHRhcmdldElkPzogc3RyaW5nKSB7XG4gICAgdGhpcy5sb2coYE1lc3NhZ2UgcHVibGlzaGVkYCwgY2hhbm5lbE5hbWUsIHsgbWVzc2FnZTogbXNnIH0pO1xuICAgIGF3YWl0IHRoaXMuX19ub3RpZnlTdWJzY3JpYmVycyhjaGFubmVsTmFtZSwgbXNnLCBzZW5kZXJJZCk7XG5cbiAgICBpZiAoIXRoaXMuYnJvYWRjYXN0cy5oYXMoY2hhbm5lbE5hbWUpKSByZXR1cm47XG5cbiAgICB0aGlzLl9icm9hZGNhc3QoY2hhbm5lbE5hbWUsIG1zZywgXCJwdWJTdWJcIiwgdGFyZ2V0SWQpO1xuICB9XG5cbiAgcHJpdmF0ZSBfX25leHRNZXNzYWdlQXdhaXRlcnMgPSBuZXcgTWFwPFxuICAgIHN0cmluZyxcbiAgICB7XG4gICAgICBwcm9taXNlOiBQcm9taXNlPHVua25vd24+O1xuICAgICAgcmVzb2x2ZTogKG1zZzogdW5rbm93bikgPT4gdW5rbm93bjtcbiAgICB9XG4gID4oKTtcblxuICBhc3luYyBuZXh0TWVzc2FnZTxUID0gdW5rbm93bj4oc3Vic0tleTogc3RyaW5nKTogUHJvbWlzZTxUPiB7XG4gICAgY29uc3QgYSA9IHRoaXMuX19uZXh0TWVzc2FnZUF3YWl0ZXJzLmdldChzdWJzS2V5KTtcbiAgICBpZiAoYSkgcmV0dXJuIGEucHJvbWlzZSBhcyBQcm9taXNlPFQ+O1xuXG4gICAgY29uc3QgbmV3QXdhaXRlcjoge1xuICAgICAgcHJvbWlzZTogUHJvbWlzZTx1bmtub3duPjtcbiAgICAgIHJlc29sdmU6IChtc2c6IHVua25vd24pID0+IHZvaWQ7XG4gICAgfSA9IHtcbiAgICAgIHByb21pc2U6IHVuZGVmaW5lZCBhcyB1bmtub3duIGFzIFByb21pc2U8VD4sXG4gICAgICByZXNvbHZlOiB1bmRlZmluZWQgYXMgdW5rbm93biBhcyAobXNnOiB1bmtub3duKSA9PiB2b2lkLFxuICAgIH07XG4gICAgbmV3QXdhaXRlci5wcm9taXNlID0gbmV3IFByb21pc2UoKHJlczogKG1zZzogdW5rbm93bikgPT4gdm9pZCkgPT4ge1xuICAgICAgbmV3QXdhaXRlci5yZXNvbHZlID0gcmVzO1xuICAgIH0pO1xuXG4gICAgdGhpcy5fX25leHRNZXNzYWdlQXdhaXRlcnMuc2V0KHN1YnNLZXksIG5ld0F3YWl0ZXIpO1xuXG4gICAgcmV0dXJuIG5ld0F3YWl0ZXIucHJvbWlzZSBhcyBQcm9taXNlPFQ+O1xuICB9XG5cbiAgU3Vic2NyaWJlPFQ+KFxuICAgIGNoYW5uZWxOYW1lOiBzdHJpbmcsXG4gICAgaGFuZGxlcj86IFRIYW5kbGVyPFQ+LFxuICAgIGJyb2FkY2FzdCA9IGZhbHNlLFxuICAgIGNhY2hlID0gdHJ1ZVxuICApOiBTdWJzY3JpcHRpb248VD4ge1xuICAgIGNvbnN0IHNldHRpbmdzID0gY2hhbm5lbFNldHRpbmdzLmdldChjaGFubmVsTmFtZSk7XG4gICAgY29uc3Qgc2V0dGluZ3NPdmVycmlkZGVuID0gZmFsc2U7XG4gICAgaWYgKHNldHRpbmdzKSB7XG4gICAgICBicm9hZGNhc3QgPSBzZXR0aW5ncy5icm9hZGNhc3QgfHwgZmFsc2U7XG4gICAgICBjYWNoZSA9IHNldHRpbmdzLmNhY2hlIHx8IHRydWU7XG4gICAgICBzZXR0aW5nc092ZXJyaWRkZW47XG4gICAgfVxuXG4gICAgY29uc3Qgc3VicyA9IHRoaXMuc3Vic2NyaWJlcnMuZ2V0KGNoYW5uZWxOYW1lKSB8fCBbXTtcbiAgICBjb25zdCBoZGwgPSBoYW5kbGVyIGFzIChtc2c6IHVua25vd24pID0+IHZvaWQ7XG4gICAgc3Vicy5wdXNoKGhkbCk7XG4gICAgdGhpcy5zdWJzY3JpYmVycy5zZXQoY2hhbm5lbE5hbWUsIHN1YnMpO1xuXG4gICAgY29uc3Qgc3Vic2NyaXB0aW9uOiBTdWJzY3JpcHRpb248VD4gPSB7XG4gICAgICBjaGFubmVsTmFtZTogY2hhbm5lbE5hbWUsXG4gICAgICBpc0NhY2hlZDogZmFsc2UsXG4gICAgICBkaXNwb3NlOiAoKSA9PiB7XG4gICAgICAgIGNvbnN0IF9zdWJzID0gdGhpcy5zdWJzY3JpYmVycy5nZXQoY2hhbm5lbE5hbWUpO1xuXG4gICAgICAgIGlmIChfc3VicyA9PSB1bmRlZmluZWQpIHJldHVybjtcbiAgICAgICAgY29uc3QgaSA9IF9zdWJzLmluZGV4T2YoaGRsKTtcblxuICAgICAgICBpZiAoaSA9PT0gLTEpIHJldHVybjtcbiAgICAgICAgX3N1YnMuc3BsaWNlKGksIDEpO1xuICAgICAgfSxcbiAgICAgIHB1Ymxpc2g6IChtc2csIHRhcmdldElkPzogc3RyaW5nKSA9PlxuICAgICAgICB0aGlzLlB1Ymxpc2goY2hhbm5lbE5hbWUsIG1zZywgdGFyZ2V0SWQpLFxuICAgICAgaXNEaXNwb3NlZDogZmFsc2UsXG4gICAgfTtcblxuICAgIGlmIChicm9hZGNhc3QpIHRoaXMuX19jb25maWd1cmVCcm9hZGNhc3Qoc3Vic2NyaXB0aW9uKTtcbiAgICBpZiAoY2FjaGUpIHtcbiAgICAgIGlmICghdGhpcy5zdGF0ZS5oYXMoY2hhbm5lbE5hbWUpKSB0aGlzLnN0YXRlLnNldChjaGFubmVsTmFtZSwgdW5kZWZpbmVkKTtcbiAgICAgIGNvbnN0IHN0YXRlID0gdGhpcy5zdGF0ZS5nZXQoY2hhbm5lbE5hbWUpO1xuICAgICAgaWYgKHN0YXRlKSBoZGwoc3RhdGUpO1xuICAgIH1cbiAgICBpZiAodGhpcy5hY3RpdmVOb3RpZmljYXRpb25zLmhhcyhjaGFubmVsTmFtZSkpXG4gICAgICB0aGlzLm5leHRNZXNzYWdlKGNoYW5uZWxOYW1lKS50aGVuKCh4KSA9PiBoZGwoeCkpO1xuXG4gICAgcmV0dXJuIHN1YnNjcmlwdGlvbjtcbiAgfVxuXG4gIHByaXZhdGUgYnJpZGdlUmVxdWVzdChcbiAgICBjaGFubmVsTmFtZTogc3RyaW5nLFxuICAgIHJlcXVlc3REYXRhOiB1bmtub3duLFxuICAgIHNlbmRlcklkOiBzdHJpbmdcbiAgKSB7XG4gICAgY29uc3QgbGlzdGVuZXIgPSB0aGlzLnJlcXVlc3RMaXN0ZW5lcnMuZ2V0KGNoYW5uZWxOYW1lKTtcblxuICAgIGlmICghbGlzdGVuZXIpIHJldHVybiBQcm9taXNlLnJlc29sdmUodW5kZWZpbmVkKTtcblxuICAgIHJldHVybiBsaXN0ZW5lci5oYW5kbGVyKHJlcXVlc3REYXRhLCBzZW5kZXJJZCkgYXMgUHJvbWlzZTx1bmtub3duPjtcbiAgfVxuXG4gIFJlcXVlc3Q8VFJlcCA9IHVua25vd24+KFxuICAgIGNoYW5uZWxOYW1lOiBzdHJpbmcsXG4gICAgcmVxdWVzdERhdGE6IHVua25vd24sXG4gICAgYnJvYWRjYXN0ID0gZmFsc2UsXG4gICAgdGFyZ2V0SWQ/OiBzdHJpbmdcbiAgKTogUHJvbWlzZTxUUmVwPiB8IFByb21pc2U8dW5kZWZpbmVkPiB7XG4gICAgaWYgKCFicm9hZGNhc3QpIHtcbiAgICAgIGNvbnN0IGxpc3RlbmVyID0gdGhpcy5yZXF1ZXN0TGlzdGVuZXJzLmdldChjaGFubmVsTmFtZSk7XG4gICAgICBpZiAoIWxpc3RlbmVyKSByZXR1cm4gUHJvbWlzZS5yZXNvbHZlKHVuZGVmaW5lZCk7XG4gICAgICByZXR1cm4gbGlzdGVuZXIuaGFuZGxlcihyZXF1ZXN0RGF0YSkgYXMgUHJvbWlzZTxUUmVwPjtcbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy5fYnJvYWRjYXN0KGNoYW5uZWxOYW1lLCByZXF1ZXN0RGF0YSwgXCJyZXFcIiwgdGFyZ2V0SWQpO1xuICAgICAgY29uc3QgcmVxID0gdGhpcy5icm9hZGNhc3RlZFJlcXVlc3RzLmdldChjaGFubmVsTmFtZSk7XG4gICAgICBpZiAocmVxKSByZXEucmVzb2x2ZSh1bmRlZmluZWQpO1xuXG4gICAgICBsZXQgcmVzb2x2ZSA9IHVuZGVmaW5lZCBhcyB1bmtub3duIGFzIChyOiB1bmtub3duKSA9PiB2b2lkO1xuICAgICAgY29uc3QgcHJvbWlzZSA9IG5ldyBQcm9taXNlPFRSZXA+KFxuICAgICAgICAocmVzKSA9PiAocmVzb2x2ZSA9IHJlcyBhcyAocjogdW5rbm93bikgPT4gdm9pZClcbiAgICAgICk7XG4gICAgICBjb25zdCBicmVxID0ge1xuICAgICAgICBwcm9taXNlLFxuICAgICAgICByZXNvbHZlLFxuICAgICAgfTtcbiAgICAgIHRoaXMuYnJvYWRjYXN0ZWRSZXF1ZXN0cy5zZXQoY2hhbm5lbE5hbWUsIGJyZXEpO1xuICAgICAgcmV0dXJuIGJyZXEucHJvbWlzZTtcbiAgICB9XG4gIH1cbiAgcHJpdmF0ZSBicm9hZGNhc3RlZFJlcXVlc3RzID0gbmV3IE1hcDxcbiAgICBzdHJpbmcsXG4gICAge1xuICAgICAgcHJvbWlzZTogUHJvbWlzZTx1bmtub3duPjtcbiAgICAgIHJlc29sdmU6IChyOiB1bmtub3duKSA9PiB2b2lkO1xuICAgIH1cbiAgPigpO1xuXG4gIFJlcGx5PFRSZXEgPSB1bmtub3duLCBUUmVwID0gdW5rbm93bj4oXG4gICAgY2hhbm5lbE5hbWU6IHN0cmluZyxcbiAgICBoYW5kbGVyOiAocmVxOiBUUmVxKSA9PiBUUmVwLFxuICAgIGJyb2FkY2FzdCA9IGZhbHNlXG4gICkge1xuICAgIGlmIChicm9hZGNhc3QpIHtcbiAgICAgIGNvbnN0IG9yaWdIYW5kbGVyID0gaGFuZGxlcjtcbiAgICAgIGhhbmRsZXIgPSAoKG1zZzogVFJlcSwgdGFyZ2V0SWQ6IHN0cmluZykgPT5cbiAgICAgICAgdGhpcy5fYnJvYWRjYXN0KFxuICAgICAgICAgIGNoYW5uZWxOYW1lLFxuICAgICAgICAgIG9yaWdIYW5kbGVyKG1zZyksXG4gICAgICAgICAgXCJyZXBcIixcbiAgICAgICAgICB0YXJnZXRJZFxuICAgICAgICApKSBhcyB1bmtub3duIGFzIChyZXE6IFRSZXEpID0+IFRSZXA7XG4gICAgfVxuICAgIGNvbnN0IHJlcUxpc3RlbmVycyA9IHRoaXMucmVxdWVzdExpc3RlbmVycztcbiAgICBjb25zdCBzdWJzOiBSZXFTdWJzY3JpcHRpb24gPSB7XG4gICAgICBjaGFubmVsTmFtZSxcbiAgICAgIGdldCBpc0Rpc3Bvc2VkKCkge1xuICAgICAgICByZXR1cm4gcmVxTGlzdGVuZXJzLmhhcyhjaGFubmVsTmFtZSk7XG4gICAgICB9LFxuICAgICAgaXNCcm9hZGNhc3Q6IGJyb2FkY2FzdCxcbiAgICAgIGhhbmRsZXI6IGhhbmRsZXIgYXMgKHI6IHVua25vd24pID0+IHVua25vd24sXG4gICAgICBkaXNwb3NlOiB1bmRlZmluZWQgYXMgdW5rbm93biBhcyAoKSA9PiB2b2lkLFxuICAgIH07XG5cbiAgICBzdWJzLmRpc3Bvc2UgPSAoKSA9PiB7XG4gICAgICBzdWJzLmlzRGlzcG9zZWQgPSB0cnVlO1xuICAgICAgY29uc3QgY3VycmVudExpc3RlbmVyID0gdGhpcy5yZXF1ZXN0TGlzdGVuZXJzLmdldChjaGFubmVsTmFtZSk7XG4gICAgICBpZiAoY3VycmVudExpc3RlbmVyID09PSBzdWJzKSB0aGlzLnJlcXVlc3RMaXN0ZW5lcnMuZGVsZXRlKGNoYW5uZWxOYW1lKTtcbiAgICB9O1xuXG4gICAgY29uc3QgY3VycmVudExpc3RlbmVyID0gdGhpcy5yZXF1ZXN0TGlzdGVuZXJzLmdldChjaGFubmVsTmFtZSk7XG4gICAgaWYgKGN1cnJlbnRMaXN0ZW5lcikge1xuICAgICAgY3VycmVudExpc3RlbmVyLmlzRGlzcG9zZWQgPSB0cnVlO1xuICAgICAgY29uc29sZS53YXJuKFwiUmVxdWVzdCBsaXN0ZW5lciBoYXMgYmVlbiByZXBsYWNlZDogXCIgKyBjaGFubmVsTmFtZSk7XG4gICAgfVxuICAgIHRoaXMucmVxdWVzdExpc3RlbmVycy5zZXQoY2hhbm5lbE5hbWUsIHN1YnMpO1xuICAgIHJldHVybiBzdWJzO1xuICB9XG5cbiAgcmVxdWVzdExpc3RlbmVycyA9IG5ldyBNYXA8c3RyaW5nLCBSZXFTdWJzY3JpcHRpb24+KCk7XG5cbiAgcHJpdmF0ZSBhY3RpdmVOb3RpZmljYXRpb25zID0gbmV3IFNldDxzdHJpbmc+KCk7XG5cbiAgcHJpdmF0ZSBhc3luYyBfX25vdGlmeVN1YnNjcmliZXJzKFxuICAgIGNoYW5uZWxOYW1lOiBzdHJpbmcsXG4gICAgbXNnOiB1bmtub3duLFxuICAgIHNJZDogc3RyaW5nXG4gICkge1xuICAgIHRoaXMuYWN0aXZlTm90aWZpY2F0aW9ucy5hZGQoY2hhbm5lbE5hbWUpO1xuICAgIGNvbnN0IGhhbmRsZXJzID0gdGhpcy5zdWJzY3JpYmVycy5nZXQoY2hhbm5lbE5hbWUpIHx8IFtdO1xuXG4gICAgY29uc3QgYWxsU3Vic2NyaWJlcnNQcm9taXNlczogUHJvbWlzZTx2b2lkPltdID0gW107XG4gICAgZm9yIChjb25zdCBoIG9mIGhhbmRsZXJzKSB7XG4gICAgICBpZiAoIWgpIGNvbnRpbnVlO1xuICAgICAgYWxsU3Vic2NyaWJlcnNQcm9taXNlcy5wdXNoKFByb21pc2UucmVzb2x2ZShoKG1zZywgc0lkKSkpO1xuICAgICAgdGhpcy5sb2coXCJIYW5kbGVyIGNhbGxlZFwiLCBjaGFubmVsTmFtZSwgeyBoYW5kbGVyOiBoLCBtZXNzYWdlOiBtc2cgfSk7XG4gICAgfVxuXG4gICAgYXdhaXQgUHJvbWlzZS5hbGwoYWxsU3Vic2NyaWJlcnNQcm9taXNlcyk7XG5cbiAgICBpZiAoY2hhbm5lbFNldHRpbmdzLmdldChjaGFubmVsTmFtZSk/LmNhY2hlKVxuICAgICAgdGhpcy5zdGF0ZS5zZXQoY2hhbm5lbE5hbWUsIG1zZyk7XG5cbiAgICB0aGlzLl9faGFuZGxlQXdhaXRlcihjaGFubmVsTmFtZSwgbXNnKTtcbiAgICB0aGlzLmFjdGl2ZU5vdGlmaWNhdGlvbnMuZGVsZXRlKGNoYW5uZWxOYW1lKTtcblxuICAgIHRoaXMubG9nKFwiTWVzc2FnZSBoYW5kbGVkXCIsIGNoYW5uZWxOYW1lLCB7XG4gICAgICBtZXNzYWdlOiBtc2csXG4gICAgICBoYW5kbGVycyxcbiAgICAgIGJyb2tlcjogdGhpcyxcbiAgICB9KTtcbiAgfVxuXG4gIHByaXZhdGUgX19oYW5kbGVBd2FpdGVyKHN1YnNLZXk6IHN0cmluZywgbXNnOiB1bmtub3duKSB7XG4gICAgY29uc3QgYXdhaXRlciA9IHRoaXMuX19uZXh0TWVzc2FnZUF3YWl0ZXJzLmdldChzdWJzS2V5KTtcbiAgICBpZiAoIWF3YWl0ZXIpIHJldHVybjtcblxuICAgIGF3YWl0ZXIucmVzb2x2ZShtc2cpO1xuXG4gICAgdGhpcy5fX25leHRNZXNzYWdlQXdhaXRlcnMuZGVsZXRlKHN1YnNLZXkpO1xuICB9XG59XG5cbmdsb2JhbFRoaXMuQnJvd3Nlck1lc3NhZ2VCcm9rZXIgPz89IG5ldyBCcm9rZXIoKTtcblxuZXhwb3J0IGNvbnN0IEJNQiA9IGdsb2JhbFRoaXMuQnJvd3Nlck1lc3NhZ2VCcm9rZXI7XG5leHBvcnQgKiBmcm9tIFwiLi9QdWJTdWJDaGFubmVsXCI7XG5leHBvcnQgKiBmcm9tIFwiLi9SZXFSZXBDaGFubmVsXCI7XG4iLCAiaW1wb3J0IHsgQk1CIH0gZnJvbSBcIi4vQnJva2VyXCI7XG5pbXBvcnQge1xuICBEaXNwb3NlcixcbiAgQ2hhbm5lbFNldHRpbmdzLFxuICBJUHViU3ViQ2hhbm5lbCxcbiAgVEhhbmRsZXIsXG59IGZyb20gXCIuL1R5cGVzXCI7XG5cbmNvbnN0IHB1YlN1YkNoYW5uZWxzID0gbmV3IE1hcDxzdHJpbmcsIFB1YlN1YkNoYW5uZWw+KCk7XG5cbmV4cG9ydCBjbGFzcyBQdWJTdWJDaGFubmVsPFRNc2cgPSBhbnk+XG4gIGltcGxlbWVudHMgSVB1YlN1YkNoYW5uZWw8VE1zZz5cbntcbiAgc3RhdGljIGZvcjxUTXNnPihcbiAgICBuYW1lOiBzdHJpbmcsXG4gICAgc2V0dGluZ3M/OiBDaGFubmVsU2V0dGluZ3NcbiAgKTogUHViU3ViQ2hhbm5lbDxUTXNnPiB7XG4gICAgaWYgKCFzZXR0aW5ncykge1xuICAgICAgY29uc3QgYyA9IHB1YlN1YkNoYW5uZWxzLmdldChuYW1lKTtcbiAgICAgIGlmICghYykgdGhyb3cgRXJyb3IoXCJDYW4ndCBmaW5kIGNoYW5uZWwgc2V0dGluZ3NcIik7XG4gICAgICByZXR1cm4gYyBhcyBQdWJTdWJDaGFubmVsPFRNc2c+O1xuICAgIH1cblxuICAgIEJNQi5Db25maWd1cmVDaGFubmVsKFxuICAgICAgbmFtZSxcbiAgICAgIHNldHRpbmdzLmJyb2FkY2FzdCB8fCBmYWxzZSxcbiAgICAgIHNldHRpbmdzLmNhY2hlIHx8IGZhbHNlLFxuICAgICAgc2V0dGluZ3MudHJhY2UgfHwgZmFsc2VcbiAgICApO1xuICAgIGNvbnN0IGNoYW5uZWwgPSBuZXcgUHViU3ViQ2hhbm5lbDxUTXNnPihuYW1lLCBzZXR0aW5ncyk7XG4gICAgcHViU3ViQ2hhbm5lbHMuc2V0KG5hbWUsIGNoYW5uZWwpO1xuICAgIHJldHVybiBjaGFubmVsO1xuICB9XG5cbiAgcHJpdmF0ZSBjb25zdHJ1Y3RvcihcbiAgICBuYW1lOiBzdHJpbmcsXG4gICAgc2V0dGluZ3M6IENoYW5uZWxTZXR0aW5nc1xuICApIHtcbiAgICB0aGlzLm5hbWUgPSBuYW1lO1xuICAgIHRoaXMuc2V0dGluZ3MgPSBzZXR0aW5ncztcbiAgfVxuXG4gIGFzeW5jIHNlbmQobXNnOiBUTXNnLCB0YXJnZXRJZD86IHN0cmluZyk6IFByb21pc2U8dm9pZD4ge1xuICAgIEJNQi5QdWJsaXNoKHRoaXMubmFtZSwgbXNnLCB0YXJnZXRJZCk7XG4gIH1cbiAgc3RhdGljIGFzeW5jIHB1Ymxpc2g8VE1zZyA9IGFueT4oXG4gICAgbmFtZTogc3RyaW5nLFxuICAgIG1zZzogVE1zZyxcbiAgICB0YXJnZXRJZD86IHN0cmluZ1xuICApIHtcbiAgICBCTUIuUHVibGlzaChuYW1lLCBtc2csIHRhcmdldElkKTtcbiAgfVxuICBzdGF0aWMgYXN5bmMgYnJvYWRjYXN0PFRNc2cgPSBhbnk+KFxuICAgIG5hbWU6IHN0cmluZyxcbiAgICBtc2c6IFRNc2csXG4gICAgdGFyZ2V0SWQ/OiBzdHJpbmdcbiAgKSB7XG4gICAgQk1CLkJyb2FkY2FzdDxUTXNnPihuYW1lLCBtc2csIHRhcmdldElkKTtcbiAgfVxuXG4gIHN1YnNjcmliZShoYW5kbGVyOiBUSGFuZGxlcjxUTXNnPik6IERpc3Bvc2VyIHtcbiAgICBjb25zdCBzID0gQk1CLlN1YnNjcmliZShcbiAgICAgIHRoaXMubmFtZSxcbiAgICAgIGhhbmRsZXIsXG4gICAgICB0aGlzLnNldHRpbmdzLmJyb2FkY2FzdCxcbiAgICAgIHRoaXMuc2V0dGluZ3MuY2FjaGVcbiAgICApO1xuICAgIHJldHVybiBzLmRpc3Bvc2U7XG4gIH1cblxuICBnZXRTdGF0ZSgpOiBUTXNnIHwgdW5kZWZpbmVkIHtcbiAgICByZXR1cm4gQk1CLkdldFN0YXRlKHRoaXMubmFtZSk7XG4gIH1cbiAgc3RhdGljIEdldFN0YXRlPFRNc2c+KG5hbWU6IHN0cmluZykge1xuICAgIHJldHVybiBCTUIuR2V0U3RhdGU8VE1zZz4obmFtZSk7XG4gIH1cblxuICBuZXh0TWVzc2FnZSgpOiBQcm9taXNlPFRNc2c+IHtcbiAgICByZXR1cm4gQk1CLm5leHRNZXNzYWdlKHRoaXMubmFtZSk7XG4gIH1cblxuICBzdGF0aWMgbmV4dE1lc3NhZ2U8VE1zZz4obmFtZTogc3RyaW5nKTogUHJvbWlzZTxUTXNnPiB7XG4gICAgcmV0dXJuIEJNQi5uZXh0TWVzc2FnZShuYW1lKTtcbiAgfVxuXG4gIHJlYWRvbmx5IHR5cGUgPSBcInB1YlN1YlwiO1xuICByZWFkb25seSBkaXNwb3NlID0gKCkgPT4ge1xuICAgIEJNQi5zdWJzY3JpYmVycy5kZWxldGUodGhpcy5uYW1lKTtcbiAgICBwdWJTdWJDaGFubmVscy5kZWxldGUodGhpcy5uYW1lKTtcbiAgfTtcblxuICByZWFkb25seSBuYW1lOiBzdHJpbmcgPSBcIlwiO1xuICByZWFkb25seSBzZXR0aW5nczogQ2hhbm5lbFNldHRpbmdzID0ge307XG59XG4iLCAiZXhwb3J0IGNvbnN0IFBVQl9TVUJfUkVRVUVTVF9TVUJTQ1JJUFRJT05fS0VZID0gXCJ0ZXN0UmVxXCI7XG5leHBvcnQgY29uc3QgUFVCX1NVQl9SRVNQT05TRV9TVUJTQ1JJUFRJT05fS0VZID0gXCJ0ZXN0UmVzcFwiO1xuZXhwb3J0IGNvbnN0IFJFUV9SRVBfQ0hBTk5FTF9OQU1FID0gXCJyZXFSZXBDaGFubmVsXCI7XG4iLCAiaW1wb3J0IHtcbiAgUHViU3ViQ2hhbm5lbCxcbiAgUmVxUmVwQ2hhbm5lbCxcbn0gZnJvbSBcImJyb3dzZXItbWVzc2FnZS1icm9rZXJcIjtcbmltcG9ydCB7XG4gIFBVQl9TVUJfUkVRVUVTVF9TVUJTQ1JJUFRJT05fS0VZLFxuICBQVUJfU1VCX1JFU1BPTlNFX1NVQlNDUklQVElPTl9LRVksXG4gIFJFUV9SRVBfQ0hBTk5FTF9OQU1FLFxufSBmcm9tIFwiLi9jb25zdGFudHNcIjtcblxuUHViU3ViQ2hhbm5lbC5mb3IoUFVCX1NVQl9SRVFVRVNUX1NVQlNDUklQVElPTl9LRVksIHtcbiAgYnJvYWRjYXN0OiB0cnVlLFxufSkuc3Vic2NyaWJlKChfKSA9PiB7XG4gIFB1YlN1YkNoYW5uZWwuYnJvYWRjYXN0KFxuICAgIFBVQl9TVUJfUkVTUE9OU0VfU1VCU0NSSVBUSU9OX0tFWSxcbiAgICB7IHBheWxvYWQ6IFwicmVzcG9uc2VcIiB9XG4gICk7XG59KTtcblxuUmVxUmVwQ2hhbm5lbC5mb3I8eyBwYXlsb2FkOiBzdHJpbmcgfSwgeyBwYXlsb2FkOiBzdHJpbmcgfT4oXG4gIFJFUV9SRVBfQ0hBTk5FTF9OQU1FLFxuICB7XG4gICAgYnJvYWRjYXN0OiB0cnVlLFxuICB9XG4pLnJlcGx5KChyZXEpID0+IHtcbiAgcmV0dXJuIHsgcGF5bG9hZDogcmVxLnBheWxvYWQgKyBcInJlc3BvbnNlXCIgfTtcbn0pO1xuXG4vL2xldCB3aW5kb3cga25vdyB0aGF0IHdvcmtlciBpcyByZWFkeSBhbmQgZXhlY3V0ZSB0ZXN0XG5wb3N0TWVzc2FnZShcInJlYWR5XCIpO1xuIl0sCiAgIm1hcHBpbmdzIjogIjtBQUdBLElBQU1BLElBQWlCLG9CQUFJO0FBQTNCLElBRWFDLElBQU4sTUFBTUMsRUFFYjtFQW1EVSxZQUNOQyxHQUNBQyxHQUNBO0FBckNGLFNBQVMsT0FBaUI7QUFFMUIsU0FBQSxXQUE0QixDQUFDO0FBTzdCLFNBQVMsT0FBZTtBQTZCdEIsU0FBSyxPQUFPRCxHQUNaLEtBQUssV0FBV0M7RUFDbEI7RUF4REEsTUFBTSxRQUFRQyxHQUF1QztBQUNuRCxXQUFPQyxFQUFJLFFBQ1QsS0FBSyxNQUNMRCxHQUNBLEtBQUssU0FBUyxTQUNoQjtFQUNGO0VBRUEsTUFBTUUsR0FBOEM7QUFDbEQsV0FBT0QsRUFBSSxNQUNULEtBQUssTUFDTEMsR0FDQSxLQUFLLFNBQVMsU0FDaEIsRUFBRTtFQUNKO0VBTUEsVUFBVTtBQUNSRCxNQUFJLGlCQUFpQixPQUFPLEtBQUssSUFBSSxHQUNyQ04sRUFBZSxPQUFPLEtBQUssSUFBSTtFQUNqQztFQUlBLE9BQU8sSUFDTEcsR0FDQUMsR0FDMkI7QUFDM0IsUUFBSSxDQUFDQSxHQUFVO0FBQ2IsVUFBTUksSUFBSVIsRUFBZSxJQUFJRyxDQUFJO0FBQ2pDLFVBQUksQ0FBQ0s7QUFBRyxjQUFNLE1BQU0sNkJBQTZCO0FBQ2pELGFBQU9BO0lBQ1Q7QUFFQUYsTUFBSSxpQkFDRkgsR0FDQUMsRUFBUyxhQUFhLE9BQ3RCQSxFQUFTLFNBQVMsT0FDbEJBLEVBQVMsU0FBUyxLQUNwQjtBQUNBLFFBQU1LLElBQVUsSUFBSVAsRUFDbEJDLEdBQ0FDLENBQ0Y7QUFDQSxXQUFBSixFQUFlLElBQUlHLEdBQU1NLENBQU8sR0FDekJBO0VBQ1Q7QUFRRjtBQ3JEQSxJQUFNQyxJQUFpQjtBQUF2QixJQUNNQyxJQUF5QjtBQUUvQixTQUFTQyxFQUFnQkMsSUFBb0Q7QUFDM0UsU0FBT0EsR0FBRSxnQkFBZ0JIO0FBQzNCO0FBRUEsU0FBU0ksRUFBVUQsSUFBdUI7QUFDeEMsU0FBT0EsR0FBRSxZQUFZLFFBQWFBLEdBQUUsWUFBWTtBQUNsRDtBQUNBLFNBQVNFLEVBQVdGLElBQXVCO0FBQ3pDLFNBQU9BLEdBQUUsWUFBWSxRQUFhQSxHQUFFLFlBQVk7QUFDbEQ7QUFFTyxJQUFNRyxJQUFXLEtBQUssT0FBTyxFQUFFLFNBQVMsRUFBRSxFQUFFLFVBQVUsR0FBRyxDQUFDO0FBRWpFLFNBQVNDLEVBQTZCQyxJQUFTQyxJQUFVLEdBQUc7QUFDMUQsTUFBSUM7QUFDSixTQUFPLElBQUlDLE1BQW9CO0FBQzdCLGlCQUFhRCxDQUFLLEdBQ2xCQSxJQUFRLFdBQVcsTUFBTTtBQUN2QkYsTUFBQUEsR0FBSyxHQUFHRyxDQUFJO0lBQ2QsR0FBR0YsQ0FBTztFQUNaO0FBQ0Y7QUFFQSxJQUFNRyxJQUFrQixvQkFBSTtBQUE1QixJQUVNQyxJQUFOLE1BQWdDO0VBMkI5QixjQUFjO0FBMUJkLFNBQUEsUUFBaUI7QUFDakIsU0FBQSxrQkFBMkI7QUFDM0IsU0FBQSxnQkFBeUI7QUFDekIsU0FBQSxXQUFXUDtBQUNYLFNBQUEsUUFBUSxvQkFBSTtBQUNaLFNBQUEsY0FBYyxvQkFBSTtBQUNsQixTQUFBLGFBQWEsb0JBQUk7QUFDakIsU0FBUSxjQUFjLElBQUksaUJBQWlCTCxDQUFzQjtBQTZOakUsU0FBUSx3QkFBd0Isb0JBQUk7QUFtSHBDLFNBQVEsc0JBQXNCLG9CQUFJO0FBaURsQyxTQUFBLG1CQUFtQixvQkFBSTtBQUV2QixTQUFRLHNCQUFzQixvQkFBSTtBQS9XaEMsU0FBSyxZQUFZLFlBQVksS0FBSyxnQkFBZ0IsS0FBSyxJQUFJLEdBQzNELEtBQUssWUFBWSxpQkFBaUIsS0FBSyxxQkFBcUIsS0FBSyxJQUFJLEdBRXJFLFdBQVcsTUFBTTtBQUNmLFdBQUssa0JBQWtCLFFBQVcsTUFBUztJQUM3QyxHQUFHLENBQUMsR0FFSixLQUFLLGtCQUFrQk0sRUFBUyxLQUFLLGtCQUFrQixLQUFLLElBQUksR0FBRyxDQUFDO0VBQ3RFO0VBMUJRLElBQUlPLEdBQWlCZixHQUFpQmdCLEdBQWdCO0FBQzVELFFBQU1qQixJQUFJYyxFQUFnQixJQUFJYixDQUFPO0FBQUEsS0FFbkMsS0FBSyxTQUNMRCxHQUFHLFNBQ0ZBLEdBQUcsYUFBYSxLQUFLLG1CQUNyQixDQUFDQSxHQUFHLGFBQWEsS0FBSyxtQkFFdkIsUUFBUSxlQUNOLElBQUksV0FBVyxZQUFZLElBQUksSUFBSSxLQUFLLFFBQVEsS0FBS0MsQ0FBTyxLQUFLZSxDQUFPLEVBQzFFLEdBQ0EsUUFBUSxJQUFJQyxDQUFJLEdBQ2hCLFFBQVEsTUFBTSxHQUNkLFFBQVEsU0FBUztFQUVyQjtFQWFBLGlCQUNFQyxHQUNBQyxHQUNBQyxHQUNBQyxHQUNNO0FBQ05QLE1BQWdCLElBQUlJLEdBQWEsRUFDL0IsV0FBV0MsR0FDWCxPQUFPQyxHQUNQLE9BQUFDLEVBQ0YsQ0FBQyxHQUVHRCxLQUFTLENBQUMsS0FBSyxNQUFNLElBQUlGLENBQVcsS0FDdEMsS0FBSyxNQUFNLElBQUlBLEdBQWEsTUFBUyxHQUNuQ0MsS0FBVyxLQUFLLFdBQVcsSUFBSUQsQ0FBVztFQUNoRDtFQUVRLHFCQUFxQkksR0FBc0M7QUFDakUsVUFBTSxNQUFNLHVCQUF1QkEsRUFBRyxJQUFJO0VBQzVDO0VBTVEsa0JBQWtCQyxHQUFtQkMsR0FBNkI7QUFDeEUsUUFBSUMsSUFBb0IsTUFBTSxLQUFLLEtBQUssV0FBVyxLQUFLLENBQUM7QUFFckRELFNBQW9CQSxFQUFpQixTQUFTLE1BQ2hEQyxJQUFvQkEsRUFBa0IsT0FBUUMsT0FDNUNGLEVBQWlCLFNBQVNFLENBQUMsQ0FDN0I7QUFHRixRQUFNQyxJQUF1QyxDQUFDO0FBQzlDLGFBQVdDLEtBQUssS0FBSztBQUNkQSxRQUFFLENBQUMsS0FDSEgsRUFBa0IsU0FBU0csRUFBRSxDQUFDLENBQUMsTUFDcENELEVBQWVDLEVBQUUsQ0FBQyxDQUFDLElBQUlBLEVBQUUsQ0FBQztBQUc1QixRQUFNQyxJQUFzQixFQUMxQixJQUFJckIsR0FDSixnQkFBQW1CLEdBQ0EsWUFBWUYsRUFDZCxHQUVNSCxJQUE2QixFQUNqQyxhQUFhcEIsR0FDYixXQUFXLFdBQVcsWUFBWSxNQUNsQyxVQUFBTSxHQUNBLFVBQUFlLEdBQ0EsS0FBS00sR0FDTCxhQUFhLE9BQ2Y7QUFFQSxTQUFLLFlBQVksWUFBWVAsQ0FBRSxHQUUzQkMsS0FBWSxPQUNkLEtBQUssSUFBSSw0QkFBNEIsSUFBSSxFQUN2QyxhQUFhTSxFQUNmLENBQUMsSUFFRCxLQUFLLElBQUksNEJBQTRCLElBQUksRUFDdkMsVUFBQU4sR0FDQSxhQUFhTSxFQUNmLENBQUM7RUFDTDtFQUVRLG9CQUFvQlAsR0FBNEI7QUFDdEQsUUFBSWhCLEVBQVVnQixDQUFFO0FBQ2QsYUFBTyxLQUFLLGdCQUFnQkEsRUFBRyxVQUFVQSxFQUFHLElBQUksVUFBVTtBQUM1RCxRQUFJZixFQUFXZSxDQUFFO0FBQ2YsZUFBVyxLQUFLLE9BQU8sUUFBUUEsRUFBRyxJQUFJLGNBQWM7QUFFaEQsYUFBSyxXQUFXLElBQUksRUFBRSxDQUFDLENBQUMsS0FDeEIsS0FBSyxNQUFNLElBQUksRUFBRSxDQUFDLENBQUMsS0FDbkIsS0FBSyxNQUFNLElBQUksRUFBRSxDQUFDLENBQUMsS0FBSyxRQUV4QixLQUFLLG9CQUFvQixFQUFFLENBQUMsR0FBRyxFQUFFLENBQUMsR0FBR0EsRUFBRyxRQUFRLEdBR2xELEtBQUssSUFBSSxtQ0FBbUMsSUFBSUEsRUFBRyxHQUFHO0VBRzVEO0VBRVEsZ0JBQWdCQSxHQUFzQztBQUc1RCxRQUZBLEtBQUssSUFBSSxzQkFBc0JBLEVBQUcsS0FBSyxhQUFhQSxFQUFHLElBQUksR0FFdkRBLEVBQUcsS0FBSyxZQUFZLFFBQWFBLEVBQUcsS0FBSyxhQUFhZCxHQUFVO0FBQ2xFLFdBQUssSUFBSSwwQ0FBMENjLEVBQUcsS0FBSyxXQUFXO0FBQ3RFO0lBQ0Y7QUFFQSxRQUFJbEIsRUFBZ0JrQixFQUFHLElBQUk7QUFBRyxhQUFPLEtBQUssb0JBQW9CQSxFQUFHLElBQUk7QUFFckUsWUFBUUEsRUFBRyxLQUFLLGFBQWE7TUFDM0IsS0FBSztBQUNILGFBQUssb0JBQ0hBLEVBQUcsS0FBSyxhQUNSQSxFQUFHLEtBQUssS0FDUkEsRUFBRyxLQUFLLFFBQ1Y7QUFDQTtNQUNGLEtBQUs7QUFDSCxhQUFLLGNBQWNBLEVBQUcsS0FBSyxhQUFhQSxFQUFHLEtBQUssS0FBS0EsRUFBRyxLQUFLLFFBQVE7QUFDckU7TUFDRixLQUFLO0FBQ0gsWUFBTVEsSUFBTSxLQUFLLG9CQUFvQixJQUFJUixFQUFHLEtBQUssV0FBVztBQUM1RCxZQUFJLENBQUNRO0FBQUs7QUFFVkEsVUFBSSxRQUFRUixFQUFHLEtBQUssR0FBRyxHQUN2QixLQUFLLG9CQUFvQixPQUFPQSxFQUFHLEtBQUssV0FBVztBQUVuRDtJQUNKO0FBRUEsU0FBSyxJQUFJLHFCQUFxQkEsRUFBRyxLQUFLLGFBQWFBLEVBQUcsSUFBSTtFQUM1RDtFQU9RLHFCQUFxQlMsR0FBdUM7QUFDbEUsUUFBSSxDQUFDQSxFQUFhO0FBQ2hCLFlBQU0sSUFBSSxNQUFNLHNCQUFzQjtBQUV4QyxTQUFLLFdBQVcsSUFBSUEsRUFBYSxXQUFXO0FBQzVDLFFBQU1DLElBQWtCRCxFQUFhO0FBQ3JDQSxNQUFhLFVBQVUsTUFBTTtBQUMzQkMsUUFBZ0IsR0FDaEIsS0FBSyxXQUFXLE9BQU9ELEVBQWEsV0FBVztJQUNqRCxHQUNBQSxFQUFhLGNBQWMsTUFFM0IsS0FBSyxnQkFBZ0I7RUFDdkI7RUFFQSxTQUFZRSxHQUFnQztBQUMxQyxRQUFJQTtBQUNGLGFBQU8sS0FBSyxNQUFNLElBQUlBLENBQU87RUFJakM7RUFFQSxNQUFNLFVBQVVmLEdBQXFCckIsR0FBYzBCLEdBQW1CO0FBQ3BFLFNBQUssV0FBV0wsR0FBYXJCLEdBQUssVUFBVTBCLENBQVE7RUFDdEQ7RUFFQSxNQUFjLFdBQ1pMLEdBQ0FyQixHQUNBcUMsR0FDQVgsR0FDQTtBQUNBLFFBQU0zQixJQUFXa0IsRUFBZ0IsSUFBSUksQ0FBVztBQUVoRCxTQUFLLElBQ0gsd0JBQXdCZ0IsQ0FBVyxRQUFRWCxLQUFZLGFBQWEsSUFDcEVMLEdBQ0EsRUFBRSxTQUFTckIsRUFBSSxDQUNqQjtBQUVBLFFBQU1zQyxJQUFPLE1BQU0sUUFBUSxRQUFRdEMsQ0FBRyxHQUNoQ3VDLElBQStCLEVBQ25DLGFBQWFsQixHQUNiLFdBQVcsV0FBVyxZQUFZLE1BQ2xDLFVBQVVWLEdBQ1YsVUFBVWUsR0FDVixLQUFLWSxHQUNMLGFBQUFELEVBQ0Y7QUFFSXRDLE9BQVUsU0FBTyxLQUFLLE1BQU0sSUFBSXNCLEdBQWFyQixDQUFHLEdBRXBELEtBQUssWUFBWSxZQUFZdUMsQ0FBUTtFQUN2QztFQUVBLE1BQU0sUUFBUWxCLEdBQXFCckIsR0FBYzBCLEdBQW1CO0FBQ2xFLFNBQUssSUFBSSxxQkFBcUJMLEdBQWEsRUFBRSxTQUFTckIsRUFBSSxDQUFDLEdBQzNELE1BQU0sS0FBSyxvQkFBb0JxQixHQUFhckIsR0FBS1csQ0FBUSxHQUVwRCxLQUFLLFdBQVcsSUFBSVUsQ0FBVyxLQUVwQyxLQUFLLFdBQVdBLEdBQWFyQixHQUFLLFVBQVUwQixDQUFRO0VBQ3REO0VBVUEsTUFBTSxZQUF5QlUsR0FBNkI7QUFDMUQsUUFBTUksSUFBSSxLQUFLLHNCQUFzQixJQUFJSixDQUFPO0FBQ2hELFFBQUlJO0FBQUcsYUFBT0EsRUFBRTtBQUVoQixRQUFNQyxJQUdGLEVBQ0YsU0FBUyxRQUNULFNBQVMsT0FDWDtBQUNBLFdBQUFBLEVBQVcsVUFBVSxJQUFJLFFBQVNDLE9BQWdDO0FBQ2hFRCxRQUFXLFVBQVVDO0lBQ3ZCLENBQUMsR0FFRCxLQUFLLHNCQUFzQixJQUFJTixHQUFTSyxDQUFVLEdBRTNDQSxFQUFXO0VBQ3BCO0VBRUEsVUFDRXBCLEdBQ0FuQixHQUNBb0IsSUFBWSxPQUNaQyxJQUFRLE1BQ1M7QUFDakIsUUFBTXhCLElBQVdrQixFQUFnQixJQUFJSSxDQUFXLEdBQzFDc0IsSUFBcUI7QUFDdkI1QyxVQUNGdUIsSUFBWXZCLEVBQVMsYUFBYSxPQUNsQ3dCLElBQVF4QixFQUFTLFNBQVM7QUFJNUIsUUFBTTZDLElBQU8sS0FBSyxZQUFZLElBQUl2QixDQUFXLEtBQUssQ0FBQyxHQUM3Q3dCLElBQU0zQztBQUNaMEMsTUFBSyxLQUFLQyxDQUFHLEdBQ2IsS0FBSyxZQUFZLElBQUl4QixHQUFhdUIsQ0FBSTtBQUV0QyxRQUFNVixJQUFnQyxFQUNwQyxhQUFhYixHQUNiLFVBQVUsT0FDVixTQUFTLE1BQU07QUFDYixVQUFNeUIsSUFBUSxLQUFLLFlBQVksSUFBSXpCLENBQVc7QUFFOUMsVUFBSXlCLEtBQVM7QUFBVztBQUN4QixVQUFNQyxJQUFJRCxFQUFNLFFBQVFELENBQUc7QUFFdkJFLFlBQU0sTUFDVkQsRUFBTSxPQUFPQyxHQUFHLENBQUM7SUFDbkIsR0FDQSxTQUFTLENBQUMvQyxHQUFLMEIsTUFDYixLQUFLLFFBQVFMLEdBQWFyQixHQUFLMEIsQ0FBUSxHQUN6QyxZQUFZLE1BQ2Q7QUFHQSxRQURJSixLQUFXLEtBQUsscUJBQXFCWSxDQUFZLEdBQ2pEWCxHQUFPO0FBQ0osV0FBSyxNQUFNLElBQUlGLENBQVcsS0FBRyxLQUFLLE1BQU0sSUFBSUEsR0FBYSxNQUFTO0FBQ3ZFLFVBQU1XLElBQVEsS0FBSyxNQUFNLElBQUlYLENBQVc7QUFDcENXLFdBQU9hLEVBQUliLENBQUs7SUFDdEI7QUFDQSxXQUFJLEtBQUssb0JBQW9CLElBQUlYLENBQVcsS0FDMUMsS0FBSyxZQUFZQSxDQUFXLEVBQUUsS0FBTVUsT0FBTWMsRUFBSWQsQ0FBQyxDQUFDLEdBRTNDRztFQUNUO0VBRVEsY0FDTmIsR0FDQTJCLEdBQ0FyQyxHQUNBO0FBQ0EsUUFBTXNDLElBQVcsS0FBSyxpQkFBaUIsSUFBSTVCLENBQVc7QUFFdEQsV0FBSzRCLElBRUVBLEVBQVMsUUFBUUQsR0FBYXJDLENBQVEsSUFGdkIsUUFBUSxRQUFRLE1BQVM7RUFHakQ7RUFFQSxRQUNFVSxHQUNBMkIsR0FDQTFCLElBQVksT0FDWkksR0FDb0M7QUFDcEMsUUFBS0osR0FJRTtBQUNMLFdBQUssV0FBV0QsR0FBYTJCLEdBQWEsT0FBT3RCLENBQVE7QUFDekQsVUFBTU8sSUFBTSxLQUFLLG9CQUFvQixJQUFJWixDQUFXO0FBQ2hEWSxXQUFLQSxFQUFJLFFBQVEsTUFBUztBQUU5QixVQUFJaUIsR0FJRUMsSUFBTyxFQUNYLFNBSmMsSUFBSSxRQUNqQlQsT0FBU1EsSUFBVVIsQ0FDdEIsR0FHRSxTQUFBUSxFQUNGO0FBQ0EsYUFBQSxLQUFLLG9CQUFvQixJQUFJN0IsR0FBYThCLENBQUksR0FDdkNBLEVBQUs7SUFDZCxPQW5CZ0I7QUFDZCxVQUFNRixJQUFXLEtBQUssaUJBQWlCLElBQUk1QixDQUFXO0FBQ3RELGFBQUs0QixJQUNFQSxFQUFTLFFBQVFELENBQVcsSUFEYixRQUFRLFFBQVEsTUFBUztJQUVqRDtFQWdCRjtFQVNBLE1BQ0UzQixHQUNBbkIsR0FDQW9CLElBQVksT0FDWjtBQUNBLFFBQUlBLEdBQVc7QUFDYixVQUFNOEIsSUFBY2xEO0FBQ3BCQSxVQUFXLENBQUNGLEdBQVcwQixNQUNyQixLQUFLLFdBQ0hMLEdBQ0ErQixFQUFZcEQsQ0FBRyxHQUNmLE9BQ0EwQixDQUNGO0lBQ0o7QUFDQSxRQUFNMkIsSUFBZSxLQUFLLGtCQUNwQlQsSUFBd0IsRUFDNUIsYUFBQXZCLEdBQ0EsSUFBSSxhQUFhO0FBQ2YsYUFBT2dDLEVBQWEsSUFBSWhDLENBQVc7SUFDckMsR0FDQSxhQUFhQyxHQUNiLFNBQVNwQixHQUNULFNBQVMsT0FDWDtBQUVBMEMsTUFBSyxVQUFVLE1BQU07QUFDbkJBLFFBQUssYUFBYSxNQUNNLEtBQUssaUJBQWlCLElBQUl2QixDQUFXLE1BQ3JDdUIsS0FBTSxLQUFLLGlCQUFpQixPQUFPdkIsQ0FBVztJQUN4RTtBQUVBLFFBQU1pQyxJQUFrQixLQUFLLGlCQUFpQixJQUFJakMsQ0FBVztBQUM3RCxXQUFJaUMsTUFDRkEsRUFBZ0IsYUFBYSxNQUM3QixRQUFRLEtBQUsseUNBQXlDakMsQ0FBVyxJQUVuRSxLQUFLLGlCQUFpQixJQUFJQSxHQUFhdUIsQ0FBSSxHQUNwQ0E7RUFDVDtFQU1BLE1BQWMsb0JBQ1p2QixHQUNBckIsR0FDQXVELEdBQ0E7QUFDQSxTQUFLLG9CQUFvQixJQUFJbEMsQ0FBVztBQUN4QyxRQUFNbUMsSUFBVyxLQUFLLFlBQVksSUFBSW5DLENBQVcsS0FBSyxDQUFDLEdBRWpEb0MsSUFBMEMsQ0FBQztBQUNqRCxhQUFXQyxLQUFLRjtBQUNURSxZQUNMRCxFQUF1QixLQUFLLFFBQVEsUUFBUUMsRUFBRTFELEdBQUt1RCxDQUFHLENBQUMsQ0FBQyxHQUN4RCxLQUFLLElBQUksa0JBQWtCbEMsR0FBYSxFQUFFLFNBQVNxQyxHQUFHLFNBQVMxRCxFQUFJLENBQUM7QUFHdEUsVUFBTSxRQUFRLElBQUl5RCxDQUFzQixHQUVwQ3hDLEVBQWdCLElBQUlJLENBQVcsR0FBRyxTQUNwQyxLQUFLLE1BQU0sSUFBSUEsR0FBYXJCLENBQUcsR0FFakMsS0FBSyxnQkFBZ0JxQixHQUFhckIsQ0FBRyxHQUNyQyxLQUFLLG9CQUFvQixPQUFPcUIsQ0FBVyxHQUUzQyxLQUFLLElBQUksbUJBQW1CQSxHQUFhLEVBQ3ZDLFNBQVNyQixHQUNULFVBQUF3RCxHQUNBLFFBQVEsS0FDVixDQUFDO0VBQ0g7RUFFUSxnQkFBZ0JwQixHQUFpQnBDLEdBQWM7QUFDckQsUUFBTTJELElBQVUsS0FBSyxzQkFBc0IsSUFBSXZCLENBQU87QUFDakR1QixVQUVMQSxFQUFRLFFBQVEzRCxDQUFHLEdBRW5CLEtBQUssc0JBQXNCLE9BQU9vQyxDQUFPO0VBQzNDO0FBQ0Y7QUFFQSxXQUFXLHlCQUFYLFdBQVcsdUJBQXlCLElBQUlsQjtBQUVqQyxJQUFNakIsSUFBTSxXQUFXO0FDdmQ5QixJQUFNMkQsSUFBaUIsb0JBQUk7QUFBM0IsSUFFYUMsSUFBTixNQUFNQyxHQUViO0VBc0JVLFlBQ05oRSxHQUNBQyxHQUNBO0FBZ0RGLFNBQVMsT0FBTztBQUNoQixTQUFTLFVBQVUsTUFBTTtBQUN2QkUsUUFBSSxZQUFZLE9BQU8sS0FBSyxJQUFJLEdBQ2hDMkQsRUFBZSxPQUFPLEtBQUssSUFBSTtJQUNqQztBQUVBLFNBQVMsT0FBZTtBQUN4QixTQUFTLFdBQTRCLENBQUM7QUF0RHBDLFNBQUssT0FBTzlELEdBQ1osS0FBSyxXQUFXQztFQUNsQjtFQTNCQSxPQUFPLElBQ0xELEdBQ0FDLEdBQ3FCO0FBQ3JCLFFBQUksQ0FBQ0EsR0FBVTtBQUNiLFVBQU1JLElBQUl5RCxFQUFlLElBQUk5RCxDQUFJO0FBQ2pDLFVBQUksQ0FBQ0s7QUFBRyxjQUFNLE1BQU0sNkJBQTZCO0FBQ2pELGFBQU9BO0lBQ1Q7QUFFQUYsTUFBSSxpQkFDRkgsR0FDQUMsRUFBUyxhQUFhLE9BQ3RCQSxFQUFTLFNBQVMsT0FDbEJBLEVBQVMsU0FBUyxLQUNwQjtBQUNBLFFBQU1LLElBQVUsSUFBSTBELEdBQW9CaEUsR0FBTUMsQ0FBUTtBQUN0RCxXQUFBNkQsRUFBZSxJQUFJOUQsR0FBTU0sQ0FBTyxHQUN6QkE7RUFDVDtFQVVBLE1BQU0sS0FBS0osR0FBVzBCLEdBQWtDO0FBQ3REekIsTUFBSSxRQUFRLEtBQUssTUFBTUQsR0FBSzBCLENBQVE7RUFDdEM7RUFDQSxhQUFhLFFBQ1g1QixHQUNBRSxHQUNBMEIsR0FDQTtBQUNBekIsTUFBSSxRQUFRSCxHQUFNRSxHQUFLMEIsQ0FBUTtFQUNqQztFQUNBLGFBQWEsVUFDWDVCLEdBQ0FFLEdBQ0EwQixHQUNBO0FBQ0F6QixNQUFJLFVBQWdCSCxHQUFNRSxHQUFLMEIsQ0FBUTtFQUN6QztFQUVBLFVBQVV4QixHQUFtQztBQU8zQyxXQU5VRCxFQUFJLFVBQ1osS0FBSyxNQUNMQyxHQUNBLEtBQUssU0FBUyxXQUNkLEtBQUssU0FBUyxLQUNoQixFQUNTO0VBQ1g7RUFFQSxXQUE2QjtBQUMzQixXQUFPRCxFQUFJLFNBQVMsS0FBSyxJQUFJO0VBQy9CO0VBQ0EsT0FBTyxTQUFlSCxHQUFjO0FBQ2xDLFdBQU9HLEVBQUksU0FBZUgsQ0FBSTtFQUNoQztFQUVBLGNBQTZCO0FBQzNCLFdBQU9HLEVBQUksWUFBWSxLQUFLLElBQUk7RUFDbEM7RUFFQSxPQUFPLFlBQWtCSCxHQUE2QjtBQUNwRCxXQUFPRyxFQUFJLFlBQVlILENBQUk7RUFDN0I7QUFVRjs7O0FDN0ZPLElBQU0sbUNBQW1DO0FBQ3pDLElBQU0sb0NBQW9DO0FBQzFDLElBQU0sdUJBQXVCOzs7QUNRcEMsRUFBYyxJQUFJLGtDQUFrQztBQUFBLEVBQ2xELFdBQVc7QUFDYixDQUFDLEVBQUUsVUFBVSxDQUFDLE1BQU07QUFDbEIsSUFBYztBQUFBLElBQ1o7QUFBQSxJQUNBLEVBQUUsU0FBUyxXQUFXO0FBQUEsRUFDeEI7QUFDRixDQUFDO0FBRUQsRUFBYztBQUFBLEVBQ1o7QUFBQSxFQUNBO0FBQUEsSUFDRSxXQUFXO0FBQUEsRUFDYjtBQUNGLEVBQUUsTUFBTSxDQUFDLFFBQVE7QUFDZixTQUFPLEVBQUUsU0FBUyxJQUFJLFVBQVUsV0FBVztBQUM3QyxDQUFDO0FBR0QsWUFBWSxPQUFPOyIsCiAgIm5hbWVzIjogWyJyZXFSZXBDaGFubmVscyIsICJSZXFSZXBDaGFubmVsIiwgIl9SZXFSZXBDaGFubmVsIiwgIm5hbWUiLCAic2V0dGluZ3MiLCAibXNnIiwgIkJNQiIsICJoYW5kbGVyIiwgImMiLCAiY2hhbm5lbCIsICJCUk9BRENBU1RfU1lOQyIsICJCUk9XU0VSX01FU1NBR0VfQlJPS0VSIiwgImlzQnJvYWRjYXN0U3luYyIsICJlIiwgImlzU3luY1JlcSIsICJpc1N5bmNSZXNwIiwgInNlbmRlcklkIiwgImRlYm91bmNlIiwgImZ1bmMiLCAidGltZW91dCIsICJ0aW1lciIsICJhcmdzIiwgImNoYW5uZWxTZXR0aW5ncyIsICJCcm9rZXIiLCAibWVzc2FnZSIsICJkYXRhIiwgImNoYW5uZWxOYW1lIiwgImJyb2FkY2FzdCIsICJjYWNoZSIsICJ0cmFjZSIsICJldiIsICJ0YXJnZXRJZCIsICJmaWx0ZXJCcm9hZGNhc3RzIiwgImN1cnJlbnRCcm9hZGNhc3RzIiwgImsiLCAiYXZhaWxhYmxlU3RhdGUiLCAieCIsICJzdGF0ZSIsICJyZXEiLCAic3Vic2NyaXB0aW9uIiwgIm9yaWdpbmFsRGlzcG9zZSIsICJzdWJzS2V5IiwgImNoYW5uZWxUeXBlIiwgIl9tc2ciLCAiZW52ZWxvcGUiLCAiYSIsICJuZXdBd2FpdGVyIiwgInJlcyIsICJzZXR0aW5nc092ZXJyaWRkZW4iLCAic3VicyIsICJoZGwiLCAiX3N1YnMiLCAiaSIsICJyZXF1ZXN0RGF0YSIsICJsaXN0ZW5lciIsICJyZXNvbHZlIiwgImJyZXEiLCAib3JpZ0hhbmRsZXIiLCAicmVxTGlzdGVuZXJzIiwgImN1cnJlbnRMaXN0ZW5lciIsICJzSWQiLCAiaGFuZGxlcnMiLCAiYWxsU3Vic2NyaWJlcnNQcm9taXNlcyIsICJoIiwgImF3YWl0ZXIiLCAicHViU3ViQ2hhbm5lbHMiLCAiUHViU3ViQ2hhbm5lbCIsICJfUHViU3ViQ2hhbm5lbCJdCn0K
