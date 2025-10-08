import type * as http from 'node:http';
import type { AddressInfo } from 'node:net';
import type { Request, Response } from 'express';
import express from 'express';
import {
	InteractionResponseFlags,
	InteractionResponseType,
	InteractionType,
	verifyKeyMiddleware,
} from '../index';
import { subtleCrypto } from '../util';
import {
	applicationCommandRequestBody,
	autocompleteRequestBody,
	generateKeyPair,
	messageComponentRequestBody,
	pingRequestBody,
	sendExampleRequest,
	signRequestWithKeyPair,
} from './utils/SharedTestUtils';

const expressApp = express();

const exampleApplicationCommandResponse = {
	type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
	data: {
		content: 'Hello world',
	},
};

const exampleMessageComponentResponse = {
	type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
	data: {
		content: 'Hello, you interacted with a component.',
		flags: InteractionResponseFlags.EPHEMERAL,
	},
};

const exampleAutocompleteResponse = {
	type: InteractionResponseType.APPLICATION_COMMAND_AUTOCOMPLETE_RESULT,
	data: {
		choices: [
			{
				name: 'The first option',
				value: 'first_option',
			},
		],
	},
};

let requestBody: unknown;
let expressAppServer: http.Server;
let exampleInteractionsUrl: string;

describe('verify key middleware', () => {
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
			'/interactions',
			(req, _res, next) => {
				if (requestBody) {
					req.body = requestBody;
				}
				next();
			},
			verifyKeyMiddleware(rawPublicKey),
			(req: Request, res: Response) => {
				const interaction = req.body;
				if (interaction.type === InteractionType.APPLICATION_COMMAND) {
					res.send(exampleApplicationCommandResponse);
				} else if (interaction.type === InteractionType.MESSAGE_COMPONENT) {
					res.send(exampleMessageComponentResponse);
				} else if (
					interaction.type === InteractionType.APPLICATION_COMMAND_AUTOCOMPLETE
				) {
					res.send(exampleAutocompleteResponse);
				}
			},
		);

		await new Promise<void>((resolve) => {
			expressAppServer = expressApp.listen(0);
			resolve();
		});
		exampleInteractionsUrl = `http://localhost:${
			(expressAppServer.address() as AddressInfo).port
		}/interactions`;
	});

	it('valid ping', async () => {
		// Sign and verify a valid ping request
		const signedRequest = await signRequestWithKeyPair(
			pingRequestBody,
			validKeyPair.privateKey,
		);
		const exampleRequestResponse = await sendExampleRequest(
			exampleInteractionsUrl,
			{
				'x-signature-ed25519': signedRequest.signature,
				'x-signature-timestamp': signedRequest.timestamp,
				'content-type': 'application/json',
			},
			signedRequest.body,
		);
		expect(exampleRequestResponse.status).toBe(200);
	});

	it('valid application command', async () => {
		// Sign and verify a valid application command request
		const signedRequest = await signRequestWithKeyPair(
			applicationCommandRequestBody,
			validKeyPair.privateKey,
		);
		const exampleRequestResponse = await sendExampleRequest(
			exampleInteractionsUrl,
			{
				'x-signature-ed25519': signedRequest.signature,
				'x-signature-timestamp': signedRequest.timestamp,
				'content-type': 'application/json',
			},
			signedRequest.body,
		);
		const exampleRequestResponseBody = JSON.parse(exampleRequestResponse.body);
		expect(exampleRequestResponseBody).toStrictEqual(
			exampleApplicationCommandResponse,
		);
	});

	it('valid message component', async () => {
		// Sign and verify a valid message component request
		const signedRequest = await signRequestWithKeyPair(
			messageComponentRequestBody,
			validKeyPair.privateKey,
		);
		const exampleRequestResponse = await sendExampleRequest(
			exampleInteractionsUrl,
			{
				'x-signature-ed25519': signedRequest.signature,
				'x-signature-timestamp': signedRequest.timestamp,
				'content-type': 'application/json',
			},
			signedRequest.body,
		);
		const exampleRequestResponseBody = JSON.parse(exampleRequestResponse.body);
		expect(exampleRequestResponseBody).toStrictEqual(
			exampleMessageComponentResponse,
		);
	});

	it('valid autocomplete', async () => {
		// Sign and verify a valid autocomplete request
		const signedRequest = await signRequestWithKeyPair(
			autocompleteRequestBody,
			validKeyPair.privateKey,
		);
		const exampleRequestResponse = await sendExampleRequest(
			exampleInteractionsUrl,
			{
				'x-signature-ed25519': signedRequest.signature,
				'x-signature-timestamp': signedRequest.timestamp,
				'content-type': 'application/json',
			},
			signedRequest.body,
		);
		const exampleRequestResponseBody = JSON.parse(exampleRequestResponse.body);
		expect(exampleRequestResponseBody).toStrictEqual(
			exampleAutocompleteResponse,
		);
	});

	it('invalid key', async () => {
		// Sign a request with a different private key and verify with the valid public key
		const signedRequest = await signRequestWithKeyPair(
			pingRequestBody,
			invalidKeyPair.privateKey,
		);
		const exampleRequestResponse = await sendExampleRequest(
			exampleInteractionsUrl,
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
			pingRequestBody,
			validKeyPair.privateKey,
		);
		const exampleRequestResponse = await sendExampleRequest(
			exampleInteractionsUrl,
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
			pingRequestBody,
			validKeyPair.privateKey,
		);
		const exampleRequestResponse = await sendExampleRequest(
			exampleInteractionsUrl,
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
			pingRequestBody,
			validKeyPair.privateKey,
		);
		const exampleRequestResponse = await sendExampleRequest(
			exampleInteractionsUrl,
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
		// Sign a valid request and verify with an invalid timestamp
		const exampleRequestResponse = await sendExampleRequest(
			exampleInteractionsUrl,
			{
				'content-type': 'application/json',
			},
			exampleInteractionsUrl,
		);
		expect(exampleRequestResponse.status).toBe(401);
	});

	it('missing public key', async () => {
		expect(() => verifyKeyMiddleware('')).toThrow(
			'You must specify a Discord client public key',
		);
	});

	it('handles string bodies from middleware', async () => {
		const signedRequest = await signRequestWithKeyPair(
			pingRequestBody,
			validKeyPair.privateKey,
		);
		requestBody = signedRequest.body;
		const exampleRequestResponse = await sendExampleRequest(
			exampleInteractionsUrl,
			{
				'x-signature-ed25519': signedRequest.signature,
				'x-signature-timestamp': signedRequest.timestamp,
				'content-type': 'application/json',
			},
			'',
		);
		expect(exampleRequestResponse.status).toBe(200);
	});

	it('warns on unknown bodies from middleware', async () => {
		const warnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {
			return;
		});
		const signedRequest = await signRequestWithKeyPair(
			pingRequestBody,
			validKeyPair.privateKey,
		);
		requestBody = JSON.parse(signedRequest.body);
		const exampleRequestResponse = await sendExampleRequest(
			exampleInteractionsUrl,
			{
				'x-signature-ed25519': signedRequest.signature,
				'x-signature-timestamp': signedRequest.timestamp,
				'content-type': 'application/json',
			},
			'',
		);
		expect(exampleRequestResponse.status).toBe(200);
		expect(warnSpy).toHaveBeenCalled();
	});
});

afterAll(() => {
	if (expressAppServer) {
		expressAppServer.close();
	}
});
