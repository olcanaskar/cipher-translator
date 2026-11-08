import { useEffect, useRef, useState, type CSSProperties } from 'react'
import {
  ALPHABET_OPTIONS,
  alphabetLength,
  type AlphabetId,
  type CipherDefinition,
} from '../lib/ciphers'
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
  const [alphabetMenuOpen, setAlphabetMenuOpen] = useState(false)
  const alphabetMenuRef = useRef<HTMLDivElement>(null)
  const showKey = cipher.keyKind !== 'none'
  const showAlphabet = Boolean(cipher.supportsAlphabet)

  useEffect(() => {
    if (!alphabetMenuOpen) return

    const handlePointerDown = (event: PointerEvent) => {
      if (
        alphabetMenuRef.current &&
        !alphabetMenuRef.current.contains(event.target as Node)
      ) {
        setAlphabetMenuOpen(false)
      }
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setAlphabetMenuOpen(false)
    }

    document.addEventListener('pointerdown', handlePointerDown)
    document.addEventListener('keydown', handleKeyDown)

    return () => {
      document.removeEventListener('pointerdown', handlePointerDown)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [alphabetMenuOpen])

  if (!showKey && !showAlphabet) return null

  const shiftMax = alphabetLength(alphabet) - 1
  const shiftValue = Math.min(Math.max(Number(keyValue) || 1, 1), shiftMax)
  const progress =
    shiftMax > 1 ? ((shiftValue - 1) / (shiftMax - 1)) * 100 : 0
  const selectedAlphabet =
    ALPHABET_OPTIONS.find((option) => option.id === alphabet) ?? ALPHABET_OPTIONS[0]

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
          <div className="alphabet-control" ref={alphabetMenuRef}>
            <button
              type="button"
              className={`alphabet-trigger${alphabetMenuOpen ? ' is-open' : ''}`}
              aria-haspopup="listbox"
              aria-expanded={alphabetMenuOpen}
              aria-label={`Alphabet: ${selectedAlphabet.label}`}
              onClick={() => setAlphabetMenuOpen((open) => !open)}
            >
              <span className="alphabet-trigger-code">{selectedAlphabet.code}</span>
              <span>{selectedAlphabet.label}</span>
              <Icon name="chevronDown" size={16} />
            </button>

            {alphabetMenuOpen ? (
              <div className="alphabet-menu" role="listbox" aria-label="Alphabet">
                {ALPHABET_OPTIONS.map((option) => {
                  const selected = option.id === alphabet
                  return (
                    <button
                      key={option.id}
                      type="button"
                      role="option"
                      aria-selected={selected}
                      className={`alphabet-option${selected ? ' is-selected' : ''}`}
                      onClick={() => {
                        onAlphabetChange(option.id)
                        setAlphabetMenuOpen(false)
                      }}
                    >
                      <span className="alphabet-option-code">{option.code}</span>
                      <span className="alphabet-option-label">{option.label}</span>
                      {selected ? (
                        <span className="alphabet-option-check">
                          <Icon name="check" size={18} />
                        </span>
                      ) : null}
                    </button>
                  )
                })}
              </div>
            ) : null}
          </div>
        </div>
      ) : null}
    </div>
  )
}
