# BMB - BrowserMessageBroker

> ⚠️ **EXPERIMENTAL AND POORLY TESTED!** Use at your own risk

![Tests](https://github.com/A-Maiorov/bmb/actions/workflows/test.yml/badge.svg)
[![Published on npm](https://img.shields.io/npm/v/browser-message-broker.svg?logo=npm)](https://www.npmjs.com/package/browser-message-broker)

BMB is a tiny message broker (only 1.4 kb compressed) that supports Publish/Subscribe messaging pattern across multiple scripting contexts of the same origin (Tabs, Ifames, Service Workers, Dedicated and Shared Worker). It uses [BroadcastChannel](https://developer.mozilla.org/en-US/docs/Web/API/BroadcastChannel#browser_compatibility) as a unified way of communication between different contexts.

## Potential use cases

- Communication between independent scripts or web components or micro frontends
- Communication between multiple tabs and workers

## Features

- Unified api to to send messages within single scripting contexts and/or bridge them to other contexts
- Messages caching and automatic synchronisation of the contexts

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

Or

```ts
BMB.publish("my-message", { name: "Foo", greeting: "Hi!" });
```

Open two browser tabs and see message in DevTools console in both tabs

## Examples

See `/examples/todo-app` in this repo

[Todo-app example readme](/examples/todo-app/readme.md)
