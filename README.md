# Cipher Translator

A private, offline cipher translator for Android. Paste text, pick a method, and encode or decode it without the text ever leaving the device.

> **Status:** early development. The web MVP is functional; the Android wrapper and store release are next.

## Why it exists

Most "encrypt text online" tools send the plaintext to a server. This app is local-first:

- No accounts, ads, analytics, or network calls.
- AES-256-GCM with a password, plus classical ciphers, encodings, and hashes.
- Works offline; designed as a mobile-first web app and packaged for Android with Capacitor.

## Implemented

- 13 transformations:
  - Modern: AES-256-GCM (PBKDF2-HMAC-SHA256, 600,000 iterations)
  - Hash: SHA-256, SHA-512, MD5 (compatibility only)
  - Classical: Caesar, ROT13, Atbash, Vigenère, A1Z26, Morse
  - Encoding: Base64, Hex, Binary
- English and Turkish alphabets for the classical ciphers that support them.
- Live conversion for fast methods; explicit action for AES password derivation.
- Copy, share, paste, clear, and output-to-input swap.
- Turkish UI with system light/dark theme.
- Unit tests for every codec, including known vectors, Unicode, tampering, and wrong-password cases.

## Tech stack

- React 19 + TypeScript + Vite
- Web Crypto API for AES-GCM, PBKDF2, SHA-256, and SHA-512
- `@noble/hashes` for MD5 compatibility
- Vitest
- Capacitor 8 (planned) for the Android APK

No backend. The production app will bundle the built static files inside the APK.

## Development

```bash
npm install
npm run dev
```

Other commands:

```bash
npm test        # Vitest
npm run typecheck
npm run lint
npm run build
npm run preview
```

## Project structure

```
src/
  components/         # Icons, key controls, method picker
  hooks/              # Converter state and live conversion
  lib/ciphers/        # Pure cipher engine + tests
  lib/clipboard.ts    # Clipboard/share helpers
  styles/global.css   # Design tokens and app styles
  App.tsx
```

## Security notes

- AES payload format: `CT1.<iterations>.<salt>.<iv>.<ciphertext>`, base64url.
- Salt is 16 bytes, IV is 12 bytes, and a fresh salt/IV is generated for every encryption.
- The password is never stored. There is no recovery mechanism.
- Classical ciphers, Base64, Hex, and Binary are **not** secure encryption. They are included for learning and quick transformations.
- MD5 and SHA-family outputs are one-way and cannot be reversed.
- Web Crypto requires a secure context. Use `localhost` during development or the Capacitor app; plain HTTP over a LAN IP will not expose `crypto.subtle`.

## Roadmap

- History and settings (local-only, clearable)
- Capacitor Android wrapper and debug APK
- App icon, splash screen, release signing
- Optional PWA install and Android share-sheet intake
- English UI

## License

Private project. All rights reserved.
