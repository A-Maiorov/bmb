# BMB - BrowserMessageBroker

![Tests](https://github.com/A-Maiorov/bmb/actions/workflows/test.yml/badge.svg)
[![Published on npm](https://img.shields.io/npm/v/browser-message-broker.svg?logo=npm)](https://www.npmjs.com/package/browser-message-broker)

BMB is a tiny message broker (only about 2 kb compressed) that supports Publish/Subscribe and Request/Reply messaging patterns across multiple scripting contexts of the same origin (Tabs, Ifames, Service Workers, Dedicated and Shared Worker). It uses [BroadcastChannel](https://developer.mozilla.org/en-US/docs/Web/API/BroadcastChannel#browser_compatibility) as a unified way of communication between different contexts.

## Potential use cases

- Communication between independent scripts or web components or micro frontends
- Communication between multiple tabs and workers or iframes

## Features

- Publish/Subscribe
- Request/Reply
- Messages caching and automatic synchronization of the contexts

## Examples

See `/examples/todo-app` in this repo

[Todo-app example readme](/examples/todo-app/readme.md)

[Demo](https://a-maiorov.github.io/bmb/)

## Getting started

Install:

```console
npm install browser-message-broker --save
```

### Publish/Subscribe

MyMessageProducer.ts

```ts
import { PubSubChannel, ReqRepChannel } from "browser-message-broker";
type MyMessage = { name: string; greeting: string }
const MyMessageChannel = PubSubChannel.for<MyMessage>(
  "MyMessage", {
    broadcast: true,
    cache: false,
    trace: false
  }
);

MyMessageChannel.publish({ name: "Foo", greeting: "Hi!" });
```

> **Or,** just publish/broadcast using default channel settings

```ts
PubSubChannel.publish("MyMessage", { name: "Foo", greeting: "Hi!" });
//or
PubSubChannel.broadcast("MyMessage", { name: "Foo", greeting: "Hi!" });
```

MyMessageConsumer.ts

```ts
import { PubSubChannel, ReqRepChannel } from "browser-message-broker";
type MyMessage = { name: string; greeting: string }
const MyMessageChannel = PubSubChannel.for<MyMessage>(
  "MyMessage", {
    broadcast: true,
    cache: false,
    trace: false
  }
);

MyMessageChannel.subscribe((msg: MyMessage)=>{
    console.log(msg)
})
```

Request/Reply

```ts
import { PubSubChannel, ReqRepChannel } from "browser-message-broker";

type TReq = { reqPayload: string };
type TRep = { respPayload: string };

// Shared Worker (consumer)
ReqRepChannel.for<TReq, TRep>(
  "GetData", 
  { broadcast: true }
).reply((req: TReq)=>{
  return  { respPayload: "Hello " + req.reqPayload   }
});

// Window (producer)
const req: TReq = { reqPayload: "Bob" };

const reply: TResp = 
await ReqRepChannel.for<TReq, TRep>(
 "GetData", 
 { broadcast: true }
).request(undefined);

console.log(reply)// { "respPayload": "Hello Bob" }
```
