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
    canConvert,
    isOneWay,
    selectCipher,
    changeDirection,
    changeAlphabet,
    updateInput,
    updateKey,
    clear,
    convert,
    swap,
  } = useConverter()

  const [methodPickerOpen, setMethodPickerOpen] = useState(false)
  const [toast, setToast] = useState<string | null>(null)
  const toastTimer = useRef<number | null>(null)
  const outputCardRef = useRef<HTMLElement>(null)

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

  const handleConvert = useCallback(async () => {
    const converted = await convert()
    if (!converted) return

    if (isOneWay) showToast('Özet oluşturuldu.')
    else if (direction === 'decode') showToast('Metin çözüldü.')
    else if (cipher.category === 'encoding') showToast('Metin kodlandı.')
    else showToast('Metin şifrelendi.')

    if (cipher.manual && window.matchMedia('(max-width: 639px)').matches) {
      window.requestAnimationFrame(() => {
        window.requestAnimationFrame(() => {
          outputCardRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
        })
      })
    }
  }, [cipher.category, cipher.manual, convert, direction, isOneWay, showToast])

  const encodeLabel = cipher.category === 'encoding' ? 'Kodla' : 'Şifrele'
  const actionLabel = isOneWay ? 'Hashle' : direction === 'encode' ? encodeLabel : 'Çöz'
  const actionIcon: IconName = isOneWay
    ? 'hash'
    : direction === 'decode'
      ? 'unlock'
      : cipher.category === 'encoding'
        ? 'code'
        : 'lock'

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
      <div className="bg-orb bg-orb--one" aria-hidden="true" />
      <div className="bg-orb bg-orb--two" aria-hidden="true" />

      <div className={`shell${cipher.manual ? ' shell--with-action' : ''}`}>
        <header className="topbar">
          <div className="brand">
            <span className="brand-mark">
              <Icon name="lock" size={22} />
            </span>
            <div className="brand-copy">
              <h1 className="brand-title">Şifre Çevirmen</h1>
              <p className="brand-subtitle">şifrele · çöz · dönüştür</p>
            </div>
          </div>
          <span className="offline-pill">
            <span className="offline-dot" />
            Offline
          </span>
        </header>

        <main className="workspace">
          <section className="card input-card" aria-labelledby="source-label">
            <div className="card-head">
              <label className="card-label" id="source-label" htmlFor="source">
                Metin
              </label>
              <span className="card-meta">
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
              <button type="button" className="ghost-button" onClick={handlePaste}>
                <Icon name="paste" size={16} />
                Yapıştır
              </button>
              <button
                type="button"
                className="ghost-button"
                onClick={clear}
                disabled={input.length === 0}
              >
                <Icon name="trash" size={16} />
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
              <Icon name="swap" size={18} />
            </button>
            <span className="swap-line" />
          </div>

          <section className="card method-card">
            <div className="card-head">
              <span className="card-label">Yöntem</span>
              <span className="card-meta">13 dönüşüm</span>
            </div>

            <button
              type="button"
              className="method-button"
              onClick={() => setMethodPickerOpen(true)}
              aria-haspopup="dialog"
            >
              <span className={`method-icon method-icon--${cipher.category}`}>
                <Icon name={CATEGORY_ICONS[cipher.category]} size={19} />
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
                <Icon name="chevronDown" size={18} />
              </span>
            </button>

            {isOneWay ? (
              <div className="oneway-strip">
                <Icon name="shield" size={16} />
                <span>Tek yönlü işlem: çıktı geri döndürülemez.</span>
              </div>
            ) : (
              <div className="segmented" role="group" aria-label="Dönüşüm yönü">
                <button
                  type="button"
                  className={direction === 'encode' ? 'is-active' : ''}
                  aria-pressed={direction === 'encode'}
                  onClick={() => changeDirection('encode')}
                >
                  <Icon name="lock" size={16} />
                  {encodeLabel}
                </button>
                <button
                  type="button"
                  className={direction === 'decode' ? 'is-active' : ''}
                  aria-pressed={direction === 'decode'}
                  onClick={() => changeDirection('decode')}
                >
                  <Icon name="unlock" size={16} />
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
                <Icon name="alert" size={15} />
                <span>Türkçe karakter algılandı · TR alfabesine geç</span>
              </button>
            ) : null}

            {cipher.note ? (
              <p className="note-row">
                <Icon name="shield" size={15} />
                <span>{cipher.note}</span>
              </p>
            ) : null}
          </section>

          {error ? (
            <div className="error-banner" role="alert">
              <Icon name="alert" size={18} />
              <span>{error}</span>
            </div>
          ) : null}

          <section className="card output-card" aria-labelledby="result-label" ref={outputCardRef}>
            <div className="card-head">
              <label className="card-label" id="result-label" htmlFor="result">
                {isOneWay ? 'Özet' : 'Sonuç'}
              </label>
              <span className="card-meta">
                {isBusy
                  ? 'Hesaplanıyor…'
                  : output.length > 0
                    ? `${output.length.toLocaleString('tr-TR')} karakter`
                    : 'Hazır'}
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
                className="ghost-button"
                onClick={handleCopy}
                disabled={output.length === 0}
              >
                <Icon name="copy" size={16} />
                Kopyala
              </button>
              <button
                type="button"
                className="ghost-button"
                onClick={handleShare}
                disabled={output.length === 0}
              >
                <Icon name="share" size={16} />
                Paylaş
              </button>
            </div>
          </section>

          <p className="privacy-note">
            <Icon name="shield" size={14} />
            <span>Metin cihazından ayrılmaz; hiçbir sunucuya gönderilmez.</span>
          </p>
        </main>
      </div>

      {cipher.manual ? (
        <div className="action-dock">
          <div className="action-dock-inner">
            <button
              type="button"
              className="primary-button"
              onClick={handleConvert}
              disabled={!canConvert}
              aria-busy={isBusy}
            >
              {isBusy ? (
                <span className="spinner" aria-hidden="true" />
              ) : (
                <Icon name={actionIcon} size={19} />
              )}
              <span>{isBusy ? 'Hesaplanıyor…' : actionLabel}</span>
            </button>
          </div>
        </div>
      ) : null}

      <MethodPicker
        open={methodPickerOpen}
        selectedId={cipher.id}
        onClose={closeMethodPicker}
        onSelect={handleMethodSelect}
      />

      {toast ? (
        <div className="toast" role="status">
          {toast}
        </div>
      ) : null}
    </div>
  )
}

export default App
