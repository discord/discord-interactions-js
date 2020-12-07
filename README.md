discord-interactions
---

Types and helper functions that may come in handy when you implement a Discord Interactions webhook.

## Installation

```
npm install discord-interactions
```

## Usage

Use the `InteractionType` and `InteractionResponseType` enums to figure out how to respond to a webhook.

Use `verifyKey` to check a request signature (requires installation of `noble-ed25519` package):

```
 const signature = req.get('X-Signature-Ed25519');
 const timestamp = req.get('X-Signature-Timestamp');
 const isValidRequest = await verifyKey(req.rawBody, signature, timestamp, 'MY_CLIENT_PUBLIC_KEY');
 if (!isValidRequest) {
   return res.status(403).end('Bad request signature');
 }
```

Note that `req.rawBody` must be populated by a middleware (it is also set by some cloud function providers).

If you're using an express-like API, you can simplify things by using the `verifyKeyMiddleware`.  For example:

```js
app.post('/interactions', verifyKeyMiddleware('MY_CLIENT_PUBLIC_KEY'), (req, res) => {
  const message = req.body;
  if (message.type === InteractionType.COMMAND) {
    res.send({
      type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
      data: {
        content: 'Hello world',
      },
    });
  }
});
```

Make sure to include this middleware before other middlewares like body-parser.

## Exports

This module exports the following:

### InteractionType

An enum of interaction types that can be POSTed to your webhook endpoint.

### InteractionResponseType

An enum of response types you may provide in reply to Discord's webhook.

### InteractionResponseFlags

An enum of flags you can set on your response data.

### verifyKey(rawBody: Buffer, signature: string, timestamp: string, clientPublicKey: string): Promise<boolean>

Verify a signed payload POSTed to your webhook endpoint.

### verifyKeyMiddleware(clientPublicKey: string)

Express-style middleware that will verify request signatures (make sure you include this before any other middleware that modifies the request body).
