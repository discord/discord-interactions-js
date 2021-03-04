const { InteractionResponseType, InteractionType, verifyKey } = require('discord-interactions');

const CLIENT_PUBLIC_KEY = process.env.CLIENT_PUBLIC_KEY;

module.exports.myInteraction = async (req, res) => {
  // Verify the request
  const signature = req.get('X-Signature-Ed25519');
  const timestamp = req.get('X-Signature-Timestamp');
  const isValidRequest = await verifyKey(req.rawBody, signature, timestamp, CLIENT_PUBLIC_KEY);
  if (!isValidRequest) {
    return res.status(401).end('Bad request signature');
  }

  // Handle the payload
  const interaction = req.body;
  if (interaction && interaction.type === InteractionType.APPLICATION_COMMAND) {
    res.send({
      type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
      data: {
        content: `You used: ${interaction.data.name}`,
      },
    });
  } else {
    res.send({
      type: InteractionResponseType.PONG,
    });
  }
};
