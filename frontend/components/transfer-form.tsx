'use client'

import { useEffect, useMemo, useState, type FormEvent } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'

import { createTransfer } from '../lib/api'
import { Card } from './ui/card'
import { Button } from './ui/button'

const IBAN_REGEX = /^TR[0-9]{24}$/

interface FieldState {
  value: string
  touched: boolean
}

export default function TransferForm() {
  const searchParams = useSearchParams()
  const router = useRouter()

  const [fromIban, setFromIban] = useState<FieldState>({ value: searchParams.get('from')?.toUpperCase() ?? '', touched: false })
  const [toIban, setToIban] = useState<FieldState>({ value: '', touched: false })
  const [amount, setAmount] = useState<FieldState>({ value: '', touched: false })
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [toastId, setToastId] = useState<number | null>(null)

  useEffect(() => {
    const fromParam = searchParams.get('from')?.toUpperCase() ?? ''
    if (fromParam && !fromIban.touched) {
      setFromIban({ value: fromParam, touched: false })
    }
  }, [searchParams, fromIban.touched])

  const amountValid = useMemo(() => {
    if (!amount.value) return false
    const pattern = /^(?!0+\.00)(\d+)(\.\d{2})$/
    const numeric = Number(amount.value)
    return numeric > 0 && pattern.test(amount.value)
  }, [amount.value])

  const fromIbanValid = IBAN_REGEX.test(fromIban.value)
  const toIbanValid = IBAN_REGEX.test(toIban.value)
  const sameIban = fromIban.value && toIban.value && fromIban.value === toIban.value

  const formValid = fromIbanValid && toIbanValid && amountValid && !sameIban

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!formValid) return

    setSubmitting(true)
    setError(null)
    setToastId(null)

    try {
      const result = await createTransfer({
        fromIban: fromIban.value,
        toIban: toIban.value,
        amount: Number(amount.value).toFixed(2)
      })
      setToastId(result.id)
      setAmount({ value: '', touched: false })
      setToIban({ value: '', touched: false })
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Bilinmeyen hata'
      setError(message)
    } finally {
      setSubmitting(false)
    }
  }

  useEffect(() => {
    if (toastId === null) return
    const timeout = window.setTimeout(() => setToastId(null), 6000)
    return () => window.clearTimeout(timeout)
  }, [toastId])

  return (
    <>
      <Card className="max-w-xl">
        <h2 className="mb-4 text-xl font-semibold text-gray-900">Para Gönder</h2>
        <form className="space-y-4" onSubmit={handleSubmit} noValidate>
          {error && (
            <div role="alert" className="rounded-md border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-700">
              {error}
            </div>
          )}
          <div>
            <label className="block text-sm font-medium text-gray-700" htmlFor="fromIban">
              Gönderen IBAN
            </label>
            <input
              id="fromIban"
              name="fromIban"
              value={fromIban.value}
              onChange={(event) => setFromIban({ value: event.target.value.toUpperCase(), touched: true })}
              onBlur={() => setFromIban((prev) => ({ ...prev, touched: true }))}
              className="mt-1 w-full rounded-md border border-primary/30 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/40"
              placeholder="TR00..."
              pattern="^TR[0-9]{24}$"
              required
              aria-invalid={fromIban.touched && !fromIbanValid}
              aria-describedby="fromIbanHint"
            />
            <p id="fromIbanHint" className="mt-1 text-xs text-gray-500">
              26 karakter, TR ile başlar.
            </p>
            {fromIban.touched && !fromIbanValid && (
              <p className="mt-1 text-xs text-red-600">Geçerli bir IBAN giriniz.</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700" htmlFor="toIban">
              Alıcı IBAN
            </label>
            <input
              id="toIban"
              name="toIban"
              value={toIban.value}
              onChange={(event) => setToIban({ value: event.target.value.toUpperCase(), touched: true })}
              onBlur={() => setToIban((prev) => ({ ...prev, touched: true }))}
              className="mt-1 w-full rounded-md border border-primary/30 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/40"
              placeholder="TR00..."
              pattern="^TR[0-9]{24}$"
              required
              aria-invalid={toIban.touched && !toIbanValid}
              aria-describedby="toIbanHint"
            />
            <p id="toIbanHint" className="mt-1 text-xs text-gray-500">
              26 karakter, TR ile başlar.
            </p>
            {toIban.touched && !toIbanValid && (
              <p className="mt-1 text-xs text-red-600">Geçerli bir IBAN giriniz.</p>
            )}
          </div>
          {sameIban && (
            <p className="text-xs text-red-600">Gönderen ve alıcı IBAN aynı olamaz.</p>
          )}
          <div>
            <label className="block text-sm font-medium text-gray-700" htmlFor="amount">
              Tutar
            </label>
            <input
              id="amount"
              name="amount"
              inputMode="decimal"
              value={amount.value}
              onChange={(event) => setAmount({ value: event.target.value, touched: true })}
              onBlur={() => setAmount((prev) => ({ ...prev, touched: true }))}
              placeholder="0.00"
              className="mt-1 w-full rounded-md border border-primary/30 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/40"
              required
              aria-invalid={amount.touched && !amountValid}
              aria-describedby="amountHint"
            />
            <p id="amountHint" className="mt-1 text-xs text-gray-500">0'dan büyük ve tam iki ondalık.</p>
            {amount.touched && !amountValid && (
              <p className="mt-1 text-xs text-red-600">Geçerli bir tutar giriniz.</p>
            )}
          </div>
          <Button type="submit" disabled={!formValid || submitting} aria-disabled={!formValid || submitting}>
            {submitting ? 'Gönderiliyor...' : 'Gönder'}
          </Button>
        </form>
      </Card>

      {toastId !== null && (
        <div className="pointer-events-none fixed inset-x-0 top-4 flex justify-center px-4 sm:justify-end sm:px-6">
          <div
            role="status"
            aria-live="assertive"
            className="pointer-events-auto flex items-center gap-3 rounded-md bg-primary px-4 py-3 text-sm text-white shadow-lg"
          >
            <span>Transfer #{toastId} başarılı.</span>
            <button
              type="button"
              className="rounded-md border border-white/20 px-2 py-1 text-xs font-semibold text-white transition hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-white/60"
              onClick={() => {
                router.push(`/transfers?highlight=${toastId}`)
                setToastId(null)
              }}
            >
              Transferi gör
            </button>
            <button
              type="button"
              aria-label="Kapat"
              className="rounded-md p-1 text-white/80 transition hover:bg-white/10 hover:text-white focus:outline-none focus:ring-2 focus:ring-white/60"
              onClick={() => setToastId(null)}
            >
              ×
            </button>
          </div>
        </div>
      )}
    </>
  )
}
