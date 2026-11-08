import { aesDecrypt, aesEncrypt } from './aes'
import {
  a1z26Decode,
  a1z26Encode,
  atbash,
  caesarDecode,
  caesarEncode,
  morseDecode,
  morseEncode,
  rot13,
  vigenere,
} from './classical'
import { base64Decode, base64Encode, binaryDecode, binaryEncode, hexDecode, hexEncode } from './codecs'
import { CipherError } from './errors'
import { md5Hex, sha256, sha512 } from './hashes'
import type {
  CipherCategory,
  CipherContext,
  CipherDefinition,
  Direction,
} from './types'

function parseShift(context: CipherContext): number {
  const value = context.key.trim()
  if (value.length === 0) {
    throw new CipherError('missing-key', 'Bir kaydırma değeri girin.')
  }
  if (!/^-?\d+$/.test(value)) {
    throw new CipherError('invalid-key', 'Kaydırma değeri tam sayı olmalı.')
  }
  return Number(value)
}

const aesGcm: CipherDefinition = {
  id: 'aes-gcm',
  name: 'AES-256-GCM',
  description: 'Parola tabanlı gerçek şifreleme',
  category: 'modern',
  kind: 'reversible',
  keyKind: 'password',
  security: 'strong',
  manual: true,
  encode: (input, context) => aesEncrypt(input, context.key),
  decode: (input, context) => aesDecrypt(input, context.key),
}

const sha256Cipher: CipherDefinition = {
  id: 'sha-256',
  name: 'SHA-256',
  description: '256 bit kriptografik özet',
  category: 'hash',
  kind: 'one-way',
  keyKind: 'none',
  security: 'one-way',
  note: 'Tek yönlüdür; özetten orijinal metin geri elde edilemez.',
  encode: (input) => sha256(input),
}

const sha512Cipher: CipherDefinition = {
  id: 'sha-512',
  name: 'SHA-512',
  description: '512 bit kriptografik özet',
  category: 'hash',
  kind: 'one-way',
  keyKind: 'none',
  security: 'one-way',
  note: 'Tek yönlüdür; özetten orijinal metin geri elde edilemez.',
  encode: (input) => sha512(input),
}

const md5Cipher: CipherDefinition = {
  id: 'md5',
  name: 'MD5',
  description: 'Eski ve kırılgan özet',
  category: 'hash',
  kind: 'one-way',
  keyKind: 'none',
  security: 'one-way',
  note: 'Güvenlik için kullanılmamalıdır. Yalnızca eski uyumluluk için.',
  encode: (input) => md5Hex(input),
}

const caesar: CipherDefinition = {
  id: 'caesar',
  name: 'Sezar',
  description: 'Kaydırmalı klasik şifre',
  category: 'classical',
  kind: 'reversible',
  keyKind: 'number',
  security: 'classic',
  supportsAlphabet: true,
  note: 'Harfler alfabede kaydırılır; sayı ve noktalama korunur.',
  encode: (input, context) => caesarEncode(input, parseShift(context), context.alphabet),
  decode: (input, context) => caesarDecode(input, parseShift(context), context.alphabet),
}

const rot13Cipher: CipherDefinition = {
  id: 'rot13',
  name: 'ROT13',
  description: 'Kendini çözen 13 kaydırma',
  category: 'classical',
  kind: 'reversible',
  keyKind: 'none',
  security: 'classic',
  note: 'Yalnızca İngiliz alfabesini dönüştürür. Şifreleme sayılmaz.',
  encode: (input) => rot13(input),
  decode: (input) => rot13(input),
}

const atbashCipher: CipherDefinition = {
  id: 'atbash',
  name: 'Atbash',
  description: 'Alfabeyi tersine çevirir',
  category: 'classical',
  kind: 'reversible',
  keyKind: 'none',
  security: 'classic',
  supportsAlphabet: true,
  note: 'A ↔ Z eşlemesi yapar. Şifreleme sayılmaz.',
  encode: (input, context) => atbash(input, context.alphabet),
  decode: (input, context) => atbash(input, context.alphabet),
}

