import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  CATEGORY_LABELS,
  CATEGORY_ORDER,
  CIPHERS,
  SECURITY_LABELS,
  type CipherCategory,
} from '../lib/ciphers'
import { Icon, type IconName } from './Icon'

interface MethodPickerProps {
  open: boolean
  selectedId: string
  onClose(): void
  onSelect(id: string): void
}

const CATEGORY_ICONS: Record<CipherCategory, IconName> = {
  modern: 'lock',
  classical: 'key',
  encoding: 'code',
  hash: 'hash',
}

export function MethodPicker({ open, selectedId, onClose, onSelect }: MethodPickerProps) {
  const [query, setQuery] = useState('')

  const close = useCallback(() => {
    setQuery('')
    onClose()
  }, [onClose])

  useEffect(() => {
    if (!open) return

    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') close()
    }
    document.addEventListener('keydown', handleKeyDown)

    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = previousOverflow
    }
  }, [close, open])

  const groups = useMemo(() => {
    const normalized = query.trim().toLocaleLowerCase('tr-TR')
    const filtered =
      normalized.length === 0
        ? CIPHERS
        : CIPHERS.filter((cipher) =>
            `${cipher.name} ${cipher.description} ${CATEGORY_LABELS[cipher.category]}`
              .toLocaleLowerCase('tr-TR')
              .includes(normalized),
          )

    return CATEGORY_ORDER.map((category) => ({
      category,
      ciphers: filtered.filter((cipher) => cipher.category === category),
    })).filter((group) => group.ciphers.length > 0)
  }, [query])

  if (!open) return null

  return (
    <div
      className="sheet-backdrop"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) close()
      }}
    >
      <section
        className="sheet"
        role="dialog"
        aria-modal="true"
        aria-labelledby="method-picker-title"
      >
        <div className="sheet-handle" aria-hidden="true" />
        <header className="sheet-head">
          <h2 className="sheet-title" id="method-picker-title">
            Choose a method
          </h2>
          <button type="button" className="sheet-close" onClick={close} aria-label="Kapat">
            <Icon name="close" size={24} />
          </button>
        </header>

        <div className="search-field">
          <span className="search-icon">
            <Icon name="search" size={18} />
          </span>
          <input
            className="text-input"
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search methods…"
            autoComplete="off"
            spellCheck={false}
            aria-label="Search methods"
          />
        </div>

        <div className="method-list">
          {groups.length === 0 ? (
            <div className="empty-search">
              <Icon name="search" size={22} />
              <p>No results for “{query}”.</p>
            </div>
          ) : (
            groups.map((group) => (
              <div key={group.category}>
                <h3 className="category-title">{CATEGORY_LABELS[group.category]}</h3>
                {group.ciphers.map((cipher) => {
                  const selected = cipher.id === selectedId
                  return (
                    <button
                      type="button"
                      key={cipher.id}
                      className={`method-option${selected ? ' is-selected' : ''}`}
                      onClick={() => {
                        setQuery('')
                        onSelect(cipher.id)
                      }}
                    >
                      <span className={`option-icon option-icon--${cipher.category}`}>
                        <Icon name={CATEGORY_ICONS[cipher.category]} size={19} />
                      </span>
                      <span className="option-copy">
                        <span className="option-title-row">
                          <span className="option-name">{cipher.name}</span>
                          <span className={`badge badge--${cipher.security}`}>
                            {SECURITY_LABELS[cipher.security]}
                          </span>
                        </span>
                        <span className="option-desc">{cipher.description}</span>
                      </span>
                      {selected ? (
                        <span className="option-check">
                          <Icon name="check" size={18} />
                        </span>
                      ) : null}
                    </button>
                  )
                })}
              </div>
            ))
          )}
        </div>
      </section>
    </div>
  )
}
