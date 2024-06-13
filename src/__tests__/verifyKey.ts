import { verifyKey } from '../index';
import {
	generateKeyPair,
	pingRequestBody,
	signRequestWithKeyPair,
} from './utils/SharedTestUtils';

describe('verify key method', () => {
	let validKeyPair: CryptoKeyPair;
	let invalidKeyPair: CryptoKeyPair;

	beforeAll(async () => {
		validKeyPair = await generateKeyPair();
		invalidKeyPair = await generateKeyPair();
	});

	it('valid ping request', async () => {
		// Sign and verify a valid ping request
		const signedRequest = await signRequestWithKeyPair(
			pingRequestBody,
			validKeyPair.privateKey,
		);
		const isValid = await verifyKey(
			signedRequest.body,
			signedRequest.signature,
			signedRequest.timestamp,
			validKeyPair.publicKey,
		);
		expect(isValid).toBe(true);
	});

	it('valid application command', async () => {
		// Sign and verify a valid application command request
		const signedRequest = await signRequestWithKeyPair(
			pingRequestBody,
			validKeyPair.privateKey,
		);
		const isValid = await verifyKey(
			signedRequest.body,
			signedRequest.signature,
			signedRequest.timestamp,
			validKeyPair.publicKey,
		);
		expect(isValid).toBe(true);
	});

	it('valid message component', async () => {
		// Sign and verify a valid message component request
		const signedRequest = await signRequestWithKeyPair(
			pingRequestBody,
			validKeyPair.privateKey,
		);
		const isValid = await verifyKey(
			signedRequest.body,
			signedRequest.signature,
			signedRequest.timestamp,
			validKeyPair.publicKey,
		);
		expect(isValid).toBe(true);
	});

	it('valid autocomplete', async () => {
		// Sign and verify a valid autocomplete request
		const signedRequest = await signRequestWithKeyPair(
			pingRequestBody,
			validKeyPair.privateKey,
		);
		const isValid = await verifyKey(
			signedRequest.body,
			signedRequest.signature,
			signedRequest.timestamp,
			validKeyPair.publicKey,
		);
		expect(isValid).toBe(true);
	});

	it('invalid key', async () => {
		// Sign a request with a different private key and verify with the valid public key
		const signedRequest = await signRequestWithKeyPair(
			pingRequestBody,
			invalidKeyPair.privateKey,
		);
		const isValid = await verifyKey(
			signedRequest.body,
			signedRequest.signature,
			signedRequest.timestamp,
			validKeyPair.publicKey,
		);
		expect(isValid).toBe(false);
	});

	it('invalid body', async () => {
		// Sign a valid request and verify with an invalid body
		const signedRequest = await signRequestWithKeyPair(
			pingRequestBody,
			validKeyPair.privateKey,
		);
		const isValid = await verifyKey(
			'example invalid body',
			signedRequest.signature,
			signedRequest.timestamp,
			validKeyPair.publicKey,
		);
		expect(isValid).toBe(false);
	});

	it('invalid signature', async () => {
		// Sign a valid request and verify with an invalid signature
		const signedRequest = await signRequestWithKeyPair(
			pingRequestBody,
			validKeyPair.privateKey,
		);
		const isValid = await verifyKey(
			signedRequest.body,
			'example invalid signature',
			signedRequest.timestamp,
			validKeyPair.publicKey,
		);
		expect(isValid).toBe(false);
	});

	it('invalid timestamp', async () => {
		// Sign a valid request and verify with an invalid timestamp
		const signedRequest = await signRequestWithKeyPair(
			pingRequestBody,
			validKeyPair.privateKey,
		);
		const isValid = await verifyKey(
			signedRequest.body,
			signedRequest.signature,
			String(Math.round(new Date().getTime() / 1000) - 10000),
			validKeyPair.publicKey,
		);
		expect(isValid).toBe(false);
	});

	it('supports array buffers', async () => {
		const signedRequest = await signRequestWithKeyPair(
			pingRequestBody,
			validKeyPair.privateKey,
		);
		const encoder = new TextEncoder();
		const bodyEncoded = encoder.encode(signedRequest.body);
		const isValid = await verifyKey(
			bodyEncoded.buffer,
			signedRequest.signature,
			signedRequest.timestamp,
			validKeyPair.publicKey,
		);
		expect(isValid).toBe(true);
	});

	it('invalid body data type', async () => {
		const signedRequest = await signRequestWithKeyPair(
			pingRequestBody,
			validKeyPair.privateKey,
		);
		const invalidBody = {} as unknown as string;
		const isValid = await verifyKey(
			invalidBody,
			signedRequest.signature,
			signedRequest.timestamp,
			validKeyPair.publicKey,
		);
		expect(isValid).toBe(false);
	});
});
