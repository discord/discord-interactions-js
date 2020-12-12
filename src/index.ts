import type { IncomingMessage, ServerResponse } from 'http';
import { verify as edVerify } from 'noble-ed25519';
import { Context, Next } from 'koa';

/**
 * The type of interaction this request is.
 */
const InteractionType: { [interactionType: string]: number } = Object.freeze({
  /**
   * A ping.
   */
  PING: 1,
  /**
   * A command invocation.
   */
  COMMAND: 2,
});

/**
 * The type of response that is being sent.
 */
const InteractionResponseType: { [interactionType: string]: number } = Object.freeze({
  /**
   * Acknowledge a `PING`.
   */
  PONG: 1,
  /**
   * Acknowledge a command without sending a message.
   */
  ACKNOWLEDGE: 2,
  /**
   * Respond with a message.
   */
  CHANNEL_MESSAGE: 3,
  /**
   * Respond with a message, showing the user's input.
   */
  CHANNEL_MESSAGE_WITH_SOURCE: 4,
  /**
   * Acknowledge a command without sending a message, showing the user's input.
   */
  ACKNOWLEDGE_WITH_SOURCE: 5,
});

const InteractionResponseFlags: { [flagName: string]: number } = Object.freeze({
  EPHEMERAL: 1 << 6,
});

/**
 * Validates a payload from Discord against its signature and key.
 *
 * @param rawBody - The raw payload data
 * @param signature - The signature from the `X-Signature-Ed25519` header
 * @param timestamp - The timestamp from the `X-Signature-Timestamp` header
 * @param clientPublicKey - The public key from the Discord developer dashboard
 * @returns Whether or not validation was successful
 */
async function verifyKey(
  rawBody: Buffer,
  signature: string,
  timestamp: string,
  clientPublicKey: string,
): Promise<boolean> {
  return await edVerify(signature, Buffer.concat([Buffer.from(timestamp, 'utf-8'), rawBody]), clientPublicKey);
}

type NextFunction = (err?: Error) => void;

/**
 * Creates a middleware function for use in Express-compatible web servers.
 *
 * @param clientPublicKey - The public key from the Discord developer dashboard
 * @returns The middleware function
 */
function verifyKeyExpressMiddleware(
  clientPublicKey: string,
): (req: IncomingMessage, res: ServerResponse, next: NextFunction) => void {
  if (!clientPublicKey) {
    throw new Error('You must specify a Discord client public key');
  }
  return async function (req: IncomingMessage, res: ServerResponse, next: NextFunction) {
    const timestamp = (req.headers['X-Signature-Timestamp'] || '') as string;
    const signature = (req.headers['X-Signature-Ed25519'] || '') as string;

    const chunks: Array<Buffer> = [];
    req.on('data', function (chunk) {
      chunks.push(chunk);
    });
    req.on('end', async function () {
      const rawBody = Buffer.concat(chunks);
      if (!(await verifyKey(rawBody, signature, timestamp, clientPublicKey))) {
        res.statusCode = 401;
        res.end('Invalid signature');
        return;
      }

      const body = JSON.parse(rawBody.toString('utf-8')) || {};

      if (body.type === InteractionType.PING) {
        res.setHeader('Content-Type', 'application/json');
        res.end(
          JSON.stringify({
            type: InteractionResponseType.PONG,
          }),
        );
        return;
      }

      next();
    });
  };
}

/**
 * Creates a middleware function for use in Koa-compatible web servers.
 *
 * @param clientPublicKey - The public key from the Discord developer dashboard
 * @returns The middleware function
 */
function verifyKeyKoaMiddleware(clientPublicKey: string) {
  if (!clientPublicKey) {
    throw new Error('You must specify a Discord client public key');
  }

  return async function (ctx: Context, next: Next) {
    const timestamp = ctx.get('X-Signature-Timestamp') || '';
    const signature = ctx.get('X-Signature-Ed25519') || '';

    const { rawBody } = ctx.request;

    if (!(await verifyKey(Buffer.from(rawBody), signature, timestamp, clientPublicKey))) {
      ctx.status = 401;
      ctx.body = 'Invalid signature';
      return;
    }

    const body = JSON.parse(rawBody) || {};

    if (body.type === InteractionType.PING) {
      ctx.set('Content-Type', 'application/json');
      ctx.body = {
        type: InteractionResponseType.PONG,
      };
      return;
    }

    await next();
  };
}

export {
  InteractionType,
  InteractionResponseType,
  InteractionResponseFlags,
  verifyKey,
  verifyKeyExpressMiddleware,
  verifyKeyKoaMiddleware,
};
