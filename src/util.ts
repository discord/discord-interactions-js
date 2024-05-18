/**
 * Based on environment, get a reference to the Web Crypto API's SubtleCrypto interface.
 * @returns An implementation of the Web Crypto API's SubtleCrypto interface.
 */
export function getSubtleCrypto(): SubtleCrypto {
	if (typeof window !== 'undefined' && window.crypto) {
		return window.crypto.subtle;
	}
	if (typeof globalThis !== 'undefined' && globalThis.crypto) {
		return globalThis.crypto.subtle;
	}
	if (typeof crypto !== 'undefined') {
		return crypto.subtle;
	}
	throw new Error('No Web Crypto API implementation found');
}

/**
 * Convert a base64 encoded string to an ArrayBuffer.
 * @param base64 base64 encoded string
 * @returns
 */
export function base64ToArrayBuffer(base64: string) {
	const binaryString = atob(base64);
	const len = binaryString.length;
	const bytes = new Uint8Array(len);
	for (let i = 0; i < len; i++) {
		bytes[i] = binaryString.charCodeAt(i);
	}
	return bytes.buffer;
}

/**
 * Converts an array buffer to a base64 encoded string
 * @param buffer The data in arrayBuffer format
 * @returns a base 64 encoded string
 */
export function arrayBufferToBase64(buffer: ArrayBufferLike) {
	let binary = '';
	const bytes = new Uint8Array(buffer);
	const len = bytes.byteLength;
	for (let i = 0; i < len; i++) {
		binary += String.fromCharCode(bytes[i]);
	}
	return btoa(binary);
}
