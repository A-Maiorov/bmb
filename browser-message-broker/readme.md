# Browser Message Broker

## Conventions

- Pub-Sub messages are persistent: last sent message is saved and can be retrieved at any time using: `BMB.GetState()`
  