import { useEffect, useState } from 'react'
import AsyncStorage from '@react-native-async-storage/async-storage'

const STORAGE_KEY = 'pre-fruits-invoice-counter'

// Reads the last-used invoice number from AsyncStorage on mount
// (hydration) and persists every increment straight back to it, so the
// counter survives app restarts. AsyncStorage is async, so the counter
// starts at 1 and is corrected once the stored value resolves.
export function useInvoiceNumber() {
  const [invoiceNumber, setInvoiceNumber] = useState(1)

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY).then((stored) => {
      const parsed = Number(stored)
      if (Number.isFinite(parsed) && parsed > 0) {
        setInvoiceNumber(parsed)
      }
    })
  }, [])

  const advanceInvoiceNumber = () => {
    setInvoiceNumber((current) => {
      const next = current + 1
      AsyncStorage.setItem(STORAGE_KEY, String(next))
      return next
    })
  }

  return [invoiceNumber, advanceInvoiceNumber]
}
