export type CipherErrorCode =
  | 'missing-key'
  | 'invalid-key'
  | 'invalid-input'
  | 'unsupported-characters'
  | 'decrypt-failed'
  | 'invalid-format'
  | 'crypto-unavailable'

export class CipherError extends Error {
  readonly code: CipherErrorCode
  readonly detail?: string

  constructor(code: CipherErrorCode, detail?: string) {
    super(detail ?? code)
    this.name = 'CipherError'
    this.code = code
    this.detail = detail
  }
}

export function describeCipherError(error: unknown): string {
  if (error instanceof CipherError) {
    switch (error.code) {
      case 'missing-key':
        return error.detail ?? 'Enter a password or key.'
      case 'invalid-key':
        return error.detail ?? 'The key is invalid.'
      case 'invalid-input':
        return error.detail ?? 'The input is not valid for this method.'
      case 'unsupported-characters':
        return error.detail ?? 'The input contains unsupported characters.'
      case 'decrypt-failed':
        return 'Wrong password or corrupted data.'
      case 'invalid-format':
        return 'The text is not a valid output for this method.'
      case 'crypto-unavailable':
        return 'The browser crypto API is unavailable. Open the app over localhost or in the APK.'
    }
  }

  return 'Something went wrong. Please try again.'
}
