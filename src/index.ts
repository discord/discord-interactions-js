import nacl from 'tweetnacl';
import type { Request, Response, NextFunction } from 'express';

/**
 * The type of interaction this request is.
 */
enum InteractionType {
  /**
   * A ping.
   */
  PING = 1,
  /**
   * A command invocation.
   */
  APPLICATION_COMMAND = 2,
  /**
   * Usage of a message's component.
   */
  MESSAGE_COMPONENT = 3,
  /**
   * An interaction sent when an application command option is filled out.
   */
  APPLICATION_COMMAND_AUTOCOMPLETE = 4,
  /**
   * An interaction sent when a modal is submitted.
   */
  MODAL_SUBMIT = 5,
}

/**
 * The type of response that is being sent.
 */
enum InteractionResponseType {
  /**
   * Acknowledge a `PING`.
   */
  PONG = 1,
  /**
   * Respond with a message, showing the user's input.
   */
  CHANNEL_MESSAGE_WITH_SOURCE = 4,
  /**
   * Acknowledge a command without sending a message, showing the user's input. Requires follow-up.
   */
  DEFERRED_CHANNEL_MESSAGE_WITH_SOURCE = 5,
  /**
   * Acknowledge an interaction and edit the original message that contains the component later; the user does not see a loading state.
   */
  DEFERRED_UPDATE_MESSAGE = 6,
  /**
   * Edit the message the component was attached to.
   */
  UPDATE_MESSAGE = 7,
  /*
   * Callback for an app to define the results to the user.
   */
  APPLICATION_COMMAND_AUTOCOMPLETE_RESULT = 8,
  /*
   * Respond with a modal.
   */
  MODAL = 9,
}

/**
 * Flags that can be included in an Interaction Response.
 */
enum InteractionResponseFlags {
  /**
   * Show the message only to the user that performed the interaction. Message
   * does not persist between sessions.
   */
  EPHEMERAL = 1 << 6,
}

/**
 * Converts different types to Uint8Array.
 *
 * @param value - Value to convert. Strings are parsed as hex.
 * @param format - Format of value. Valid options: 'hex'. Defaults to utf-8.
 * @returns Value in Uint8Array form.
 */
function valueToUint8Array(value: Uint8Array | ArrayBuffer | Buffer | string, format?: string): Uint8Array {
  if (value == null) {
    return new Uint8Array();
  }
  if (typeof value === 'string') {
    if (format === 'hex') {
      const matches = value.match(/.{1,2}/g);
      if (matches == null) {
        throw new Error('Value is not a valid hex string');
      }
      const hexVal = matches.map((byte: string) => parseInt(byte, 16));
      return new Uint8Array(hexVal);
    } else {
      return new TextEncoder().encode(value);
    }
  }
  try {
    if (Buffer.isBuffer(value)) {
      return new Uint8Array(value);
    }
  } catch (ex) {
    // Runtime doesn't have Buffer
  }
  if (value instanceof ArrayBuffer) {
    return new Uint8Array(value);
  }
  if (value instanceof Uint8Array) {
    return value;
  }
  throw new Error('Unrecognized value type, must be one of: string, Buffer, ArrayBuffer, Uint8Array');
}

/**
 * Merge two arrays.
 *
 * @param arr1 - First array
 * @param arr2 - Second array
 * @returns Concatenated arrays
 */
function concatUint8Arrays(arr1: Uint8Array, arr2: Uint8Array): Uint8Array {
  const merged = new Uint8Array(arr1.length + arr2.length);
  merged.set(arr1);
  merged.set(arr2, arr1.length);
  return merged;
}

/**
 * Validates a payload from Discord against its signature and key.
 *
 * @param rawBody - The raw payload data
 * @param signature - The signature from the `X-Signature-Ed25519` header
 * @param timestamp - The timestamp from the `X-Signature-Timestamp` header
 * @param clientPublicKey - The public key from the Discord developer dashboard
 * @returns Whether or not validation was successful
 */
function verifyKey(
  rawBody: Uint8Array | ArrayBuffer | Buffer | string,
  signature: Uint8Array | ArrayBuffer | Buffer | string,
  timestamp: Uint8Array | ArrayBuffer | Buffer | string,
  clientPublicKey: Uint8Array | ArrayBuffer | Buffer | string,
): boolean {
  try {
    const timestampData = valueToUint8Array(timestamp);
    const bodyData = valueToUint8Array(rawBody);
    const message = concatUint8Arrays(timestampData, bodyData);

    const signatureData = valueToUint8Array(signature, 'hex');
    const publicKeyData = valueToUint8Array(clientPublicKey, 'hex');
    return nacl.sign.detached.verify(message, signatureData, publicKeyData);
  } catch (ex) {
    console.error('[discord-interactions]: Invalid verifyKey parameters', ex);
    return false;
  }
}

/**
 * Creates a middleware function for use in Express-compatible web servers.
 *
 * @param clientPublicKey - The public key from the Discord developer dashboard
 * @returns The middleware function
 */
function verifyKeyMiddleware(clientPublicKey: string): (req: Request, res: Response, next: NextFunction) => void {
  if (!clientPublicKey) {
    throw new Error('You must specify a Discord client public key');
  }

  return function (req: Request, res: Response, next: NextFunction) {
    const timestamp = (req.header('X-Signature-Timestamp') || '') as string;
    const signature = (req.header('X-Signature-Ed25519') || '') as string;

    function onBodyComplete(rawBody: Buffer) {
      if (!verifyKey(rawBody, signature, timestamp, clientPublicKey)) {
        res.statusCode = 401;
        res.end('[discord-interactions] Invalid signature');
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

      req.body = body;
      next();
    }

    if (req.body) {
      if (Buffer.isBuffer(req.body)) {
        onBodyComplete(req.body);
      } else if (typeof req.body === 'string') {
        onBodyComplete(Buffer.from(req.body, 'utf-8'));
      } else {
        console.warn(
          '[discord-interactions]: req.body was tampered with, probably by some other middleware. We recommend disabling middleware for interaction routes so that req.body is a raw buffer.',
        );
        // Attempt to reconstruct the raw buffer. This works but is risky
        // because it depends on JSON.stringify matching the Discord backend's
        // JSON serialization.
        onBodyComplete(Buffer.from(JSON.stringify(req.body), 'utf-8'));
      }
    } else {
      const chunks: Array<Buffer> = [];
      req.on('data', (chunk) => {
        chunks.push(chunk);
      });
      req.on('end', () => {
        const rawBody = Buffer.concat(chunks);
        onBodyComplete(rawBody);
      });
    }
  };
}

export { InteractionType, InteractionResponseType, InteractionResponseFlags, verifyKey, verifyKeyMiddleware };
export * from './components';
