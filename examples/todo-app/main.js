(() => {
  var __defProp = Object.defineProperty;
  var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
  var __decorateClass = (decorators, target, key, kind) => {
    var result = kind > 1 ? void 0 : kind ? __getOwnPropDesc(target, key) : target;
    for (var i4 = decorators.length - 1, decorator; i4 >= 0; i4--)
      if (decorator = decorators[i4])
        result = (kind ? decorator(target, key, result) : decorator(result)) || result;
    if (kind && result)
      __defProp(target, key, result);
    return result;
  };

  // ../../common/temp/node_modules/.pnpm/@lit+reactive-element@1.3.2/node_modules/@lit/reactive-element/css-tag.js
  var t = window.ShadowRoot && (window.ShadyCSS === void 0 || window.ShadyCSS.nativeShadow) && "adoptedStyleSheets" in Document.prototype && "replace" in CSSStyleSheet.prototype;
  var e = Symbol();
  var n = /* @__PURE__ */ new Map();
  var s = class {
    constructor(t3, n7) {
      if (this._$cssResult$ = true, n7 !== e)
        throw Error("CSSResult is not constructable. Use `unsafeCSS` or `css` instead.");
      this.cssText = t3;
    }
    get styleSheet() {
      let e7 = n.get(this.cssText);
      return t && e7 === void 0 && (n.set(this.cssText, e7 = new CSSStyleSheet()), e7.replaceSync(this.cssText)), e7;
    }
    toString() {
      return this.cssText;
    }
  };
  var o = (t3) => new s(typeof t3 == "string" ? t3 : t3 + "", e);
  var i = (e7, n7) => {
    t ? e7.adoptedStyleSheets = n7.map((t3) => t3 instanceof CSSStyleSheet ? t3 : t3.styleSheet) : n7.forEach((t3) => {
      const n8 = document.createElement("style"), s5 = window.litNonce;
      s5 !== void 0 && n8.setAttribute("nonce", s5), n8.textContent = t3.cssText, e7.appendChild(n8);
    });
  };
  var S = t ? (t3) => t3 : (t3) => t3 instanceof CSSStyleSheet ? ((t4) => {
    let e7 = "";
    for (const n7 of t4.cssRules)
      e7 += n7.cssText;
    return o(e7);
  })(t3) : t3;

  // ../../common/temp/node_modules/.pnpm/@lit+reactive-element@1.3.2/node_modules/@lit/reactive-element/reactive-element.js
  var s2;
  var e2 = window.trustedTypes;
  var r2 = e2 ? e2.emptyScript : "";
  var h = window.reactiveElementPolyfillSupport;
  var o2 = { toAttribute(t3, i4) {
    switch (i4) {
      case Boolean:
        t3 = t3 ? r2 : null;
        break;
      case Object:
      case Array:
        t3 = t3 == null ? t3 : JSON.stringify(t3);
    }
    return t3;
  }, fromAttribute(t3, i4) {
    let s5 = t3;
    switch (i4) {
      case Boolean:
        s5 = t3 !== null;
        break;
      case Number:
        s5 = t3 === null ? null : Number(t3);
        break;
      case Object:
      case Array:
        try {
          s5 = JSON.parse(t3);
        } catch (t4) {
          s5 = null;
        }
    }
    return s5;
  } };
  var n2 = (t3, i4) => i4 !== t3 && (i4 == i4 || t3 == t3);
  var l = { attribute: true, type: String, converter: o2, reflect: false, hasChanged: n2 };
  var a = class extends HTMLElement {
    constructor() {
      super(), this._$Et = /* @__PURE__ */ new Map(), this.isUpdatePending = false, this.hasUpdated = false, this._$Ei = null, this.o();
    }
    static addInitializer(t3) {
      var i4;
      (i4 = this.l) !== null && i4 !== void 0 || (this.l = []), this.l.push(t3);
    }
    static get observedAttributes() {
      this.finalize();
      const t3 = [];
      return this.elementProperties.forEach((i4, s5) => {
        const e7 = this._$Eh(s5, i4);
        e7 !== void 0 && (this._$Eu.set(e7, s5), t3.push(e7));
      }), t3;
    }
    static createProperty(t3, i4 = l) {
      if (i4.state && (i4.attribute = false), this.finalize(), this.elementProperties.set(t3, i4), !i4.noAccessor && !this.prototype.hasOwnProperty(t3)) {
        const s5 = typeof t3 == "symbol" ? Symbol() : "__" + t3, e7 = this.getPropertyDescriptor(t3, s5, i4);
        e7 !== void 0 && Object.defineProperty(this.prototype, t3, e7);
      }
    }
    static getPropertyDescriptor(t3, i4, s5) {
      return { get() {
        return this[i4];
      }, set(e7) {
        const r4 = this[t3];
        this[i4] = e7, this.requestUpdate(t3, r4, s5);
      }, configurable: true, enumerable: true };
    }
    static getPropertyOptions(t3) {
      return this.elementProperties.get(t3) || l;
    }
    static finalize() {
      if (this.hasOwnProperty("finalized"))
        return false;
      this.finalized = true;
      const t3 = Object.getPrototypeOf(this);
      if (t3.finalize(), this.elementProperties = new Map(t3.elementProperties), this._$Eu = /* @__PURE__ */ new Map(), this.hasOwnProperty("properties")) {
        const t4 = this.properties, i4 = [...Object.getOwnPropertyNames(t4), ...Object.getOwnPropertySymbols(t4)];
        for (const s5 of i4)
          this.createProperty(s5, t4[s5]);
      }
      return this.elementStyles = this.finalizeStyles(this.styles), true;
    }
    static finalizeStyles(i4) {
      const s5 = [];
      if (Array.isArray(i4)) {
        const e7 = new Set(i4.flat(1 / 0).reverse());
        for (const i5 of e7)
          s5.unshift(S(i5));
      } else
        i4 !== void 0 && s5.push(S(i4));
      return s5;
    }
    static _$Eh(t3, i4) {
      const s5 = i4.attribute;
      return s5 === false ? void 0 : typeof s5 == "string" ? s5 : typeof t3 == "string" ? t3.toLowerCase() : void 0;
    }
    o() {
      var t3;
      this._$Ep = new Promise((t4) => this.enableUpdating = t4), this._$AL = /* @__PURE__ */ new Map(), this._$Em(), this.requestUpdate(), (t3 = this.constructor.l) === null || t3 === void 0 || t3.forEach((t4) => t4(this));
    }
    addController(t3) {
      var i4, s5;
      ((i4 = this._$Eg) !== null && i4 !== void 0 ? i4 : this._$Eg = []).push(t3), this.renderRoot !== void 0 && this.isConnected && ((s5 = t3.hostConnected) === null || s5 === void 0 || s5.call(t3));
    }
    removeController(t3) {
      var i4;
      (i4 = this._$Eg) === null || i4 === void 0 || i4.splice(this._$Eg.indexOf(t3) >>> 0, 1);
    }
    _$Em() {
      this.constructor.elementProperties.forEach((t3, i4) => {
        this.hasOwnProperty(i4) && (this._$Et.set(i4, this[i4]), delete this[i4]);
      });
    }
    createRenderRoot() {
      var t3;
      const s5 = (t3 = this.shadowRoot) !== null && t3 !== void 0 ? t3 : this.attachShadow(this.constructor.shadowRootOptions);
      return i(s5, this.constructor.elementStyles), s5;
    }
    connectedCallback() {
      var t3;
      this.renderRoot === void 0 && (this.renderRoot = this.createRenderRoot()), this.enableUpdating(true), (t3 = this._$Eg) === null || t3 === void 0 || t3.forEach((t4) => {
        var i4;
        return (i4 = t4.hostConnected) === null || i4 === void 0 ? void 0 : i4.call(t4);
      });
    }
    enableUpdating(t3) {
    }
    disconnectedCallback() {
      var t3;
      (t3 = this._$Eg) === null || t3 === void 0 || t3.forEach((t4) => {
        var i4;
        return (i4 = t4.hostDisconnected) === null || i4 === void 0 ? void 0 : i4.call(t4);
      });
    }
    attributeChangedCallback(t3, i4, s5) {
      this._$AK(t3, s5);
    }
    _$ES(t3, i4, s5 = l) {
      var e7, r4;
      const h3 = this.constructor._$Eh(t3, s5);
      if (h3 !== void 0 && s5.reflect === true) {
        const n7 = ((r4 = (e7 = s5.converter) === null || e7 === void 0 ? void 0 : e7.toAttribute) !== null && r4 !== void 0 ? r4 : o2.toAttribute)(i4, s5.type);
        this._$Ei = t3, n7 == null ? this.removeAttribute(h3) : this.setAttribute(h3, n7), this._$Ei = null;
      }
    }
    _$AK(t3, i4) {
      var s5, e7, r4;
      const h3 = this.constructor, n7 = h3._$Eu.get(t3);
      if (n7 !== void 0 && this._$Ei !== n7) {
        const t4 = h3.getPropertyOptions(n7), l5 = t4.converter, a3 = (r4 = (e7 = (s5 = l5) === null || s5 === void 0 ? void 0 : s5.fromAttribute) !== null && e7 !== void 0 ? e7 : typeof l5 == "function" ? l5 : null) !== null && r4 !== void 0 ? r4 : o2.fromAttribute;
        this._$Ei = n7, this[n7] = a3(i4, t4.type), this._$Ei = null;
      }
    }
    requestUpdate(t3, i4, s5) {
      let e7 = true;
      t3 !== void 0 && (((s5 = s5 || this.constructor.getPropertyOptions(t3)).hasChanged || n2)(this[t3], i4) ? (this._$AL.has(t3) || this._$AL.set(t3, i4), s5.reflect === true && this._$Ei !== t3 && (this._$EC === void 0 && (this._$EC = /* @__PURE__ */ new Map()), this._$EC.set(t3, s5))) : e7 = false), !this.isUpdatePending && e7 && (this._$Ep = this._$E_());
    }
    async _$E_() {
      this.isUpdatePending = true;
      try {
        await this._$Ep;
      } catch (t4) {
        Promise.reject(t4);
      }
      const t3 = this.scheduleUpdate();
      return t3 != null && await t3, !this.isUpdatePending;
    }
    scheduleUpdate() {
      return this.performUpdate();
    }
    performUpdate() {
      var t3;
      if (!this.isUpdatePending)
        return;
      this.hasUpdated, this._$Et && (this._$Et.forEach((t4, i5) => this[i5] = t4), this._$Et = void 0);
      let i4 = false;
      const s5 = this._$AL;
      try {
        i4 = this.shouldUpdate(s5), i4 ? (this.willUpdate(s5), (t3 = this._$Eg) === null || t3 === void 0 || t3.forEach((t4) => {
          var i5;
          return (i5 = t4.hostUpdate) === null || i5 === void 0 ? void 0 : i5.call(t4);
        }), this.update(s5)) : this._$EU();
      } catch (t4) {
        throw i4 = false, this._$EU(), t4;
      }
      i4 && this._$AE(s5);
    }
    willUpdate(t3) {
    }
    _$AE(t3) {
      var i4;
      (i4 = this._$Eg) === null || i4 === void 0 || i4.forEach((t4) => {
        var i5;
        return (i5 = t4.hostUpdated) === null || i5 === void 0 ? void 0 : i5.call(t4);
      }), this.hasUpdated || (this.hasUpdated = true, this.firstUpdated(t3)), this.updated(t3);
    }
    _$EU() {
      this._$AL = /* @__PURE__ */ new Map(), this.isUpdatePending = false;
    }
    get updateComplete() {
      return this.getUpdateComplete();
    }
    getUpdateComplete() {
      return this._$Ep;
    }
    shouldUpdate(t3) {
      return true;
    }
    update(t3) {
      this._$EC !== void 0 && (this._$EC.forEach((t4, i4) => this._$ES(i4, this[i4], t4)), this._$EC = void 0), this._$EU();
    }
    updated(t3) {
    }
    firstUpdated(t3) {
    }
  };
  a.finalized = true, a.elementProperties = /* @__PURE__ */ new Map(), a.elementStyles = [], a.shadowRootOptions = { mode: "open" }, h == null || h({ ReactiveElement: a }), ((s2 = globalThis.reactiveElementVersions) !== null && s2 !== void 0 ? s2 : globalThis.reactiveElementVersions = []).push("1.3.2");

  // ../../common/temp/node_modules/.pnpm/lit-html@2.2.3/node_modules/lit-html/lit-html.js
  var t2;
  var i2 = globalThis.trustedTypes;
  var s3 = i2 ? i2.createPolicy("lit-html", { createHTML: (t3) => t3 }) : void 0;
  var e3 = `lit$${(Math.random() + "").slice(9)}$`;
  var o3 = "?" + e3;
  var n3 = `<${o3}>`;
  var l2 = document;
  var h2 = (t3 = "") => l2.createComment(t3);
  var r3 = (t3) => t3 === null || typeof t3 != "object" && typeof t3 != "function";
  var d = Array.isArray;
  var u = (t3) => {
    var i4;
    return d(t3) || typeof ((i4 = t3) === null || i4 === void 0 ? void 0 : i4[Symbol.iterator]) == "function";
  };
  var c = /<(?:(!--|\/[^a-zA-Z])|(\/?[a-zA-Z][^>\s]*)|(\/?$))/g;
  var v = /-->/g;
  var a2 = />/g;
  var f = />|[ 	\n\r](?:([^\s"'>=/]+)([ 	\n\r]*=[ 	\n\r]*(?:[^ 	\n\r"'`<>=]|("|')|))|$)/g;
  var _ = /'/g;
  var m = /"/g;
  var g = /^(?:script|style|textarea|title)$/i;
  var p = (t3) => (i4, ...s5) => ({ _$litType$: t3, strings: i4, values: s5 });
  var $ = p(1);
  var y = p(2);
  var b = Symbol.for("lit-noChange");
  var w = Symbol.for("lit-nothing");
  var T = /* @__PURE__ */ new WeakMap();
  var x = (t3, i4, s5) => {
    var e7, o7;
    const n7 = (e7 = s5 == null ? void 0 : s5.renderBefore) !== null && e7 !== void 0 ? e7 : i4;
    let l5 = n7._$litPart$;
    if (l5 === void 0) {
      const t4 = (o7 = s5 == null ? void 0 : s5.renderBefore) !== null && o7 !== void 0 ? o7 : null;
      n7._$litPart$ = l5 = new N(i4.insertBefore(h2(), t4), t4, void 0, s5 != null ? s5 : {});
    }
    return l5._$AI(t3), l5;
  };
  var A = l2.createTreeWalker(l2, 129, null, false);
  var C = (t3, i4) => {
    const o7 = t3.length - 1, l5 = [];
    let h3, r4 = i4 === 2 ? "<svg>" : "", d2 = c;
    for (let i5 = 0; i5 < o7; i5++) {
      const s5 = t3[i5];
      let o8, u3, p2 = -1, $2 = 0;
      for (; $2 < s5.length && (d2.lastIndex = $2, u3 = d2.exec(s5), u3 !== null); )
        $2 = d2.lastIndex, d2 === c ? u3[1] === "!--" ? d2 = v : u3[1] !== void 0 ? d2 = a2 : u3[2] !== void 0 ? (g.test(u3[2]) && (h3 = RegExp("</" + u3[2], "g")), d2 = f) : u3[3] !== void 0 && (d2 = f) : d2 === f ? u3[0] === ">" ? (d2 = h3 != null ? h3 : c, p2 = -1) : u3[1] === void 0 ? p2 = -2 : (p2 = d2.lastIndex - u3[2].length, o8 = u3[1], d2 = u3[3] === void 0 ? f : u3[3] === '"' ? m : _) : d2 === m || d2 === _ ? d2 = f : d2 === v || d2 === a2 ? d2 = c : (d2 = f, h3 = void 0);
      const y2 = d2 === f && t3[i5 + 1].startsWith("/>") ? " " : "";
      r4 += d2 === c ? s5 + n3 : p2 >= 0 ? (l5.push(o8), s5.slice(0, p2) + "$lit$" + s5.slice(p2) + e3 + y2) : s5 + e3 + (p2 === -2 ? (l5.push(void 0), i5) : y2);
    }
    const u2 = r4 + (t3[o7] || "<?>") + (i4 === 2 ? "</svg>" : "");
    if (!Array.isArray(t3) || !t3.hasOwnProperty("raw"))
      throw Error("invalid template strings array");
    return [s3 !== void 0 ? s3.createHTML(u2) : u2, l5];
  };
  var E = class {
    constructor({ strings: t3, _$litType$: s5 }, n7) {
      let l5;
      this.parts = [];
      let r4 = 0, d2 = 0;
      const u2 = t3.length - 1, c3 = this.parts, [v2, a3] = C(t3, s5);
      if (this.el = E.createElement(v2, n7), A.currentNode = this.el.content, s5 === 2) {
        const t4 = this.el.content, i4 = t4.firstChild;
        i4.remove(), t4.append(...i4.childNodes);
      }
      for (; (l5 = A.nextNode()) !== null && c3.length < u2; ) {
        if (l5.nodeType === 1) {
          if (l5.hasAttributes()) {
            const t4 = [];
            for (const i4 of l5.getAttributeNames())
              if (i4.endsWith("$lit$") || i4.startsWith(e3)) {
                const s6 = a3[d2++];
                if (t4.push(i4), s6 !== void 0) {
                  const t5 = l5.getAttribute(s6.toLowerCase() + "$lit$").split(e3), i5 = /([.?@])?(.*)/.exec(s6);
                  c3.push({ type: 1, index: r4, name: i5[2], strings: t5, ctor: i5[1] === "." ? M : i5[1] === "?" ? H : i5[1] === "@" ? I : S2 });
                } else
                  c3.push({ type: 6, index: r4 });
              }
            for (const i4 of t4)
              l5.removeAttribute(i4);
          }
          if (g.test(l5.tagName)) {
            const t4 = l5.textContent.split(e3), s6 = t4.length - 1;
            if (s6 > 0) {
              l5.textContent = i2 ? i2.emptyScript : "";
              for (let i4 = 0; i4 < s6; i4++)
                l5.append(t4[i4], h2()), A.nextNode(), c3.push({ type: 2, index: ++r4 });
              l5.append(t4[s6], h2());
            }
          }
        } else if (l5.nodeType === 8)
          if (l5.data === o3)
            c3.push({ type: 2, index: r4 });
          else {
            let t4 = -1;
            for (; (t4 = l5.data.indexOf(e3, t4 + 1)) !== -1; )
              c3.push({ type: 7, index: r4 }), t4 += e3.length - 1;
          }
        r4++;
      }
    }
    static createElement(t3, i4) {
      const s5 = l2.createElement("template");
      return s5.innerHTML = t3, s5;
    }
  };
  function P(t3, i4, s5 = t3, e7) {
    var o7, n7, l5, h3;
    if (i4 === b)
      return i4;
    let d2 = e7 !== void 0 ? (o7 = s5._$Cl) === null || o7 === void 0 ? void 0 : o7[e7] : s5._$Cu;
    const u2 = r3(i4) ? void 0 : i4._$litDirective$;
    return (d2 == null ? void 0 : d2.constructor) !== u2 && ((n7 = d2 == null ? void 0 : d2._$AO) === null || n7 === void 0 || n7.call(d2, false), u2 === void 0 ? d2 = void 0 : (d2 = new u2(t3), d2._$AT(t3, s5, e7)), e7 !== void 0 ? ((l5 = (h3 = s5)._$Cl) !== null && l5 !== void 0 ? l5 : h3._$Cl = [])[e7] = d2 : s5._$Cu = d2), d2 !== void 0 && (i4 = P(t3, d2._$AS(t3, i4.values), d2, e7)), i4;
  }
  var V = class {
    constructor(t3, i4) {
      this.v = [], this._$AN = void 0, this._$AD = t3, this._$AM = i4;
    }
    get parentNode() {
      return this._$AM.parentNode;
    }
    get _$AU() {
      return this._$AM._$AU;
    }
    p(t3) {
      var i4;
      const { el: { content: s5 }, parts: e7 } = this._$AD, o7 = ((i4 = t3 == null ? void 0 : t3.creationScope) !== null && i4 !== void 0 ? i4 : l2).importNode(s5, true);
      A.currentNode = o7;
      let n7 = A.nextNode(), h3 = 0, r4 = 0, d2 = e7[0];
      for (; d2 !== void 0; ) {
        if (h3 === d2.index) {
          let i5;
          d2.type === 2 ? i5 = new N(n7, n7.nextSibling, this, t3) : d2.type === 1 ? i5 = new d2.ctor(n7, d2.name, d2.strings, this, t3) : d2.type === 6 && (i5 = new L(n7, this, t3)), this.v.push(i5), d2 = e7[++r4];
        }
        h3 !== (d2 == null ? void 0 : d2.index) && (n7 = A.nextNode(), h3++);
      }
      return o7;
    }
    m(t3) {
      let i4 = 0;
      for (const s5 of this.v)
        s5 !== void 0 && (s5.strings !== void 0 ? (s5._$AI(t3, s5, i4), i4 += s5.strings.length - 2) : s5._$AI(t3[i4])), i4++;
    }
  };
  var N = class {
    constructor(t3, i4, s5, e7) {
      var o7;
      this.type = 2, this._$AH = w, this._$AN = void 0, this._$AA = t3, this._$AB = i4, this._$AM = s5, this.options = e7, this._$Cg = (o7 = e7 == null ? void 0 : e7.isConnected) === null || o7 === void 0 || o7;
    }
    get _$AU() {
      var t3, i4;
      return (i4 = (t3 = this._$AM) === null || t3 === void 0 ? void 0 : t3._$AU) !== null && i4 !== void 0 ? i4 : this._$Cg;
    }
    get parentNode() {
      let t3 = this._$AA.parentNode;
      const i4 = this._$AM;
      return i4 !== void 0 && t3.nodeType === 11 && (t3 = i4.parentNode), t3;
    }
    get startNode() {
      return this._$AA;
    }
    get endNode() {
      return this._$AB;
    }
    _$AI(t3, i4 = this) {
      t3 = P(this, t3, i4), r3(t3) ? t3 === w || t3 == null || t3 === "" ? (this._$AH !== w && this._$AR(), this._$AH = w) : t3 !== this._$AH && t3 !== b && this.$(t3) : t3._$litType$ !== void 0 ? this.T(t3) : t3.nodeType !== void 0 ? this.k(t3) : u(t3) ? this.S(t3) : this.$(t3);
    }
    M(t3, i4 = this._$AB) {
      return this._$AA.parentNode.insertBefore(t3, i4);
    }
    k(t3) {
      this._$AH !== t3 && (this._$AR(), this._$AH = this.M(t3));
    }
    $(t3) {
      this._$AH !== w && r3(this._$AH) ? this._$AA.nextSibling.data = t3 : this.k(l2.createTextNode(t3)), this._$AH = t3;
    }
    T(t3) {
      var i4;
      const { values: s5, _$litType$: e7 } = t3, o7 = typeof e7 == "number" ? this._$AC(t3) : (e7.el === void 0 && (e7.el = E.createElement(e7.h, this.options)), e7);
      if (((i4 = this._$AH) === null || i4 === void 0 ? void 0 : i4._$AD) === o7)
        this._$AH.m(s5);
      else {
        const t4 = new V(o7, this), i5 = t4.p(this.options);
        t4.m(s5), this.k(i5), this._$AH = t4;
      }
    }
    _$AC(t3) {
      let i4 = T.get(t3.strings);
      return i4 === void 0 && T.set(t3.strings, i4 = new E(t3)), i4;
    }
    S(t3) {
      d(this._$AH) || (this._$AH = [], this._$AR());
      const i4 = this._$AH;
      let s5, e7 = 0;
      for (const o7 of t3)
        e7 === i4.length ? i4.push(s5 = new N(this.M(h2()), this.M(h2()), this, this.options)) : s5 = i4[e7], s5._$AI(o7), e7++;
      e7 < i4.length && (this._$AR(s5 && s5._$AB.nextSibling, e7), i4.length = e7);
    }
    _$AR(t3 = this._$AA.nextSibling, i4) {
      var s5;
      for ((s5 = this._$AP) === null || s5 === void 0 || s5.call(this, false, true, i4); t3 && t3 !== this._$AB; ) {
        const i5 = t3.nextSibling;
        t3.remove(), t3 = i5;
      }
    }
    setConnected(t3) {
      var i4;
      this._$AM === void 0 && (this._$Cg = t3, (i4 = this._$AP) === null || i4 === void 0 || i4.call(this, t3));
    }
  };
  var S2 = class {
    constructor(t3, i4, s5, e7, o7) {
      this.type = 1, this._$AH = w, this._$AN = void 0, this.element = t3, this.name = i4, this._$AM = e7, this.options = o7, s5.length > 2 || s5[0] !== "" || s5[1] !== "" ? (this._$AH = Array(s5.length - 1).fill(new String()), this.strings = s5) : this._$AH = w;
    }
    get tagName() {
      return this.element.tagName;
    }
    get _$AU() {
      return this._$AM._$AU;
    }
    _$AI(t3, i4 = this, s5, e7) {
      const o7 = this.strings;
      let n7 = false;
      if (o7 === void 0)
        t3 = P(this, t3, i4, 0), n7 = !r3(t3) || t3 !== this._$AH && t3 !== b, n7 && (this._$AH = t3);
      else {
        const e8 = t3;
        let l5, h3;
        for (t3 = o7[0], l5 = 0; l5 < o7.length - 1; l5++)
          h3 = P(this, e8[s5 + l5], i4, l5), h3 === b && (h3 = this._$AH[l5]), n7 || (n7 = !r3(h3) || h3 !== this._$AH[l5]), h3 === w ? t3 = w : t3 !== w && (t3 += (h3 != null ? h3 : "") + o7[l5 + 1]), this._$AH[l5] = h3;
      }
      n7 && !e7 && this.C(t3);
    }
    C(t3) {
      t3 === w ? this.element.removeAttribute(this.name) : this.element.setAttribute(this.name, t3 != null ? t3 : "");
    }
  };
  var M = class extends S2 {
    constructor() {
      super(...arguments), this.type = 3;
    }
    C(t3) {
      this.element[this.name] = t3 === w ? void 0 : t3;
    }
  };
  var k = i2 ? i2.emptyScript : "";
  var H = class extends S2 {
    constructor() {
      super(...arguments), this.type = 4;
    }
    C(t3) {
      t3 && t3 !== w ? this.element.setAttribute(this.name, k) : this.element.removeAttribute(this.name);
    }
  };
  var I = class extends S2 {
    constructor(t3, i4, s5, e7, o7) {
      super(t3, i4, s5, e7, o7), this.type = 5;
    }
    _$AI(t3, i4 = this) {
      var s5;
      if ((t3 = (s5 = P(this, t3, i4, 0)) !== null && s5 !== void 0 ? s5 : w) === b)
        return;
      const e7 = this._$AH, o7 = t3 === w && e7 !== w || t3.capture !== e7.capture || t3.once !== e7.once || t3.passive !== e7.passive, n7 = t3 !== w && (e7 === w || o7);
      o7 && this.element.removeEventListener(this.name, this, e7), n7 && this.element.addEventListener(this.name, this, t3), this._$AH = t3;
    }
    handleEvent(t3) {
      var i4, s5;
      typeof this._$AH == "function" ? this._$AH.call((s5 = (i4 = this.options) === null || i4 === void 0 ? void 0 : i4.host) !== null && s5 !== void 0 ? s5 : this.element, t3) : this._$AH.handleEvent(t3);
    }
  };
  var L = class {
    constructor(t3, i4, s5) {
      this.element = t3, this.type = 6, this._$AN = void 0, this._$AM = i4, this.options = s5;
    }
    get _$AU() {
      return this._$AM._$AU;
    }
    _$AI(t3) {
      P(this, t3);
    }
  };
  var z = window.litHtmlPolyfillSupport;
  z == null || z(E, N), ((t2 = globalThis.litHtmlVersions) !== null && t2 !== void 0 ? t2 : globalThis.litHtmlVersions = []).push("2.2.3");

  // ../../common/temp/node_modules/.pnpm/lit-element@3.2.0/node_modules/lit-element/lit-element.js
  var l3;
  var o4;
  var s4 = class extends a {
    constructor() {
      super(...arguments), this.renderOptions = { host: this }, this._$Dt = void 0;
    }
    createRenderRoot() {
      var t3, e7;
      const i4 = super.createRenderRoot();
      return (t3 = (e7 = this.renderOptions).renderBefore) !== null && t3 !== void 0 || (e7.renderBefore = i4.firstChild), i4;
    }
    update(t3) {
      const i4 = this.render();
      this.hasUpdated || (this.renderOptions.isConnected = this.isConnected), super.update(t3), this._$Dt = x(i4, this.renderRoot, this.renderOptions);
    }
    connectedCallback() {
      var t3;
      super.connectedCallback(), (t3 = this._$Dt) === null || t3 === void 0 || t3.setConnected(true);
    }
    disconnectedCallback() {
      var t3;
      super.disconnectedCallback(), (t3 = this._$Dt) === null || t3 === void 0 || t3.setConnected(false);
    }
    render() {
      return b;
    }
  };
  s4.finalized = true, s4._$litElement$ = true, (l3 = globalThis.litElementHydrateSupport) === null || l3 === void 0 || l3.call(globalThis, { LitElement: s4 });
  var n4 = globalThis.litElementPolyfillSupport;
  n4 == null || n4({ LitElement: s4 });
  ((o4 = globalThis.litElementVersions) !== null && o4 !== void 0 ? o4 : globalThis.litElementVersions = []).push("3.2.0");

  // ../../common/temp/node_modules/.pnpm/@lit+reactive-element@1.3.2/node_modules/@lit/reactive-element/decorators/custom-element.js
  var n5 = (n7) => (e7) => typeof e7 == "function" ? ((n8, e8) => (window.customElements.define(n8, e8), e8))(n7, e7) : ((n8, e8) => {
    const { kind: t3, elements: i4 } = e8;
    return { kind: t3, elements: i4, finisher(e9) {
      window.customElements.define(n8, e9);
    } };
  })(n7, e7);

  // ../../common/temp/node_modules/.pnpm/@lit+reactive-element@1.3.2/node_modules/@lit/reactive-element/decorators/query-assigned-elements.js
  var n6;
  var e5 = ((n6 = window.HTMLSlotElement) === null || n6 === void 0 ? void 0 : n6.prototype.assignedElements) != null ? (o7, n7) => o7.assignedElements(n7) : (o7, n7) => o7.assignedNodes(n7).filter((o8) => o8.nodeType === Node.ELEMENT_NODE);

  // ../../browser-message-broker/dist/Broker.js
  var i3 = class {
    constructor() {
      this.state = /* @__PURE__ */ new Map();
      this.subscribers = /* @__PURE__ */ new Map();
      this.braodcasts = /* @__PURE__ */ new Map();
    }
    __configureBroadcast(s5) {
      if (!s5.key)
        throw new Error("Invalid subscription");
      let r4 = new BroadcastChannel(s5.key);
      r4.onmessage = (e7) => {
        this.__notifySubscribers(s5.key, e7.data);
      }, r4.onmessageerror = (e7) => {
        throw Error("Broadcast failed: " + e7.data);
      }, this.braodcasts.set(s5.key, r4), s5.dispose = () => {
        r4.close(), s5.dispose(), this.braodcasts.delete(s5.key);
      }, s5.isBroadcast = true;
    }
    GetState(s5) {
      if (s5)
        return this.state.get(s5);
    }
    async __notifySubscribers(s5, r4) {
      let e7 = this.subscribers.get(s5) || [], o7 = [];
      for await (let t3 of e7) {
        let a3 = t3(r4);
        o7.push(Promise.resolve(a3));
      }
      await Promise.all(o7), this.state.set(s5, r4);
    }
    async Publish(s5, r4) {
      await this.__notifySubscribers(s5, r4);
      let e7 = this.braodcasts.get(s5);
      e7 && e7.postMessage(r4);
    }
    Subscribe(s5, r4 = () => {
    }) {
      let e7 = this.subscribers.get(s5) || [], o7 = r4;
      e7.push(o7), this.subscribers.set(s5, e7);
      let t3 = { key: s5, dispose: () => {
        e7.splice(e7.indexOf(o7), 1), t3.isDisposed = true;
      }, broadcast: () => {
      }, isDisposed: false };
      return t3.broadcast = () => (this.__configureBroadcast(t3), t3), t3;
    }
  };
  globalThis.BrowserMessageBroker = globalThis.BrowserMessageBroker || new i3();
  var c2 = globalThis.BrowserMessageBroker;

  // ../../browser-message-broker/dist/LitSubscriber.js
  var e6 = globalThis.BrowserMessageBroker;
  if (!e6)
    throw Error("Cant find browser-message-broker");
  var o6 = class {
    constructor(t3, s5) {
      t3.addController(this), this.__host = t3, this.__subsKey = s5, this.state = e6.GetState(s5);
    }
    hostConnected() {
      this.subscription = e6.Subscribe(this.__subsKey, (t3) => (this.state = t3, this.__host.requestUpdate()));
    }
    hostDisconnected() {
      this.subscription?.dispose();
    }
  };

  // app.ts
  var TodoApp = class extends s4 {
    constructor() {
      super();
      this.subs = new o6(this, MsgAddTodo.name);
    }
    render() {
      var _a;
      return $`
      <div>Hello world! ${(_a = this.subs.state) == null ? void 0 : _a.text}</div>
      <todo-btn-add> </todo-btn-add>
    `;
    }
  };
  TodoApp = __decorateClass([
    n5("todo-app")
  ], TodoApp);
  var AddTodoButton = class extends s4 {
    constructor() {
      super();
    }
    render() {
      return $`
      <button
        @click=${() => c2.Publish(MsgAddTodo.name, new MsgAddTodo("Go drink beer"))}
      >
        ADD TODO
      </button>
    `;
    }
  };
  AddTodoButton = __decorateClass([
    n5("todo-btn-add")
  ], AddTodoButton);
  var MsgAddTodo = class {
    constructor(t3) {
      this.text = "";
      this.text = t3;
    }
  };
})();
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
//# sourceMappingURL=main.js.map
