import { useState } from 'react'
import FruitPresetGrid from './FruitPresetGrid'

const emptyDraft = { nameEn: '', nameTa: '', rate: '', qty: '' }

export default function BillingForm({
  customerName,
  onCustomerNameChange,
  cart,
  onAddItem,
  onRemoveItem,
}) {
  // Draft state for the item currently being keyed in. Kept separate from
  // the cart so preset taps, manual typing, and "Add to Bill" can all
  // mutate it before it becomes a committed line item.
  const [draft, setDraft] = useState(emptyDraft)

  const handleSelectFruit = (fruit) => {
    setDraft({ nameEn: fruit.nameEn, nameTa: fruit.nameTa, rate: '', qty: '' })
  }

  const handleDraftField = (field) => (event) => {
    setDraft((prev) => ({ ...prev, [field]: event.target.value }))
  }

  const canAdd =
    draft.nameEn.trim() !== '' && Number(draft.rate) > 0 && Number(draft.qty) > 0

  const handleAddToBill = (event) => {
    event.preventDefault()
    if (!canAdd) return
    onAddItem({
      id: crypto.randomUUID(),
      nameEn: draft.nameEn.trim(),
      nameTa: draft.nameTa.trim(),
      rate: Number(draft.rate),
      qty: Number(draft.qty),
    })
    setDraft(emptyDraft)
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <label
          htmlFor="customerName"
          className="mb-2 block text-2xl font-bold text-green-900"
        >
          Customer Name / வாடிக்கையாளர் பெயர்
        </label>
        <input
          id="customerName"
          type="text"
          value={customerName}
          onChange={(event) => onCustomerNameChange(event.target.value)}
          placeholder="Enter name / பெயரை உள்ளிடவும்"
          className="w-full rounded-xl border-4 border-green-700 bg-white px-4 py-3 text-xl font-semibold text-gray-900 placeholder:text-gray-400 focus:outline-none focus-visible:ring-4 focus-visible:ring-green-400"
        />
      </div>

      <FruitPresetGrid onSelectFruit={handleSelectFruit} />

      <form
        onSubmit={handleAddToBill}
        className="rounded-2xl border-4 border-green-700 bg-green-50 p-4"
      >
        <h2 className="mb-3 text-2xl font-bold text-green-900">
          Add Item / பொருள் சேர்க்க
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
          <div>
            <label htmlFor="nameEn" className="mb-1 block text-lg font-bold text-green-900">
              Fruit Name (English)
            </label>
            <input
              id="nameEn"
              type="text"
              value={draft.nameEn}
              onChange={handleDraftField('nameEn')}
              placeholder="e.g. Apple"
              className="w-full rounded-xl border-4 border-green-700 bg-white px-3 py-2 text-lg font-semibold text-gray-900 focus:outline-none focus-visible:ring-4 focus-visible:ring-green-400"
            />
          </div>
          <div>
            <label htmlFor="nameTa" className="mb-1 block text-lg font-bold text-green-900">
              பழத்தின் பெயர் (தமிழ்)
            </label>
            <input
              id="nameTa"
              type="text"
              value={draft.nameTa}
              onChange={handleDraftField('nameTa')}
              placeholder="எ.கா. ஆப்பிள்"
              className="w-full rounded-xl border-4 border-green-700 bg-white px-3 py-2 text-lg font-semibold text-gray-900 focus:outline-none focus-visible:ring-4 focus-visible:ring-green-400"
            />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div>
            <label htmlFor="rate" className="mb-1 block text-lg font-bold text-green-900">
              Rate (₹/kg) / விலை
            </label>
            <input
              id="rate"
              type="number"
              inputMode="decimal"
              min="0"
              step="0.01"
              value={draft.rate}
              onChange={handleDraftField('rate')}
              placeholder="0.00"
              className="w-full rounded-xl border-4 border-green-700 bg-white px-3 py-2 text-lg font-semibold text-gray-900 focus:outline-none focus-visible:ring-4 focus-visible:ring-green-400"
            />
          </div>
          <div>
            <label htmlFor="qty" className="mb-1 block text-lg font-bold text-green-900">
              Quantity (kg) / அளவு
            </label>
            <input
              id="qty"
              type="number"
              inputMode="decimal"
              min="0"
              step="0.01"
              value={draft.qty}
              onChange={handleDraftField('qty')}
              placeholder="0.00"
              className="w-full rounded-xl border-4 border-green-700 bg-white px-3 py-2 text-lg font-semibold text-gray-900 focus:outline-none focus-visible:ring-4 focus-visible:ring-green-400"
            />
          </div>
        </div>
        <button
          type="submit"
          disabled={!canAdd}
          className="w-full rounded-xl bg-green-700 py-4 text-xl font-bold text-white shadow-md transition hover:bg-green-800 active:scale-[0.98] disabled:cursor-not-allowed disabled:bg-gray-300 disabled:text-gray-500 focus:outline-none focus-visible:ring-4 focus-visible:ring-green-400"
        >
          + Add to Bill / பில்லில் சேர்க்க
        </button>
      </form>

      <div>
        <h2 className="mb-3 text-2xl font-bold text-green-900">
          Current Cart / தற்போதைய கார்ட்
        </h2>
        {cart.length === 0 ? (
          <p className="rounded-xl border-4 border-dashed border-green-300 bg-white p-6 text-center text-lg font-semibold text-gray-500">
            No items yet / இன்னும் பொருட்கள் இல்லை
          </p>
        ) : (
          <ul className="flex flex-col gap-2">
            {cart.map((item) => (
              <li
                key={item.id}
                className="flex items-center justify-between gap-3 rounded-xl border-2 border-green-300 bg-white px-4 py-3"
              >
                <div>
                  <p className="text-lg font-bold text-gray-900">
                    {item.nameEn} {item.nameTa && `/ ${item.nameTa}`}
                  </p>
                  <p className="text-base font-medium text-gray-600">
                    ₹{item.rate.toFixed(2)} × {item.qty} kg = ₹
                    {(item.rate * item.qty).toFixed(2)}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => onRemoveItem(item.id)}
                  aria-label={`Remove ${item.nameEn}`}
                  className="shrink-0 rounded-lg border-2 border-red-600 px-3 py-2 text-lg font-bold text-red-700 hover:bg-red-50 focus:outline-none focus-visible:ring-4 focus-visible:ring-red-300"
                >
                  ✕ Remove
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}
