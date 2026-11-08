import { ALPHABETS, alphabetLength, localeFor, mapLetters } from './alphabets'
import { CipherError } from './errors'
import type { AlphabetId } from './types'

export function caesarEncode(input: string, shift: number, alphabet: AlphabetId): string {
  return mapLetters(input, alphabet, (index) => index + shift)
}

export function caesarDecode(input: string, shift: number, alphabet: AlphabetId): string {
  return mapLetters(input, alphabet, (index) => index - shift)
}

export function rot13(input: string): string {
  return caesarEncode(input, 13, 'en')
}

export function atbash(input: string, alphabet: AlphabetId): string {
  return mapLetters(input, alphabet, (index) => alphabetLength(alphabet) - 1 - index)
}

export function vigenere(
  input: string,
  key: string,
  alphabet: AlphabetId,
  direction: 'encode' | 'decode',
): string {
  const letters = ALPHABETS[alphabet]
  const locale = localeFor(alphabet)
  const shifts: number[] = []

  for (const character of key) {
    const index = letters.indexOf(character.toLocaleLowerCase(locale))
    if (index !== -1) shifts.push(index)
  }

  if (shifts.length === 0) {
    throw new CipherError(
      'missing-key',
      'Enter a keyword containing at least one letter.',
    )
  }

  let cursor = 0
  return mapLetters(input, alphabet, (index) => {
    const shift = shifts[cursor % shifts.length]
    cursor += 1
    return direction === 'encode' ? index + shift : index - shift
  })
}

export function a1z26Encode(input: string, alphabet: AlphabetId): string {
  const letters = ALPHABETS[alphabet]
  const locale = localeFor(alphabet)
  const words = input.trim().split(/\s+/).filter(Boolean)

  return words
    .map((word) => {
      const numbers: string[] = []
      for (const character of word) {
        const index = letters.indexOf(character.toLocaleLowerCase(locale))
        if (index === -1) {
          throw new CipherError(
            'unsupported-characters',
            `A1Z26 only supports letters and spaces. Unsupported character: “${character}”`,
          )
        }
        numbers.push(String(index + 1))
      }
      return numbers.join('-')
    })
    .join(' ')
}

export function a1z26Decode(input: string, alphabet: AlphabetId): string {
  const letters = ALPHABETS[alphabet]
  const tokens = input.trim().split(/\s+/).filter(Boolean)

  return tokens
    .map((token) =>
      token
        .split('-')
        .map((part) => {
          if (!/^\d+$/.test(part)) {
            throw new CipherError('invalid-input', 'A1Z26 output must contain numbers and hyphens.')
          }
          const value = Number(part)
          if (value < 1 || value > letters.length) {
            throw new CipherError(
              'invalid-input',
              `A1Z26 numbers must be between 1 and ${letters.length}.`,
            )
          }
          return letters[value - 1]
        })
        .join(''),
    )
    .join(' ')
}

const MORSE_CODES: Record<string, string> = {
  A: '.-',
  B: '-...',
  C: '-.-.',
  D: '-..',
  E: '.',
  F: '..-.',
  G: '--.',
  H: '....',
  I: '..',
  J: '.---',
  K: '-.-',
  L: '.-..',
  M: '--',
  N: '-.',
  O: '---',
  P: '.--.',
  Q: '--.-',
  R: '.-.',
  S: '...',
  T: '-',
  U: '..-',
  V: '...-',
  W: '.--',
  X: '-..-',
  Y: '-.--',
  Z: '--..',
  '0': '-----',
  '1': '.----',
  '2': '..---',
  '3': '...--',
  '4': '....-',
  '5': '.....',
  '6': '-....',
  '7': '--...',
  '8': '---..',
  '9': '----.',
  '.': '.-.-.-',
  ',': '--..--',
  '?': '..--..',
  "'": '.----.',
  '!': '-.-.--',
  '/': '-..-.',
  '(': '-.--.',
  ')': '-.--.-',
  '&': '.-...',
  ':': '---...',
  ';': '-.-.-.',
  '=': '-...-',
  '+': '.-.-.',
  '-': '-....-',
  '_': '..--.-',
  '"': '.-..-.',
  '$': '...-..-',
  '@': '.--.-.',
}

const MORSE_LETTERS = Object.fromEntries(
  Object.entries(MORSE_CODES).map(([character, code]) => [code, character]),
)

export function morseEncode(input: string): string {
  const words = input.trim().toUpperCase().split(/\s+/).filter(Boolean)

  return words
    .map((word) =>
      [...word]
        .map((character) => {
          const code = MORSE_CODES[character]
          if (!code) {
            throw new CipherError(
              'unsupported-characters',
              `No Morse code for character: “${character}”. Use A–Z, 0–9, and basic punctuation.`,
            )
          }
          return code
        })
        .join(' '),
    )
    .join(' / ')
}

export function morseDecode(input: string): string {
  const words = input.trim().split(/\s*\/\s*/)

  return words
    .map((word) =>
      word
        .trim()
        .split(/\s+/)
        .filter(Boolean)
        .map((code) => {
          const character = MORSE_LETTERS[code]
          if (!character) {
            throw new CipherError(
              'invalid-input',
              `Invalid Morse code: “${code}”. Separate letters with spaces and words with “ / ”.`,
            )
          }
          return character
        })
        .join(''),
    )
    .join(' ')
}
