var l="broadcast-sync",b="browser-message-broker";function u(s){return s.subsKey===l}function g(s){return s.senderId!=null&&s.targetId==null}function _(s){return s.senderId!=null&&s.targetId!=null}var n=Math.random().toString(36).substring(2,9);function B(s,t=1){let e;return(...r)=>{clearTimeout(e),e=setTimeout(()=>{s(...r)},t)}}var p=class{constructor(){if(this.trace=!1,this.senderId=n,this.state=new Map,this.subscribers=new Map,this.braodcasts=new Set,this.__bcChannel=new BroadcastChannel(b),this.__nextMessageAwaters=new Map,globalThis.constructor.name==="Window"){let s=new CustomEvent("bmb-ready",{detail:this});globalThis.document.dispatchEvent(s)}this.__bcChannel.onmessage=this.handleBroadcast.bind(this),this.__bcChannel.onmessageerror=this.handleBroadcastError.bind(this),this.sendBrokerState=B(this.__sendBrokerState.bind(this),2),this.sendBrokerState()}handleBroadcastError(s){throw Error("BROADCAST FAILED: "+s.data)}__sendBrokerState(s,t){let e=Array.from(this.braodcasts.keys());t&&t.length>0&&(e=e.filter(a=>t.includes(a)));let r={};for(let a of this.state)!a[1]||!e.includes(a[0])||(r[a[0]]=a[1]);let o={id:n,availableState:r,broadcasts:e},i={subsKey:l,senderCtx:globalThis.constructor.name,senderId:n,targetId:s,msg:o};this.__bcChannel.postMessage(i),this.trace&&(s==null?console.log("[Broadcast sync requested]",i,this):console.log("[Broadcast sync responded]",s,i,this))}handleBroadcastSync(s){if(g(s))return this.sendBrokerState(s.senderId,s.msg.broadcasts);if(_(s))for(let t of Object.entries(s.msg.availableState))this.braodcasts.has(t[0])&&this.state.has(t[0])&&this.state.get(t[0])==null&&this.__notifySubscribers(t[0],t[1],s.senderId),this.trace&&console.log("[Broadcast sync responce handled]",s,this)}handleBroadcast(s){if(this.trace&&console.log("[Broadcast received]",s.data,this),s.data.targetId!=null&&s.data.targetId!==n){this.trace&&console.log("[Broadcast ignored]",s.data,this);return}if(u(s.data))return this.handleBroadcastSync(s.data);this.__notifySubscribers(s.data.subsKey,s.data.msg,s.data.senderId),this.trace&&console.log("[Broadcast handled]",s.data,this)}__configureBroadcast(s){if(!s.key)throw new Error("Invalid subscription");this.braodcasts.add(s.key);let t=s.dispose;s.dispose=()=>{t(),this.braodcasts.delete(s.key)},s.isBroadcast=!0,this.sendBrokerState()}GetState(s){if(s)return this.state.get(s)}async Publish(s,t,e){if(this.trace&&console.log("[Message published]",s,t,this),await this.__notifySubscribers(s,t,n),!this.braodcasts.has(s))return;let r={subsKey:s,senderCtx:globalThis.constructor.name,senderId:n,targetId:e,msg:t};this.__bcChannel.postMessage(r)}async nextMessage(s){let t=this.__nextMessageAwaters.get(s);if(t)return t.promise;let e={promise:void 0,resolve:void 0};return e.promise=new Promise(r=>{e.resolve=r}),this.__nextMessageAwaters.set(s,e),e.promise}Subscribe(s,t,e=!1,r=!0){let o=this.subscribers.get(s)||[],i=t;o.push(i),this.subscribers.set(s,o);let a={key:s,isCached:!1,dispose:()=>{o.splice(o.indexOf(i),1),a.isDisposed=!0},publish:(h,c)=>this.Publish(s,h,c),isDisposed:!1};return e&&this.__configureBroadcast(a),r&&this.state.set(s,void 0),this.trace&&console.log("[Subscribe]",a,this),a}async __notifySubscribers(s,t,e){let r=this.subscribers.get(s)||[],o=[];for(let i of r)!i||(o.push(Promise.resolve(i(t,e))),this.trace&&console.log("[Handler called]",i,this));await Promise.all(o),this.state.has(s)&&this.state.set(s,t),this.__handleAwaiter(s,t),this.trace&&console.log("[Message handled]",s,t,this)}__handleAwaiter(s,t){let e=this.__nextMessageAwaters.get(s);!e||(e.resolve(t),this.__nextMessageAwaters.delete(s))}};globalThis.BrowserMessageBroker=globalThis.BrowserMessageBroker||new p;var d=globalThis.BrowserMessageBroker;var y=d.Subscribe("testResp",void 0,!0),S=d.Subscribe("testReq",s=>{d.Publish("testResp",{payload:"response"})},!0);postMessage("ready");
//# sourceMappingURL=testWorker.js.map
