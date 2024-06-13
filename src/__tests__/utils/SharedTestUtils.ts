import { subtleCrypto } from '../../util';

// Example PING request body
export const pingRequestBody = JSON.stringify({
	id: '787053080478613555',
	token: 'ThisIsATokenFromDiscordThatIsVeryLong',
	type: 1,
	version: 1,
});
// Example APPLICATION_COMMAND request body
export const applicationCommandRequestBody = JSON.stringify({
	id: '787053080478613556',
	token: 'ThisIsATokenFromDiscordThatIsVeryLong',
	type: 2,
	version: 1,
	data: {
		id: '787053080478613554',
		name: 'test',
	},
});
// Example MESSAGE_COMPONENT request body
export const messageComponentRequestBody = JSON.stringify({
	id: '787053080478613555',
	token: 'ThisIsATokenFromDiscordThatIsVeryLong',
	type: 3,
	version: 1,
	data: {
		custom_id: 'test',
		component_type: 2,
	},
});
// Example APPLICATION_COMMAND_AUTOCOMPLETE request body
export const autocompleteRequestBody = JSON.stringify({
	id: '787053080478613555',
	token: 'ThisIsATokenFromDiscordThatIsVeryLong',
	type: 4,
	version: 1,
	data: {
		id: '787053080478613554',
		name: 'test',
		type: 1,
		version: '787053080478613554',
		options: [
			{
				type: 3,
				name: 'option',
				value: 'first_option',
				focused: true,
			},
		],
	},
});

export async function generateKeyPair() {
	const keyPair = await subtleCrypto.generateKey(
		{
			name: 'ed25519',
			namedCurve: 'ed25519',
		},
		true,
		['sign', 'verify'],
	);
	return keyPair;
}

export type SignedRequest = {
	body: string;
	signature: string;
	timestamp: string;
};
export type ExampleRequestResponse = {
	status: number;
	body: string;
};

export async function signRequestWithKeyPair(
	body: string,
	privateKey: CryptoKey,
) {
	const timestamp = String(Math.round(new Date().getTime() / 1000));
	const signature = await subtleCrypto.sign(
		{
			name: 'ed25519',
		},
		privateKey,
		Uint8Array.from(Buffer.concat([Buffer.from(timestamp), Buffer.from(body)])),
	);
	return {
		body,
		signature: Buffer.from(signature).toString('hex'),
		timestamp,
	};
}

export async function sendExampleRequest(
	url: string,
	headers: { [key: string]: string },
	body: string,
): Promise<ExampleRequestResponse> {
	const response = await fetch(url, {
		method: 'POST',
		headers,
		body,
	});
	return {
		status: response.status,
		body: await response.text(),
	};
}
