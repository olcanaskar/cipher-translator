import { md5 } from '@noble/hashes/legacy.js'
import { bytesToHex, encodeUtf8 } from './bytes'
import { CipherError } from './errors'

function getSubtle(): SubtleCrypto {
  if (!globalThis.crypto?.subtle) {
    throw new CipherError('crypto-unavailable')
  }
  return globalThis.crypto.subtle
}

export async function sha256(input: string): Promise<string> {
  const digest = await getSubtle().digest('SHA-256', encodeUtf8(input))
  return bytesToHex(new Uint8Array(digest))
}

export async function sha512(input: string): Promise<string> {
  const digest = await getSubtle().digest('SHA-512', encodeUtf8(input))
  return bytesToHex(new Uint8Array(digest))
}

export function md5Hex(input: string): string {
  return bytesToHex(md5(encodeUtf8(input)))
}
