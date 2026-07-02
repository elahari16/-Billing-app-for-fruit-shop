import { useState } from 'react'
import ShopLogo from './components/ShopLogo'
import BillingForm from './components/BillingForm'
import BillPreview from './components/BillPreview'
import { useInvoiceNumber } from './hooks/useInvoiceNumber'

function App() {
  const [customerName, setCustomerName] = useState('')
  const [cart, setCart] = useState([])
  const [invoiceNumber, advanceInvoiceNumber] = useInvoiceNumber()

  const addItem = (item) => setCart((prev) => [...prev, item])
  const removeItem = (id) => setCart((prev) => prev.filter((item) => item.id !== id))

  // Called after a successful PDF export: bump the persisted invoice
  // counter and reset the form so the next customer starts clean.
  const finalizeBill = () => {
    advanceInvoiceNumber()
    setCart([])
    setCustomerName('')
  }

  return (
    <div className="min-h-screen bg-green-50">
      <header className="flex items-center gap-4 bg-white border-b-4 border-green-700 px-6 py-4 shadow-sm">
        <ShopLogo className="w-14 h-14" />
        <div>
          <h1 className="text-3xl font-extrabold text-green-900">P.R.E FRUITS</h1>
          <p className="text-lg font-semibold text-gray-500">
            Billing Counter / பில்லிங் கவுண்டர்
          </p>
        </div>
      </header>

      <main className="grid grid-cols-1 lg:grid-cols-2 gap-8 px-6 py-8 max-w-7xl mx-auto">
        <section aria-label="Billing entry" className="min-w-0">
          <BillingForm
            customerName={customerName}
            onCustomerNameChange={setCustomerName}
            cart={cart}
            onAddItem={addItem}
            onRemoveItem={removeItem}
          />
        </section>

        <section aria-label="Bill preview" className="min-w-0 lg:sticky lg:top-8 lg:self-start">
          <BillPreview
            customerName={customerName}
            cart={cart}
            invoiceNumber={invoiceNumber}
            onFinalize={finalizeBill}
          />
        </section>
      </main>
    </div>
  )
}

export default App
