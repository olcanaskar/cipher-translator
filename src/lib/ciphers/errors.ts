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
        return error.detail ?? 'Bir parola veya anahtar girin.'
      case 'invalid-key':
        return error.detail ?? 'Girilen anahtar geçersiz.'
      case 'invalid-input':
        return error.detail ?? 'Giriş bu yöntem için geçerli değil.'
      case 'unsupported-characters':
        return error.detail ?? 'Giriş desteklenmeyen karakterler içeriyor.'
      case 'decrypt-failed':
        return 'Parola yanlış veya veri bozulmuş.'
      case 'invalid-format':
        return 'Metin bu yöntemin geçerli bir çıktısı değil.'
      case 'crypto-unavailable':
        return 'Tarayıcının kripto API’si kullanılamıyor. Uygulamayı localhost veya APK üzerinden açın.'
    }
  }

  return 'Beklenmeyen bir hata oluştu. Lütfen tekrar deneyin.'
}
