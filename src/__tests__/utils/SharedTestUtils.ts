import nacl from 'tweetnacl';
import fetch from 'node-fetch';

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

// Generate a "valid" keypair
export const validKeyPair = nacl.sign.keyPair();
// Generate an "invalid" keypair
export const invalidKeyPair = nacl.sign.keyPair();

export type SignedRequest = {
  body: string;
  signature: string;
  timestamp: string;
};
export type ExampleRequestResponse = {
  status: number;
  body: string;
};

export function signRequestWithKeyPair(body: string, privateKey: Uint8Array): SignedRequest {
  const timestamp = String(Math.round(new Date().getTime() / 1000));
  const signature = Buffer.from(
    nacl.sign.detached(Uint8Array.from(Buffer.concat([Buffer.from(timestamp), Buffer.from(body)])), privateKey),
  ).toString('hex');
  return {
    body,
    signature,
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
