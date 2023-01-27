// ./pages/api/interaction.js

const { InteractionType, InteractionResponseType, verifyKeyMiddleware } = require('../dist');

function runMiddleware(req, res, fn) {
  return new Promise((resolve, reject) => {
    req.header = (name) => req.headers[name.toLowerCase()];
    req.body = JSON.stringify(req.body);
    fn(req, res, (result) => {
      if (result instanceof Error) return reject(result);
      return resolve(result);
    });
  });
}

export default async function handler(req, res) {
  await runMiddleware(req, res, verifyKeyMiddleware(process.env.CLIENT_PUBLIC_KEY));

  const interaction = req.body;
  if (interaction.type === InteractionType.APPLICATION_COMMAND) {
    res.send({
      type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
      data: {
        content: 'Hello world',
      },
    });
  }
}
