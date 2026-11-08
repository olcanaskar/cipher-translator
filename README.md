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
- 12 language alphabets for the classical ciphers that support them: English,
  Turkish, German, French, Spanish, Italian, Portuguese, Dutch, Swedish, Danish,
  Norwegian, and Polish.
- Live conversion for every method. AES uses a short debounce because PBKDF2 runs on each change.
- Copy, share, paste, clear, and output-to-input swap.
- Material 3 design system: color roles, typography, shapes, state layers,
  filled/outlined components, bottom sheet, and snackbar.
- Material You dynamic color on Android 12+: a small Capacitor plugin reads the
  wallpaper-based system palette and updates the M3 color tokens at runtime. Older
  Android versions fall back to the bundled baseline palette.
- Material 3 adaptive launcher icon with a monochrome layer for Android themed icons,
  plus matching light/dark splash screens. Source logo files live in `assets/`.
- Hidden scrollbars for a cleaner full-screen mobile feel.
- Roboto Variable and Material Symbols Rounded, bundled locally for offline use.
- English UI with system light/dark theme.
- Unit tests for every codec, including known vectors, Unicode, tampering, and wrong-password cases.

## Tech stack

- React 19 + TypeScript + Vite
- Material 3 design tokens and components in plain CSS
- Roboto Variable + Material Symbols Rounded, self-hosted
- Web Crypto API for AES-GCM, PBKDF2, SHA-256, and SHA-512
- `@noble/hashes` for MD5 compatibility
- Vitest
- Capacitor 8 for the Android app
- Custom `MaterialYou` Capacitor plugin (Java) for Android 12+ dynamic color

No backend. The production app will bundle the built static files inside the APK.

## Development

```bash
npm install
npm run dev
```

Android:

```bash
npm run cap:sync
npm run android:build
```

The debug APK is written to
`android/app/build/outputs/apk/debug/app-debug.apk`. Open the native project with
`npm run android:open`.

The Android build requires JDK 21 (Gradle 8.14 does not support JDK 25).
`android:build` looks for a JDK 21 installation automatically; install Microsoft
OpenJDK 21 if it is missing.

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
- App icon, splash screen, release signing
- Optional PWA install and Android share-sheet intake

## License

Private project. All rights reserved.
