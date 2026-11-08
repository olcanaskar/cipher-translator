import type { AlphabetId } from './types'

export const ALPHABETS: Record<AlphabetId, string> = {
  en: 'abcdefghijklmnopqrstuvwxyz',
  tr: 'abcçdefgğhıijklmnoöprsştuüvyz',
  de: 'abcdefghijklmnopqrstuvwxyzäöü',
  fr: 'abcdefghijklmnopqrstuvwxyzàâæçéèêëîïôœùûüÿ',
  es: 'abcdefghijklmnñopqrstuvwxyz',
  it: 'abcdefghijklmnopqrstuvwxyz',
  pt: 'abcdefghijklmnopqrstuvwxyzç',
  nl: 'abcdefghijklmnopqrstuvwxyz',
  sv: 'abcdefghijklmnopqrstuvwxyzåäö',
  da: 'abcdefghijklmnopqrstuvwxyzæøå',
  no: 'abcdefghijklmnopqrstuvwxyzæøå',
  pl: 'aąbcćdeęfghijklłmnńoóprsśtuwyzźż',
}

const LOCALES: Record<AlphabetId, string> = {
  en: 'en-US',
  tr: 'tr-TR',
  de: 'de-DE',
  fr: 'fr-FR',
  es: 'es-ES',
  it: 'it-IT',
  pt: 'pt-PT',
  nl: 'nl-NL',
  sv: 'sv-SE',
  da: 'da-DK',
  no: 'nb-NO',
  pl: 'pl-PL',
}

export interface AlphabetOption {
  id: AlphabetId
  label: string
  code: string
}

export const ALPHABET_OPTIONS: readonly AlphabetOption[] = [
  { id: 'en', label: 'English', code: 'EN' },
  { id: 'tr', label: 'Turkish', code: 'TR' },
  { id: 'de', label: 'German', code: 'DE' },
  { id: 'fr', label: 'French', code: 'FR' },
  { id: 'es', label: 'Spanish', code: 'ES' },
  { id: 'it', label: 'Italian', code: 'IT' },
  { id: 'pt', label: 'Portuguese', code: 'PT' },
  { id: 'nl', label: 'Dutch', code: 'NL' },
  { id: 'sv', label: 'Swedish', code: 'SV' },
  { id: 'da', label: 'Danish', code: 'DA' },
  { id: 'no', label: 'Norwegian', code: 'NO' },
  { id: 'pl', label: 'Polish', code: 'PL' },
]

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
