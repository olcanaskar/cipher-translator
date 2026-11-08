export type AlphabetId = 'en' | 'tr'

export type Direction = 'encode' | 'decode'

export type CipherCategory = 'modern' | 'classical' | 'encoding' | 'hash'

export type KeyKind = 'none' | 'number' | 'text' | 'password'

export type CipherKind = 'reversible' | 'one-way'

export type CipherSecurity = 'strong' | 'classic' | 'encoding' | 'one-way'

export interface CipherContext {
  key: string
  alphabet: AlphabetId
}

export interface CipherDefinition {
  id: string
  name: string
  description: string
  category: CipherCategory
  kind: CipherKind
  keyKind: KeyKind
  security: CipherSecurity
  supportsAlphabet?: boolean
  /** Expensive derivation; live conversion uses a longer debounce. */
  heavy?: boolean
  encode(input: string, context: CipherContext): string | Promise<string>
  decode?(input: string, context: CipherContext): string | Promise<string>
}
