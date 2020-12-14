const Koa = require('koa');
const Router = require('koa-router');
const bodyParser = require('koa-bodyparser');
const { InteractionType, InteractionResponseType, verifyKeyKoaMiddleware } = require('../dist');

const app = new Koa();
const router = new Router();

app.use(bodyParser());

router.post('/interactions', verifyKeyKoaMiddleware(process.env.CLIENT_PUBLIC_KEY), (ctx) => {
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
