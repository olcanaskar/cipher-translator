import { useState, type CSSProperties } from 'react'
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
  const progress =
    shiftMax > 1 ? ((shiftValue - 1) / (shiftMax - 1)) * 100 : 0

  return (
    <div className="key-panel">
      {cipher.keyKind === 'number' ? (
        <div className="slider-field">
          <div className="slider-head">
            <label className="field-label" htmlFor="caesar-shift">
              Shift
            </label>
            <span className="slider-value">{shiftValue}</span>
          </div>
          <div className="slider-row">
            <span className="slider-end">1</span>
            <input
              id="caesar-shift"
              className="md-slider"
              type="range"
              min={1}
              max={shiftMax}
              step={1}
              value={shiftValue}
              style={{ '--slider-progress': `${progress}%` } as CSSProperties}
              onChange={(event) => onKeyChange(event.target.value)}
            />
            <span className="slider-end">{shiftMax}</span>
          </div>
        </div>
      ) : null}

      {cipher.keyKind === 'text' ? (
        <div className="md-outlined-field">
          <input
            id="cipher-key"
            className="md-outlined-field__input"
            type="text"
            value={keyValue}
            onChange={(event) => onKeyChange(event.target.value)}
            placeholder=" "
            autoComplete="off"
            autoCapitalize="none"
            spellCheck={false}
          />
          <label className="md-outlined-field__label" htmlFor="cipher-key">
            Keyword
          </label>
        </div>
      ) : null}

      {cipher.keyKind === 'password' ? (
        <div className="md-outlined-field md-outlined-field--with-icon">
          <input
            id="cipher-password"
            className="md-outlined-field__input"
            type={passwordVisible ? 'text' : 'password'}
            value={keyValue}
            onChange={(event) => onKeyChange(event.target.value)}
            placeholder=" "
            autoComplete="off"
            autoCapitalize="none"
            spellCheck={false}
          />
          <label className="md-outlined-field__label" htmlFor="cipher-password">
            Password
          </label>
          <button
            type="button"
            className="md-icon-button md-outlined-field__trailing"
            onClick={() => setPasswordVisible((visible) => !visible)}
            aria-label={passwordVisible ? 'Hide password' : 'Show password'}
          >
            <Icon name={passwordVisible ? 'eyeOff' : 'eye'} size={22} />
          </button>
        </div>
      ) : null}

      {showAlphabet ? (
        <div className="alphabet-row">
          <span className="field-label">Alphabet</span>
          <div
            className="segmented-button segmented-button--small"
            role="group"
            aria-label="Alphabet selection"
          >
            <button
              type="button"
              className={alphabet === 'en' ? 'is-active' : ''}
              aria-pressed={alphabet === 'en'}
              aria-label="English alphabet"
              onClick={() => onAlphabetChange('en')}
            >
              {alphabet === 'en' ? <Icon name="check" size={16} /> : null}
              EN
            </button>
            <button
              type="button"
              className={alphabet === 'tr' ? 'is-active' : ''}
              aria-pressed={alphabet === 'tr'}
              aria-label="Turkish alphabet"
              onClick={() => onAlphabetChange('tr')}
            >
              {alphabet === 'tr' ? <Icon name="check" size={16} /> : null}
              TR
            </button>
          </div>
        </div>
      ) : null}
    </div>
  )
}
