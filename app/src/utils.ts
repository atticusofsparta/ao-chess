import { JWKInterface } from 'arweave/node/lib/wallet';
import rsa from 'js-crypto-rsa';

import { ARNS_TX_ID_REGEX, DEFAULT_ARWEAVE } from './constants';

export function formatDate(timestamp: number) {
  return new Date(timestamp).toLocaleString();
}

export function formatTime(timestamp: number) {
  return new Date(timestamp).toLocaleTimeString();
}
export function formatArweaveAddress(address: string) {
  return `${address.slice(0, 4)}...${address.slice(-4)}`;
}

export function copyToClipboard(text: string) {
  const el = document.createElement('textarea');
  el.value = text;
  document.body.appendChild(el);
  el.select();
  document.execCommand('copy');
  document.body.removeChild(el);
}

export function safeDecode(json: string) {
  try {
    return JSON.parse(json);
  } catch (e) {
    return undefined;
  }
}

export const executeWithTimeout = async (fn: () => any, ms: number) => {
  return await Promise.race([
    fn(),
    new Promise((resolve) => setTimeout(() => resolve('timeout'), ms)),
  ]);
};

export function camelToReadable(camel: string) {
  const words = camel.replace(/([A-Z])/g, ' $1').toLowerCase();
  return words.charAt(0).toUpperCase() + words.slice(1);
}

