import { useState } from 'react'

const STORAGE_KEY = 'pre-fruits-invoice-counter'

// Reads the last-used invoice number from localStorage on first render
// (hydration) and persists every increment straight back to it, so the
// counter survives page reloads / app restarts.
export function useInvoiceNumber() {
  const [invoiceNumber, setInvoiceNumber] = useState(() => {
    const stored = Number(localStorage.getItem(STORAGE_KEY))
    return Number.isFinite(stored) && stored > 0 ? stored : 1
  })

  const advanceInvoiceNumber = () => {
    setInvoiceNumber((current) => {
      const next = current + 1
      localStorage.setItem(STORAGE_KEY, String(next))
      return next
    })
  }

  return [invoiceNumber, advanceInvoiceNumber]
}
