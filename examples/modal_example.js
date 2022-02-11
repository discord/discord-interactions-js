const express = require('express');
const { InteractionType, InteractionResponseType, verifyKeyMiddleware, ModalBuilder: { modal, MODAL_COMPONENTS: { textInput, paragraphInput } } } = require('../dist');

const app = express();

app.post('/interactions', verifyKeyMiddleware(process.env.CLIENT_PUBLIC_KEY), (req, res) => {
  const interaction = req.body;
  if (interaction.type === InteractionType.APPLICATION_COMMAND) {
    res.send({
      type: InteractionResponseType.APPLICATION_MODAL,
      data: modal({
        title: 'Test',
        custom_id: 'test-modal',
        components: [
          textInput({
            label: 'Short Input',
            custom_id: 'short-input',
            placeholder: 'Short Input',
          }),
          paragraphInput({
            label: 'Paragraph Input',
            custom_id: 'paragraph-input',
            placeholder: 'Paragraph Input',
            required: false
          }),
        ],
      }),
    });
  }
});

app.listen(8999, () => {
  console.log('Example app listening at http://localhost:8999');
});
