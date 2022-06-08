# Todo-app based on browser-message-broker

This is a minimalistic spa that consists of several independent components:

- todo-editor
- todo-list
- todo-app
- sharedWorker

All components are bundled in separate js files and completely independent

**todo-list** and **todo-app** are loaded in iframes

**sharedWorker** is registered via todo-app component and serves as a DAL and single source of truth for browser tabs

## Getting started

Install dependencies

```sh
npm i
```

Start

```sh
npm start
```

Open multiple tabs and try to use the app

You can see the worker via chrome://inspect/#workers