export async function uploadImage(
  img: string,
  signer: Window['arweaveWallet'],
) {
  const bloob = await fetch(img).then((r) => r.blob());
  const transaction = await DEFAULT_ARWEAVE.createTransaction({
    data: await bloob.arrayBuffer(),
  });

  transaction.addTag('Content-Type', bloob.type);
  await signer.sign(transaction);
  await DEFAULT_ARWEAVE.transactions.post(transaction);
  return transaction.id;
}
export function base64ToBase64Url(base64: string) {
  return base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

export function base64UrlToBase64(base64url: string) {
  return base64url
    .replace(/-/g, '+')
    .replace(/_/g, '/')
    .padEnd(base64url.length + ((4 - (base64url.length % 4)) % 4), '=');
}

export async function decryptJSONWithArconnect(
  b64EncryptedData: string,
  arweaveWallet: Window['arweaveWallet'],
): Promise<object> {
  //   const encryptedData = Uint8Array.from(atob(b64EncryptedData), (c) =>
  //     c.charCodeAt(0),
  //   );
  const decoder = new TextDecoder('utf-8');

  const decrypted = await arweaveWallet
    // @ts-ignore types package not up to date, this is the correct usage
    .decrypt(b64EncryptedData, { name: 'RSA-OAEP' });
  const decoded = decoder.decode(decrypted as any);

  return JSON.parse(decoded);
}

export async function encryptJSONWithPublicKey(
  obj: object,
  publicKey: string,
): Promise<string> {
  const encoder = new TextEncoder();
  const jsonString = JSON.stringify(obj);
  const byteArray = encoder.encode(jsonString);
  // @ts-ignore
  return rsa.encrypt(byteArray, { kty: 'RSA', n: publicKey, e: 'AQAB' });
}

export async function encryptStringWithPublicKey(
  str: string,
  publicKey: string,
): Promise<string> {
  const encoder = new TextEncoder();
  const byteArray = encoder.encode(str);
  const encrypted = await rsa.encrypt(byteArray, {
    kty: 'RSA',
    n: publicKey,
    e: 'AQAB',
  });

  // Convert the encrypted byte array to a base64url string
  const base64 = btoa(String.fromCharCode(...new Uint8Array(encrypted)));
  return base64ToBase64Url(base64);
}
export async function decryptStringWithArconnect(
  b64UrlEncryptedData: string,
  arweaveWallet: Window['arweaveWallet'],
): Promise<string> {
  // Convert the base64url string to a byte array
  const base64 = base64UrlToBase64(b64UrlEncryptedData);
  const byteArray = Uint8Array.from(atob(base64), (c) => c.charCodeAt(0));
  const decoder = new TextDecoder('utf-8');

  try {
    // Decrypt the byte array using the Arweave wallet
    const decrypted = await arweaveWallet.decrypt(byteArray, {
      // @ts-ignore types package not up to date, this is the correct usage
      name: 'RSA-OAEP',
    });

    // Decode the decrypted byte array to a string
    // @ts-ignore
    return decoder.decode(new Uint8Array(decrypted));
  } catch (error) {
    console.error('Decryption failed:', error);
    throw error;
  }
}

export async function decryptJSONWithJWK(
  b64EncryptedData: string,
  jwk: JWKInterface,
): Promise<object> {
  //   const encryptedData = atob(b64EncryptedData);
  const decoder = new TextDecoder('utf-8');
  //   const byteArray = Uint8Array.from(encryptedData, (c) => c.charCodeAt(0));
  return rsa.decrypt(b64EncryptedData as any, jwk).then((decrypted) => {
    return JSON.parse(decoder.decode(decrypted));
  });
}

export function isArweaveTransactionID(id?: string) {
  if (!id) {
    return false;
  }
  if (!ARNS_TX_ID_REGEX.test(id)) {
    return false;
  }
  return true;
}

interface Equatable<T> {
  equals(other: T): boolean;
}

class PositiveFiniteInteger implements Equatable<PositiveFiniteInteger> {
  constructor(private readonly positiveFiniteInteger: number) {
    if (
      !Number.isFinite(this.positiveFiniteInteger) ||
      !Number.isInteger(this.positiveFiniteInteger) ||
      this.positiveFiniteInteger < 0
    ) {
      throw new Error(
        `Number must be a non-negative integer value! ${positiveFiniteInteger}`,
      );
    }
  }

  [Symbol.toPrimitive](hint?: string): number | string {
    if (hint === 'string') {
      this.toString();
    }

    return this.positiveFiniteInteger;
  }

  plus(positiveFiniteInteger: PositiveFiniteInteger): PositiveFiniteInteger {
    return new PositiveFiniteInteger(
      this.positiveFiniteInteger + positiveFiniteInteger.positiveFiniteInteger,
    );
  }

  minus(positiveFiniteInteger: PositiveFiniteInteger): PositiveFiniteInteger {
    return new PositiveFiniteInteger(
      this.positiveFiniteInteger - positiveFiniteInteger.positiveFiniteInteger,
    );
  }

  isGreaterThan(positiveFiniteInteger: PositiveFiniteInteger): boolean {
    return (
      this.positiveFiniteInteger > positiveFiniteInteger.positiveFiniteInteger
    );
  }

  isGreaterThanOrEqualTo(
    positiveFiniteInteger: PositiveFiniteInteger,
  ): boolean {
    return (
      this.positiveFiniteInteger >= positiveFiniteInteger.positiveFiniteInteger
    );
  }

  isLessThan(positiveFiniteInteger: PositiveFiniteInteger): boolean {
    return (
      this.positiveFiniteInteger < positiveFiniteInteger.positiveFiniteInteger
    );
  }

  isLessThanOrEqualTo(positiveFiniteInteger: PositiveFiniteInteger): boolean {
    return (
      this.positiveFiniteInteger <= positiveFiniteInteger.positiveFiniteInteger
    );
  }

  toString(): string {
    return `${this.positiveFiniteInteger}`;
  }

  valueOf(): number {
    return this.positiveFiniteInteger;
  }

  toJSON(): number {
    return this.positiveFiniteInteger;
  }

  equals(other: PositiveFiniteInteger): boolean {
    return this.positiveFiniteInteger === other.positiveFiniteInteger;
  }
}

export class Token {
  protected value: number;
  protected denomination: number;
  constructor(value: number, denomination: number | string) {
    if (!Number.isFinite(value) || value < 0) {
      throw new Error('Token must be a non-negative finite number');
    }
    this.value = +value.toFixed(6);
    this.denomination = +denomination;
  }

  valueOf(): number {
    return this.value;
  }

  toMToken(): mToken {
    return new mToken(
      Math.floor(this.value * 10 ** this.denomination),
      this.denomination,
    );
  }

  toString(): string {
    return `${this.value}`;
  }
}

export class mToken extends PositiveFiniteInteger {
  protected denomination: number;
  constructor(value: number, denomination: number | string) {
    super(value);
    this.denomination = +denomination;
  }

  multiply(multiplier: mToken | number): mToken {
    // always round down on multiplication and division
    const result = Math.floor(this.valueOf() * multiplier.valueOf());
    return new mToken(result, this.denomination);
  }

  divide(divisor: mToken | number): mToken {
    if (divisor.valueOf() === 0) {
      // TODO: how should we handle this
      throw new Error('Cannot divide by zero');
    }
    // always round down on multiplication and division
    const result = Math.floor(this.valueOf() / divisor.valueOf());
    return new mToken(result, this.denomination);
  }

  plus(addend: mToken): mToken {
    const result = super.plus(addend);
    return new mToken(result.valueOf(), this.denomination);
  }

  minus(subtractHend: mToken): mToken {
    const result = super.minus(subtractHend);
    return new mToken(result.valueOf(), this.denomination);
  }

  toToken(): Token {
    return new Token(
      this.valueOf() / 10 ** this.denomination,
      this.denomination,
    );
  }
}

export type AoSigner = (args: {
  data: string | Buffer;
  tags?: { name: string; value: string }[];
  target?: string;
  anchor?: string;
}) => Promise<{ id: string; raw: ArrayBuffer }>;
