# discord-interactions

---
[![version](https://img.shields.io/npm/v/discord-interactions.svg)](https://www.npmjs.com/package/discord-interactions)
[![ci](https://github.com/discord/discord-interactions-js/actions/workflows/ci.yaml/badge.svg)](https://github.com/discord/discord-interactions-js/actions/workflows/ci.yaml)
![Downloads](https://img.shields.io/npm/dt/discord-interactions)

Types and helper functions that may come in handy when you implement a Discord webhook.

## Overview

This library provides a simple interface for working with Discord webhooks, including both slash command interactions
and webhook events. You can build applications that:

- Handle [Interactions](https://discord.com/developers/docs/interactions/overview) when users send commands to your app
- Process [Webhook Events](https://discord.com/developers/docs/events/webhook-events) to receive real-time notifications
  about activities in your Discord server

When users interact with your application or when events occur in your Discord server, Discord will send HTTP requests
to your web application. This library makes it easier to:

- Verify that requests to your endpoint are actually coming from Discord (for both interactions and events)
- Integrate verification with web frameworks that
  use [connect middleware](https://expressjs.com/en/guide/using-middleware.html) (like express)
- Use lightweight enums and TypeScript types to aid in handling request payloads and responses
- Process different types of webhook payloads with type-safe interfaces

To learn more about building on Discord, see [https://discord.dev](https://discord.dev).

## Installation

```sh
npm install discord-interactions
```

## Interactions Usage

Use the `InteractionType` and `InteractionResponseType` enums to figure out how to respond to an interactions' webhook.

Use `verifyKey` to check a request signature:

```js
 const signature = req.get('X-Signature-Ed25519');
 const timestamp = req.get('X-Signature-Timestamp');
 const isValidRequest = await verifyKey(req.rawBody, signature, timestamp, 'MY_CLIENT_PUBLIC_KEY');
 if (!isValidRequest) {
   return res.status(401).end('Bad request signature');
 }
```

Note that `req.rawBody` must be populated by a middleware (it is also set by some cloud function providers).

If you're using an express-like API, you can simplify things by using the `verifyKeyMiddleware`.  For example:

```js
app.post('/interactions', verifyKeyMiddleware('MY_CLIENT_PUBLIC_KEY'), (req, res) => {
  const message = req.body;
  if (message.type === InteractionType.APPLICATION_COMMAND) {
    res.send({
      type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
      data: {
        content: 'Hello world',
      },
    });
  }
});
```

Make sure that you do not use other middlewares like `body-parser`, which tamper with the request body, for interaction routes.

### Interaction Types

The following enumerations are available to help working with interaction requests and responses. For more details, see the [examples](/examples/).

|                            |                                                                           |
|----------------------------|---------------------------------------------------------------------------|
| `InteractionType`          | An enum of interaction types that can be POSTed to your webhook endpoint. |
| `InteractionResponseType`  | An enum of response types you may provide in reply to Discord's webhook.  |
| `InteractionResponseFlags` | An enum of flags you can set on your response data.                       |

### Message Components

This library contains lightweight TypeScript types and enums that are helpful when working with [Message Components](https://discord.com/developers/docs/components/reference).  

|                         |                                                                                                                                       |
|-------------------------|---------------------------------------------------------------------------------------------------------------------------------------|
| `MessageComponentTypes` | An enum of message component types that can be used in messages and modals.                                                           |
| `ActionRow`             | Type for [Action Rows](https://discord.com/developers/docs/components/reference#action-row)                                           |
| `Button`                | Type for [Buttons](https://discord.com/developers/docs/components/reference#button)                                                   |
| `ButtonStyleTypes`      | Enum for [Button Styles](https://discord.com/developers/docs/components/reference#button-button-styles)                               |
| `StringSelect`          | Type for [String Selects](https://discord.com/developers/docs/components/reference#string-select)                                     |
| `StringSelectOption`    | Type for [String Select Options](https://discord.com/developers/docs/components/reference#string-select-select-option-structure)      |
| `UserSelect`            | Type for [User Selects](https://discord.com/developers/docs/components/reference#user-select)                                         |
| `RoleSelect`            | Type for [Role Selects](https://discord.com/developers/docs/components/reference#role-select)                                         |
| `MentionableSelect`     | Type for [Mentionable Selects](https://discord.com/developers/docs/components/reference#mentionable-select)                           |
| `ChannelSelect`         | Type for [Channel Selects](https://discord.com/developers/docs/components/reference#channel-select)                                   |
| `InputText`             | Type for [Text Inputs](https://discord.com/developers/docs/components/reference#text-input)                                           |
| `TextStyleTypes`        | Enum for [Text Style Types](https://discord.com/developers/docs/components/reference#text-input-text-input-styles)                    |
| `Section`               | Type for [Sections](https://discord.com/developers/docs/components/reference#section)                                                 |
| `TextDisplay`           | Type for [Text Displays](https://discord.com/developers/docs/components/reference#text-display)                                       |
| `Thumbnail`             | Type for [Thumbnails](https://discord.com/developers/docs/components/reference#thumbnail)                                             |
| `MediaGallery`          | Type for [Media Galleries](https://discord.com/developers/docs/components/reference#media-gallery)                                    |
| `MediaGalleryItem`      | Type for [Media Gallery Item](https://discord.com/developers/docs/components/reference#media-gallery-media-gallery-item-structure)    |
| `FileComponent`         | Type for [File Components](https://discord.com/developers/docs/components/reference#file)                                             |
| `Separator`             | Type for [Separators](https://discord.com/developers/docs/components/reference#separator)                                             |
| `Container`             | Type for [Containers](https://discord.com/developers/docs/components/reference#container)                                             |
| `UnfurledMediaItem`     | Type for [Unfurled Media Item](https://discord.com/developers/docs/components/reference#unfurled-media-item-structure)                |


The following enumerations are available to help working with Webhook events. For more details, see the 
[examples](/examples/).

## Webhook Event Usage

Use the `WebhookType` and `WebhookEventType` enums to figure out how to process an event webhook.

Use `verifyKey` to check a request signature (same as above):

```js
 const signature = req.get('X-Signature-Ed25519');
 const timestamp = req.get('X-Signature-Timestamp');
 const isValidRequest = await verifyKey(req.rawBody, signature, timestamp, 'MY_CLIENT_PUBLIC_KEY');
 if (!isValidRequest) {
   return res.status(401).end('Bad request signature');
 }
```

Note that `req.rawBody` must be populated by a middleware (it is also set by some cloud function providers).

If you're using an express-like API, you can simplify things by using the `verifyWebhookEventMiddleware`.  For example:

```javascript
app.post(
	'/events',
	verifyWebhookEventMiddleware(process.env.CLIENT_PUBLIC_KEY),
	(req, res) => {
		console.log("📨 Event Received!")
        console.log(req.body);
	},
);
```

### Webhook Event Types

The following enumerations are available to help working with interaction requests and responses. 
For more details, see the [express example](/examples/express_app.js).

|                    |                                                                           |
|--------------------|---------------------------------------------------------------------------|
| `WebhookType`      | An enum of interaction types that can be POSTed to your webhook endpoint. |
| `WebhookEventType` | An enum of response types you may provide in reply to Discord's webhook.  |

For a complete list of available TypeScript types, check out [discord-api-types](https://www.npmjs.com/package/discord-api-types) package.

## Running the Examples

To run the examples:

```shell
npm run build 
export CLIENT_PUBLIC_KEY=${Your Discord App Public Key} 
node examples/express_app.js # or choose a different example
```

## Learning more

To learn more about the Discord API, visit [https://discord.dev](https://discord.dev).