const vigenereCipher: CipherDefinition = {
  id: 'vigenere',
  name: 'Vigenère',
  description: 'Anahtar kelimeli klasik şifre',
  category: 'classical',
  kind: 'reversible',
  keyKind: 'text',
  security: 'classic',
  supportsAlphabet: true,
  note: 'En az bir harf içeren bir anahtar girin. Anahtardaki harfler sırayla kullanılır.',
  encode: (input, context) => vigenere(input, context.key, context.alphabet, 'encode'),
  decode: (input, context) => vigenere(input, context.key, context.alphabet, 'decode'),
}

const a1z26Cipher: CipherDefinition = {
  id: 'a1z26',
  name: 'A1Z26',
  description: 'Harfleri sayılara çevirir',
  category: 'classical',
  kind: 'reversible',
  keyKind: 'none',
  security: 'classic',
  supportsAlphabet: true,
  note: 'Yalnızca harf ve boşluk destekler. Noktalama kaydedilmez.',
  encode: (input, context) => a1z26Encode(input, context.alphabet),
  decode: (input, context) => a1z26Decode(input, context.alphabet),
}

const morseCipher: CipherDefinition = {
  id: 'morse',
  name: 'Morse',
  description: 'Nokta ve çizgi kodu',
  category: 'classical',
  kind: 'reversible',
  keyKind: 'none',
  security: 'classic',
  note: 'Büyük/küçük harf kaybolur. Harfler boşlukla, kelimeler “ / ” ile ayrılır.',
  encode: (input) => morseEncode(input),
  decode: (input) => morseDecode(input),
}

const base64Cipher: CipherDefinition = {
  id: 'base64',
  name: 'Base64',
  description: 'Metni Base64’e kodlar',
  category: 'encoding',
  kind: 'reversible',
  keyKind: 'none',
  security: 'encoding',
  note: 'Kodlamadır; gizlilik veya güvenlik sağlamaz.',
  encode: (input) => base64Encode(input),
  decode: (input) => base64Decode(input),
}

const hexCipher: CipherDefinition = {
  id: 'hex',
  name: 'Hex',
  description: 'Metni onaltılık baytlara çevirir',
  category: 'encoding',
  kind: 'reversible',
  keyKind: 'none',
  security: 'encoding',
  note: 'Kodlamadır; gizlilik veya güvenlik sağlamaz.',
  encode: (input) => hexEncode(input),
  decode: (input) => hexDecode(input),
}

const binaryCipher: CipherDefinition = {
  id: 'binary',
  name: 'Binary',
  description: 'Metni ikilik baytlara çevirir',
  category: 'encoding',
  kind: 'reversible',
  keyKind: 'none',
  security: 'encoding',
  note: 'Kodlamadır; gizlilik veya güvenlik sağlamaz.',
  encode: (input) => binaryEncode(input),
  decode: (input) => binaryDecode(input),
}

export const CIPHERS: CipherDefinition[] = [
  aesGcm,
  sha256Cipher,
  sha512Cipher,
  md5Cipher,
  caesar,
  rot13Cipher,
  atbashCipher,
  vigenereCipher,
  a1z26Cipher,
  morseCipher,
  base64Cipher,
  hexCipher,
  binaryCipher,
]

export const CATEGORY_ORDER: CipherCategory[] = ['modern', 'classical', 'encoding', 'hash']

export const CATEGORY_LABELS: Record<CipherCategory, string> = {
  modern: 'Modern',
  classical: 'Klasik',
  encoding: 'Kodlama',
  hash: 'Hash',
}

export const SECURITY_LABELS: Record<CipherDefinition['security'], string> = {
  strong: 'Güvenli',
  classic: 'Klasik',
  encoding: 'Kodlama',
  'one-way': 'Tek yönlü',
}

export function getCipher(id: string): CipherDefinition | undefined {
  return CIPHERS.find((cipher) => cipher.id === id)
}

export async function runCipher(
  cipher: CipherDefinition,
  direction: Direction,
  input: string,
  context: CipherContext,
): Promise<string> {
  if (direction === 'decode') {
    if (!cipher.decode) {
      throw new CipherError('invalid-input', 'Bu yöntem tek yönlüdür.')
    }
    return cipher.decode(input, context)
  }

  return cipher.encode(input, context)
}
