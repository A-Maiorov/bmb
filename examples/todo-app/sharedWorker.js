"use strict";(()=>{var J=Object.defineProperty,Q=Object.defineProperties;var X=Object.getOwnPropertyDescriptors;var B=Object.getOwnPropertySymbols;var Z=Object.prototype.hasOwnProperty,ee=Object.prototype.propertyIsEnumerable;var A=(e,t,s)=>t in e?J(e,t,{enumerable:!0,configurable:!0,writable:!0,value:s}):e[t]=s,v=(e,t)=>{for(var s in t||(t={}))Z.call(t,s)&&A(e,s,t[s]);if(B)for(var s of B(t))ee.call(t,s)&&A(e,s,t[s]);return e},L=(e,t)=>Q(e,X(t));var g=(e,t,s)=>new Promise((n,r)=>{var o=i=>{try{d(s.next(i))}catch(l){r(l)}},a=i=>{try{d(s.throw(i))}catch(l){r(l)}},d=i=>i.done?n(i.value):Promise.resolve(i.value).then(o,a);d((s=s.apply(e,t)).next())});var te=(e,t)=>t.some(s=>e instanceof s),R,P;function se(){return R||(R=[IDBDatabase,IDBObjectStore,IDBIndex,IDBCursor,IDBTransaction])}function ne(){return P||(P=[IDBCursor.prototype.advance,IDBCursor.prototype.continue,IDBCursor.prototype.continuePrimaryKey])}var k=new WeakMap,_=new WeakMap,q=new WeakMap,w=new WeakMap,C=new WeakMap;function re(e){let t=new Promise((s,n)=>{let r=()=>{e.removeEventListener("success",o),e.removeEventListener("error",a)},o=()=>{s(b(e.result)),r()},a=()=>{n(e.error),r()};e.addEventListener("success",o),e.addEventListener("error",a)});return t.then(s=>{s instanceof IDBCursor&&k.set(s,e)}).catch(()=>{}),C.set(t,e),t}function ae(e){if(_.has(e))return;let t=new Promise((s,n)=>{let r=()=>{e.removeEventListener("complete",o),e.removeEventListener("error",a),e.removeEventListener("abort",a)},o=()=>{s(),r()},a=()=>{n(e.error||new DOMException("AbortError","AbortError")),r()};e.addEventListener("complete",o),e.addEventListener("error",a),e.addEventListener("abort",a)});_.set(e,t)}var I={get(e,t,s){if(e instanceof IDBTransaction){if(t==="done")return _.get(e);if(t==="objectStoreNames")return e.objectStoreNames||q.get(e);if(t==="store")return s.objectStoreNames[1]?void 0:s.objectStore(s.objectStoreNames[0])}return b(e[t])},set(e,t,s){return e[t]=s,!0},has(e,t){return e instanceof IDBTransaction&&(t==="done"||t==="store")?!0:t in e}};function N(e){I=e(I)}function oe(e){return e===IDBDatabase.prototype.transaction&&!("objectStoreNames"in IDBTransaction.prototype)?function(t,...s){let n=e.call(y(this),t,...s);return q.set(n,t.sort?t.sort():[t]),b(n)}:ne().includes(e)?function(...t){return e.apply(y(this),t),b(k.get(this))}:function(...t){return b(e.apply(y(this),t))}}function ie(e){return typeof e=="function"?oe(e):(e instanceof IDBTransaction&&ae(e),te(e,se())?new Proxy(e,I):e)}function b(e){if(e instanceof IDBRequest)return re(e);if(w.has(e))return w.get(e);let t=ie(e);return t!==e&&(w.set(e,t),C.set(t,e)),t}var y=e=>C.get(e);function F(e,t,{blocked:s,upgrade:n,blocking:r,terminated:o}={}){let a=indexedDB.open(e,t),d=b(a);return n&&a.addEventListener("upgradeneeded",i=>{n(b(a.result),i.oldVersion,i.newVersion,b(a.transaction))}),s&&a.addEventListener("blocked",()=>s()),d.then(i=>{o&&i.addEventListener("close",()=>o()),r&&i.addEventListener("versionchange",()=>r())}).catch(()=>{}),d}var de=["get","getKey","getAll","getAllKeys","count"],ce=["put","add","delete","clear"],E=new Map;function j(e,t){if(!(e instanceof IDBDatabase&&!(t in e)&&typeof t=="string"))return;if(E.get(t))return E.get(t);let s=t.replace(/FromIndex$/,""),n=t!==s,r=ce.includes(s);if(!(s in(n?IDBIndex:IDBObjectStore).prototype)||!(r||de.includes(s)))return;let o=async function(a,...d){let i=this.transaction(a,r?"readwrite":"readonly"),l=i.store;return n&&(l=l.index(d.shift())),(await Promise.all([l[s](...d),r&&i.done]))[0]};return E.set(t,o),o}N(e=>({...e,get:(t,s,n)=>j(t,s)||e.get(t,s,n),has:(t,s)=>!!j(t,s)||e.has(t,s)}));var M=new Map,O=class{constructor(e,t){this.type="reqRep",this.settings={},this.name="",this.name=e,this.settings=t}async request(e){return c.Request(this.name,e,this.settings.broadcast)}reply(e){return c.Reply(this.name,e,this.settings.broadcast).dispose}dispose(){c.requestListeners.delete(this.name),M.delete(this.name)}static for(e,t){if(!t){let n=M.get(e);if(!n)throw Error("Can't find channel settings");return n}c.ConfigureChannel(e,t.broadcast||!1,t.cache||!1,t.trace||!1);let s=new O(e,t);return M.set(e,s),s}},G="broadcast-sync",le="browser-message-broker";function he(e){return e.channelName===G}function ue(e){return e.senderId!=null&&e.targetId==null}function be(e){return e.senderId!=null&&e.targetId!=null}var m=Math.random().toString(36).substring(2,9);function fe(e,t=1){let s;return(...n)=>{clearTimeout(s),s=setTimeout(()=>{e(...n)},t)}}var p=new Map,ge=class{constructor(){this.trace=!1,this.senderId=m,this.state=new Map,this.subscribers=new Map,this.braodcasts=new Set,this.__bcChannel=new BroadcastChannel(le),this.__nextMessageAwaters=new Map,this.broadcastedRequests=new Map,this.requestListeners=new Map,this.__bcChannel.onmessage=this.handleBroadcast.bind(this),this.__bcChannel.onmessageerror=this.handleBroadcastError.bind(this),setTimeout(()=>{this.__sendBrokerState(void 0,void 0)},0),this.sendBrokerState=fe(this.__sendBrokerState.bind(this),2)}log(e,t,...s){(this.trace||p.get(t)?.trace)&&console.log(`[${globalThis.constructor.name}(${this.senderId})-${t}] ${e}`,s)}ConfigureChannel(e,t,s,n){p.set(e,{broadcast:t,cache:s,trace:n}),s&&this.state.set(e,void 0),t&&this.braodcasts.add(e)}handleBroadcastError(e){throw Error("BROADCAST FAILED: "+e.data)}__sendBrokerState(e,t){let s=Array.from(this.braodcasts.keys());t&&t.length>0&&(s=s.filter(a=>t.includes(a)));let n={};for(let a of this.state)!a[1]||!s.includes(a[0])||(n[a[0]]=a[1]);let r={id:m,availableState:n,broadcasts:s},o={channelName:G,senderCtx:globalThis.constructor.name,senderId:m,targetId:e,msg:r,channelType:"sync"};this.__bcChannel.postMessage(o),e==null?this.log("Broadcast sync requested","",{brokerState:r}):this.log("Broadcast sync responded","",{targetId:e,brokerState:r})}handleBroadcastSync(e){if(ue(e))return this.sendBrokerState(e.senderId,e.msg.broadcasts);if(be(e))for(let t of Object.entries(e.msg.availableState))this.braodcasts.has(t[0])&&this.state.has(t[0])&&this.state.get(t[0])==null&&this.__notifySubscribers(t[0],t[1],e.senderId),this.log("Broadcast sync responce handled","",e.msg)}handleBroadcast(e){if(this.log("Broadcast received",e.data.channelName,e.data),e.data.targetId!=null&&e.data.targetId!==m){this.log("Broadcast ignored (different targetId)",e.data.channelName);return}if(he(e.data))return this.handleBroadcastSync(e.data);switch(e.data.channelType){case"pubSub":this.__notifySubscribers(e.data.channelName,e.data.msg,e.data.senderId);break;case"req":this.bridgeRequest(e.data.channelName,e.data.msg,e.data.senderId);break;case"rep":let t=this.broadcastedRequests.get(e.data.channelName);if(!t)return;t.resolve(e.data.msg),this.broadcastedRequests.delete(e.data.channelName);break}this.log("Broadcast handled",e.data.channelName,e.data)}__configureBroadcast(e){if(!e.channelName)throw new Error("Invalid subscription");this.braodcasts.add(e.channelName);let t=e.dispose;e.dispose=()=>{t(),this.braodcasts.delete(e.channelName)},e.isBroadcast=!0,this.sendBrokerState()}GetState(e){if(e)return this.state.get(e)}async Broadcast(e,t,s){this._broadcast(e,t,"pubSub",s)}async _broadcast(e,t,s,n){let r=p.get(e);this.log(`Message broadcasted (${s}) to ${n||"all brokers"}`,e,t);let o=await Promise.resolve(t),a={channelName:e,senderCtx:globalThis.constructor.name,senderId:m,targetId:n,msg:o,channelType:s};r?.cache&&this.state.set(e,t),this.__bcChannel.postMessage(a)}async Publish(e,t,s){this.log("Message published",e,t),await this.__notifySubscribers(e,t,m),this.braodcasts.has(e)&&this._broadcast(e,t,"pubSub",s)}async nextMessage(e){let t=this.__nextMessageAwaters.get(e);if(t)return t.promise;let s={promise:void 0,resolve:void 0};return s.promise=new Promise(n=>{s.resolve=n}),this.__nextMessageAwaters.set(e,s),s.promise}Subscribe(e,t,s=!1,n=!0){let r=p.get(e),o=!1;r&&(s=r.broadcast||!1,n=r.cache||!0);let a=this.subscribers.get(e)||[],d=t;a.push(d),this.subscribers.set(e,a);let i={channelName:e,isCached:!1,dispose:()=>{let l=this.subscribers.get(e);if(l==null)return;let D=l.indexOf(d);D!==-1&&l.splice(D,1)},publish:(l,D)=>this.Publish(e,l,D),isDisposed:!1};return s&&this.__configureBroadcast(i),n&&this.state.set(e,void 0),i}bridgeRequest(e,t,s){let n=this.requestListeners.get(e);return n?n.handler(t,s):Promise.resolve(void 0)}Request(e,t,s=!1,n){if(s){this._broadcast(e,t,"req",n);let r=this.broadcastedRequests.get(e);r&&r.resolve(void 0);let o,a={promise:new Promise(d=>o=d),resolve:o};return this.broadcastedRequests.set(e,a),a.promise}else{let r=this.requestListeners.get(e);return r?r.handler(t):Promise.resolve(void 0)}}Reply(e,t,s=!1){if(s){let a=t;t=(d,i)=>this._broadcast(e,a(d),"rep",i)}let n=this.requestListeners,r={channelName:e,get isDisposed(){return n.has(e)},isBroadcast:s,handler:t,dispose:void 0};r.dispose=()=>{r.isDisposed=!0,this.requestListeners.get(e)===r&&this.requestListeners.delete(e)};let o=this.requestListeners.get(e);return o&&(o.isDisposed=!0,console.warn("Request listener has been replaced: "+e)),this.requestListeners.set(e,r),r}async __notifySubscribers(e,t,s){let n=this.subscribers.get(e)||[],r=[];for(let o of n)!o||(r.push(Promise.resolve(o(t,s))),this.log("Handler called",e,o));await Promise.all(r),p.get(e)?.cache&&this.state.set(e,t),this.__handleAwaiter(e,t),this.log("Message handled",e,t,this)}__handleAwaiter(e,t){let s=this.__nextMessageAwaters.get(e);!s||(s.resolve(t),this.__nextMessageAwaters.delete(e))}};globalThis.BrowserMessageBroker=globalThis.BrowserMessageBroker||new ge;var c=globalThis.BrowserMessageBroker,x=new Map,h=class{constructor(e,t){this.type="pubSub",this.dispose=()=>{c.subscribers.delete(this.name),x.delete(this.name)},this.name="",this.settings={},this.name=e,this.settings=t}static for(e,t){if(!t){let n=x.get(e);if(!n)throw Error("Can't find channel settings");return n}c.ConfigureChannel(e,t.broadcast||!1,t.cache||!1,t.trace||!1);let s=new h(e,t);return x.set(e,s),s}async send(e,t){c.Publish(this.name,e,t)}static async publish(e,t,s){c.Publish(e,t,s)}static async broadcast(e,t,s){c.Broadcast(e,t,s)}subscribe(e){return c.Subscribe(this.name,e,this.settings.broadcast,this.settings.cache).dispose}getState(){return c.GetState(this.name)}static GetState(e){return c.GetState(e)}nextMessage(){return c.nextMessage(this.name)}static nextMessage(e){return c.nextMessage(e)}};var u={ADD_TODO:"addTodo",TODO_ADDED:"todoAdded",TODO_ERR:"todoErr",MODIFY_TODO:"modifyTodo",COMPLETE_TODO:"completeTodo",TODO_MODIFIED:"todoModified",DEL_TODO:"delTodo",TODO_DELETED:"todoDeleted",GET_ALL_TODOS:"getAllTodos",TODO_SELECTED:"todoSelected",CHECK_DATA_SOURCE:"checkDataSource",DATA_SOURCE_READY:"dataSourceReady"},$=h.for(u.TODO_ADDED,{broadcast:!0,cache:!1}),f=h.for(u.TODO_ERR,{broadcast:!0,cache:!1}),W=h.for(u.TODO_DELETED,{broadcast:!0,cache:!1}),S=h.for(u.TODO_MODIFIED,{broadcast:!0,cache:!1}),K=h.for(u.DATA_SOURCE_READY,{broadcast:!0,cache:!0}),V=h.for(u.ADD_TODO,{broadcast:!0,cache:!1}),Y=h.for(u.COMPLETE_TODO,{broadcast:!0,cache:!1}),U=h.for(u.DEL_TODO,{broadcast:!0,cache:!1}),H=h.for(u.MODIFY_TODO,{broadcast:!0,cache:!1}),z=O.for(u.GET_ALL_TODOS,{broadcast:!0}),Ae=h.for(u.TODO_SELECTED,{broadcast:!0,cache:!0});var T=F("Todos",1,{upgrade(e){e.createObjectStore("todo",{keyPath:"id",autoIncrement:!0}).createIndex("isDone","isDone")}});V.subscribe(ye);Y.subscribe(De);U.subscribe(Te);H.subscribe(pe);z.reply(me);function me(e){return g(this,null,function*(){try{return yield(yield T).getAll("todo")}catch(t){console.log(t),f.send({message:"Can't get all todos",context:{}})}return Promise.resolve([])})}function pe(e){return g(this,null,function*(){try{let t=yield T,s=yield t.get("todo",e.id);s.text=e.newText,yield t.put("todo",s),S.send(s)}catch(t){f.send({message:`Can't modify todo. Change: text = '${e.newText}'`,context:{id:e.id}})}})}function Te(e){return g(this,null,function*(){try{yield(yield T).delete("todo",e.id),W.send(e)}catch(t){f.send({message:"Can't delete todo",context:e})}})}function De(e){return g(this,null,function*(){try{yield(yield T).put("todo",L(v({},e),{isDone:!0})),e.isDone=!0,S.send(e)}catch(t){f.send({message:"Can't complete todo",context:e})}})}function ye(e){return g(this,null,function*(){if(!e.text||e.text===""){f.send({context:e,message:"Can't add todo without text"});return}let t={text:e.text,isDone:!1};try{let n=yield(yield T).add("todo",t);t.id=n,$.send(t)}catch(s){f.send({message:"Can't add todo. ",context:e})}})}K.send(!0);})();
//# sourceMappingURL=sharedWorker.js.map
