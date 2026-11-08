import { base64UrlToBytes, bytesToBase64Url, decodeUtf8, encodeUtf8 } from './bytes'
import { CipherError } from './errors'

const VERSION = 'CT1'
const SALT_BYTES = 16
const IV_BYTES = 12
const TAG_BYTES = 16
const MIN_ITERATIONS = 100_000
const MAX_ITERATIONS = 2_000_000

export const AES_ITERATIONS = 600_000

function getCrypto(): Crypto {
  if (!globalThis.crypto?.subtle) {
    throw new CipherError('crypto-unavailable')
  }
  return globalThis.crypto
}

async function deriveKey(
  password: string,
  salt: Uint8Array<ArrayBuffer>,
  iterations: number,
): Promise<CryptoKey> {
  const crypto = getCrypto()
  const material = await crypto.subtle.importKey(
    'raw',
    encodeUtf8(password),
    'PBKDF2',
    false,
    ['deriveKey'],
  )

  return crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt,
      iterations,
      hash: 'SHA-256',
    },
    material,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt'],
  )
}

export async function aesEncrypt(input: string, password: string): Promise<string> {
  if (password.length === 0) {
    throw new CipherError('missing-key', 'Enter a password to encrypt.')
  }

  const crypto = getCrypto()
  const salt = crypto.getRandomValues(new Uint8Array(SALT_BYTES))
  const iv = crypto.getRandomValues(new Uint8Array(IV_BYTES))
  const key = await deriveKey(password, salt, AES_ITERATIONS)
  const encrypted = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv },
    key,
    encodeUtf8(input),
  )

  return [
    VERSION,
    String(AES_ITERATIONS),
    bytesToBase64Url(salt),
    bytesToBase64Url(iv),
    bytesToBase64Url(new Uint8Array(encrypted)),
  ].join('.')
}

export async function aesDecrypt(input: string, password: string): Promise<string> {
  if (password.length === 0) {
    throw new CipherError('missing-key', 'Enter a password to decrypt.')
  }

  const parts = input.trim().split('.')
  if (parts.length !== 5 || parts[0] !== VERSION) {
    throw new CipherError('invalid-format')
  }

  const iterations = Number(parts[1])
  if (
    !Number.isInteger(iterations) ||
    iterations < MIN_ITERATIONS ||
    iterations > MAX_ITERATIONS
  ) {
    throw new CipherError('invalid-format')
  }

  let salt: Uint8Array<ArrayBuffer>
  let iv: Uint8Array<ArrayBuffer>
  let ciphertext: Uint8Array<ArrayBuffer>

  try {
    salt = base64UrlToBytes(parts[2])
    iv = base64UrlToBytes(parts[3])
    ciphertext = base64UrlToBytes(parts[4])
  } catch {
    throw new CipherError('invalid-format')
  }

  if (
    salt.length !== SALT_BYTES ||
    iv.length !== IV_BYTES ||
    ciphertext.length < TAG_BYTES
  ) {
    throw new CipherError('invalid-format')
  }

  try {
    const crypto = getCrypto()
    const key = await deriveKey(password, salt, iterations)
    const decrypted = await crypto.subtle.decrypt(
      { name: 'AES-GCM', iv },
      key,
      ciphertext,
    )
    return decodeUtf8(new Uint8Array(decrypted))
  } catch (error) {
    if (error instanceof CipherError) throw error
    throw new CipherError('decrypt-failed')
  }
}
