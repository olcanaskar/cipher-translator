import { CipherError } from './errors'

const encoder = new TextEncoder()

export function encodeUtf8(input: string): Uint8Array<ArrayBuffer> {
  return encoder.encode(input)
}

export function decodeUtf8(bytes: Uint8Array<ArrayBufferLike>): string {
  try {
    return new TextDecoder('utf-8', { fatal: true }).decode(bytes)
  } catch {
    throw new CipherError('invalid-input', 'Veri geçerli bir UTF-8 metni değil.')
  }
}

export function bytesToHex(bytes: Uint8Array<ArrayBufferLike>): string {
  let result = ''
  for (const byte of bytes) {
    result += byte.toString(16).padStart(2, '0')
  }
  return result
}

export function hexToBytes(value: string): Uint8Array<ArrayBuffer> {
  const clean = value.replace(/\s+/g, '')
  if (clean.length === 0) return new Uint8Array()
  if (clean.length % 2 !== 0 || !/^[0-9a-f]+$/i.test(clean)) {
    throw new CipherError('invalid-input', 'Hex metni çift sayıda onaltılık karakter içermeli.')
  }

  const bytes = new Uint8Array(clean.length / 2)
  for (let index = 0; index < clean.length; index += 2) {
    bytes[index / 2] = Number.parseInt(clean.slice(index, index + 2), 16)
  }
  return bytes
}

export function bytesToBase64(bytes: Uint8Array<ArrayBufferLike>): string {
  let binary = ''
  for (const byte of bytes) {
    binary += String.fromCharCode(byte)
  }
  return btoa(binary)
}

export function base64ToBytes(value: string): Uint8Array<ArrayBuffer> {
  const clean = value.replace(/\s+/g, '')
  if (!/^[A-Za-z0-9+/]*={0,2}$/.test(clean)) {
    throw new CipherError('invalid-input', 'Base64 metni geçersiz karakterler içeriyor.')
  }

  const padded = clean.padEnd(Math.ceil(clean.length / 4) * 4, '=')
  let binary: string
  try {
    binary = atob(padded)
  } catch {
    throw new CipherError('invalid-input', 'Base64 metni geçersiz.')
  }

  const bytes = new Uint8Array(binary.length)
  for (let index = 0; index < binary.length; index += 1) {
    bytes[index] = binary.charCodeAt(index)
  }
  return bytes
}

export function bytesToBase64Url(bytes: Uint8Array<ArrayBufferLike>): string {
  return bytesToBase64(bytes).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '')
}

export function base64UrlToBytes(value: string): Uint8Array<ArrayBuffer> {
  const clean = value.replace(/=+$/g, '')
  if (!/^[A-Za-z0-9_-]*$/.test(clean)) {
    throw new CipherError('invalid-format')
  }

  const base64 = clean.replace(/-/g, '+').replace(/_/g, '/')
  const padded = base64.padEnd(Math.ceil(base64.length / 4) * 4, '=')

  let binary: string
  try {
    binary = atob(padded)
  } catch {
    throw new CipherError('invalid-format')
  }

  const bytes = new Uint8Array(binary.length)
  for (let index = 0; index < binary.length; index += 1) {
    bytes[index] = binary.charCodeAt(index)
  }
  return bytes
}
