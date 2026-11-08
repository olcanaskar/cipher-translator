import type { AlphabetId } from './types'

export const ALPHABETS: Record<AlphabetId, string> = {
  en: 'abcdefghijklmnopqrstuvwxyz',
  tr: 'abcçdefgğhıijklmnoöprsştuüvyz',
}

const LOCALES: Record<AlphabetId, string> = {
  en: 'en-US',
  tr: 'tr-TR',
}

export function alphabetLength(alphabetId: AlphabetId): number {
  return ALPHABETS[alphabetId].length
}

export function localeFor(alphabetId: AlphabetId): string {
  return LOCALES[alphabetId]
}

/**
 * Maps every letter through the given index mapper. Case is preserved and all
 * non-letter characters pass through untouched.
 */
export function mapLetters(
  input: string,
  alphabetId: AlphabetId,
  mapper: (index: number) => number,
): string {
  const alphabet = ALPHABETS[alphabetId]
  const locale = localeFor(alphabetId)
  let result = ''

  for (const character of input) {
    const lower = character.toLocaleLowerCase(locale)
    const index = alphabet.indexOf(lower)

    if (index === -1) {
      result += character
      continue
    }

    const mappedIndex = ((mapper(index) % alphabet.length) + alphabet.length) % alphabet.length
    const mapped = alphabet[mappedIndex]
    result += character === lower ? mapped : mapped.toLocaleUpperCase(locale)
  }

  return result
}
