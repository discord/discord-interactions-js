import { verifyKey } from '../index';
import {
  generatedInvalidKeyPair,
  generatedValidKeyPair,
  pingRequestBody,
  signRequestWithKeyPair,
} from './utils/SharedTestUtils';

describe('verify key method', () => {
  it('valid', () => {
    // Sign and verify a valid request
    const signedRequest = signRequestWithKeyPair(pingRequestBody, generatedValidKeyPair.secretKey);
    expect(verifyKey(signedRequest.body, signedRequest.signature, signedRequest.timestamp, generatedValidKeyPair.publicKey)).toBe(true);
  });

  it('invalid key', () => {
    // Sign a request with a different private key and verify with the valid public key
    const signedRequest = signRequestWithKeyPair(pingRequestBody, generatedInvalidKeyPair.secretKey);
    expect(verifyKey(signedRequest.body, signedRequest.signature, signedRequest.timestamp, generatedValidKeyPair.publicKey)).toBe(false);
  });

  it('invalid body', () => {
    // Sign a valid request and verify with an invalid body
    const signedRequest = signRequestWithKeyPair(pingRequestBody, generatedValidKeyPair.secretKey);
    expect(verifyKey('example invalid body', signedRequest.signature, signedRequest.timestamp, generatedValidKeyPair.publicKey)).toBe(false);
  });

  it('invalid signature', () => {
    // Sign a valid request and verify with an invalid signature
    const signedRequest = signRequestWithKeyPair(pingRequestBody, generatedValidKeyPair.secretKey);
    expect(verifyKey(signedRequest.body, 'example invalid signature', signedRequest.timestamp, generatedValidKeyPair.publicKey)).toBe(false);
  });

  it('invalid timestamp', () => {
    // Sign a valid request and verify with an invalid timestamp
    const signedRequest = signRequestWithKeyPair(pingRequestBody, generatedValidKeyPair.secretKey);
    expect(verifyKey('example invalid body', signedRequest.signature, String(new Date().getTime() - 10000), generatedValidKeyPair.publicKey)).toBe(false);
  });
});