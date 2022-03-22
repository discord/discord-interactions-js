import { Request, Response } from 'express';
import * as http from 'http';
import { InteractionResponseType, InteractionResponseFlags, InteractionType, verifyKeyMiddleware } from '../index';
import { AddressInfo } from 'net';
import {
  autocompleteRequestBody,
  applicationCommandRequestBody,
  invalidKeyPair,
  validKeyPair,
  messageComponentRequestBody,
  pingRequestBody,
  sendExampleRequest,
  signRequestWithKeyPair,
} from './utils/SharedTestUtils';

import express from 'express';
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

expressApp.post(
  '/interactions',
  verifyKeyMiddleware(Buffer.from(validKeyPair.publicKey).toString('hex')),
  (req: Request, res: Response) => {
    const interaction = req.body;
    if (interaction.type === InteractionType.APPLICATION_COMMAND) {
      res.send(exampleApplicationCommandResponse);
    } else if (interaction.type === InteractionType.MESSAGE_COMPONENT) {
      res.send(exampleMessageComponentResponse);
    } else if (interaction.type === InteractionType.APPLICATION_COMMAND_AUTOCOMPLETE) {
      res.send(exampleAutocompleteResponse);
    }
  },
);

let expressAppServer: http.Server;
let exampleInteractionsUrl: string;

beforeAll(async () => {
  await new Promise<void>((resolve) => {
    expressAppServer = expressApp.listen(0);
    resolve();
  });
  exampleInteractionsUrl = 'http://localhost:' + (expressAppServer.address() as AddressInfo).port + '/interactions';
});

describe('verify key middleware', () => {
  it('valid ping', async () => {
    // Sign and verify a valid ping request
    const signedRequest = signRequestWithKeyPair(pingRequestBody, validKeyPair.secretKey);
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
    const signedRequest = signRequestWithKeyPair(applicationCommandRequestBody, validKeyPair.secretKey);
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
    expect(exampleRequestResponseBody).toStrictEqual(exampleApplicationCommandResponse);
  });

  it('valid message component', async () => {
    // Sign and verify a valid message component request
    const signedRequest = signRequestWithKeyPair(messageComponentRequestBody, validKeyPair.secretKey);
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
    expect(exampleRequestResponseBody).toStrictEqual(exampleMessageComponentResponse);
  });

  it('valid autocomplete', async () => {
    // Sign and verify a valid autocomplete request
    const signedRequest = signRequestWithKeyPair(autocompleteRequestBody, validKeyPair.secretKey);
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
    expect(exampleRequestResponseBody).toStrictEqual(exampleAutocompleteResponse);
  });

  it('invalid key', async () => {
    // Sign a request with a different private key and verify with the valid public key
    const signedRequest = signRequestWithKeyPair(pingRequestBody, invalidKeyPair.secretKey);
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
    const signedRequest = signRequestWithKeyPair(pingRequestBody, validKeyPair.secretKey);
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
    const signedRequest = signRequestWithKeyPair(pingRequestBody, validKeyPair.secretKey);
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
    const signedRequest = signRequestWithKeyPair(pingRequestBody, validKeyPair.secretKey);
    const exampleRequestResponse = await sendExampleRequest(
      exampleInteractionsUrl,
      {
        'x-signature-ed25519': signedRequest.signature,
        'x-signature-timestamp': String(Math.round(new Date().getTime() / 1000) - 10000),
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
});

afterAll(() => {
  if (expressAppServer) {
    expressAppServer.close();
  }
});
