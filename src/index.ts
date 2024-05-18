import type { NextFunction, Request, Response } from 'express';
import { base64ToArrayBuffer, getSubtleCrypto } from './util';

const crypto = getSubtleCrypto();

/**
 * The type of interaction this request is.
 */
export enum InteractionType {
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
export enum InteractionResponseType {
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
	/*
	 * Respond with an upgrade prompt.
	 */
	PREMIUM_REQUIRED = 10,
}

/**
 * Flags that can be included in an Interaction Response.
 */
export enum InteractionResponseFlags {
	/**
	 * Show the message only to the user that performed the interaction. Message
	 * does not persist between sessions.
	 */
	EPHEMERAL = 1 << 6,
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
export async function verifyKey(
	rawBody: Uint8Array | ArrayBuffer | Buffer | string,
	signature: string,
	timestamp: string,
	clientPublicKey: string | CryptoKey,
): Promise<boolean> {
	try {
		const encoder = new TextEncoder();
		const publicKey =
			typeof clientPublicKey === 'string'
				? await crypto.importKey(
						'raw',
						base64ToArrayBuffer(clientPublicKey),
						{
							name: 'ed25519',
							namedCurve: 'ed25519',
						},
						false,
						['verify'],
					)
				: clientPublicKey;
		const body =
			typeof rawBody === 'string'
				? rawBody
				: Buffer.from(rawBody).toString('utf-8');
		const isValid = await crypto.verify(
			{
				name: 'ed25519',
			},
			publicKey,
			base64ToArrayBuffer(signature),
			encoder.encode(timestamp + body),
		);
		return isValid;
	} catch (ex) {
		return false;
	}
}

/**
 * Creates a middleware function for use in Express-compatible web servers.
 *
 * @param clientPublicKey - The public key from the Discord developer dashboard
 * @returns The middleware function
 */
export function verifyKeyMiddleware(
	clientPublicKey: string,
): (req: Request, res: Response, next: NextFunction) => void {
	if (!clientPublicKey) {
		throw new Error('You must specify a Discord client public key');
	}

	return async (req: Request, res: Response, next: NextFunction) => {
		const timestamp = req.header('X-Signature-Timestamp') || '';
		const signature = req.header('X-Signature-Ed25519') || '';

		if (!timestamp || !signature) {
			res.statusCode = 401;
			res.end('[discord-interactions] Invalid signature');
			return;
		}

		async function onBodyComplete(rawBody: Buffer) {
			const isValid = await verifyKey(
				rawBody,
				signature,
				timestamp,
				clientPublicKey,
			);
			if (!isValid) {
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
				await onBodyComplete(req.body);
			} else if (typeof req.body === 'string') {
				await onBodyComplete(Buffer.from(req.body, 'utf-8'));
			} else {
				console.warn(
					'[discord-interactions]: req.body was tampered with, probably by some other middleware. We recommend disabling middleware for interaction routes so that req.body is a raw buffer.',
				);
				// Attempt to reconstruct the raw buffer. This works but is risky
				// because it depends on JSON.stringify matching the Discord backend's
				// JSON serialization.
				await onBodyComplete(Buffer.from(JSON.stringify(req.body), 'utf-8'));
			}
		} else {
			const chunks: Array<Buffer> = [];
			req.on('data', (chunk) => {
				chunks.push(chunk);
			});
			req.on('end', async () => {
				const rawBody = Buffer.concat(chunks);
				await onBodyComplete(rawBody);
			});
		}
	};
}

export * from './components';
