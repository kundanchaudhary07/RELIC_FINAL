/**
 * Real Cryptographic Hash calculation using Web Crypto API (SHA-256)
 * Ensures genuine, non-faked cryptographic hashing for digital evidence verification.
 */

export async function calculateSha256(data: string | ArrayBuffer | Uint8Array): Promise<string> {
  let buffer: ArrayBuffer;
  if (typeof data === 'string') {
    buffer = new TextEncoder().encode(data).buffer;
  } else if (data instanceof Uint8Array) {
    buffer = data.buffer;
  } else {
    buffer = data;
  }

  const hashBuffer = await crypto.subtle.digest('SHA-256', buffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
}

export async function verifySha256Integrity(data: string | ArrayBuffer, expectedHash: string): Promise<boolean> {
  const calculated = await calculateSha256(data);
  return calculated.toLowerCase() === expectedHash.toLowerCase();
}
