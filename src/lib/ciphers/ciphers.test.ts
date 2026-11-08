import { describe, expect, it } from 'vitest'
import { ALPHABETS, ALPHABET_OPTIONS } from './alphabets'
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
import {
  base64Decode,
  base64Encode,
  binaryDecode,
  binaryEncode,
  hexDecode,
  hexEncode,
} from './codecs'
import { md5Hex, sha256, sha512 } from './hashes'
import { CIPHERS, runCipher } from './registry'
import type { CipherContext } from './types'

const english: CipherContext = { key: '', alphabet: 'en' }
const turkish: CipherContext = { key: '', alphabet: 'tr' }

describe('classical ciphers', () => {
  it('shifts Caesar letters and preserves punctuation', () => {
    expect(caesarEncode('Hello, World!', 3, 'en')).toBe('Khoor, Zruog!')
    expect(caesarDecode('Khoor, Zruog!', 3, 'en')).toBe('Hello, World!')
  })

  it('round-trips Turkish characters and case', () => {
    const input = 'Çağrı, ışığın ölçüsü: İstanbul'
    const encoded = caesarEncode(input, 7, 'tr')

    expect(encoded).not.toBe(input)
    expect(caesarDecode(encoded, 7, 'tr')).toBe(input)
  })

  it('implements ROT13 as a self-inverse transform', () => {
    expect(rot13('Hello')).toBe('Uryyb')
    expect(rot13(rot13('Hello'))).toBe('Hello')
  })

  it('reverses the alphabet with Atbash', () => {
    expect(atbash('abc xyz', 'en')).toBe('zyx cba')
    expect(atbash(atbash('Istanbul', 'tr'), 'tr')).toBe('Istanbul')
  })

  it('matches the Vigenère reference vector', () => {
    expect(vigenere('ATTACKATDAWN', 'LEMON', 'en', 'encode')).toBe('LXFOPVEFRNHR')
    expect(vigenere('LXFOPVEFRNHR', 'LEMON', 'en', 'decode')).toBe('ATTACKATDAWN')
  })

  it('round-trips Vigenère with Turkish letters', () => {
    const input = 'Şifreli Mesaj'
    const encoded = vigenere(input, 'anahtar', 'tr', 'encode')

    expect(vigenere(encoded, 'anahtar', 'tr', 'decode')).toBe(input)
  })

  it('encodes and decodes A1Z26', () => {
    expect(a1z26Encode('HELLO WORLD', 'en')).toBe('8-5-12-12-15 23-15-18-12-4')
    expect(a1z26Decode('8-5-12-12-15 23-15-18-12-4', 'en')).toBe('hello world')
    expect(a1z26Encode('ç', 'tr')).toBe('4')
    expect(a1z26Decode('4', 'tr')).toBe('ç')
  })

  it('encodes and decodes Morse with word separators', () => {
    expect(morseEncode('SOS')).toBe('... --- ...')
    expect(morseDecode('... --- ...')).toBe('SOS')
    expect(morseEncode('HI THERE')).toBe('.... .. / - .... . .-. .')
    expect(morseDecode('.... .. / - .... . .-. .')).toBe('HI THERE')
  })

  it('rejects unsupported Morse characters', () => {
    expect(() => morseEncode('ş')).toThrowError(/No Morse code for character/)
  })

  it('provides a unique alphabet for every language option', () => {
    expect(ALPHABET_OPTIONS).toHaveLength(12)

    for (const [id, alphabet] of Object.entries(ALPHABETS)) {
      expect(new Set(alphabet).size, `${id} contains a duplicate letter`).toBe(
        alphabet.length,
      )
    }
  })

  const languageSamples = [
    ['de', 'Grüße aus München'],
    ['fr', 'Café déjà vu, œuvre et æther'],
    ['es', 'Mañana será otro día'],
    ['it', 'Città e perché'],
    ['pt', 'Ação, coração e pão'],
    ['nl', 'Een café in de stad'],
    ['sv', 'Ångström och blåbär'],
    ['da', 'Blåbærsyltetøj'],
    ['no', 'Blåbærsyltetøy'],
    ['pl', 'Zażółć gęślą jaźń'],
  ] as const

  for (const [alphabet, text] of languageSamples) {
    it(`round-trips Caesar with the ${alphabet} alphabet`, () => {
      expect(caesarDecode(caesarEncode(text, 7, alphabet), 7, alphabet)).toBe(text)
    })
  }
})

describe('encodings', () => {
  it('round-trips Base64 including Unicode', () => {
    expect(base64Encode('merhaba')).toBe('bWVyaGFiYQ==')
    expect(base64Decode('bWVyaGFiYQ==')).toBe('merhaba')

    const input = 'Türkçe metin 👋'
    expect(base64Decode(base64Encode(input))).toBe(input)
  })

  it('round-trips hex and binary', () => {
    expect(hexEncode('Hi')).toBe('4869')
    expect(hexDecode('4869')).toBe('Hi')
    expect(binaryEncode('Hi')).toBe('01001000 01101001')
    expect(binaryDecode('01001000 01101001')).toBe('Hi')

    const input = 'ç ğü 👋'
    expect(hexDecode(hexEncode(input))).toBe(input)
    expect(binaryDecode(binaryEncode(input))).toBe(input)
  })

  it('rejects malformed encodings', () => {
    expect(() => base64Decode('%%%')).toThrowError(/Base64/)
    expect(() => hexDecode('abc')).toThrowError(/Hex/)
    expect(() => binaryDecode('0101')).toThrowError(/Binary/)
  })
})

