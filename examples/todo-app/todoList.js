"use strict";(()=>{var qt=Object.defineProperty;var kt=Object.getOwnPropertyDescriptor;var F=(e,t,s,o)=>{for(var r=o>1?void 0:o?kt(t,s):t,i=e.length-1,n;i>=0;i--)(n=e[i])&&(r=(o?n(t,s,r):n(r))||r);return o&&r&&qt(t,s,r),r};var B=globalThis,L=B.ShadowRoot&&(B.ShadyCSS===void 0||B.ShadyCSS.nativeShadow)&&"adoptedStyleSheets"in Document.prototype&&"replace"in CSSStyleSheet.prototype,K=Symbol(),ht=new WeakMap,D=class{constructor(t,s,o){if(this._$cssResult$=!0,o!==K)throw Error("CSSResult is not constructable. Use `unsafeCSS` or `css` instead.");this.cssText=t,this.t=s}get styleSheet(){let t=this.o,s=this.t;if(L&&t===void 0){let o=s!==void 0&&s.length===1;o&&(t=ht.get(s)),t===void 0&&((this.o=t=new CSSStyleSheet).replaceSync(this.cssText),o&&ht.set(s,t))}return t}toString(){return this.cssText}},lt=e=>new D(typeof e=="string"?e:e+"",void 0,K),Y=(e,...t)=>{let s=e.length===1?e[0]:t.reduce((o,r,i)=>o+(n=>{if(n._$cssResult$===!0)return n.cssText;if(typeof n=="number")return n;throw Error("Value passed to 'css' function must be a 'css' function result: "+n+". Use 'unsafeCSS' to pass non-literal values, but take care to ensure page security.")})(r)+e[i+1],e[0]);return new D(s,e,K)},Z=(e,t)=>{if(L)e.adoptedStyleSheets=t.map(s=>s instanceof CSSStyleSheet?s:s.styleSheet);else for(let s of t){let o=document.createElement("style"),r=B.litNonce;r!==void 0&&o.setAttribute("nonce",r),o.textContent=s.cssText,e.appendChild(o)}},H=L?e=>e:e=>e instanceof CSSStyleSheet?(t=>{let s="";for(let o of t.cssRules)s+=o.cssText;return lt(s)})(e):e;var{is:Bt,defineProperty:Lt,getOwnPropertyDescriptor:Ht,getOwnPropertyNames:jt,getOwnPropertySymbols:zt,getPrototypeOf:Wt}=Object,j=globalThis,ct=j.trustedTypes,Gt=ct?ct.emptyScript:"",Vt=j.reactiveElementPolyfillSupport,O=(e,t)=>e,M={toAttribute(e,t){switch(t){case Boolean:e=e?Gt:null;break;case Object:case Array:e=e==null?e:JSON.stringify(e)}return e},fromAttribute(e,t){let s=e;switch(t){case Boolean:s=e!==null;break;case Number:s=e===null?null:Number(e);break;case Object:case Array:try{s=JSON.parse(e)}catch{s=null}}return s}},z=(e,t)=>!Bt(e,t),pt={attribute:!0,type:String,converter:M,reflect:!1,hasChanged:z};Symbol.metadata??=Symbol("metadata"),j.litPropertyMetadata??=new WeakMap;var _=class extends HTMLElement{static addInitializer(t){this._$Ei(),(this.l??=[]).push(t)}static get observedAttributes(){return this.finalize(),this._$Eh&&[...this._$Eh.keys()]}static createProperty(t,s=pt){if(s.state&&(s.attribute=!1),this._$Ei(),this.elementProperties.set(t,s),!s.noAccessor){let o=Symbol(),r=this.getPropertyDescriptor(t,o,s);r!==void 0&&Lt(this.prototype,t,r)}}static getPropertyDescriptor(t,s,o){let{get:r,set:i}=Ht(this.prototype,t)??{get(){return this[s]},set(n){this[s]=n}};return{get(){return r?.call(this)},set(n){let d=r?.call(this);i.call(this,n),this.requestUpdate(t,d,o)},configurable:!0,enumerable:!0}}static getPropertyOptions(t){return this.elementProperties.get(t)??pt}static _$Ei(){if(this.hasOwnProperty(O("elementProperties")))return;let t=Wt(this);t.finalize(),t.l!==void 0&&(this.l=[...t.l]),this.elementProperties=new Map(t.elementProperties)}static finalize(){if(this.hasOwnProperty(O("finalized")))return;if(this.finalized=!0,this._$Ei(),this.hasOwnProperty(O("properties"))){let s=this.properties,o=[...jt(s),...zt(s)];for(let r of o)this.createProperty(r,s[r])}let t=this[Symbol.metadata];if(t!==null){let s=litPropertyMetadata.get(t);if(s!==void 0)for(let[o,r]of s)this.elementProperties.set(o,r)}this._$Eh=new Map;for(let[s,o]of this.elementProperties){let r=this._$Eu(s,o);r!==void 0&&this._$Eh.set(r,s)}this.elementStyles=this.finalizeStyles(this.styles)}static finalizeStyles(t){let s=[];if(Array.isArray(t)){let o=new Set(t.flat(1/0).reverse());for(let r of o)s.unshift(H(r))}else t!==void 0&&s.push(H(t));return s}static _$Eu(t,s){let o=s.attribute;return o===!1?void 0:typeof o=="string"?o:typeof t=="string"?t.toLowerCase():void 0}constructor(){super(),this._$Ep=void 0,this.isUpdatePending=!1,this.hasUpdated=!1,this._$Em=null,this._$Ev()}_$Ev(){this._$Eg=new Promise(t=>this.enableUpdating=t),this._$AL=new Map,this._$E_(),this.requestUpdate(),this.constructor.l?.forEach(t=>t(this))}addController(t){(this._$ES??=[]).push(t),this.renderRoot!==void 0&&this.isConnected&&t.hostConnected?.()}removeController(t){this._$ES?.splice(this._$ES.indexOf(t)>>>0,1)}_$E_(){let t=new Map,s=this.constructor.elementProperties;for(let o of s.keys())this.hasOwnProperty(o)&&(t.set(o,this[o]),delete this[o]);t.size>0&&(this._$Ep=t)}createRenderRoot(){let t=this.shadowRoot??this.attachShadow(this.constructor.shadowRootOptions);return Z(t,this.constructor.elementStyles),t}connectedCallback(){this.renderRoot??=this.createRenderRoot(),this.enableUpdating(!0),this._$ES?.forEach(t=>t.hostConnected?.())}enableUpdating(t){}disconnectedCallback(){this._$ES?.forEach(t=>t.hostDisconnected?.())}attributeChangedCallback(t,s,o){this._$AK(t,o)}_$EO(t,s){let o=this.constructor.elementProperties.get(t),r=this.constructor._$Eu(t,o);if(r!==void 0&&o.reflect===!0){let i=(o.converter?.toAttribute!==void 0?o.converter:M).toAttribute(s,o.type);this._$Em=t,i==null?this.removeAttribute(r):this.setAttribute(r,i),this._$Em=null}}_$AK(t,s){let o=this.constructor,r=o._$Eh.get(t);if(r!==void 0&&this._$Em!==r){let i=o.getPropertyOptions(r),n=typeof i.converter=="function"?{fromAttribute:i.converter}:i.converter?.fromAttribute!==void 0?i.converter:M;this._$Em=r,this[r]=n.fromAttribute(s,i.type),this._$Em=null}}requestUpdate(t,s,o,r=!1,i){if(t!==void 0){if(o??=this.constructor.getPropertyOptions(t),!(o.hasChanged??z)(r?i:this[t],s))return;this.C(t,s,o)}this.isUpdatePending===!1&&(this._$Eg=this._$EP())}C(t,s,o){this._$AL.has(t)||this._$AL.set(t,s),o.reflect===!0&&this._$Em!==t&&(this._$Ej??=new Set).add(t)}async _$EP(){this.isUpdatePending=!0;try{await this._$Eg}catch(s){Promise.reject(s)}let t=this.scheduleUpdate();return t!=null&&await t,!this.isUpdatePending}scheduleUpdate(){return this.performUpdate()}performUpdate(){if(!this.isUpdatePending)return;if(!this.hasUpdated){if(this._$Ep){for(let[r,i]of this._$Ep)this[r]=i;this._$Ep=void 0}let o=this.constructor.elementProperties;if(o.size>0)for(let[r,i]of o)i.wrapped!==!0||this._$AL.has(r)||this[r]===void 0||this.C(r,this[r],i)}let t=!1,s=this._$AL;try{t=this.shouldUpdate(s),t?(this.willUpdate(s),this._$ES?.forEach(o=>o.hostUpdate?.()),this.update(s)):this._$ET()}catch(o){throw t=!1,this._$ET(),o}t&&this._$AE(s)}willUpdate(t){}_$AE(t){this._$ES?.forEach(s=>s.hostUpdated?.()),this.hasUpdated||(this.hasUpdated=!0,this.firstUpdated(t)),this.updated(t)}_$ET(){this._$AL=new Map,this.isUpdatePending=!1}get updateComplete(){return this.getUpdateComplete()}getUpdateComplete(){return this._$Eg}shouldUpdate(t){return!0}update(t){this._$Ej&&=this._$Ej.forEach(s=>this._$EO(s,this[s])),this._$ET()}updated(t){}firstUpdated(t){}};_.elementStyles=[],_.shadowRootOptions={mode:"open"},_[O("elementProperties")]=new Map,_[O("finalized")]=new Map,Vt?.({ReactiveElement:_}),(j.reactiveElementVersions??=[]).push("2.0.1");var ot=globalThis,W=ot.trustedTypes,ut=W?W.createPolicy("lit-html",{createHTML:e=>e}):void 0,$t="$lit$",$=`lit$${(Math.random()+"").slice(9)}$`,yt="?"+$,Ft=`<${yt}>`,T=document,R=()=>T.createComment(""),I=e=>e===null||typeof e!="object"&&typeof e!="function",At=Array.isArray,Kt=e=>At(e)||typeof e?.[Symbol.iterator]=="function",J=`[ 	
\f\r]`,P=/<(?:(!--|\/[^a-zA-Z])|(\/?[a-zA-Z][^>\s]*)|(\/?$))/g,ft=/-->/g,mt=/>/g,A=RegExp(`>|${J}(?:([^\\s"'>=/]+)(${J}*=${J}*(?:[^ 	
\f\r"'\`<>=]|("|')|))|$)`,"g"),gt=/'/g,_t=/"/g,St=/^(?:script|style|textarea|title)$/i,Tt=e=>(t,...s)=>({_$litType$:e,strings:t,values:s}),rt=Tt(1),ce=Tt(2),v=Symbol.for("lit-noChange"),p=Symbol.for("lit-nothing"),bt=new WeakMap,S=T.createTreeWalker(T,129);function vt(e,t){if(!Array.isArray(e)||!e.hasOwnProperty("raw"))throw Error("invalid template strings array");return ut!==void 0?ut.createHTML(t):t}var Yt=(e,t)=>{let s=e.length-1,o=[],r,i=t===2?"<svg>":"",n=P;for(let d=0;d<s;d++){let a=e[d],h,c,l=-1,g=0;for(;g<a.length&&(n.lastIndex=g,c=n.exec(a),c!==null);)g=n.lastIndex,n===P?c[1]==="!--"?n=ft:c[1]!==void 0?n=mt:c[2]!==void 0?(St.test(c[2])&&(r=RegExp("</"+c[2],"g")),n=A):c[3]!==void 0&&(n=A):n===A?c[0]===">"?(n=r??P,l=-1):c[1]===void 0?l=-2:(l=n.lastIndex-c[2].length,h=c[1],n=c[3]===void 0?A:c[3]==='"'?_t:gt):n===_t||n===gt?n=A:n===ft||n===mt?n=P:(n=A,r=void 0);let b=n===A&&e[d+1].startsWith("/>")?" ":"";i+=n===P?a+Ft:l>=0?(o.push(h),a.slice(0,l)+$t+a.slice(l)+$+b):a+$+(l===-2?d:b)}return[vt(e,i+(e[s]||"<?>")+(t===2?"</svg>":"")),o]},N=class e{constructor({strings:t,_$litType$:s},o){let r;this.parts=[];let i=0,n=0,d=t.length-1,a=this.parts,[h,c]=Yt(t,s);if(this.el=e.createElement(h,o),S.currentNode=this.el.content,s===2){let l=this.el.content.firstChild;l.replaceWith(...l.childNodes)}for(;(r=S.nextNode())!==null&&a.length<d;){if(r.nodeType===1){if(r.hasAttributes())for(let l of r.getAttributeNames())if(l.endsWith($t)){let g=c[n++],b=r.getAttribute(l).split($),k=/([.?@])?(.*)/.exec(g);a.push({type:1,index:i,name:k[2],strings:b,ctor:k[1]==="."?X:k[1]==="?"?tt:k[1]==="@"?et:C}),r.removeAttribute(l)}else l.startsWith($)&&(a.push({type:6,index:i}),r.removeAttribute(l));if(St.test(r.tagName)){let l=r.textContent.split($),g=l.length-1;if(g>0){r.textContent=W?W.emptyScript:"";for(let b=0;b<g;b++)r.append(l[b],R()),S.nextNode(),a.push({type:2,index:++i});r.append(l[g],R())}}}else if(r.nodeType===8)if(r.data===yt)a.push({type:2,index:i});else{let l=-1;for(;(l=r.data.indexOf($,l+1))!==-1;)a.push({type:7,index:i}),l+=$.length-1}i++}}static createElement(t,s){let o=T.createElement("template");return o.innerHTML=t,o}};function E(e,t,s=e,o){if(t===v)return t;let r=o!==void 0?s._$Co?.[o]:s._$Cl,i=I(t)?void 0:t._$litDirective$;return r?.constructor!==i&&(r?._$AO?.(!1),i===void 0?r=void 0:(r=new i(e),r._$AT(e,s,o)),o!==void 0?(s._$Co??=[])[o]=r:s._$Cl=r),r!==void 0&&(t=E(e,r._$AS(e,t.values),r,o)),t}var Q=class{constructor(t,s){this._$AV=[],this._$AN=void 0,this._$AD=t,this._$AM=s}get parentNode(){return this._$AM.parentNode}get _$AU(){return this._$AM._$AU}u(t){let{el:{content:s},parts:o}=this._$AD,r=(t?.creationScope??T).importNode(s,!0);S.currentNode=r;let i=S.nextNode(),n=0,d=0,a=o[0];for(;a!==void 0;){if(n===a.index){let h;a.type===2?h=new U(i,i.nextSibling,this,t):a.type===1?h=new a.ctor(i,a.name,a.strings,this,t):a.type===6&&(h=new st(i,this,t)),this._$AV.push(h),a=o[++d]}n!==a?.index&&(i=S.nextNode(),n++)}return S.currentNode=T,r}p(t){let s=0;for(let o of this._$AV)o!==void 0&&(o.strings!==void 0?(o._$AI(t,o,s),s+=o.strings.length-2):o._$AI(t[s])),s++}},U=class e{get _$AU(){return this._$AM?._$AU??this._$Cv}constructor(t,s,o,r){this.type=2,this._$AH=p,this._$AN=void 0,this._$AA=t,this._$AB=s,this._$AM=o,this.options=r,this._$Cv=r?.isConnected??!0}get parentNode(){let t=this._$AA.parentNode,s=this._$AM;return s!==void 0&&t?.nodeType===11&&(t=s.parentNode),t}get startNode(){return this._$AA}get endNode(){return this._$AB}_$AI(t,s=this){t=E(this,t,s),I(t)?t===p||t==null||t===""?(this._$AH!==p&&this._$AR(),this._$AH=p):t!==this._$AH&&t!==v&&this._(t):t._$litType$!==void 0?this.g(t):t.nodeType!==void 0?this.$(t):Kt(t)?this.T(t):this._(t)}k(t){return this._$AA.parentNode.insertBefore(t,this._$AB)}$(t){this._$AH!==t&&(this._$AR(),this._$AH=this.k(t))}_(t){this._$AH!==p&&I(this._$AH)?this._$AA.nextSibling.data=t:this.$(T.createTextNode(t)),this._$AH=t}g(t){let{values:s,_$litType$:o}=t,r=typeof o=="number"?this._$AC(t):(o.el===void 0&&(o.el=N.createElement(vt(o.h,o.h[0]),this.options)),o);if(this._$AH?._$AD===r)this._$AH.p(s);else{let i=new Q(r,this),n=i.u(this.options);i.p(s),this.$(n),this._$AH=i}}_$AC(t){let s=bt.get(t.strings);return s===void 0&&bt.set(t.strings,s=new N(t)),s}T(t){At(this._$AH)||(this._$AH=[],this._$AR());let s=this._$AH,o,r=0;for(let i of t)r===s.length?s.push(o=new e(this.k(R()),this.k(R()),this,this.options)):o=s[r],o._$AI(i),r++;r<s.length&&(this._$AR(o&&o._$AB.nextSibling,r),s.length=r)}_$AR(t=this._$AA.nextSibling,s){for(this._$AP?.(!1,!0,s);t&&t!==this._$AB;){let o=t.nextSibling;t.remove(),t=o}}setConnected(t){this._$AM===void 0&&(this._$Cv=t,this._$AP?.(t))}},C=class{get tagName(){return this.element.tagName}get _$AU(){return this._$AM._$AU}constructor(t,s,o,r,i){this.type=1,this._$AH=p,this._$AN=void 0,this.element=t,this.name=s,this._$AM=r,this.options=i,o.length>2||o[0]!==""||o[1]!==""?(this._$AH=Array(o.length-1).fill(new String),this.strings=o):this._$AH=p}_$AI(t,s=this,o,r){let i=this.strings,n=!1;if(i===void 0)t=E(this,t,s,0),n=!I(t)||t!==this._$AH&&t!==v,n&&(this._$AH=t);else{let d=t,a,h;for(t=i[0],a=0;a<i.length-1;a++)h=E(this,d[o+a],s,a),h===v&&(h=this._$AH[a]),n||=!I(h)||h!==this._$AH[a],h===p?t=p:t!==p&&(t+=(h??"")+i[a+1]),this._$AH[a]=h}n&&!r&&this.j(t)}j(t){t===p?this.element.removeAttribute(this.name):this.element.setAttribute(this.name,t??"")}},X=class extends C{constructor(){super(...arguments),this.type=3}j(t){this.element[this.name]=t===p?void 0:t}},tt=class extends C{constructor(){super(...arguments),this.type=4}j(t){this.element.toggleAttribute(this.name,!!t&&t!==p)}},et=class extends C{constructor(t,s,o,r,i){super(t,s,o,r,i),this.type=5}_$AI(t,s=this){if((t=E(this,t,s,0)??p)===v)return;let o=this._$AH,r=t===p&&o!==p||t.capture!==o.capture||t.once!==o.once||t.passive!==o.passive,i=t!==p&&(o===p||r);r&&this.element.removeEventListener(this.name,this,o),i&&this.element.addEventListener(this.name,this,t),this._$AH=t}handleEvent(t){typeof this._$AH=="function"?this._$AH.call(this.options?.host??this.element,t):this._$AH.handleEvent(t)}},st=class{constructor(t,s,o){this.element=t,this.type=6,this._$AN=void 0,this._$AM=s,this.options=o}get _$AU(){return this._$AM._$AU}_$AI(t){E(this,t)}};var Zt=ot.litHtmlPolyfillSupport;Zt?.(N,U),(ot.litHtmlVersions??=[]).push("3.0.1");var Et=(e,t,s)=>{let o=s?.renderBefore??t,r=o._$litPart$;if(r===void 0){let i=s?.renderBefore??null;o._$litPart$=r=new U(t.insertBefore(R(),i),i,void 0,s??{})}return r._$AI(e),r};var y=class extends _{constructor(){super(...arguments),this.renderOptions={host:this},this._$Do=void 0}createRenderRoot(){let t=super.createRenderRoot();return this.renderOptions.renderBefore??=t.firstChild,t}update(t){let s=this.render();this.hasUpdated||(this.renderOptions.isConnected=this.isConnected),super.update(t),this._$Do=Et(s,this.renderRoot,this.renderOptions)}connectedCallback(){super.connectedCallback(),this._$Do?.setConnected(!0)}disconnectedCallback(){super.disconnectedCallback(),this._$Do?.setConnected(!1)}render(){return v}};y._$litElement$=!0,y["finalized"]=!0,globalThis.litElementHydrateSupport?.({LitElement:y});var Jt=globalThis.litElementPolyfillSupport;Jt?.({LitElement:y});(globalThis.litElementVersions??=[]).push("4.0.1");var Ct=e=>(t,s)=>{s!==void 0?s.addInitializer(()=>{customElements.define(e,t)}):customElements.define(e,t)};var Qt={attribute:!0,type:String,converter:M,reflect:!1,hasChanged:z},Xt=(e=Qt,t,s)=>{let{kind:o,metadata:r}=s,i=globalThis.litPropertyMetadata.get(r);if(i===void 0&&globalThis.litPropertyMetadata.set(r,i=new Map),i.set(s.name,e),o==="accessor"){let{name:n}=s;return{set(d){let a=t.get.call(this);t.set.call(this,d),this.requestUpdate(n,a,e)},init(d){return d!==void 0&&this.C(n,void 0,e),d}}}if(o==="setter"){let{name:n}=s;return function(d){let a=this[n];t.call(this,d),this.requestUpdate(n,a,e)}}throw Error("Unsupported decorator location: "+o)};function xt(e){return(t,s)=>typeof s=="object"?Xt(e,t,s):((o,r,i)=>{let n=r.hasOwnProperty(i);return r.constructor.createProperty(i,n?{...o,wrapped:!0}:o),n?Object.getOwnPropertyDescriptor(r,i):void 0})(e,t,s)}function wt(e){return xt({...e,state:!0,attribute:!1})}var it=new Map,at=class{constructor(e,t){this.type="reqRep",this.settings={},this.name="",this.name=e,this.settings=t}async request(e){return u.Request(this.name,e,this.settings.broadcast)}reply(e){return u.Reply(this.name,e,this.settings.broadcast).dispose}dispose(){u.requestListeners.delete(this.name),it.delete(this.name)}static for(e,t){if(!t){let o=it.get(e);if(!o)throw Error("Can't find channel settings");return o}u.ConfigureChannel(e,t.broadcast||!1,t.cache||!1,t.trace||!1);let s=new at(e,t);return it.set(e,s),s}},Dt="broadcast-sync",te="browser-message-broker";function ee(e){return e.channelName===Dt}function se(e){return e.senderId!=null&&e.targetId==null}function oe(e){return e.senderId!=null&&e.targetId!=null}var x=Math.random().toString(36).substring(2,9);function re(e,t=1){let s;return(...o)=>{clearTimeout(s),s=setTimeout(()=>{e(...o)},t)}}var q=new Map,ie=class{constructor(){this.trace=!1,this.senderId=x,this.state=new Map,this.subscribers=new Map,this.braodcasts=new Set,this.__bcChannel=new BroadcastChannel(te),this.__nextMessageAwaters=new Map,this.broadcastedRequests=new Map,this.requestListeners=new Map,this.__bcChannel.onmessage=this.handleBroadcast.bind(this),this.__bcChannel.onmessageerror=this.handleBroadcastError.bind(this),setTimeout(()=>{this.__sendBrokerState(void 0,void 0)},0),this.sendBrokerState=re(this.__sendBrokerState.bind(this),2)}log(e,t,...s){(this.trace||q.get(t)?.trace)&&console.log(`[${globalThis.constructor.name}(${this.senderId})-${t}] ${e}`,s)}ConfigureChannel(e,t,s,o){q.set(e,{broadcast:t,cache:s,trace:o}),s&&this.state.set(e,void 0),t&&this.braodcasts.add(e)}handleBroadcastError(e){throw Error("BROADCAST FAILED: "+e.data)}__sendBrokerState(e,t){let s=Array.from(this.braodcasts.keys());t&&t.length>0&&(s=s.filter(n=>t.includes(n)));let o={};for(let n of this.state)!n[1]||!s.includes(n[0])||(o[n[0]]=n[1]);let r={id:x,availableState:o,broadcasts:s},i={channelName:Dt,senderCtx:globalThis.constructor.name,senderId:x,targetId:e,msg:r,channelType:"sync"};this.__bcChannel.postMessage(i),e==null?this.log("Broadcast sync requested","",{brokerState:r}):this.log("Broadcast sync responded","",{targetId:e,brokerState:r})}handleBroadcastSync(e){if(se(e))return this.sendBrokerState(e.senderId,e.msg.broadcasts);if(oe(e))for(let t of Object.entries(e.msg.availableState))this.braodcasts.has(t[0])&&this.state.has(t[0])&&this.state.get(t[0])==null&&this.__notifySubscribers(t[0],t[1],e.senderId),this.log("Broadcast sync responce handled","",e.msg)}handleBroadcast(e){if(this.log("Broadcast received",e.data.channelName,e.data),e.data.targetId!=null&&e.data.targetId!==x){this.log("Broadcast ignored (different targetId)",e.data.channelName);return}if(ee(e.data))return this.handleBroadcastSync(e.data);switch(e.data.channelType){case"pubSub":this.__notifySubscribers(e.data.channelName,e.data.msg,e.data.senderId);break;case"req":this.bridgeRequest(e.data.channelName,e.data.msg,e.data.senderId);break;case"rep":let t=this.broadcastedRequests.get(e.data.channelName);if(!t)return;t.resolve(e.data.msg),this.broadcastedRequests.delete(e.data.channelName);break}this.log("Broadcast handled",e.data.channelName,e.data)}__configureBroadcast(e){if(!e.channelName)throw new Error("Invalid subscription");this.braodcasts.add(e.channelName);let t=e.dispose;e.dispose=()=>{t(),this.braodcasts.delete(e.channelName)},e.isBroadcast=!0,this.sendBrokerState()}GetState(e){if(e)return this.state.get(e)}async Broadcast(e,t,s){this._broadcast(e,t,"pubSub",s)}async _broadcast(e,t,s,o){let r=q.get(e);this.log(`Message broadcasted (${s}) to ${o||"all brokers"}`,e,t);let i=await Promise.resolve(t),n={channelName:e,senderCtx:globalThis.constructor.name,senderId:x,targetId:o,msg:i,channelType:s};r?.cache&&this.state.set(e,t),this.__bcChannel.postMessage(n)}async Publish(e,t,s){this.log("Message published",e,t),await this.__notifySubscribers(e,t,x),this.braodcasts.has(e)&&this._broadcast(e,t,"pubSub",s)}async nextMessage(e){let t=this.__nextMessageAwaters.get(e);if(t)return t.promise;let s={promise:void 0,resolve:void 0};return s.promise=new Promise(o=>{s.resolve=o}),this.__nextMessageAwaters.set(e,s),s.promise}Subscribe(e,t,s=!1,o=!0){let r=q.get(e),i=!1;r&&(s=r.broadcast||!1,o=r.cache||!0);let n=this.subscribers.get(e)||[],d=t;n.push(d),this.subscribers.set(e,n);let a={channelName:e,isCached:!1,dispose:()=>{let h=this.subscribers.get(e);if(h==null)return;let c=h.indexOf(d);c!==-1&&h.splice(c,1)},publish:(h,c)=>this.Publish(e,h,c),isDisposed:!1};return s&&this.__configureBroadcast(a),o&&this.state.set(e,void 0),a}bridgeRequest(e,t,s){let o=this.requestListeners.get(e);return o?o.handler(t,s):Promise.resolve(void 0)}Request(e,t,s=!1,o){if(s){this._broadcast(e,t,"req",o);let r=this.broadcastedRequests.get(e);r&&r.resolve(void 0);let i,n={promise:new Promise(d=>i=d),resolve:i};return this.broadcastedRequests.set(e,n),n.promise}else{let r=this.requestListeners.get(e);return r?r.handler(t):Promise.resolve(void 0)}}Reply(e,t,s=!1){if(s){let n=t;t=(d,a)=>this._broadcast(e,n(d),"rep",a)}let o=this.requestListeners,r={channelName:e,get isDisposed(){return o.has(e)},isBroadcast:s,handler:t,dispose:void 0};r.dispose=()=>{r.isDisposed=!0,this.requestListeners.get(e)===r&&this.requestListeners.delete(e)};let i=this.requestListeners.get(e);return i&&(i.isDisposed=!0,console.warn("Request listener has been replaced: "+e)),this.requestListeners.set(e,r),r}async __notifySubscribers(e,t,s){let o=this.subscribers.get(e)||[],r=[];for(let i of o)!i||(r.push(Promise.resolve(i(t,s))),this.log("Handler called",e,i));await Promise.all(r),q.get(e)?.cache&&this.state.set(e,t),this.__handleAwaiter(e,t),this.log("Message handled",e,t,this)}__handleAwaiter(e,t){let s=this.__nextMessageAwaters.get(e);!s||(s.resolve(t),this.__nextMessageAwaters.delete(e))}};globalThis.BrowserMessageBroker=globalThis.BrowserMessageBroker||new ie;var u=globalThis.BrowserMessageBroker,nt=new Map,f=class{constructor(e,t){this.type="pubSub",this.dispose=()=>{u.subscribers.delete(this.name),nt.delete(this.name)},this.name="",this.settings={},this.name=e,this.settings=t}static for(e,t){if(!t){let o=nt.get(e);if(!o)throw Error("Can't find channel settings");return o}u.ConfigureChannel(e,t.broadcast||!1,t.cache||!1,t.trace||!1);let s=new f(e,t);return nt.set(e,s),s}async send(e,t){u.Publish(this.name,e,t)}static async publish(e,t,s){u.Publish(e,t,s)}static async broadcast(e,t,s){u.Broadcast(e,t,s)}subscribe(e){return u.Subscribe(this.name,e,this.settings.broadcast,this.settings.cache).dispose}getState(){return u.GetState(this.name)}static GetState(e){return u.GetState(e)}nextMessage(){return u.nextMessage(this.name)}static nextMessage(e){return u.nextMessage(e)}};var m={ADD_TODO:"addTodo",TODO_ADDED:"todoAdded",TODO_ERR:"todoErr",MODIFY_TODO:"modifyTodo",COMPLETE_TODO:"completeTodo",TODO_MODIFIED:"todoModified",DEL_TODO:"delTodo",TODO_DELETED:"todoDeleted",GET_ALL_TODOS:"getAllTodos",TODO_SELECTED:"todoSelected",CHECK_DATA_SOURCE:"checkDataSource",DATA_SOURCE_READY:"dataSourceReady"},Ot=f.for(m.TODO_ADDED,{broadcast:!0,cache:!1}),ss=f.for(m.TODO_ERR,{broadcast:!0,cache:!1}),Mt=f.for(m.TODO_DELETED,{broadcast:!0,cache:!1}),Pt=f.for(m.TODO_MODIFIED,{broadcast:!0,cache:!1}),dt=f.for(m.DATA_SOURCE_READY,{broadcast:!0,cache:!0}),os=f.for(m.ADD_TODO,{broadcast:!0,cache:!1}),Rt=f.for(m.COMPLETE_TODO,{broadcast:!0,cache:!1}),It=f.for(m.DEL_TODO,{broadcast:!0,cache:!1}),rs=f.for(m.MODIFY_TODO,{broadcast:!0,cache:!1}),Nt=at.for(m.GET_ALL_TODOS,{broadcast:!0}),Ut=f.for(m.TODO_SELECTED,{broadcast:!0,cache:!0});var V=class{constructor(t){this.host=t,t.addController(this),this.disposeTodoAdded=Ot.subscribe(this.onTodoAdded.bind(this)),this.disposeTodoModified=Pt.subscribe(this.onTodoModified.bind(this)),this.disposeTodoDeleted=Mt.subscribe(this.onTodoDeleted.bind(this))}onTodoAdded(t){this.host.allTodos.push(t),this.host.requestUpdate()}onTodoDeleted(t){let s=this.__findTodoIndex(t);s!==-1&&(this.host.allTodos.splice(s,1),this.host.requestUpdate())}__findTodoIndex(t){return this.host.allTodos?this.host.allTodos.findIndex(s=>s.id===t.id):-1}onTodoModified(t){let s=this.__findTodoIndex(t);s!==-1&&(this.host.allTodos[s]=t,this.host.requestUpdate())}completeTodo(t){Rt.send(t)}deleteTodo(t){It.send(t)}selectTodo(t){Ut.send(t)}async hostConnected(){dt.getState()||await dt.nextMessage();let s=await Nt.request();this.host.allTodos=s||[]}hostDisconnected(){this.disposeTodoAdded(),this.disposeTodoModified(),this.disposeTodoDeleted()}};var w=class extends y{constructor(){super(...arguments);this.allTodos=[];this.controller=new V(this)}render(){return rt`<div>TO DO:</div>
      <ul>
        ${this.allTodos.map(s=>rt`
            <li ?data-isDone=${s.isDone}>
              <button
                @click=${()=>this.controller.completeTodo(s)}
                class="check"
              >
                ✔
              </button>
              <span
                @click=${()=>this.controller.selectTodo(s)}
                class="text"
                >${s.text}</span
              >
              <button
                @click=${()=>this.controller.deleteTodo(s)}
                class="delete"
              >
                ❌
              </button>
            </li>
          `)}
      </ul>`}};w.styles=Y`
    button {
      padding: 5px;
    }

    li[data-isDone] > .check {
      display: none;
    }

    li[data-isDone] > .check {
      display: none;
    }
    li[data-isDone] > .text {
      text-decoration: line-through;
    }

    .text {
      cursor: pointer;
    }
  `,F([wt()],w.prototype,"allTodos",2),w=F([Ct("todo-list")],w);})();
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
//# sourceMappingURL=todoList.js.map
