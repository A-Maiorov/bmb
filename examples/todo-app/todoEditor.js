(()=>{var Me=Object.defineProperty;var Oe=Object.getOwnPropertyDescriptor;var q=(s,e,t,i)=>{for(var r=i>1?void 0:i?Oe(e,t):e,o=s.length-1,n;o>=0;o--)(n=s[o])&&(r=(i?n(e,t,r):n(r))||r);return i&&r&&Me(e,t,r),r};var L=window.ShadowRoot&&(window.ShadyCSS===void 0||window.ShadyCSS.nativeShadow)&&"adoptedStyleSheets"in Document.prototype&&"replace"in CSSStyleSheet.prototype,j=Symbol(),ne=new Map,D=class{constructor(e,t){if(this._$cssResult$=!0,t!==j)throw Error("CSSResult is not constructable. Use `unsafeCSS` or `css` instead.");this.cssText=e}get styleSheet(){let e=ne.get(this.cssText);return L&&e===void 0&&(ne.set(this.cssText,e=new CSSStyleSheet),e.replaceSync(this.cssText)),e}toString(){return this.cssText}},ae=s=>new D(typeof s=="string"?s:s+"",j),G=(s,...e)=>{let t=s.length===1?s[0]:e.reduce((i,r,o)=>i+(n=>{if(n._$cssResult$===!0)return n.cssText;if(typeof n=="number")return n;throw Error("Value passed to 'css' function must be a 'css' function result: "+n+". Use 'unsafeCSS' to pass non-literal values, but take care to ensure page security.")})(r)+s[o+1],s[0]);return new D(t,j)},K=(s,e)=>{L?s.adoptedStyleSheets=e.map(t=>t instanceof CSSStyleSheet?t:t.styleSheet):e.forEach(t=>{let i=document.createElement("style"),r=window.litNonce;r!==void 0&&i.setAttribute("nonce",r),i.textContent=t.cssText,s.appendChild(i)})},H=L?s=>s:s=>s instanceof CSSStyleSheet?(e=>{let t="";for(let i of e.cssRules)t+=i.cssText;return ae(t)})(s):s;var V,le=window.trustedTypes,Pe=le?le.emptyScript:"",de=window.reactiveElementPolyfillSupport,W={toAttribute(s,e){switch(e){case Boolean:s=s?Pe:null;break;case Object:case Array:s=s==null?s:JSON.stringify(s)}return s},fromAttribute(s,e){let t=s;switch(e){case Boolean:t=s!==null;break;case Number:t=s===null?null:Number(s);break;case Object:case Array:try{t=JSON.parse(s)}catch{t=null}}return t}},he=(s,e)=>e!==s&&(e==e||s==s),F={attribute:!0,type:String,converter:W,reflect:!1,hasChanged:he},v=class extends HTMLElement{constructor(){super(),this._$Et=new Map,this.isUpdatePending=!1,this.hasUpdated=!1,this._$Ei=null,this.o()}static addInitializer(e){var t;(t=this.l)!==null&&t!==void 0||(this.l=[]),this.l.push(e)}static get observedAttributes(){this.finalize();let e=[];return this.elementProperties.forEach((t,i)=>{let r=this._$Eh(i,t);r!==void 0&&(this._$Eu.set(r,i),e.push(r))}),e}static createProperty(e,t=F){if(t.state&&(t.attribute=!1),this.finalize(),this.elementProperties.set(e,t),!t.noAccessor&&!this.prototype.hasOwnProperty(e)){let i=typeof e=="symbol"?Symbol():"__"+e,r=this.getPropertyDescriptor(e,i,t);r!==void 0&&Object.defineProperty(this.prototype,e,r)}}static getPropertyDescriptor(e,t,i){return{get(){return this[t]},set(r){let o=this[e];this[t]=r,this.requestUpdate(e,o,i)},configurable:!0,enumerable:!0}}static getPropertyOptions(e){return this.elementProperties.get(e)||F}static finalize(){if(this.hasOwnProperty("finalized"))return!1;this.finalized=!0;let e=Object.getPrototypeOf(this);if(e.finalize(),this.elementProperties=new Map(e.elementProperties),this._$Eu=new Map,this.hasOwnProperty("properties")){let t=this.properties,i=[...Object.getOwnPropertyNames(t),...Object.getOwnPropertySymbols(t)];for(let r of i)this.createProperty(r,t[r])}return this.elementStyles=this.finalizeStyles(this.styles),!0}static finalizeStyles(e){let t=[];if(Array.isArray(e)){let i=new Set(e.flat(1/0).reverse());for(let r of i)t.unshift(H(r))}else e!==void 0&&t.push(H(e));return t}static _$Eh(e,t){let i=t.attribute;return i===!1?void 0:typeof i=="string"?i:typeof e=="string"?e.toLowerCase():void 0}o(){var e;this._$Ep=new Promise(t=>this.enableUpdating=t),this._$AL=new Map,this._$Em(),this.requestUpdate(),(e=this.constructor.l)===null||e===void 0||e.forEach(t=>t(this))}addController(e){var t,i;((t=this._$Eg)!==null&&t!==void 0?t:this._$Eg=[]).push(e),this.renderRoot!==void 0&&this.isConnected&&((i=e.hostConnected)===null||i===void 0||i.call(e))}removeController(e){var t;(t=this._$Eg)===null||t===void 0||t.splice(this._$Eg.indexOf(e)>>>0,1)}_$Em(){this.constructor.elementProperties.forEach((e,t)=>{this.hasOwnProperty(t)&&(this._$Et.set(t,this[t]),delete this[t])})}createRenderRoot(){var e;let t=(e=this.shadowRoot)!==null&&e!==void 0?e:this.attachShadow(this.constructor.shadowRootOptions);return K(t,this.constructor.elementStyles),t}connectedCallback(){var e;this.renderRoot===void 0&&(this.renderRoot=this.createRenderRoot()),this.enableUpdating(!0),(e=this._$Eg)===null||e===void 0||e.forEach(t=>{var i;return(i=t.hostConnected)===null||i===void 0?void 0:i.call(t)})}enableUpdating(e){}disconnectedCallback(){var e;(e=this._$Eg)===null||e===void 0||e.forEach(t=>{var i;return(i=t.hostDisconnected)===null||i===void 0?void 0:i.call(t)})}attributeChangedCallback(e,t,i){this._$AK(e,i)}_$ES(e,t,i=F){var r,o;let n=this.constructor._$Eh(e,i);if(n!==void 0&&i.reflect===!0){let d=((o=(r=i.converter)===null||r===void 0?void 0:r.toAttribute)!==null&&o!==void 0?o:W.toAttribute)(t,i.type);this._$Ei=e,d==null?this.removeAttribute(n):this.setAttribute(n,d),this._$Ei=null}}_$AK(e,t){var i,r,o;let n=this.constructor,d=n._$Eu.get(e);if(d!==void 0&&this._$Ei!==d){let a=n.getPropertyOptions(d),l=a.converter,p=(o=(r=(i=l)===null||i===void 0?void 0:i.fromAttribute)!==null&&r!==void 0?r:typeof l=="function"?l:null)!==null&&o!==void 0?o:W.fromAttribute;this._$Ei=d,this[d]=p(t,a.type),this._$Ei=null}}requestUpdate(e,t,i){let r=!0;e!==void 0&&(((i=i||this.constructor.getPropertyOptions(e)).hasChanged||he)(this[e],t)?(this._$AL.has(e)||this._$AL.set(e,t),i.reflect===!0&&this._$Ei!==e&&(this._$EC===void 0&&(this._$EC=new Map),this._$EC.set(e,i))):r=!1),!this.isUpdatePending&&r&&(this._$Ep=this._$E_())}async _$E_(){this.isUpdatePending=!0;try{await this._$Ep}catch(t){Promise.reject(t)}let e=this.scheduleUpdate();return e!=null&&await e,!this.isUpdatePending}scheduleUpdate(){return this.performUpdate()}performUpdate(){var e;if(!this.isUpdatePending)return;this.hasUpdated,this._$Et&&(this._$Et.forEach((r,o)=>this[o]=r),this._$Et=void 0);let t=!1,i=this._$AL;try{t=this.shouldUpdate(i),t?(this.willUpdate(i),(e=this._$Eg)===null||e===void 0||e.forEach(r=>{var o;return(o=r.hostUpdate)===null||o===void 0?void 0:o.call(r)}),this.update(i)):this._$EU()}catch(r){throw t=!1,this._$EU(),r}t&&this._$AE(i)}willUpdate(e){}_$AE(e){var t;(t=this._$Eg)===null||t===void 0||t.forEach(i=>{var r;return(r=i.hostUpdated)===null||r===void 0?void 0:r.call(i)}),this.hasUpdated||(this.hasUpdated=!0,this.firstUpdated(e)),this.updated(e)}_$EU(){this._$AL=new Map,this.isUpdatePending=!1}get updateComplete(){return this.getUpdateComplete()}getUpdateComplete(){return this._$Ep}shouldUpdate(e){return!0}update(e){this._$EC!==void 0&&(this._$EC.forEach((t,i)=>this._$ES(i,this[i],t)),this._$EC=void 0),this._$EU()}updated(e){}firstUpdated(e){}};v.finalized=!0,v.elementProperties=new Map,v.elementStyles=[],v.shadowRootOptions={mode:"open"},de?.({ReactiveElement:v}),((V=globalThis.reactiveElementVersions)!==null&&V!==void 0?V:globalThis.reactiveElementVersions=[]).push("1.3.2");var Y,T=globalThis.trustedTypes,ce=T?T.createPolicy("lit-html",{createHTML:s=>s}):void 0,f=`lit$${(Math.random()+"").slice(9)}$`,_e="?"+f,De=`<${_e}>`,w=document,k=(s="")=>w.createComment(s),B=s=>s===null||typeof s!="object"&&typeof s!="function",be=Array.isArray,Re=s=>{var e;return be(s)||typeof((e=s)===null||e===void 0?void 0:e[Symbol.iterator])=="function"},R=/<(?:(!--|\/[^a-zA-Z])|(\/?[a-zA-Z][^>\s]*)|(\/?$))/g,ue=/-->/g,pe=/>/g,b=/>|[ 	\n\r](?:([^\s"'>=/]+)([ 	\n\r]*=[ 	\n\r]*(?:[^ 	\n\r"'`<>=]|("|')|))|$)/g,me=/'/g,ge=/"/g,ye=/^(?:script|style|textarea|title)$/i,$e=s=>(e,...t)=>({_$litType$:s,strings:e,values:t}),te=$e(1),We=$e(2),y=Symbol.for("lit-noChange"),u=Symbol.for("lit-nothing"),ve=new WeakMap,Ae=(s,e,t)=>{var i,r;let o=(i=t?.renderBefore)!==null&&i!==void 0?i:e,n=o._$litPart$;if(n===void 0){let d=(r=t?.renderBefore)!==null&&r!==void 0?r:null;o._$litPart$=n=new A(e.insertBefore(k(),d),d,void 0,t??{})}return n._$AI(s),n},C=w.createTreeWalker(w,129,null,!1),ke=(s,e)=>{let t=s.length-1,i=[],r,o=e===2?"<svg>":"",n=R;for(let a=0;a<t;a++){let l=s[a],p,h,c=-1,m=0;for(;m<l.length&&(n.lastIndex=m,h=n.exec(l),h!==null);)m=n.lastIndex,n===R?h[1]==="!--"?n=ue:h[1]!==void 0?n=pe:h[2]!==void 0?(ye.test(h[2])&&(r=RegExp("</"+h[2],"g")),n=b):h[3]!==void 0&&(n=b):n===b?h[0]===">"?(n=r??R,c=-1):h[1]===void 0?c=-2:(c=n.lastIndex-h[2].length,p=h[1],n=h[3]===void 0?b:h[3]==='"'?ge:me):n===ge||n===me?n=b:n===ue||n===pe?n=R:(n=b,r=void 0);let N=n===b&&s[a+1].startsWith("/>")?" ":"";o+=n===R?l+De:c>=0?(i.push(p),l.slice(0,c)+"$lit$"+l.slice(c)+f+N):l+f+(c===-2?(i.push(void 0),a):N)}let d=o+(s[t]||"<?>")+(e===2?"</svg>":"");if(!Array.isArray(s)||!s.hasOwnProperty("raw"))throw Error("invalid template strings array");return[ce!==void 0?ce.createHTML(d):d,i]},$=class{constructor({strings:e,_$litType$:t},i){let r;this.parts=[];let o=0,n=0,d=e.length-1,a=this.parts,[l,p]=ke(e,t);if(this.el=$.createElement(l,i),C.currentNode=this.el.content,t===2){let h=this.el.content,c=h.firstChild;c.remove(),h.append(...c.childNodes)}for(;(r=C.nextNode())!==null&&a.length<d;){if(r.nodeType===1){if(r.hasAttributes()){let h=[];for(let c of r.getAttributeNames())if(c.endsWith("$lit$")||c.startsWith(f)){let m=p[n++];if(h.push(c),m!==void 0){let N=r.getAttribute(m.toLowerCase()+"$lit$").split(f),U=/([.?@])?(.*)/.exec(m);a.push({type:1,index:o,name:U[2],strings:N,ctor:U[1]==="."?J:U[1]==="?"?Q:U[1]==="@"?X:M})}else a.push({type:6,index:o})}for(let c of h)r.removeAttribute(c)}if(ye.test(r.tagName)){let h=r.textContent.split(f),c=h.length-1;if(c>0){r.textContent=T?T.emptyScript:"";for(let m=0;m<c;m++)r.append(h[m],k()),C.nextNode(),a.push({type:2,index:++o});r.append(h[c],k())}}}else if(r.nodeType===8)if(r.data===_e)a.push({type:2,index:o});else{let h=-1;for(;(h=r.data.indexOf(f,h+1))!==-1;)a.push({type:7,index:o}),h+=f.length-1}o++}}static createElement(e,t){let i=w.createElement("template");return i.innerHTML=e,i}};function x(s,e,t=s,i){var r,o,n,d;if(e===y)return e;let a=i!==void 0?(r=t._$Cl)===null||r===void 0?void 0:r[i]:t._$Cu,l=B(e)?void 0:e._$litDirective$;return a?.constructor!==l&&((o=a?._$AO)===null||o===void 0||o.call(a,!1),l===void 0?a=void 0:(a=new l(s),a._$AT(s,t,i)),i!==void 0?((n=(d=t)._$Cl)!==null&&n!==void 0?n:d._$Cl=[])[i]=a:t._$Cu=a),a!==void 0&&(e=x(s,a._$AS(s,e.values),a,i)),e}var Z=class{constructor(e,t){this.v=[],this._$AN=void 0,this._$AD=e,this._$AM=t}get parentNode(){return this._$AM.parentNode}get _$AU(){return this._$AM._$AU}p(e){var t;let{el:{content:i},parts:r}=this._$AD,o=((t=e?.creationScope)!==null&&t!==void 0?t:w).importNode(i,!0);C.currentNode=o;let n=C.nextNode(),d=0,a=0,l=r[0];for(;l!==void 0;){if(d===l.index){let p;l.type===2?p=new A(n,n.nextSibling,this,e):l.type===1?p=new l.ctor(n,l.name,l.strings,this,e):l.type===6&&(p=new ee(n,this,e)),this.v.push(p),l=r[++a]}d!==l?.index&&(n=C.nextNode(),d++)}return o}m(e){let t=0;for(let i of this.v)i!==void 0&&(i.strings!==void 0?(i._$AI(e,i,t),t+=i.strings.length-2):i._$AI(e[t])),t++}},A=class{constructor(e,t,i,r){var o;this.type=2,this._$AH=u,this._$AN=void 0,this._$AA=e,this._$AB=t,this._$AM=i,this.options=r,this._$Cg=(o=r?.isConnected)===null||o===void 0||o}get _$AU(){var e,t;return(t=(e=this._$AM)===null||e===void 0?void 0:e._$AU)!==null&&t!==void 0?t:this._$Cg}get parentNode(){let e=this._$AA.parentNode,t=this._$AM;return t!==void 0&&e.nodeType===11&&(e=t.parentNode),e}get startNode(){return this._$AA}get endNode(){return this._$AB}_$AI(e,t=this){e=x(this,e,t),B(e)?e===u||e==null||e===""?(this._$AH!==u&&this._$AR(),this._$AH=u):e!==this._$AH&&e!==y&&this.$(e):e._$litType$!==void 0?this.T(e):e.nodeType!==void 0?this.k(e):Re(e)?this.S(e):this.$(e)}M(e,t=this._$AB){return this._$AA.parentNode.insertBefore(e,t)}k(e){this._$AH!==e&&(this._$AR(),this._$AH=this.M(e))}$(e){this._$AH!==u&&B(this._$AH)?this._$AA.nextSibling.data=e:this.k(w.createTextNode(e)),this._$AH=e}T(e){var t;let{values:i,_$litType$:r}=e,o=typeof r=="number"?this._$AC(e):(r.el===void 0&&(r.el=$.createElement(r.h,this.options)),r);if(((t=this._$AH)===null||t===void 0?void 0:t._$AD)===o)this._$AH.m(i);else{let n=new Z(o,this),d=n.p(this.options);n.m(i),this.k(d),this._$AH=n}}_$AC(e){let t=ve.get(e.strings);return t===void 0&&ve.set(e.strings,t=new $(e)),t}S(e){be(this._$AH)||(this._$AH=[],this._$AR());let t=this._$AH,i,r=0;for(let o of e)r===t.length?t.push(i=new A(this.M(k()),this.M(k()),this,this.options)):i=t[r],i._$AI(o),r++;r<t.length&&(this._$AR(i&&i._$AB.nextSibling,r),t.length=r)}_$AR(e=this._$AA.nextSibling,t){var i;for((i=this._$AP)===null||i===void 0||i.call(this,!1,!0,t);e&&e!==this._$AB;){let r=e.nextSibling;e.remove(),e=r}}setConnected(e){var t;this._$AM===void 0&&(this._$Cg=e,(t=this._$AP)===null||t===void 0||t.call(this,e))}},M=class{constructor(e,t,i,r,o){this.type=1,this._$AH=u,this._$AN=void 0,this.element=e,this.name=t,this._$AM=r,this.options=o,i.length>2||i[0]!==""||i[1]!==""?(this._$AH=Array(i.length-1).fill(new String),this.strings=i):this._$AH=u}get tagName(){return this.element.tagName}get _$AU(){return this._$AM._$AU}_$AI(e,t=this,i,r){let o=this.strings,n=!1;if(o===void 0)e=x(this,e,t,0),n=!B(e)||e!==this._$AH&&e!==y,n&&(this._$AH=e);else{let d=e,a,l;for(e=o[0],a=0;a<o.length-1;a++)l=x(this,d[i+a],t,a),l===y&&(l=this._$AH[a]),n||(n=!B(l)||l!==this._$AH[a]),l===u?e=u:e!==u&&(e+=(l??"")+o[a+1]),this._$AH[a]=l}n&&!r&&this.C(e)}C(e){e===u?this.element.removeAttribute(this.name):this.element.setAttribute(this.name,e??"")}},J=class extends M{constructor(){super(...arguments),this.type=3}C(e){this.element[this.name]=e===u?void 0:e}},Be=T?T.emptyScript:"",Q=class extends M{constructor(){super(...arguments),this.type=4}C(e){e&&e!==u?this.element.setAttribute(this.name,Be):this.element.removeAttribute(this.name)}},X=class extends M{constructor(e,t,i,r,o){super(e,t,i,r,o),this.type=5}_$AI(e,t=this){var i;if((e=(i=x(this,e,t,0))!==null&&i!==void 0?i:u)===y)return;let r=this._$AH,o=e===u&&r!==u||e.capture!==r.capture||e.once!==r.once||e.passive!==r.passive,n=e!==u&&(r===u||o);o&&this.element.removeEventListener(this.name,this,r),n&&this.element.addEventListener(this.name,this,e),this._$AH=e}handleEvent(e){var t,i;typeof this._$AH=="function"?this._$AH.call((i=(t=this.options)===null||t===void 0?void 0:t.host)!==null&&i!==void 0?i:this.element,e):this._$AH.handleEvent(e)}},ee=class{constructor(e,t,i){this.element=e,this.type=6,this._$AN=void 0,this._$AM=t,this.options=i}get _$AU(){return this._$AM._$AU}_$AI(e){x(this,e)}};var fe=window.litHtmlPolyfillSupport;fe?.($,A),((Y=globalThis.litHtmlVersions)!==null&&Y!==void 0?Y:globalThis.litHtmlVersions=[]).push("2.2.4");var se,ie;var _=class extends v{constructor(){super(...arguments),this.renderOptions={host:this},this._$Dt=void 0}createRenderRoot(){var e,t;let i=super.createRenderRoot();return(e=(t=this.renderOptions).renderBefore)!==null&&e!==void 0||(t.renderBefore=i.firstChild),i}update(e){let t=this.render();this.hasUpdated||(this.renderOptions.isConnected=this.isConnected),super.update(e),this._$Dt=Ae(t,this.renderRoot,this.renderOptions)}connectedCallback(){var e;super.connectedCallback(),(e=this._$Dt)===null||e===void 0||e.setConnected(!0)}disconnectedCallback(){var e;super.disconnectedCallback(),(e=this._$Dt)===null||e===void 0||e.setConnected(!1)}render(){return y}};_.finalized=!0,_._$litElement$=!0,(se=globalThis.litElementHydrateSupport)===null||se===void 0||se.call(globalThis,{LitElement:_});var Se=globalThis.litElementPolyfillSupport;Se?.({LitElement:_});((ie=globalThis.litElementVersions)!==null&&ie!==void 0?ie:globalThis.litElementVersions=[]).push("3.2.0");var Ee=s=>e=>typeof e=="function"?((t,i)=>(window.customElements.define(t,i),i))(s,e):((t,i)=>{let{kind:r,elements:o}=i;return{kind:r,elements:o,finisher(n){window.customElements.define(t,n)}}})(s,e);var Ie=(s,e)=>e.kind==="method"&&e.descriptor&&!("value"in e.descriptor)?{...e,finisher(t){t.createProperty(e.key,s)}}:{kind:"field",key:Symbol(),placement:"own",descriptor:{},originalKey:e.key,initializer(){typeof e.initializer=="function"&&(this[e.key]=e.initializer.call(this))},finisher(t){t.createProperty(e.key,s)}};function Ce(s){return(e,t)=>t!==void 0?((i,r,o)=>{r.constructor.createProperty(o,i)})(s,e,t):Ie(s,e)}function Te(s){return Ce({...s,state:!0})}var S=({finisher:s,descriptor:e})=>(t,i)=>{var r;if(i===void 0){let o=(r=t.originalKey)!==null&&r!==void 0?r:t.key,n=e!=null?{kind:"method",placement:"prototype",key:o,descriptor:e(t.key)}:{...t,key:o};return s!=null&&(n.finisher=function(d){s(d,o)}),n}{let o=t.constructor;e!==void 0&&Object.defineProperty(t,i,e(i)),s?.(o,i)}};function we(s,e){return S({descriptor:t=>{let i={get(){var r,o;return(o=(r=this.renderRoot)===null||r===void 0?void 0:r.querySelector(s))!==null&&o!==void 0?o:null},enumerable:!0,configurable:!0};if(e){let r=typeof t=="symbol"?Symbol():"__"+t;i.get=function(){var o,n;return this[r]===void 0&&(this[r]=(n=(o=this.renderRoot)===null||o===void 0?void 0:o.querySelector(s))!==null&&n!==void 0?n:null),this[r]}}return i}})}var re,bt=((re=window.HTMLSlotElement)===null||re===void 0?void 0:re.prototype.assignedElements)!=null?(s,e)=>s.assignedElements(e):(s,e)=>s.assignedNodes(e).filter(t=>t.nodeType===Node.ELEMENT_NODE);var I={ADD_TODO:"addTodo",TODO_ADDED:"todoAdded",TODO_ERR:"todoErr",MODIFY_TODO:"modifyTodo",COMPLETE_TODO:"completeTodo",TODO_MODIFIED:"todoModified",DEL_TODO:"delTodo",TODO_DELETED:"todoDeleted",GET_ALL_TODOS:"getAllTodos",TODO_SELECTED:"todoSelected",CHECK_DATA_SOURCE:"checkDataSource",DATA_SOURCE_READY:"dataSourceReady"};var xe="broadcast-sync",Ne="browser-message-broker";function Ue(s){return s.channelName===xe}function qe(s){return s.senderId!=null&&s.targetId==null}function Le(s){return s.senderId!=null&&s.targetId!=null}var O=Math.random().toString(36).substring(2,9);function He(s,e=1){let t;return(...i)=>{clearTimeout(t),t=setTimeout(()=>{s(...i)},e)}}var z=new Map,ze=class{constructor(){this.trace=!1,this.senderId=O,this.state=new Map,this.subscribers=new Map,this.braodcasts=new Set,this.__bcChannel=new BroadcastChannel(Ne),this.__nextMessageAwaters=new Map,this.broadcastedRequests=new Map,this.requestListeners=new Map,this.__bcChannel.onmessage=this.handleBroadcast.bind(this),this.__bcChannel.onmessageerror=this.handleBroadcastError.bind(this),setTimeout(()=>{this.__sendBrokerState(void 0,void 0)},0),this.sendBrokerState=He(this.__sendBrokerState.bind(this),2)}log(s,e,...t){(this.trace||z.get(e)?.trace)&&console.log(`[${globalThis.constructor.name}(${this.senderId})-${e}] ${s}`,t)}ConfigureChannel(s,e,t,i){z.set(s,{enableBroadcast:e,enableCaching:t,trace:i}),t&&this.state.set(s,void 0),e&&this.braodcasts.add(s)}handleBroadcastError(s){throw Error("BROADCAST FAILED: "+s.data)}__sendBrokerState(s,e){let t=Array.from(this.braodcasts.keys());e&&e.length>0&&(t=t.filter(n=>e.includes(n)));let i={};for(let n of this.state)!n[1]||!t.includes(n[0])||(i[n[0]]=n[1]);let r={id:O,availableState:i,broadcasts:t},o={channelName:xe,senderCtx:globalThis.constructor.name,senderId:O,targetId:s,msg:r,channelType:"sync"};this.__bcChannel.postMessage(o),s==null?this.log("Broadcast sync requested","",{brokerState:r}):this.log("Broadcast sync responded","",{targetId:s,brokerState:r})}handleBroadcastSync(s){if(qe(s))return this.sendBrokerState(s.senderId,s.msg.broadcasts);if(Le(s))for(let e of Object.entries(s.msg.availableState))this.braodcasts.has(e[0])&&this.state.has(e[0])&&this.state.get(e[0])==null&&this.__notifySubscribers(e[0],e[1],s.senderId),this.log("Broadcast sync responce handled","",s.msg)}handleBroadcast(s){if(this.log("Broadcast received",s.data.channelName,s.data),s.data.targetId!=null&&s.data.targetId!==O){this.log("Broadcast ignored (different targetId)",s.data.channelName);return}if(Ue(s.data))return this.handleBroadcastSync(s.data);switch(s.data.channelType){case"pubSub":this.__notifySubscribers(s.data.channelName,s.data.msg,s.data.senderId);break;case"req":this.bridgeRequest(s.data.channelName,s.data.msg,s.data.senderId);break;case"rep":let e=this.broadcastedRequests.get(s.data.channelName);if(!e)return;e.resolve(s.data.msg),this.broadcastedRequests.delete(s.data.channelName);break}this.log("Broadcast handled",s.data.channelName,s.data)}__configureBroadcast(s){if(!s.channelName)throw new Error("Invalid subscription");this.braodcasts.add(s.channelName);let e=s.dispose;s.dispose=()=>{e(),this.braodcasts.delete(s.channelName)},s.isBroadcast=!0,this.sendBrokerState()}GetState(s){if(s)return this.state.get(s)}async Broadcast(s,e,t){this._broadcast(s,e,"pubSub",t)}async _broadcast(s,e,t,i){let r=z.get(s);this.log(`Message broadcasted (${t}) to ${i||"all brokers"}`,s,e);let o=await Promise.resolve(e),n={channelName:s,senderCtx:globalThis.constructor.name,senderId:O,targetId:i,msg:o,channelType:t};r?.enableCaching&&this.state.set(s,e),this.__bcChannel.postMessage(n)}async Publish(s,e,t){this.log("Message published",s,e),await this.__notifySubscribers(s,e,O),this.braodcasts.has(s)&&this._broadcast(s,e,"pubSub",t)}async nextMessage(s){let e=this.__nextMessageAwaters.get(s);if(e)return e.promise;let t={promise:void 0,resolve:void 0};return t.promise=new Promise(i=>{t.resolve=i}),this.__nextMessageAwaters.set(s,t),t.promise}Subscribe(s,e,t=!1,i=!0){let r=z.get(s),o=!1;r&&(t=r.enableBroadcast||!1,i=r.enableCaching||!0);let n=this.subscribers.get(s)||[],d=e;n.push(d),this.subscribers.set(s,n);let a={channelName:s,isCached:!1,dispose:()=>{let l=this.subscribers.get(s);if(l==null)return;let p=l.indexOf(d);p!==-1&&l.splice(p,1)},publish:(l,p)=>this.Publish(s,l,p),isDisposed:!1};return t&&this.__configureBroadcast(a),i&&this.state.set(s,void 0),a}bridgeRequest(s,e,t){let i=this.requestListeners.get(s);return i?i.handler(e,t):Promise.resolve(void 0)}Request(s,e,t=!1,i){if(t){this._broadcast(s,e,"req",i);let r=this.broadcastedRequests.get(s);r&&r.resolve(void 0);let o,n={promise:new Promise(d=>o=d),resolve:o};return this.broadcastedRequests.set(s,n),n.promise}else{let r=this.requestListeners.get(s);return r?r.handler(e):Promise.resolve(void 0)}}Reply(s,e,t=!1){if(t){let n=e;e=(d,a)=>this._broadcast(s,n(d),"rep",a)}let i=this.requestListeners,r={channelName:s,get isDisposed(){return i.has(s)},isBroadcast:t,handler:e,dispose:void 0};r.dispose=()=>{r.isDisposed=!0,this.requestListeners.get(s)===r&&this.requestListeners.delete(s)};let o=this.requestListeners.get(s);return o&&(o.isDisposed=!0,console.warn("Request listener has been replaced: "+s)),this.requestListeners.set(s,r),r}async __notifySubscribers(s,e,t){let i=this.subscribers.get(s)||[],r=[];for(let o of i)!o||(r.push(Promise.resolve(o(e,t))),this.log("Handler called",s,o));await Promise.all(r),this.state.has(s)&&this.state.set(s,e),this.__handleAwaiter(s,e),this.log("Message handled",s,e,this)}__handleAwaiter(s,e){let t=this.__nextMessageAwaters.get(s);!t||(t.resolve(e),this.__nextMessageAwaters.delete(s))}};globalThis.BrowserMessageBroker=globalThis.BrowserMessageBroker||new ze;var g=globalThis.BrowserMessageBroker,oe=new Map,P=class{constructor(s,e){this.type="pubSub",this.dispose=()=>{g.subscribers.delete(this.name),oe.delete(this.name)},this.name="",this.settings={},this.name=s,this.settings=e}static getOrCreate(s,e){if(!e){let i=oe.get(s);if(!i)throw Error("Can't find channel settings");return i}g.ConfigureChannel(s,e.enableBroadcast||!1,e.enableCaching||!1,e.trace||!1);let t=new P(s,e);return oe.set(s,t),t}async publish(s,e){g.Publish(this.name,s,e)}static async publish(s,e,t){g.Publish(s,e,t)}static async broadcast(s,e,t){g.Broadcast(s,e,t)}subscribe(s){return g.Subscribe(this.name,s,this.settings.enableBroadcast,this.settings.enableCaching).dispose}getState(){return g.GetState(this.name)}static GetState(s){return g.GetState(s)}nextMessage(){return g.nextMessage(this.name)}static nextMessage(s){return g.nextMessage(s)}};var E=class extends _{constructor(){super();this.selectedTodo=void 0;this.disposeTodoSelected=P.getOrCreate(I.TODO_SELECTED,{enableBroadcast:!0,enableCaching:!0}).subscribe(this.onTodoSelected.bind(this)),this.disposeTodoModified=P.getOrCreate(I.TODO_MODIFIED,{enableBroadcast:!0,enableCaching:!0}).subscribe(this.onTodoModified.bind(this)),this.disposeTodoDeleted=P.getOrCreate(I.TODO_DELETED,{enableBroadcast:!0,enableCaching:!1}).subscribe(this.onTodoModified.bind(this))}disconnectedCallback(){this.disposeTodoSelected(),this.disposeTodoModified(),this.disposeTodoDeleted(),super.disconnectedCallback()}onTodoModified(t){this.selectedTodo&&t.id===this.selectedTodo.id&&(this.selectedTodo=void 0)}onTodoSelected(t){this.selectedTodo=t}render(){return this.selectedTodo?te`
        <div>Edit todo ${this.selectedTodo.id}</div>
        <div>
          <input
            type="text"
            id="text"
            value=${this.selectedTodo.text}
          />
          <button @click=${this.saveTodo}>save</button>
        </div>
      `:te``}saveTodo(){var i;if(!this.txtInput||!this.selectedTodo)return;let t=(i=this.txtInput)==null?void 0:i.value;!t||t===""||P.broadcast(I.MODIFY_TODO,{id:this.selectedTodo.id,newText:t})}};E.styles=G`
    :host {
      display: block;
      margin: 10px 0px;
    }
  `,q([Te()],E.prototype,"selectedTodo",2),q([we("#text")],E.prototype,"txtInput",2),E=q([Ee("todo-editor")],E);})();
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
/**
 * @license
 * Copyright 2019 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
/**
 * @license
 * Copyright 2021 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
//# sourceMappingURL=todoEditor.js.map
