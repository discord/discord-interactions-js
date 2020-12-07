import type { Request, Response, NextFunction } from 'express';

const InteractionType: { [interactionType: string]: number } = Object.freeze({
  PING: 1,
  COMMAND: 2,
});

const InteractionResponseType: { [interactionType: string]: number } = Object.freeze({
  PONG: 1,
  ACKNOWLEDGE: 2,
  CHANNEL_MESSAGE: 3,
  CHANNEL_MESSAGE_WITH_SOURCE: 4,
  ACKNOWLEDGE_WITH_SOURCE: 5,
});

const InteractionResponseFlags: { [flagName: string]: number } = Object.freeze({
  EPHEMERAL: 1 << 6,
});

async function verifyKey(
  rawBody: Buffer,
  signature: string,
  timestamp: string,
  clientPublicKey: string,
): Promise<boolean> {
  const ed = require('noble-ed25519');
  return await ed.verify(signature, Buffer.concat([Buffer.from(timestamp, 'utf-8'), rawBody]), clientPublicKey);
}

function verifyKeyMiddleware(clientPublicKey: string) {
  if (!clientPublicKey) {
    throw new Error('You must specify a Discord client public key');
  }
  return async function (req: Request, res: Response, next: NextFunction) {
    const timestamp = req.get('X-Signature-Timestamp') || '';
    const signature = req.get('X-Signature-Ed25519') || '';

    const chunks: Array<Buffer> = [];
    req.on('data', function (chunk) {
      chunks.push(chunk);
    });
    req.on('end', async function () {
      const rawBody = Buffer.concat(chunks);
      if (!(await verifyKey(rawBody, signature, timestamp, clientPublicKey))) {
        res.status(403).end('Invalid signature');
        return;
      }
      req.body = JSON.parse(rawBody.toString('utf-8')) || {};

      if (req.body.type === InteractionType.PING) {
        res
          .json({
            type: InteractionResponseType.PONG,
          })
          .end();
        return;
      }

      next();
    });
  };
}

module.exports = {
  InteractionType,
  InteractionResponseType,
  InteractionResponseFlags,
  verifyKey,
  verifyKeyMiddleware,
};
