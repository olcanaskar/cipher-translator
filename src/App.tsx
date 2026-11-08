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
      showToast('Panoya erişilemedi. Metni elle yapıştır.')
      return
    }
    if (text.length === 0) {
      showToast('Pano boş.')
      return
    }
    updateInput(text)
    showToast('Panodan yapıştırıldı.')
  }, [showToast, updateInput])

  const handleCopy = useCallback(async () => {
    if (output.length === 0) return
    showToast((await copyText(output)) ? 'Panoya kopyalandı.' : 'Kopyalanamadı.')
  }, [output, showToast])

  const handleShare = useCallback(async () => {
    if (output.length === 0) return
    const result = await shareText(output)
    if (result === 'shared') showToast('Paylaşım açıldı.')
    else if (result === 'copied') showToast('Panoya kopyalandı.')
    else showToast('Paylaşılamadı.')
  }, [output, showToast])

  const handleSwap = useCallback(() => {
    if (swap()) showToast('Çıktı girişe taşındı.')
  }, [showToast, swap])

  const encodeLabel = cipher.category === 'encoding' ? 'Kodla' : 'Şifrele'
  const hasTurkishCharacters = /[çğıöşüÇĞİÖŞÜ]/u.test(input)

  const inputPlaceholder = isOneWay
    ? 'Özetlenecek metni yapıştır…'
    : direction === 'decode'
      ? 'Çözülecek metni yapıştır…'
      : cipher.category === 'encoding'
        ? 'Kodlanacak metni yapıştır…'
        : 'Şifrelenecek metni yapıştır…'

  return (
    <div className="app">
      <header className="top-app-bar">
        <div className="top-app-bar__brand">
          <span className="app-logo">
            <Icon name="lock" size={24} />
          </span>
          <h1 className="app-title">Şifre Çevirmen</h1>
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
            <div className="segmented-button segmented-button--full" role="group" aria-label="Dönüşüm yönü">
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
                Çöz
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
              <span>Türkçe karakter algılandı · TR alfabesine geç</span>
            </button>
          ) : null}
        </section>

        <section className="card input-card" aria-labelledby="source-label">
          <div className="card-head">
            <label className="card-label" id="source-label" htmlFor="source">
              Metin
            </label>
            <span className="supporting-text">
              {input.length.toLocaleString('tr-TR')} karakter
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
              Yapıştır
            </button>
            <button
              type="button"
              className="text-button"
              onClick={clear}
              disabled={input.length === 0}
            >
              <Icon name="trash" size={18} />
              Temizle
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
            aria-label="Çıktıyı girişe taşı"
            title="Çıktıyı girişe taşı"
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
              {isOneWay ? 'Özet' : 'Sonuç'}
            </label>
            <span className="supporting-text output-status">
              {isBusy ? (
                <>
                  <span className="spinner spinner--small" aria-hidden="true" />
                  Hesaplanıyor…
                </>
              ) : output.length > 0 ? (
                `${output.length.toLocaleString('tr-TR')} karakter`
              ) : (
                'Hazır'
              )}
            </span>
          </div>
          <textarea
            id="result"
            className="card-textarea card-textarea--output"
            value={output}
            readOnly
            placeholder="Sonuç burada görünecek…"
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
              Kopyala
            </button>
            <button
              type="button"
              className="text-button"
              onClick={handleShare}
              disabled={output.length === 0}
            >
              <Icon name="share" size={18} />
              Paylaş
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
