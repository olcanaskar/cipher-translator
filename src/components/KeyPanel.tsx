import { useState } from 'react'
import { alphabetLength, type AlphabetId, type CipherDefinition } from '../lib/ciphers'
import { Icon } from './Icon'

interface KeyPanelProps {
  cipher: CipherDefinition
  keyValue: string
  alphabet: AlphabetId
  onKeyChange(value: string): void
  onAlphabetChange(value: AlphabetId): void
}

export function KeyPanel({
  cipher,
  keyValue,
  alphabet,
  onKeyChange,
  onAlphabetChange,
}: KeyPanelProps) {
  const [passwordVisible, setPasswordVisible] = useState(false)
  const showKey = cipher.keyKind !== 'none'
  const showAlphabet = Boolean(cipher.supportsAlphabet)

  if (!showKey && !showAlphabet) return null

  const shiftMax = alphabetLength(alphabet) - 1
  const shiftValue = Math.min(Math.max(Number(keyValue) || 1, 1), shiftMax)

  return (
    <div className="key-panel">
      {cipher.keyKind === 'number' ? (
        <div className="field">
          <div className="field-label">
            <span>Kaydırma</span>
            <output className="shift-value" htmlFor="caesar-shift">
              {shiftValue}
            </output>
          </div>
          <div className="shift-row">
            <span className="shift-end">1</span>
            <input
              id="caesar-shift"
              type="range"
              min={1}
              max={shiftMax}
              step={1}
              value={shiftValue}
              onChange={(event) => onKeyChange(event.target.value)}
            />
            <span className="shift-end">{shiftMax}</span>
          </div>
        </div>
      ) : null}

      {cipher.keyKind === 'text' ? (
        <div className="field">
          <label className="field-label" htmlFor="cipher-key">
            <span>Anahtar kelime</span>
          </label>
          <input
            id="cipher-key"
            className="text-input"
            type="text"
            value={keyValue}
            onChange={(event) => onKeyChange(event.target.value)}
            placeholder="ör. limon"
            autoComplete="off"
            autoCapitalize="none"
            spellCheck={false}
          />
        </div>
      ) : null}

      {cipher.keyKind === 'password' ? (
        <div className="field">
          <label className="field-label" htmlFor="cipher-password">
            <span>Parola</span>
          </label>
          <div className="password-wrap">
            <input
              id="cipher-password"
              className="text-input"
              type={passwordVisible ? 'text' : 'password'}
              value={keyValue}
              onChange={(event) => onKeyChange(event.target.value)}
              placeholder="Güçlü bir parola seç"
              autoComplete="off"
              autoCapitalize="none"
              spellCheck={false}
            />
            <button
              type="button"
              className="icon-button"
              onClick={() => setPasswordVisible((visible) => !visible)}
              aria-label={passwordVisible ? 'Parolayı gizle' : 'Parolayı göster'}
            >
              <Icon name={passwordVisible ? 'eyeOff' : 'eye'} size={19} />
            </button>
          </div>
        </div>
      ) : null}

      {showAlphabet ? (
        <div className="alphabet-row">
          <span className="field-label field-label--inline">Alfabe</span>
          <div className="mini-segmented" role="group" aria-label="Alfabe seçimi">
            <button
              type="button"
              className={alphabet === 'en' ? 'is-active' : ''}
              aria-pressed={alphabet === 'en'}
              onClick={() => onAlphabetChange('en')}
            >
              EN
            </button>
            <button
              type="button"
              className={alphabet === 'tr' ? 'is-active' : ''}
              aria-pressed={alphabet === 'tr'}
              onClick={() => onAlphabetChange('tr')}
            >
              TR
            </button>
          </div>
        </div>
      ) : null}
    </div>
  )
}
