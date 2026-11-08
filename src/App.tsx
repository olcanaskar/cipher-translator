import { useCallback, useEffect, useRef, useState } from 'react'
import { Icon, type IconName } from './components/Icon'
import { KeyPanel } from './components/KeyPanel'
import { MethodPicker } from './components/MethodPicker'
import { useConverter } from './hooks/useConverter'
import { copyText, readClipboard, shareText } from './lib/clipboard'
import { SECURITY_LABELS, type CipherCategory } from './lib/ciphers'

const CATEGORY_ICONS: Record<CipherCategory, IconName> = {
  modern: 'lock',
  classical: 'key',
  encoding: 'code',
  hash: 'hash',
}

function App() {
  const {
    cipher,
    direction,
    input,
    key,
    alphabet,
    output,
    error,
    isBusy,
    isOneWay,
    selectCipher,
    changeDirection,
    changeAlphabet,
    updateInput,
    updateKey,
    clear,
    swap,
  } = useConverter()

  const [methodPickerOpen, setMethodPickerOpen] = useState(false)
  const [toast, setToast] = useState<string | null>(null)
  const toastTimer = useRef<number | null>(null)

  const showToast = useCallback((message: string) => {
    if (toastTimer.current !== null) window.clearTimeout(toastTimer.current)
    setToast(message)
    toastTimer.current = window.setTimeout(() => setToast(null), 2400)
  }, [])

  useEffect(() => {
    return () => {
      if (toastTimer.current !== null) window.clearTimeout(toastTimer.current)
    }
  }, [])

  const closeMethodPicker = useCallback(() => setMethodPickerOpen(false), [])

  const handleMethodSelect = useCallback(
    (id: string) => {
      selectCipher(id)
      setMethodPickerOpen(false)
    },
    [selectCipher],
  )

  const handlePaste = useCallback(async () => {
    const text = await readClipboard()
    if (text === null) {
      showToast('Could not access the clipboard. Paste the text manually.')
      return
    }
    if (text.length === 0) {
      showToast('Clipboard is empty.')
      return
    }
    updateInput(text)
    showToast('Pasted from clipboard.')
  }, [showToast, updateInput])

  const handleCopy = useCallback(async () => {
    if (output.length === 0) return
    showToast((await copyText(output)) ? 'Copied to clipboard.' : 'Could not copy.')
  }, [output, showToast])

  const handleShare = useCallback(async () => {
    if (output.length === 0) return
    const result = await shareText(output)
    if (result === 'shared') showToast('Share sheet opened.')
    else if (result === 'copied') showToast('Copied to clipboard.')
    else showToast('Could not share.')
  }, [output, showToast])

  const handleSwap = useCallback(() => {
    if (swap()) showToast('Output moved to input.')
  }, [showToast, swap])

  const isEncoding = cipher.category === 'encoding'
  const encodeLabel = isEncoding ? 'Encode' : 'Encrypt'
  const decodeLabel = isEncoding ? 'Decode' : 'Decrypt'
  const hasTurkishCharacters = /[çğıöşüÇĞİÖŞÜ]/u.test(input)

  const inputPlaceholder = isOneWay
    ? 'Paste text to hash…'
    : direction === 'decode'
      ? isEncoding
        ? 'Paste text to decode…'
        : 'Paste text to decrypt…'
      : isEncoding
        ? 'Paste text to encode…'
        : 'Paste text to encrypt…'

  return (
    <div className="app">
      <header className="top-app-bar">
        <div className="top-app-bar__brand">
          <span className="app-logo">
            <Icon name="lock" size={24} />
          </span>
          <h1 className="app-title">Cipher Translator</h1>
        </div>
      </header>

      <main className="content">
        <section className="card method-card">
          <button
            type="button"
            className="method-button"
            onClick={() => setMethodPickerOpen(true)}
            aria-haspopup="dialog"
          >
            <span className={`method-icon method-icon--${cipher.category}`}>
              <Icon name={CATEGORY_ICONS[cipher.category]} size={22} />
            </span>
            <span className="method-copy">
              <span className="method-name-row">
                <span className="method-name">{cipher.name}</span>
                <span className={`badge badge--${cipher.security}`}>
                  {SECURITY_LABELS[cipher.security]}
                </span>
              </span>
              <span className="method-desc">{cipher.description}</span>
            </span>
            <span className="method-chevron">
              <Icon name="chevronDown" size={22} />
            </span>
          </button>

          {isOneWay ? null : (
            <div className="segmented-button segmented-button--full" role="group" aria-label="Conversion direction">
              <button
                type="button"
                className={direction === 'encode' ? 'is-active' : ''}
                aria-pressed={direction === 'encode'}
                onClick={() => changeDirection('encode')}
              >
                <Icon name="lock" size={18} />
                {encodeLabel}
              </button>
              <button
                type="button"
                className={direction === 'decode' ? 'is-active' : ''}
                aria-pressed={direction === 'decode'}
                onClick={() => changeDirection('decode')}
              >
                <Icon name="unlock" size={18} />
                {decodeLabel}
              </button>
            </div>
          )}

          <KeyPanel
            cipher={cipher}
            keyValue={key}
            alphabet={alphabet}
            onKeyChange={updateKey}
            onAlphabetChange={changeAlphabet}
          />

          {cipher.supportsAlphabet && alphabet === 'en' && hasTurkishCharacters ? (
            <button
              type="button"
              className="alphabet-hint"
              onClick={() => changeAlphabet('tr')}
            >
              <Icon name="info" size={18} />
              <span>Turkish characters detected · Switch to TR alphabet</span>
            </button>
          ) : null}
        </section>

        <section className="card input-card" aria-labelledby="source-label">
          <div className="card-head">
            <label className="card-label" id="source-label" htmlFor="source">
              Text
            </label>
            <span className="supporting-text">
              {input.length.toLocaleString('en-US')} characters
            </span>
          </div>
          <textarea
            id="source"
            className="card-textarea"
            value={input}
            onChange={(event) => updateInput(event.target.value)}
            placeholder={inputPlaceholder}
            spellCheck={false}
          />
          <div className="card-actions">
            <button type="button" className="text-button" onClick={handlePaste}>
              <Icon name="paste" size={18} />
              Paste
            </button>
            <button
              type="button"
              className="text-button"
              onClick={clear}
              disabled={input.length === 0}
            >
              <Icon name="trash" size={18} />
              Clear
            </button>
          </div>
        </section>

        <div className="swap-row">
          <span className="swap-line" />
          <button
            type="button"
            className="swap-button"
            onClick={handleSwap}
            disabled={output.length === 0 || isOneWay}
            aria-label="Move output to input"
            title="Move output to input"
          >
            <Icon name="swap" size={20} />
          </button>
          <span className="swap-line" />
        </div>

        {error ? (
          <div className="error-banner" role="alert">
            <Icon name="alert" size={20} />
            <span>{error}</span>
          </div>
        ) : null}

        <section className="card output-card" aria-labelledby="result-label">
          <div className="card-head">
            <label className="card-label" id="result-label" htmlFor="result">
              {isOneWay ? 'Digest' : 'Result'}
            </label>
            <span className="supporting-text output-status">
              {isBusy ? (
                <>
                  <span className="spinner spinner--small" aria-hidden="true" />
                  Calculating…
                </>
              ) : output.length > 0 ? (
                `${output.length.toLocaleString('en-US')} characters`
              ) : (
                'Ready'
              )}
            </span>
          </div>
          <textarea
            id="result"
            className="card-textarea card-textarea--output"
            value={output}
            readOnly
            placeholder="The result will appear here…"
            spellCheck={false}
          />
          <div className="card-actions">
            <button
              type="button"
              className="text-button"
              onClick={handleCopy}
              disabled={output.length === 0}
            >
              <Icon name="copy" size={18} />
              Copy
            </button>
            <button
              type="button"
              className="text-button"
              onClick={handleShare}
              disabled={output.length === 0}
            >
              <Icon name="share" size={18} />
              Share
            </button>
          </div>
        </section>

      </main>

      <MethodPicker
        open={methodPickerOpen}
        selectedId={cipher.id}
        onClose={closeMethodPicker}
        onSelect={handleMethodSelect}
      />

      {toast ? (
        <div className="snackbar" role="status">
          {toast}
        </div>
      ) : null}
    </div>
  )
}

export default App