describe('hashes', () => {
  it('matches known SHA-256 and SHA-512 vectors', async () => {
    expect(await sha256('abc')).toBe(
      'ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad',
    )
    expect(await sha512('abc')).toBe(
      'ddaf35a193617abacc417349ae20413112e6fa4e89a97ea20a9eeee64b55d39a' +
        '2192992a274fc1a836ba3c23a3feebbd454d4423643ce80e2a9ac94fa54ca49f',
    )
  })

  it('matches the MD5 reference vector', () => {
    expect(md5Hex('abc')).toBe('900150983cd24fb0d6963f7d28e17f72')
  })
})

describe('AES-256-GCM', () => {
  it('round-trips text with a password', async () => {
    const input = 'Merhaba dünya 👋'
    const password = 'doğru at yarışı'
    const encrypted = await aesEncrypt(input, password)

    expect(encrypted.startsWith('CT1.600000.')).toBe(true)
    expect(await aesDecrypt(encrypted, password)).toBe(input)
  })

  it('uses a fresh salt and IV for every encryption', async () => {
    const first = await aesEncrypt('aynı metin', 'parola')
    const second = await aesEncrypt('aynı metin', 'parola')

    expect(first).not.toBe(second)
  })

  it('rejects a wrong password and tampered ciphertext', async () => {
    const encrypted = await aesEncrypt('gizli', 'parola')
    const parts = encrypted.split('.')
    const last = parts[4]
    parts[4] = last.slice(0, -1) + (last.endsWith('A') ? 'B' : 'A')
    const tampered = parts.join('.')

    await expect(aesDecrypt(encrypted, 'yanlış')).rejects.toMatchObject({
      code: 'decrypt-failed',
    })
    await expect(aesDecrypt(tampered, 'parola')).rejects.toMatchObject({
      code: 'decrypt-failed',
    })
  })

  it('rejects malformed payloads before deriving a key', async () => {
    await expect(aesDecrypt('CT1.600000.abc', 'parola')).rejects.toMatchObject({
      code: 'invalid-format',
    })
    await expect(aesDecrypt('nope', 'parola')).rejects.toMatchObject({
      code: 'invalid-format',
    })
  })
})

describe('cipher registry', () => {
  it('has unique ids and valid capabilities', () => {
    expect(new Set(CIPHERS.map((cipher) => cipher.id)).size).toBe(CIPHERS.length)

    for (const cipher of CIPHERS) {
      if (cipher.kind === 'one-way') {
        expect(cipher.decode).toBeUndefined()
      } else {
        expect(cipher.decode).toBeTypeOf('function')
      }
    }
  })

  const samples: Record<string, { input: string; key: string; alphabet?: 'en' | 'tr' }> = {
    'aes-gcm': { input: 'Gizli mesaj 👋', key: 'güçlü parola' },
    caesar: { input: 'Hello, World!', key: '3' },
    rot13: { input: 'Hello, World!', key: '' },
    atbash: { input: 'Hello, World!', key: '' },
    vigenere: { input: 'ATTACK AT DAWN', key: 'LEMON' },
    a1z26: { input: 'hello world', key: '' },
    morse: { input: 'SOS', key: '' },
    base64: { input: 'Türkçe metin 👋', key: '' },
    hex: { input: 'Türkçe metin 👋', key: '' },
    binary: { input: 'Türkçe metin 👋', key: '' },
  }

  for (const cipher of CIPHERS.filter((entry) => entry.kind === 'reversible')) {
    it(`round-trips ${cipher.id}`, async () => {
      const sample = samples[cipher.id]
      expect(sample).toBeDefined()

      const context: CipherContext = {
        key: sample.key,
        alphabet: sample.alphabet ?? 'en',
      }
      const encoded = await runCipher(cipher, 'encode', sample.input, context)
      const decoded = await runCipher(cipher, 'decode', encoded, context)

      expect(decoded).toBe(sample.input)
    })
  }

  it('works with a Turkish alphabet context', async () => {
    const cipher = CIPHERS.find((entry) => entry.id === 'caesar')
    expect(cipher).toBeDefined()

    const context = { key: '5', alphabet: 'tr' as const }
    const encoded = await runCipher(cipher!, 'encode', 'Çağrı', context)
    expect(await runCipher(cipher!, 'decode', encoded, context)).toBe('Çağrı')
  })

  it('refuses to decode one-way ciphers', async () => {
    const cipher = CIPHERS.find((entry) => entry.id === 'sha-256')
    expect(cipher).toBeDefined()

    await expect(runCipher(cipher!, 'decode', 'abc', english)).rejects.toMatchObject({
      code: 'invalid-input',
    })
  })

  it('keeps a Turkish context object shape', () => {
    expect(turkish.alphabet).toBe('tr')
    expect(english.alphabet).toBe('en')
  })
})
