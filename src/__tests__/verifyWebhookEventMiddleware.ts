import type * as http from 'node:http';
import type { AddressInfo } from 'node:net';
import type { Request, Response } from 'express';
import express from 'express';
import { verifyWebhookEventMiddleware } from '../index';
import { subtleCrypto } from '../util';
import { WebhookEventType, WebhookType } from '../webhooks';
import {
	generateKeyPair,
	sendExampleRequest,
	signRequestWithKeyPair,
} from './utils/SharedTestUtils';

const expressApp = express();

// Example webhook ping request body
const webhookPingRequestBody = JSON.stringify({
	type: WebhookType.PING,
});

// Example webhook event request body
const webhookEventRequestBody = JSON.stringify({
	type: WebhookType.EVENT,
	event: {
		type: WebhookEventType.APPLICATION_AUTHORIZED,
		data: {
			user: {
				id: '123456789',
				username: 'testuser',
			},
			guild_id: '987654321',
		},
	},
});

let requestBody: unknown;
let expressAppServer: http.Server;
let exampleWebhookUrl: string;

describe('verify webhook event middleware', () => {
	let validKeyPair: CryptoKeyPair;
	let invalidKeyPair: CryptoKeyPair;

	afterEach(() => {
		requestBody = undefined;
		jest.restoreAllMocks();
	});

	beforeAll(async () => {
		validKeyPair = await generateKeyPair();
		invalidKeyPair = await generateKeyPair();
		const rawPublicKey = Buffer.from(
			await subtleCrypto.exportKey('raw', validKeyPair.publicKey),
		).toString('hex');

		expressApp.post(
			'/webhook',
			(req, _res, next) => {
				if (requestBody) {
					req.body = requestBody;
				}
				next();
			},
			verifyWebhookEventMiddleware(rawPublicKey),
			(_req: Request, res: Response) => {
				// This handler will be reached but the response has already been sent
				// by the middleware with 204 status
				if (!res.headersSent) {
					res.send({ processed: true });
				}
			},
		);

		await new Promise<void>((resolve) => {
			expressAppServer = expressApp.listen(0);
			resolve();
		});
		exampleWebhookUrl = `http://localhost:${
			(expressAppServer.address() as AddressInfo).port
		}/webhook`;
	});

	it('valid webhook ping', async () => {
		// Sign and verify a valid webhook ping request
		const signedRequest = await signRequestWithKeyPair(
			webhookPingRequestBody,
			validKeyPair.privateKey,
		);
		const exampleRequestResponse = await sendExampleRequest(
			exampleWebhookUrl,
			{
				'x-signature-ed25519': signedRequest.signature,
				'x-signature-timestamp': signedRequest.timestamp,
				'content-type': 'application/json',
			},
			signedRequest.body,
		);
		expect(exampleRequestResponse.status).toBe(204);
		expect(exampleRequestResponse.body).toBe('');
	});

	it('valid webhook event', async () => {
		// Sign and verify a valid webhook event request
		const signedRequest = await signRequestWithKeyPair(
			webhookEventRequestBody,
			validKeyPair.privateKey,
		);
		const exampleRequestResponse = await sendExampleRequest(
			exampleWebhookUrl,
			{
				'x-signature-ed25519': signedRequest.signature,
				'x-signature-timestamp': signedRequest.timestamp,
				'content-type': 'application/json',
			},
			signedRequest.body,
		);
		expect(exampleRequestResponse.status).toBe(204);
		expect(exampleRequestResponse.body).toBe('');
	});

	it('invalid key', async () => {
		// Sign a request with a different private key and verify with the valid public key
		const signedRequest = await signRequestWithKeyPair(
			webhookPingRequestBody,
			invalidKeyPair.privateKey,
		);
		const exampleRequestResponse = await sendExampleRequest(
			exampleWebhookUrl,
			{
				'x-signature-ed25519': signedRequest.signature,
				'x-signature-timestamp': signedRequest.timestamp,
				'content-type': 'application/json',
			},
			signedRequest.body,
		);
		expect(exampleRequestResponse.status).toBe(401);
	});

	it('invalid body', async () => {
		// Sign a valid request and verify with an invalid body
		const signedRequest = await signRequestWithKeyPair(
			webhookPingRequestBody,
			validKeyPair.privateKey,
		);
		const exampleRequestResponse = await sendExampleRequest(
			exampleWebhookUrl,
			{
				'x-signature-ed25519': signedRequest.signature,
				'x-signature-timestamp': signedRequest.timestamp,
				'content-type': 'application/json',
			},
			'example invalid body',
		);
		expect(exampleRequestResponse.status).toBe(401);
	});

	it('invalid signature', async () => {
		// Sign a valid request and verify with an invalid signature
		const signedRequest = await signRequestWithKeyPair(
			webhookPingRequestBody,
			validKeyPair.privateKey,
		);
		const exampleRequestResponse = await sendExampleRequest(
			exampleWebhookUrl,
			{
				'x-signature-ed25519': 'example invalid signature',
				'x-signature-timestamp': signedRequest.timestamp,
				'content-type': 'application/json',
			},
			signedRequest.body,
		);
		expect(exampleRequestResponse.status).toBe(401);
	});

	it('invalid timestamp', async () => {
		// Sign a valid request and verify with an invalid timestamp
		const signedRequest = await signRequestWithKeyPair(
			webhookPingRequestBody,
			validKeyPair.privateKey,
		);
		const exampleRequestResponse = await sendExampleRequest(
			exampleWebhookUrl,
			{
				'x-signature-ed25519': signedRequest.signature,
				'x-signature-timestamp': String(Math.round(Date.now() / 1000) - 10000),
				'content-type': 'application/json',
			},
			signedRequest.body,
		);
		expect(exampleRequestResponse.status).toBe(401);
	});

	it('missing headers', async () => {
		// Send a request without required headers
		const exampleRequestResponse = await sendExampleRequest(
			exampleWebhookUrl,
			{
				'content-type': 'application/json',
			},
			webhookPingRequestBody,
		);
		expect(exampleRequestResponse.status).toBe(401);
	});

	it('missing public key', async () => {
		expect(() => verifyWebhookEventMiddleware('')).toThrow(
			'You must specify a Discord client public key',
		);
	});

	it('handles string bodies from middleware', async () => {
		const signedRequest = await signRequestWithKeyPair(
			webhookPingRequestBody,
			validKeyPair.privateKey,
		);
		requestBody = signedRequest.body;
		const exampleRequestResponse = await sendExampleRequest(
			exampleWebhookUrl,
			{
				'x-signature-ed25519': signedRequest.signature,
				'x-signature-timestamp': signedRequest.timestamp,
				'content-type': 'application/json',
			},
			'',
		);
		expect(exampleRequestResponse.status).toBe(204);
	});

	it('warns on unknown bodies from middleware', async () => {
		const warnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {
			return;
		});
		const signedRequest = await signRequestWithKeyPair(
			webhookPingRequestBody,
			validKeyPair.privateKey,
		);
		requestBody = JSON.parse(signedRequest.body);
		const exampleRequestResponse = await sendExampleRequest(
			exampleWebhookUrl,
			{
				'x-signature-ed25519': signedRequest.signature,
				'x-signature-timestamp': signedRequest.timestamp,
				'content-type': 'application/json',
			},
			'',
		);
		expect(exampleRequestResponse.status).toBe(204);
		expect(warnSpy).toBeCalled();
	});

	it('handles route handler attempting to modify already-sent response', async () => {
		// Create a separate test app with a route handler that tries to modify the response
		const testApp = express();
		const rawPublicKey = Buffer.from(
			await subtleCrypto.exportKey('raw', validKeyPair.publicKey),
		).toString('hex');

		// Spy on console.error to catch any errors
		const errorSpy = jest.spyOn(console, 'error').mockImplementation(() => {
			return;
		});

		testApp.post(
			'/webhook-test',
			verifyWebhookEventMiddleware(rawPublicKey),
			(_req: Request, res: Response) => {
				// This handler tries to send a response after middleware already sent one
				try {
					res.json({ shouldFail: true });
				} catch (error) {
					// Catch any errors from trying to modify already-sent response
					console.error('Error in route handler:', error);
				}
			},
		);

		const testServer = testApp.listen(0);
		const testUrl = `http://localhost:${
			(testServer.address() as AddressInfo).port
		}/webhook-test`;

		const signedRequest = await signRequestWithKeyPair(
			webhookEventRequestBody,
			validKeyPair.privateKey,
		);

		const response = await sendExampleRequest(
			testUrl,
			{
				'x-signature-ed25519': signedRequest.signature,
				'x-signature-timestamp': signedRequest.timestamp,
				'content-type': 'application/json',
			},
			signedRequest.body,
		);

		// The middleware should still return 204, regardless of what the handler tries to do
		expect(response.status).toBe(204);
		expect(response.body).toBe('');

		testServer.close();
		errorSpy.mockRestore();
	});
});

afterAll(() => {
	if (expressAppServer) {
		expressAppServer.close();
	}
});
