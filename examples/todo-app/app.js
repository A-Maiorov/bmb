"use strict";(()=>{var Tt=Object.defineProperty;var wt=Object.getOwnPropertyDescriptor;var W=(e,t,s,r)=>{for(var i=r>1?void 0:r?wt(t,s):t,o=e.length-1,n;o>=0;o--)(n=e[o])&&(i=(r?n(t,s,i):n(i))||i);return r&&i&&Tt(t,s,i),i};var V=new Map,K=class{constructor(e,t){this.type="reqRep",this.settings={},this.name="",this.name=e,this.settings=t}async request(e){return f.Request(this.name,e,this.settings.broadcast)}reply(e){return f.Reply(this.name,e,this.settings.broadcast).dispose}dispose(){f.requestListeners.delete(this.name),V.delete(this.name)}static for(e,t){if(!t){let r=V.get(e);if(!r)throw Error("Can't find channel settings");return r}f.ConfigureChannel(e,t.broadcast||!1,t.cache||!1,t.trace||!1);let s=new K(e,t);return V.set(e,s),s}},nt="broadcast-sync",Ot="browser-message-broker";function Dt(e){return e.channelName===nt}function Pt(e){return e.senderId!=null&&e.targetId==null}function Mt(e){return e.senderId!=null&&e.targetId!=null}var C=Math.random().toString(36).substring(2,9);function Rt(e,t=1){let s;return(...r)=>{clearTimeout(s),s=setTimeout(()=>{e(...r)},t)}}var D=new Map,It=class{constructor(){this.trace=!1,this.senderId=C,this.state=new Map,this.subscribers=new Map,this.braodcasts=new Set,this.__bcChannel=new BroadcastChannel(Ot),this.__nextMessageAwaters=new Map,this.broadcastedRequests=new Map,this.requestListeners=new Map,this.__bcChannel.onmessage=this.handleBroadcast.bind(this),this.__bcChannel.onmessageerror=this.handleBroadcastError.bind(this),setTimeout(()=>{this.__sendBrokerState(void 0,void 0)},0),this.sendBrokerState=Rt(this.__sendBrokerState.bind(this),2)}log(e,t,...s){(this.trace||D.get(t)?.trace)&&console.log(`[${globalThis.constructor.name}(${this.senderId})-${t}] ${e}`,s)}ConfigureChannel(e,t,s,r){D.set(e,{broadcast:t,cache:s,trace:r}),s&&this.state.set(e,void 0),t&&this.braodcasts.add(e)}handleBroadcastError(e){throw Error("BROADCAST FAILED: "+e.data)}__sendBrokerState(e,t){let s=Array.from(this.braodcasts.keys());t&&t.length>0&&(s=s.filter(n=>t.includes(n)));let r={};for(let n of this.state)!n[1]||!s.includes(n[0])||(r[n[0]]=n[1]);let i={id:C,availableState:r,broadcasts:s},o={channelName:nt,senderCtx:globalThis.constructor.name,senderId:C,targetId:e,msg:i,channelType:"sync"};this.__bcChannel.postMessage(o),e==null?this.log("Broadcast sync requested","",{brokerState:i}):this.log("Broadcast sync responded","",{targetId:e,brokerState:i})}handleBroadcastSync(e){if(Pt(e))return this.sendBrokerState(e.senderId,e.msg.broadcasts);if(Mt(e))for(let t of Object.entries(e.msg.availableState))this.braodcasts.has(t[0])&&this.state.has(t[0])&&this.state.get(t[0])==null&&this.__notifySubscribers(t[0],t[1],e.senderId),this.log("Broadcast sync responce handled","",e.msg)}handleBroadcast(e){if(this.log("Broadcast received",e.data.channelName,e.data),e.data.targetId!=null&&e.data.targetId!==C){this.log("Broadcast ignored (different targetId)",e.data.channelName);return}if(Dt(e.data))return this.handleBroadcastSync(e.data);switch(e.data.channelType){case"pubSub":this.__notifySubscribers(e.data.channelName,e.data.msg,e.data.senderId);break;case"req":this.bridgeRequest(e.data.channelName,e.data.msg,e.data.senderId);break;case"rep":let t=this.broadcastedRequests.get(e.data.channelName);if(!t)return;t.resolve(e.data.msg),this.broadcastedRequests.delete(e.data.channelName);break}this.log("Broadcast handled",e.data.channelName,e.data)}__configureBroadcast(e){if(!e.channelName)throw new Error("Invalid subscription");this.braodcasts.add(e.channelName);let t=e.dispose;e.dispose=()=>{t(),this.braodcasts.delete(e.channelName)},e.isBroadcast=!0,this.sendBrokerState()}GetState(e){if(e)return this.state.get(e)}async Broadcast(e,t,s){this._broadcast(e,t,"pubSub",s)}async _broadcast(e,t,s,r){let i=D.get(e);this.log(`Message broadcasted (${s}) to ${r||"all brokers"}`,e,t);let o=await Promise.resolve(t),n={channelName:e,senderCtx:globalThis.constructor.name,senderId:C,targetId:r,msg:o,channelType:s};i?.cache&&this.state.set(e,t),this.__bcChannel.postMessage(n)}async Publish(e,t,s){this.log("Message published",e,t),await this.__notifySubscribers(e,t,C),this.braodcasts.has(e)&&this._broadcast(e,t,"pubSub",s)}async nextMessage(e){let t=this.__nextMessageAwaters.get(e);if(t)return t.promise;let s={promise:void 0,resolve:void 0};return s.promise=new Promise(r=>{s.resolve=r}),this.__nextMessageAwaters.set(e,s),s.promise}Subscribe(e,t,s=!1,r=!0){let i=D.get(e),o=!1;i&&(s=i.broadcast||!1,r=i.cache||!0);let n=this.subscribers.get(e)||[],c=t;n.push(c),this.subscribers.set(e,n);let a={channelName:e,isCached:!1,dispose:()=>{let h=this.subscribers.get(e);if(h==null)return;let d=h.indexOf(c);d!==-1&&h.splice(d,1)},publish:(h,d)=>this.Publish(e,h,d),isDisposed:!1};return s&&this.__configureBroadcast(a),r&&this.state.set(e,void 0),a}bridgeRequest(e,t,s){let r=this.requestListeners.get(e);return r?r.handler(t,s):Promise.resolve(void 0)}Request(e,t,s=!1,r){if(s){this._broadcast(e,t,"req",r);let i=this.broadcastedRequests.get(e);i&&i.resolve(void 0);let o,n={promise:new Promise(c=>o=c),resolve:o};return this.broadcastedRequests.set(e,n),n.promise}else{let i=this.requestListeners.get(e);return i?i.handler(t):Promise.resolve(void 0)}}Reply(e,t,s=!1){if(s){let n=t;t=(c,a)=>this._broadcast(e,n(c),"rep",a)}let r=this.requestListeners,i={channelName:e,get isDisposed(){return r.has(e)},isBroadcast:s,handler:t,dispose:void 0};i.dispose=()=>{i.isDisposed=!0,this.requestListeners.get(e)===i&&this.requestListeners.delete(e)};let o=this.requestListeners.get(e);return o&&(o.isDisposed=!0,console.warn("Request listener has been replaced: "+e)),this.requestListeners.set(e,i),i}async __notifySubscribers(e,t,s){let r=this.subscribers.get(e)||[],i=[];for(let o of r)!o||(i.push(Promise.resolve(o(t,s))),this.log("Handler called",e,o));await Promise.all(i),D.get(e)?.cache&&this.state.set(e,t),this.__handleAwaiter(e,t),this.log("Message handled",e,t,this)}__handleAwaiter(e,t){let s=this.__nextMessageAwaters.get(e);!s||(s.resolve(t),this.__nextMessageAwaters.delete(e))}};globalThis.BrowserMessageBroker=globalThis.BrowserMessageBroker||new It;var f=globalThis.BrowserMessageBroker,F=new Map,p=class{constructor(e,t){this.type="pubSub",this.dispose=()=>{f.subscribers.delete(this.name),F.delete(this.name)},this.name="",this.settings={},this.name=e,this.settings=t}static for(e,t){if(!t){let r=F.get(e);if(!r)throw Error("Can't find channel settings");return r}f.ConfigureChannel(e,t.broadcast||!1,t.cache||!1,t.trace||!1);let s=new p(e,t);return F.set(e,s),s}async send(e,t){f.Publish(this.name,e,t)}static async publish(e,t,s){f.Publish(e,t,s)}static async broadcast(e,t,s){f.Broadcast(e,t,s)}subscribe(e){return f.Subscribe(this.name,e,this.settings.broadcast,this.settings.cache).dispose}getState(){return f.GetState(this.name)}static GetState(e){return f.GetState(e)}nextMessage(){return f.nextMessage(this.name)}static nextMessage(e){return f.nextMessage(e)}};var L=globalThis,k=L.ShadowRoot&&(L.ShadyCSS===void 0||L.ShadyCSS.nativeShadow)&&"adoptedStyleSheets"in Document.prototype&&"replace"in CSSStyleSheet.prototype,Y=Symbol(),at=new WeakMap,P=class{constructor(t,s,r){if(this._$cssResult$=!0,r!==Y)throw Error("CSSResult is not constructable. Use `unsafeCSS` or `css` instead.");this.cssText=t,this.t=s}get styleSheet(){let t=this.o,s=this.t;if(k&&t===void 0){let r=s!==void 0&&s.length===1;r&&(t=at.get(s)),t===void 0&&((this.o=t=new CSSStyleSheet).replaceSync(this.cssText),r&&at.set(s,t))}return t}toString(){return this.cssText}},ht=e=>new P(typeof e=="string"?e:e+"",void 0,Y),Z=(e,...t)=>{let s=e.length===1?e[0]:t.reduce((r,i,o)=>r+(n=>{if(n._$cssResult$===!0)return n.cssText;if(typeof n=="number")return n;throw Error("Value passed to 'css' function must be a 'css' function result: "+n+". Use 'unsafeCSS' to pass non-literal values, but take care to ensure page security.")})(i)+e[o+1],e[0]);return new P(s,e,Y)},J=(e,t)=>{if(k)e.adoptedStyleSheets=t.map(s=>s instanceof CSSStyleSheet?s:s.styleSheet);else for(let s of t){let r=document.createElement("style"),i=L.litNonce;i!==void 0&&r.setAttribute("nonce",i),r.textContent=s.cssText,e.appendChild(r)}},H=k?e=>e:e=>e instanceof CSSStyleSheet?(t=>{let s="";for(let r of t.cssRules)s+=r.cssText;return ht(s)})(e):e;var{is:Nt,defineProperty:Ut,getOwnPropertyDescriptor:qt,getOwnPropertyNames:Bt,getOwnPropertySymbols:Lt,getPrototypeOf:kt}=Object,z=globalThis,lt=z.trustedTypes,Ht=lt?lt.emptyScript:"",jt=z.reactiveElementPolyfillSupport,M=(e,t)=>e,j={toAttribute(e,t){switch(t){case Boolean:e=e?Ht:null;break;case Object:case Array:e=e==null?e:JSON.stringify(e)}return e},fromAttribute(e,t){let s=e;switch(t){case Boolean:s=e!==null;break;case Number:s=e===null?null:Number(e);break;case Object:case Array:try{s=JSON.parse(e)}catch{s=null}}return s}},Q=(e,t)=>!Nt(e,t),ct={attribute:!0,type:String,converter:j,reflect:!1,hasChanged:Q};Symbol.metadata??=Symbol("metadata"),z.litPropertyMetadata??=new WeakMap;var _=class extends HTMLElement{static addInitializer(t){this._$Ei(),(this.l??=[]).push(t)}static get observedAttributes(){return this.finalize(),this._$Eh&&[...this._$Eh.keys()]}static createProperty(t,s=ct){if(s.state&&(s.attribute=!1),this._$Ei(),this.elementProperties.set(t,s),!s.noAccessor){let r=Symbol(),i=this.getPropertyDescriptor(t,r,s);i!==void 0&&Ut(this.prototype,t,i)}}static getPropertyDescriptor(t,s,r){let{get:i,set:o}=qt(this.prototype,t)??{get(){return this[s]},set(n){this[s]=n}};return{get(){return i?.call(this)},set(n){let c=i?.call(this);o.call(this,n),this.requestUpdate(t,c,r)},configurable:!0,enumerable:!0}}static getPropertyOptions(t){return this.elementProperties.get(t)??ct}static _$Ei(){if(this.hasOwnProperty(M("elementProperties")))return;let t=kt(this);t.finalize(),t.l!==void 0&&(this.l=[...t.l]),this.elementProperties=new Map(t.elementProperties)}static finalize(){if(this.hasOwnProperty(M("finalized")))return;if(this.finalized=!0,this._$Ei(),this.hasOwnProperty(M("properties"))){let s=this.properties,r=[...Bt(s),...Lt(s)];for(let i of r)this.createProperty(i,s[i])}let t=this[Symbol.metadata];if(t!==null){let s=litPropertyMetadata.get(t);if(s!==void 0)for(let[r,i]of s)this.elementProperties.set(r,i)}this._$Eh=new Map;for(let[s,r]of this.elementProperties){let i=this._$Eu(s,r);i!==void 0&&this._$Eh.set(i,s)}this.elementStyles=this.finalizeStyles(this.styles)}static finalizeStyles(t){let s=[];if(Array.isArray(t)){let r=new Set(t.flat(1/0).reverse());for(let i of r)s.unshift(H(i))}else t!==void 0&&s.push(H(t));return s}static _$Eu(t,s){let r=s.attribute;return r===!1?void 0:typeof r=="string"?r:typeof t=="string"?t.toLowerCase():void 0}constructor(){super(),this._$Ep=void 0,this.isUpdatePending=!1,this.hasUpdated=!1,this._$Em=null,this._$Ev()}_$Ev(){this._$Eg=new Promise(t=>this.enableUpdating=t),this._$AL=new Map,this._$E_(),this.requestUpdate(),this.constructor.l?.forEach(t=>t(this))}addController(t){(this._$ES??=[]).push(t),this.renderRoot!==void 0&&this.isConnected&&t.hostConnected?.()}removeController(t){this._$ES?.splice(this._$ES.indexOf(t)>>>0,1)}_$E_(){let t=new Map,s=this.constructor.elementProperties;for(let r of s.keys())this.hasOwnProperty(r)&&(t.set(r,this[r]),delete this[r]);t.size>0&&(this._$Ep=t)}createRenderRoot(){let t=this.shadowRoot??this.attachShadow(this.constructor.shadowRootOptions);return J(t,this.constructor.elementStyles),t}connectedCallback(){this.renderRoot??=this.createRenderRoot(),this.enableUpdating(!0),this._$ES?.forEach(t=>t.hostConnected?.())}enableUpdating(t){}disconnectedCallback(){this._$ES?.forEach(t=>t.hostDisconnected?.())}attributeChangedCallback(t,s,r){this._$AK(t,r)}_$EO(t,s){let r=this.constructor.elementProperties.get(t),i=this.constructor._$Eu(t,r);if(i!==void 0&&r.reflect===!0){let o=(r.converter?.toAttribute!==void 0?r.converter:j).toAttribute(s,r.type);this._$Em=t,o==null?this.removeAttribute(i):this.setAttribute(i,o),this._$Em=null}}_$AK(t,s){let r=this.constructor,i=r._$Eh.get(t);if(i!==void 0&&this._$Em!==i){let o=r.getPropertyOptions(i),n=typeof o.converter=="function"?{fromAttribute:o.converter}:o.converter?.fromAttribute!==void 0?o.converter:j;this._$Em=i,this[i]=n.fromAttribute(s,o.type),this._$Em=null}}requestUpdate(t,s,r,i=!1,o){if(t!==void 0){if(r??=this.constructor.getPropertyOptions(t),!(r.hasChanged??Q)(i?o:this[t],s))return;this.C(t,s,r)}this.isUpdatePending===!1&&(this._$Eg=this._$EP())}C(t,s,r){this._$AL.has(t)||this._$AL.set(t,s),r.reflect===!0&&this._$Em!==t&&(this._$Ej??=new Set).add(t)}async _$EP(){this.isUpdatePending=!0;try{await this._$Eg}catch(s){Promise.reject(s)}let t=this.scheduleUpdate();return t!=null&&await t,!this.isUpdatePending}scheduleUpdate(){return this.performUpdate()}performUpdate(){if(!this.isUpdatePending)return;if(!this.hasUpdated){if(this._$Ep){for(let[i,o]of this._$Ep)this[i]=o;this._$Ep=void 0}let r=this.constructor.elementProperties;if(r.size>0)for(let[i,o]of r)o.wrapped!==!0||this._$AL.has(i)||this[i]===void 0||this.C(i,this[i],o)}let t=!1,s=this._$AL;try{t=this.shouldUpdate(s),t?(this.willUpdate(s),this._$ES?.forEach(r=>r.hostUpdate?.()),this.update(s)):this._$ET()}catch(r){throw t=!1,this._$ET(),r}t&&this._$AE(s)}willUpdate(t){}_$AE(t){this._$ES?.forEach(s=>s.hostUpdated?.()),this.hasUpdated||(this.hasUpdated=!0,this.firstUpdated(t)),this.updated(t)}_$ET(){this._$AL=new Map,this.isUpdatePending=!1}get updateComplete(){return this.getUpdateComplete()}getUpdateComplete(){return this._$Eg}shouldUpdate(t){return!0}update(t){this._$Ej&&=this._$Ej.forEach(s=>this._$EO(s,this[s])),this._$ET()}updated(t){}firstUpdated(t){}};_.elementStyles=[],_.shadowRootOptions={mode:"open"},_[M("elementProperties")]=new Map,_[M("finalized")]=new Map,jt?.({ReactiveElement:_}),(z.reactiveElementVersions??=[]).push("2.0.1");var ot=globalThis,G=ot.trustedTypes,dt=G?G.createPolicy("lit-html",{createHTML:e=>e}):void 0,_t="$lit$",$=`lit$${(Math.random()+"").slice(9)}$`,bt="?"+$,zt=`<${bt}>`,E=document,I=()=>E.createComment(""),N=e=>e===null||typeof e!="object"&&typeof e!="function",$t=Array.isArray,Gt=e=>$t(e)||typeof e?.[Symbol.iterator]=="function",X=`[ 	
\f\r]`,R=/<(?:(!--|\/[^a-zA-Z])|(\/?[a-zA-Z][^>\s]*)|(\/?$))/g,ut=/-->/g,pt=/>/g,A=RegExp(`>|${X}(?:([^\\s"'>=/]+)(${X}*=${X}*(?:[^ 	
\f\r"'\`<>=]|("|')|))|$)`,"g"),ft=/'/g,mt=/"/g,yt=/^(?:script|style|textarea|title)$/i,At=e=>(t,...s)=>({_$litType$:e,strings:t,values:s}),St=At(1),ie=At(2),v=Symbol.for("lit-noChange"),u=Symbol.for("lit-nothing"),gt=new WeakMap,S=E.createTreeWalker(E,129);function Et(e,t){if(!Array.isArray(e)||!e.hasOwnProperty("raw"))throw Error("invalid template strings array");return dt!==void 0?dt.createHTML(t):t}var Wt=(e,t)=>{let s=e.length-1,r=[],i,o=t===2?"<svg>":"",n=R;for(let c=0;c<s;c++){let a=e[c],h,d,l=-1,g=0;for(;g<a.length&&(n.lastIndex=g,d=n.exec(a),d!==null);)g=n.lastIndex,n===R?d[1]==="!--"?n=ut:d[1]!==void 0?n=pt:d[2]!==void 0?(yt.test(d[2])&&(i=RegExp("</"+d[2],"g")),n=A):d[3]!==void 0&&(n=A):n===A?d[0]===">"?(n=i??R,l=-1):d[1]===void 0?l=-2:(l=n.lastIndex-d[2].length,h=d[1],n=d[3]===void 0?A:d[3]==='"'?mt:ft):n===mt||n===ft?n=A:n===ut||n===pt?n=R:(n=A,i=void 0);let b=n===A&&e[c+1].startsWith("/>")?" ":"";o+=n===R?a+zt:l>=0?(r.push(h),a.slice(0,l)+_t+a.slice(l)+$+b):a+$+(l===-2?c:b)}return[Et(e,o+(e[s]||"<?>")+(t===2?"</svg>":"")),r]},U=class e{constructor({strings:t,_$litType$:s},r){let i;this.parts=[];let o=0,n=0,c=t.length-1,a=this.parts,[h,d]=Wt(t,s);if(this.el=e.createElement(h,r),S.currentNode=this.el.content,s===2){let l=this.el.content.firstChild;l.replaceWith(...l.childNodes)}for(;(i=S.nextNode())!==null&&a.length<c;){if(i.nodeType===1){if(i.hasAttributes())for(let l of i.getAttributeNames())if(l.endsWith(_t)){let g=d[n++],b=i.getAttribute(l).split($),B=/([.?@])?(.*)/.exec(g);a.push({type:1,index:o,name:B[2],strings:b,ctor:B[1]==="."?et:B[1]==="?"?st:B[1]==="@"?rt:w}),i.removeAttribute(l)}else l.startsWith($)&&(a.push({type:6,index:o}),i.removeAttribute(l));if(yt.test(i.tagName)){let l=i.textContent.split($),g=l.length-1;if(g>0){i.textContent=G?G.emptyScript:"";for(let b=0;b<g;b++)i.append(l[b],I()),S.nextNode(),a.push({type:2,index:++o});i.append(l[g],I())}}}else if(i.nodeType===8)if(i.data===bt)a.push({type:2,index:o});else{let l=-1;for(;(l=i.data.indexOf($,l+1))!==-1;)a.push({type:7,index:o}),l+=$.length-1}o++}}static createElement(t,s){let r=E.createElement("template");return r.innerHTML=t,r}};function T(e,t,s=e,r){if(t===v)return t;let i=r!==void 0?s._$Co?.[r]:s._$Cl,o=N(t)?void 0:t._$litDirective$;return i?.constructor!==o&&(i?._$AO?.(!1),o===void 0?i=void 0:(i=new o(e),i._$AT(e,s,r)),r!==void 0?(s._$Co??=[])[r]=i:s._$Cl=i),i!==void 0&&(t=T(e,i._$AS(e,t.values),i,r)),t}var tt=class{constructor(t,s){this._$AV=[],this._$AN=void 0,this._$AD=t,this._$AM=s}get parentNode(){return this._$AM.parentNode}get _$AU(){return this._$AM._$AU}u(t){let{el:{content:s},parts:r}=this._$AD,i=(t?.creationScope??E).importNode(s,!0);S.currentNode=i;let o=S.nextNode(),n=0,c=0,a=r[0];for(;a!==void 0;){if(n===a.index){let h;a.type===2?h=new q(o,o.nextSibling,this,t):a.type===1?h=new a.ctor(o,a.name,a.strings,this,t):a.type===6&&(h=new it(o,this,t)),this._$AV.push(h),a=r[++c]}n!==a?.index&&(o=S.nextNode(),n++)}return S.currentNode=E,i}p(t){let s=0;for(let r of this._$AV)r!==void 0&&(r.strings!==void 0?(r._$AI(t,r,s),s+=r.strings.length-2):r._$AI(t[s])),s++}},q=class e{get _$AU(){return this._$AM?._$AU??this._$Cv}constructor(t,s,r,i){this.type=2,this._$AH=u,this._$AN=void 0,this._$AA=t,this._$AB=s,this._$AM=r,this.options=i,this._$Cv=i?.isConnected??!0}get parentNode(){let t=this._$AA.parentNode,s=this._$AM;return s!==void 0&&t?.nodeType===11&&(t=s.parentNode),t}get startNode(){return this._$AA}get endNode(){return this._$AB}_$AI(t,s=this){t=T(this,t,s),N(t)?t===u||t==null||t===""?(this._$AH!==u&&this._$AR(),this._$AH=u):t!==this._$AH&&t!==v&&this._(t):t._$litType$!==void 0?this.g(t):t.nodeType!==void 0?this.$(t):Gt(t)?this.T(t):this._(t)}k(t){return this._$AA.parentNode.insertBefore(t,this._$AB)}$(t){this._$AH!==t&&(this._$AR(),this._$AH=this.k(t))}_(t){this._$AH!==u&&N(this._$AH)?this._$AA.nextSibling.data=t:this.$(E.createTextNode(t)),this._$AH=t}g(t){let{values:s,_$litType$:r}=t,i=typeof r=="number"?this._$AC(t):(r.el===void 0&&(r.el=U.createElement(Et(r.h,r.h[0]),this.options)),r);if(this._$AH?._$AD===i)this._$AH.p(s);else{let o=new tt(i,this),n=o.u(this.options);o.p(s),this.$(n),this._$AH=o}}_$AC(t){let s=gt.get(t.strings);return s===void 0&&gt.set(t.strings,s=new U(t)),s}T(t){$t(this._$AH)||(this._$AH=[],this._$AR());let s=this._$AH,r,i=0;for(let o of t)i===s.length?s.push(r=new e(this.k(I()),this.k(I()),this,this.options)):r=s[i],r._$AI(o),i++;i<s.length&&(this._$AR(r&&r._$AB.nextSibling,i),s.length=i)}_$AR(t=this._$AA.nextSibling,s){for(this._$AP?.(!1,!0,s);t&&t!==this._$AB;){let r=t.nextSibling;t.remove(),t=r}}setConnected(t){this._$AM===void 0&&(this._$Cv=t,this._$AP?.(t))}},w=class{get tagName(){return this.element.tagName}get _$AU(){return this._$AM._$AU}constructor(t,s,r,i,o){this.type=1,this._$AH=u,this._$AN=void 0,this.element=t,this.name=s,this._$AM=i,this.options=o,r.length>2||r[0]!==""||r[1]!==""?(this._$AH=Array(r.length-1).fill(new String),this.strings=r):this._$AH=u}_$AI(t,s=this,r,i){let o=this.strings,n=!1;if(o===void 0)t=T(this,t,s,0),n=!N(t)||t!==this._$AH&&t!==v,n&&(this._$AH=t);else{let c=t,a,h;for(t=o[0],a=0;a<o.length-1;a++)h=T(this,c[r+a],s,a),h===v&&(h=this._$AH[a]),n||=!N(h)||h!==this._$AH[a],h===u?t=u:t!==u&&(t+=(h??"")+o[a+1]),this._$AH[a]=h}n&&!i&&this.j(t)}j(t){t===u?this.element.removeAttribute(this.name):this.element.setAttribute(this.name,t??"")}},et=class extends w{constructor(){super(...arguments),this.type=3}j(t){this.element[this.name]=t===u?void 0:t}},st=class extends w{constructor(){super(...arguments),this.type=4}j(t){this.element.toggleAttribute(this.name,!!t&&t!==u)}},rt=class extends w{constructor(t,s,r,i,o){super(t,s,r,i,o),this.type=5}_$AI(t,s=this){if((t=T(this,t,s,0)??u)===v)return;let r=this._$AH,i=t===u&&r!==u||t.capture!==r.capture||t.once!==r.once||t.passive!==r.passive,o=t!==u&&(r===u||i);i&&this.element.removeEventListener(this.name,this,r),o&&this.element.addEventListener(this.name,this,t),this._$AH=t}handleEvent(t){typeof this._$AH=="function"?this._$AH.call(this.options?.host??this.element,t):this._$AH.handleEvent(t)}},it=class{constructor(t,s,r){this.element=t,this.type=6,this._$AN=void 0,this._$AM=s,this.options=r}get _$AU(){return this._$AM._$AU}_$AI(t){T(this,t)}};var Vt=ot.litHtmlPolyfillSupport;Vt?.(U,q),(ot.litHtmlVersions??=[]).push("3.0.1");var vt=(e,t,s)=>{let r=s?.renderBefore??t,i=r._$litPart$;if(i===void 0){let o=s?.renderBefore??null;r._$litPart$=i=new q(t.insertBefore(I(),o),o,void 0,s??{})}return i._$AI(e),i};var y=class extends _{constructor(){super(...arguments),this.renderOptions={host:this},this._$Do=void 0}createRenderRoot(){let t=super.createRenderRoot();return this.renderOptions.renderBefore??=t.firstChild,t}update(t){let s=this.render();this.hasUpdated||(this.renderOptions.isConnected=this.isConnected),super.update(t),this._$Do=vt(s,this.renderRoot,this.renderOptions)}connectedCallback(){super.connectedCallback(),this._$Do?.setConnected(!0)}disconnectedCallback(){super.disconnectedCallback(),this._$Do?.setConnected(!1)}render(){return v}};y._$litElement$=!0,y["finalized"]=!0,globalThis.litElementHydrateSupport?.({LitElement:y});var Ft=globalThis.litElementPolyfillSupport;Ft?.({LitElement:y});(globalThis.litElementVersions??=[]).push("4.0.1");var xt=e=>(t,s)=>{s!==void 0?s.addInitializer(()=>{customElements.define(e,t)}):customElements.define(e,t)};var x=(e,t,s)=>(s.configurable=!0,s.enumerable=!0,Reflect.decorate&&typeof t!="object"&&Object.defineProperty(e,t,s),s);function Ct(e,t){return(s,r,i)=>{let o=n=>n.renderRoot?.querySelector(e)??null;if(t){let{get:n,set:c}=typeof r=="object"?s:i??(()=>{let a=Symbol();return{get(){return this[a]},set(h){this[a]=h}}})();return x(s,r,{get(){if(t){let a=n.call(this);return a===void 0&&(a=o(this),c.call(this,a)),a}return o(this)}})}return x(s,r,{get(){return o(this)}})}}var m={ADD_TODO:"addTodo",TODO_ADDED:"todoAdded",TODO_ERR:"todoErr",MODIFY_TODO:"modifyTodo",COMPLETE_TODO:"completeTodo",TODO_MODIFIED:"todoModified",DEL_TODO:"delTodo",TODO_DELETED:"todoDeleted",GET_ALL_TODOS:"getAllTodos",TODO_SELECTED:"todoSelected",CHECK_DATA_SOURCE:"checkDataSource",DATA_SOURCE_READY:"dataSourceReady"},Ve=p.for(m.TODO_ADDED,{broadcast:!0,cache:!1}),Fe=p.for(m.TODO_ERR,{broadcast:!0,cache:!1}),Ke=p.for(m.TODO_DELETED,{broadcast:!0,cache:!1}),Ye=p.for(m.TODO_MODIFIED,{broadcast:!0,cache:!1}),Ze=p.for(m.DATA_SOURCE_READY,{broadcast:!0,cache:!0}),Je=p.for(m.ADD_TODO,{broadcast:!0,cache:!1}),Qe=p.for(m.COMPLETE_TODO,{broadcast:!0,cache:!1}),Xe=p.for(m.DEL_TODO,{broadcast:!0,cache:!1}),ts=p.for(m.MODIFY_TODO,{broadcast:!0,cache:!1}),es=K.for(m.GET_ALL_TODOS,{broadcast:!0}),ss=p.for(m.TODO_SELECTED,{broadcast:!0,cache:!0});var Kt=p.for(m.TODO_ERR,{broadcast:!0,cache:!1});Kt.subscribe(e=>{console.log(e)});var O=class extends y{render(){return St`
      <div>
        <input
          type="text"
          id="text"
          placeholder="Type here what to do"
        />

        <button @click=${this.addTodo}>Add</button>
      </div>
      <i>Click existing todo text in order to change it</i>
    `}addTodo(){if(!this.txtInput)return;let s=this.txtInput?.value;!s||s===""||(p.broadcast(m.ADD_TODO,{text:s}),this.txtInput.value="",this.requestUpdate())}};O.styles=Z`
    :host {
      display: block;
      margin: 10px 0px;
    }

    i {
      font-size: small;
      color: gray;
    }
  `,W([Ct("#text")],O.prototype,"txtInput",2),O=W([xt("todo-app")],O);})();
/*! Bundled license information:

@lit/reactive-element/css-tag.js:
  (**
   * @license
   * Copyright 2019 Google LLC
   * SPDX-License-Identifier: BSD-3-Clause
   *)

@lit/reactive-element/reactive-element.js:
  (**
   * @license
   * Copyright 2017 Google LLC
   * SPDX-License-Identifier: BSD-3-Clause
   *)

lit-html/lit-html.js:
  (**
   * @license
   * Copyright 2017 Google LLC
   * SPDX-License-Identifier: BSD-3-Clause
   *)

lit-element/lit-element.js:
  (**
   * @license
   * Copyright 2017 Google LLC
   * SPDX-License-Identifier: BSD-3-Clause
   *)

lit-html/is-server.js:
  (**
   * @license
   * Copyright 2022 Google LLC
   * SPDX-License-Identifier: BSD-3-Clause
   *)

@lit/reactive-element/decorators/custom-element.js:
  (**
   * @license
   * Copyright 2017 Google LLC
   * SPDX-License-Identifier: BSD-3-Clause
   *)

@lit/reactive-element/decorators/property.js:
  (**
   * @license
   * Copyright 2017 Google LLC
   * SPDX-License-Identifier: BSD-3-Clause
   *)

@lit/reactive-element/decorators/state.js:
  (**
   * @license
   * Copyright 2017 Google LLC
   * SPDX-License-Identifier: BSD-3-Clause
   *)

@lit/reactive-element/decorators/event-options.js:
  (**
   * @license
   * Copyright 2017 Google LLC
   * SPDX-License-Identifier: BSD-3-Clause
   *)

@lit/reactive-element/decorators/base.js:
  (**
   * @license
   * Copyright 2017 Google LLC
   * SPDX-License-Identifier: BSD-3-Clause
   *)

@lit/reactive-element/decorators/query.js:
  (**
   * @license
   * Copyright 2017 Google LLC
   * SPDX-License-Identifier: BSD-3-Clause
   *)

@lit/reactive-element/decorators/query-all.js:
  (**
   * @license
   * Copyright 2017 Google LLC
   * SPDX-License-Identifier: BSD-3-Clause
   *)

@lit/reactive-element/decorators/query-async.js:
  (**
   * @license
   * Copyright 2017 Google LLC
   * SPDX-License-Identifier: BSD-3-Clause
   *)

@lit/reactive-element/decorators/query-assigned-elements.js:
  (**
   * @license
   * Copyright 2021 Google LLC
   * SPDX-License-Identifier: BSD-3-Clause
   *)

@lit/reactive-element/decorators/query-assigned-nodes.js:
  (**
   * @license
   * Copyright 2017 Google LLC
   * SPDX-License-Identifier: BSD-3-Clause
   *)
*/
//# sourceMappingURL=app.js.map
