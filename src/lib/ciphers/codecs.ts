import {
  base64ToBytes,
  bytesToBase64,
  bytesToHex,
  decodeUtf8,
  encodeUtf8,
  hexToBytes,
} from './bytes'
import { CipherError } from './errors'

export function base64Encode(input: string): string {
  return bytesToBase64(encodeUtf8(input))
}

export function base64Decode(input: string): string {
  return decodeUtf8(base64ToBytes(input))
}

export function hexEncode(input: string): string {
  return bytesToHex(encodeUtf8(input))
}

export function hexDecode(input: string): string {
  return decodeUtf8(hexToBytes(input))
}

export function binaryEncode(input: string): string {
  return [...encodeUtf8(input)]
    .map((byte) => byte.toString(2).padStart(8, '0'))
    .join(' ')
}

export function binaryDecode(input: string): string {
  const clean = input.replace(/\s+/g, '')
  if (clean.length === 0) return ''
  if (!/^[01]+$/.test(clean) || clean.length % 8 !== 0) {
    throw new CipherError(
      'invalid-input',
      'Binary must consist of 8-bit groups (only 0 and 1).',
    )
  }

  const bytes = new Uint8Array(clean.length / 8)
  for (let index = 0; index < clean.length; index += 8) {
    bytes[index / 8] = Number.parseInt(clean.slice(index, index + 8), 2)
  }
  return decodeUtf8(bytes)
}
