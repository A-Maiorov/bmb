# BMB - BrowserMessageBroker

> [!WARNING]
> EXPERIMENTAL AND POORLY TESTED! Use on your own risk.

BMB is a tiny message broker (only 1.4 kb compressed) that supports Publish/Subscribe messaging pattern across multiple scripting contexts of the same origin (Tabs, Service Worker, Dedicated and Shared Worker).

## Potential use cases

- Communication between independent scripts or web components or micro frontends
- Communication between multiple tabs and workers

## Features

- Unified api to to send messages within single scripting contexts and/or bridge them to other contexts
- Messages caching and automatic synchronisation of the contexts

## Getting started

Install:

```console
npm install browser-message-broker --save-dev
```

Import:

```js
import { BMB } from "browser-message-broker";
```

Configure subscription

```ts
type MyMessage = { name: string; greeting: string }
const myMessageSubscription = BMB.Subscribe<MyMessage>(
  "my-message", //message name
  (msg)=> console.log(msg), //handler, msg will be of type MySessage
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
