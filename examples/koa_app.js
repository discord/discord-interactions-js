const Koa = require('koa');
const bodyParser = require('koa-bodyparser');
const { InteractionType, InteractionResponseType, verifyKeyKoaMiddleware } = require('../dist');

const app = new Koa();

app.use(bodyParser());
app.use(verifyKeyKoaMiddleware(process.env.CLIENT_PUBLIC_KEY));
app.use((ctx) => {
  if (ctx.request.path !== '/interactions') return;

  const interaction = ctx.request.body;
  if (interaction.type === InteractionType.COMMAND) {
    ctx.body = {
      type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
      data: {
        content: 'Hello world',
      },
    };
  }
});

app.listen(8999, () => {
  console.log('Example app listening at http://localhost:8999');
});
