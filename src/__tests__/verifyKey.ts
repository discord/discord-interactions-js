import { verifyKey } from '../index';
import {
	invalidKeyPair,
	pingRequestBody,
	signRequestWithKeyPair,
	validKeyPair,
} from './utils/SharedTestUtils';

describe('verify key method', () => {
	it('valid ping request', () => {
		// Sign and verify a valid ping request
		const signedRequest = signRequestWithKeyPair(
			pingRequestBody,
			validKeyPair.secretKey,
		);
		expect(
			verifyKey(
				signedRequest.body,
				signedRequest.signature,
				signedRequest.timestamp,
				validKeyPair.publicKey,
			),
		).toBe(true);
	});

	it('valid application command', () => {
		// Sign and verify a valid application command request
		const signedRequest = signRequestWithKeyPair(
			pingRequestBody,
			validKeyPair.secretKey,
		);
		expect(
			verifyKey(
				signedRequest.body,
				signedRequest.signature,
				signedRequest.timestamp,
				validKeyPair.publicKey,
			),
		).toBe(true);
	});

	it('valid message component', () => {
		// Sign and verify a valid message component request
		const signedRequest = signRequestWithKeyPair(
			pingRequestBody,
			validKeyPair.secretKey,
		);
		expect(
			verifyKey(
				signedRequest.body,
				signedRequest.signature,
				signedRequest.timestamp,
				validKeyPair.publicKey,
			),
		).toBe(true);
	});

	it('valid autocomplete', () => {
		// Sign and verify a valid autocomplete request
		const signedRequest = signRequestWithKeyPair(
			pingRequestBody,
			validKeyPair.secretKey,
		);
		expect(
			verifyKey(
				signedRequest.body,
				signedRequest.signature,
				signedRequest.timestamp,
				validKeyPair.publicKey,
			),
		).toBe(true);
	});

	it('invalid key', () => {
		// Sign a request with a different private key and verify with the valid public key
		const signedRequest = signRequestWithKeyPair(
			pingRequestBody,
			invalidKeyPair.secretKey,
		);
		expect(
			verifyKey(
				signedRequest.body,
				signedRequest.signature,
				signedRequest.timestamp,
				validKeyPair.publicKey,
			),
		).toBe(false);
	});

	it('invalid body', () => {
		// Sign a valid request and verify with an invalid body
		const signedRequest = signRequestWithKeyPair(
			pingRequestBody,
			validKeyPair.secretKey,
		);
		expect(
			verifyKey(
				'example invalid body',
				signedRequest.signature,
				signedRequest.timestamp,
				validKeyPair.publicKey,
			),
		).toBe(false);
	});

	it('invalid signature', () => {
		// Sign a valid request and verify with an invalid signature
		const signedRequest = signRequestWithKeyPair(
			pingRequestBody,
			validKeyPair.secretKey,
		);
		expect(
			verifyKey(
				signedRequest.body,
				'example invalid signature',
				signedRequest.timestamp,
				validKeyPair.publicKey,
			),
		).toBe(false);
	});

	it('invalid timestamp', () => {
		// Sign a valid request and verify with an invalid timestamp
		const signedRequest = signRequestWithKeyPair(
			pingRequestBody,
			validKeyPair.secretKey,
		);
		expect(
			verifyKey(
				'example invalid body',
				signedRequest.signature,
				String(Math.round(new Date().getTime() / 1000) - 10000),
				validKeyPair.publicKey,
			),
		).toBe(false);
	});

	it('supports array buffers', () => {
		const signedRequest = signRequestWithKeyPair(
			pingRequestBody,
			validKeyPair.secretKey,
		);
		const encoder = new TextEncoder();
		const bodyEncoded = encoder.encode(signedRequest.body);
		expect(
			verifyKey(
				bodyEncoded.buffer,
				signedRequest.signature,
				signedRequest.timestamp,
				validKeyPair.publicKey,
			),
		).toBe(true);
	});

	it('invalid body data type', () => {
		const signedRequest = signRequestWithKeyPair(
			pingRequestBody,
			validKeyPair.secretKey,
		);
		const invalidBody = {} as unknown as string;
		expect(
			verifyKey(
				invalidBody,
				signedRequest.signature,
				signedRequest.timestamp,
				validKeyPair.publicKey,
			),
		).toBe(false);
	});
});
