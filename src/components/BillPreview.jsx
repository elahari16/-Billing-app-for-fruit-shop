import { useRef, useState } from 'react'
import html2canvas from 'html2canvas-pro'
import ShopLogo from './ShopLogo'

const todayLabel = () =>
  new Date().toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })

export default function BillPreview({ customerName, cart, invoiceNumber, onFinalize }) {
  const billRef = useRef(null)
  const [isExporting, setIsExporting] = useState(false)

  const grandTotal = cart.reduce((sum, item) => sum + item.rate * item.qty, 0)
  const invoiceLabel = String(invoiceNumber).padStart(4, '0')

  // Renders the on-screen receipt node to a full-height PNG image
  // entirely client-side (html2canvas-pro rasterizes the DOM), then
  // advances the persisted invoice counter and clears the cart for the
  // next customer. An image (rather than a fixed-page-size PDF) means
  // the whole receipt is always captured no matter how many items are
  // in the cart. html2canvas-pro is used instead of plain html2canvas
  // because Tailwind v4 emits oklch() colors, which plain html2canvas
  // cannot parse.
  const handleDownloadImage = async () => {
    if (!billRef.current || cart.length === 0) return
    setIsExporting(true)
    try {
      const canvas = await html2canvas(billRef.current, { scale: 2, useCORS: true })
      const blob = await new Promise((resolve) => canvas.toBlob(resolve, 'image/png'))
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `PRE-Fruits-Invoice-${invoiceLabel}.png`
      link.click()
      URL.revokeObjectURL(url)
      onFinalize()
    } finally {
      setIsExporting(false)
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <div
        id="bill-preview"
        ref={billRef}
        className="mx-auto w-full max-w-md rounded-2xl border-4 border-green-800 bg-white p-6 text-gray-900 shadow-xl"
      >
        <header className="border-b-4 border-dashed border-green-700 pb-4">
          <div className="flex items-center gap-3">
            <ShopLogo className="w-16 h-16 shrink-0" />
            <div>
              <h1 className="text-3xl font-extrabold tracking-wide text-green-900">
                P.R.E FRUITS
              </h1>
              <p className="text-base font-medium text-gray-500">
                Fresh Fruits Daily / தினமும் புதிய பழங்கள்
              </p>
            </div>
          </div>
          <p className="mt-2 text-center text-sm font-semibold text-gray-700">
            R.இளங்கோவன் பழக்கடை
            <br />
            (கிருஷ்ணா ஸ்வீட் அருகில்) 1337, தெற்கு அலங்கம்,
            <br />
            பழைய பஸ்ஸ்டாண்ட் அருகில், தஞ்சாவூர்.
          </p>
        </header>

        <div className="flex justify-between py-4 text-base font-semibold">
          <div>
            <p>Invoice No / பில் எண்: <span className="font-bold">{invoiceLabel}</span></p>
            <p>Date / தேதி: <span className="font-bold">{todayLabel()}</span></p>
          </div>
        </div>

        <div className="mb-4 rounded-xl bg-green-50 px-3 py-2 text-base font-semibold">
          Customer / வாடிக்கையாளர்:{' '}
          <span className="font-bold">{customerName || '—'}</span>
        </div>

        <table className="w-full border-collapse text-left">
          <thead>
            <tr className="border-b-2 border-green-800 text-sm font-bold text-green-900">
              <th className="py-2">Item / பொருள்</th>
              <th className="py-2 text-right">Rate / விலை</th>
              <th className="py-2 text-right">Qty / அளவு</th>
              <th className="py-2 text-right">Total / மொத்தம்</th>
            </tr>
          </thead>
          <tbody>
            {cart.length === 0 ? (
              <tr>
                <td colSpan={4} className="py-6 text-center text-gray-400">
                  No items added / பொருட்கள் இல்லை
                </td>
              </tr>
            ) : (
              cart.map((item) => (
                <tr key={item.id} className="border-b border-green-100 text-sm">
                  <td className="py-2 font-semibold">
                    {item.nameEn}
                    {item.nameTa && (
                      <span className="block text-gray-500">{item.nameTa}</span>
                    )}
                  </td>
                  <td className="py-2 text-right">₹{item.rate.toFixed(2)}</td>
                  <td className="py-2 text-right">{item.qty}</td>
                  <td className="py-2 text-right font-semibold">
                    ₹{(item.rate * item.qty).toFixed(2)}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        <div className="mt-4 flex items-center justify-between rounded-xl bg-green-800 px-4 py-3 text-white">
          <span className="text-lg font-bold">Grand Total / மொத்த தொகை</span>
          <span className="text-2xl font-extrabold">₹{grandTotal.toFixed(2)}</span>
        </div>

        <footer className="mt-5 border-t-4 border-dashed border-green-700 pt-3 text-sm font-semibold text-gray-600">
          <p>Contact / தொடர்புக்கு: 9952538355</p>
          <p>GPay / ஜிபே: 6382464670</p>
          <p className="mt-2 text-center text-green-800">
            Thank you! Visit Again / நன்றி! மீண்டும் வருக
          </p>
        </footer>
      </div>

      <button
        type="button"
        onClick={handleDownloadImage}
        disabled={cart.length === 0 || isExporting}
        className="w-full rounded-xl bg-green-700 py-4 text-xl font-bold text-white shadow-md transition hover:bg-green-800 active:scale-[0.98] disabled:cursor-not-allowed disabled:bg-gray-300 disabled:text-gray-500 focus:outline-none focus-visible:ring-4 focus-visible:ring-green-400"
      >
        {isExporting
          ? 'Preparing Image... / தயார் செய்யப்படுகிறது...'
          : '⬇ Download & Finish Bill / பில் பதிவிறக்கம்'}
      </button>
    </div>
  )
}
