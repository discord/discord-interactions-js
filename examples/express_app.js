const express = require('express');
const util = require('node:util');
const {
	InteractionType,
	InteractionResponseType,
	verifyKeyMiddleware,
	verifyWebhookEventMiddleware,
} = require('../dist');

const app = express();

app.post(
	'/interactions',
	verifyKeyMiddleware(process.env.CLIENT_PUBLIC_KEY),
	(req, res) => {
		const interaction = req.body;
		if (interaction.type === InteractionType.APPLICATION_COMMAND) {
			res.send({
				type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
				data: {
					content: 'Hello world',
				},
			});
		}
	},
);

app.post(
	'/events',
	verifyWebhookEventMiddleware(process.env.CLIENT_PUBLIC_KEY),
	(req, _res) => {
		console.log('📨 Event Received!');
		console.log(
			util.inspect(req.body, { showHidden: false, colors: true, depth: null }),
		);
	},
);

// Simple health check, to also make it easy to check if the app is up and running
app.get('/health', (_req, res) => {
	res.send('ok');
});

app.listen(8999, () => {
	console.log('Example app listening at http://localhost:8999');
});
