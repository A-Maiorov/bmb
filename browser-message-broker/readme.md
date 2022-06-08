# BMB - BrowserMessageBroker

> ⚠️ **EXPERIMENTAL AND POORLY TESTED!** Use at your own risk

![Tests](https://github.com/A-Maiorov/bmb/actions/workflows/test.yml/badge.svg)
[![Published on npm](https://img.shields.io/npm/v/browser-message-broker.svg?logo=npm)](https://www.npmjs.com/package/browser-message-broker)

BMB is a tiny message broker (only about 2 kb compressed) that supports Publish/Subscribe and Request/Reply messaging patterns across multiple scripting contexts of the same origin (Tabs, Ifames, Service Workers, Dedicated and Shared Worker). It uses [BroadcastChannel](https://developer.mozilla.org/en-US/docs/Web/API/BroadcastChannel#browser_compatibility) as a unified way of communication between different contexts.

## Potential use cases

- Communication between independent scripts or web components or micro frontends
- Communication between multiple tabs and workers or iframes

## Features

- Publish/Subscribe
- Request/Reply
- Messages caching and automatic synchronisation of the contexts

## Examples

See `/examples/todo-app` in this repo

[Todo-app example readme](/examples/todo-app/readme.md)

[Demo](https://a-maiorov.github.io/bmb/)

## Getting started

Install:

```console
npm install browser-message-broker --save
```

Import:

```js
import { BMB } from "browser-message-broker";
BMB.trace = true; //enable logging messages to the console
```

### Publish/Subscribe

Configure subscription

```ts
type MyMessage = { name: string; greeting: string }
const myMessageSubscription = BMB.Subscribe<MyMessage>(
  "my-message", //message name
  (msg)=> console.log(msg), //handler, msg will be of type MyMessage
  true, //enableBroadcast
  false //enableCaching
);
```

Publish message

```ts
myMessageSubscription.publish({ name: "Foo", greeting: "Hi!" });
```

**Or,** just publish without configuring subscription

```ts
BMB.Publish("my-message", { name: "Foo", greeting: "Hi!" });
```

Request/Reply

```ts
type TReq = { reqPayload: string };
type TRep = { respPayload: string };

// Shared Worker
BMB.Reply<TReq>("reqRespTest", (req: TReq) => {
  return { respPayload: "Hello " + req.reqPayload   } as TRep;
});

// Window
const req: TReq = { reqPayload: "Bob" };
const reply = await BMB.Request<TRep>("reqRespTest", req);
console.log(reply)// { "respPayload": "Hello Bob" }
```
