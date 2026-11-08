import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import {
  CIPHERS,
  alphabetLength,
  describeCipherError,
  getCipher,
  runCipher,
  type AlphabetId,
  type CipherDefinition,
  type Direction,
} from '../lib/ciphers'

const DEFAULT_CIPHER = CIPHERS[0]

function defaultKey(cipher: CipherDefinition): string {
  return cipher.keyKind === 'number' ? '3' : ''
}

export function useConverter() {
  const [cipherId, setCipherId] = useState(DEFAULT_CIPHER.id)
  const cipher = useMemo(() => getCipher(cipherId) ?? DEFAULT_CIPHER, [cipherId])

  const [direction, setDirection] = useState<Direction>('encode')
  const [input, setInput] = useState('')
  const [key, setKey] = useState(() => defaultKey(DEFAULT_CIPHER))
  const [alphabet, setAlphabet] = useState<AlphabetId>('en')
  const [output, setOutput] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isBusy, setIsBusy] = useState(false)
  const requestId = useRef(0)

  const cancelPending = useCallback(() => {
    requestId.current += 1
    setOutput('')
    setError(null)
    setIsBusy(false)
  }, [])

  const selectCipher = useCallback((nextId: string) => {
    const next = getCipher(nextId)
    if (!next) return

    cancelPending()
    setCipherId(next.id)
    setDirection('encode')
    setKey(defaultKey(next))
    setAlphabet('en')
  }, [cancelPending])

  const changeDirection = useCallback(
    (nextDirection: Direction) => {
      cancelPending()
      setDirection(nextDirection)
    },
    [cancelPending],
  )

  const changeAlphabet = useCallback(
    (nextAlphabet: AlphabetId) => {
      cancelPending()
      setAlphabet(nextAlphabet)

      if (cipher.keyKind === 'number') {
        const max = alphabetLength(nextAlphabet) - 1
        const parsed = Number.parseInt(key, 10)
        if (!Number.isFinite(parsed) || parsed < 1) {
          setKey('3')
        } else if (parsed > max) {
          setKey(String(max))
        }
      }
    },
    [cancelPending, cipher.keyKind, key],
  )

  const updateInput = useCallback(
    (value: string) => {
      setInput(value)
      if (cipher.manual || value.length === 0) {
        cancelPending()
      }
    },
    [cancelPending, cipher.manual],
  )

  const updateKey = useCallback(
    (value: string) => {
      setKey(value)
      if (cipher.manual || (cipher.keyKind !== 'none' && value.trim().length === 0)) {
        cancelPending()
      }
    },
    [cancelPending, cipher.keyKind, cipher.manual],
  )

  // Live conversion for fast ciphers. AES waits for the explicit action because
  // every run performs a deliberately expensive password derivation.
  useEffect(() => {
    if (cipher.manual) return
    if (input.length === 0) return
    if (cipher.keyKind !== 'none' && key.trim().length === 0) return

    const currentRequest = requestId.current + 1
    requestId.current = currentRequest

    const timer = window.setTimeout(() => {
      void (async () => {
        try {
          const result = await runCipher(cipher, direction, input, { key, alphabet })
          if (requestId.current !== currentRequest) return
          setOutput(result)
        } catch (caught) {
          if (requestId.current !== currentRequest) return
          setOutput('')
          setError(describeCipherError(caught))
        }
      })()
    }, 160)

    return () => window.clearTimeout(timer)
  }, [alphabet, cipher, direction, input, key])

  const clear = useCallback(() => {
    cancelPending()
    setInput('')
  }, [cancelPending])

  const convert = useCallback(async (): Promise<boolean> => {
    if (input.length === 0) {
      setError('Önce bir metin girin.')
      return false
    }

    if (cipher.keyKind !== 'none' && key.trim().length === 0) {
      setError(cipher.keyKind === 'password' ? 'Bir parola girin.' : 'Bir anahtar girin.')
      return false
    }

    const currentRequest = requestId.current + 1
    requestId.current = currentRequest
    setIsBusy(true)
    setError(null)

    try {
      const result = await runCipher(cipher, direction, input, { key, alphabet })
      if (requestId.current !== currentRequest) return false
      setOutput(result)
      return true
    } catch (caught) {
      if (requestId.current !== currentRequest) return false
      setOutput('')
      setError(describeCipherError(caught))
      return false
    } finally {
      if (requestId.current === currentRequest) setIsBusy(false)
    }
  }, [alphabet, cipher, direction, input, key])

  const swap = useCallback((): boolean => {
    if (cipher.kind === 'one-way' || output.length === 0) return false

    requestId.current += 1
    setInput(output)
    setDirection((current) => (current === 'encode' ? 'decode' : 'encode'))
    setOutput('')
    setError(null)
    return true
  }, [cipher.kind, output])

  return {
    cipher,
    direction,
    input,
    key,
    alphabet,
    output,
    error,
    isBusy,
    canConvert: input.length > 0 && !isBusy,
    isOneWay: cipher.kind === 'one-way',
    selectCipher,
    changeDirection,
    changeAlphabet,
    updateInput,
    updateKey,
    clear,
    convert,
    swap,
  }
}
