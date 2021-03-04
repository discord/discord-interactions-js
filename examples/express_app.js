const express = require('express');
const { InteractionType, InteractionResponseType, verifyKeyMiddleware } = require('../dist');

const app = express();

app.post('/interactions', verifyKeyMiddleware(process.env.CLIENT_PUBLIC_KEY), (req, res) => {
  const interaction = req.body;
  if (interaction.type === InteractionType.APPLICATION_COMMAND) {
    res.send({
      type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
      data: {
        content: 'Hello world',
      },
    });
  }
});

app.listen(8999, () => {
  console.log('Example app listening at http://localhost:8999');
});
