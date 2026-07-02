import { FRUIT_PRESETS } from '../data/fruits'

// Large-target preset buttons. Tapping one only fills the fruit name
// (English + Tamil) into the active item draft — rate and quantity are
// left blank for the cashier to key in today's live price and weight.
export default function FruitPresetGrid({ onSelectFruit }) {
  return (
    <div>
      <h2 className="text-2xl font-bold text-green-900 mb-3">
        Quick Select Fruit / விரைவு தேர்வு
      </h2>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {FRUIT_PRESETS.map((fruit) => (
          <button
            key={fruit.nameEn}
            type="button"
            onClick={() => onSelectFruit(fruit)}
            className="flex flex-col items-center justify-center gap-1 rounded-2xl border-4 border-green-700 bg-white px-2 py-4 text-green-900 shadow-md transition hover:bg-green-100 active:scale-95 active:bg-green-200 focus:outline-none focus-visible:ring-4 focus-visible:ring-green-400"
          >
            <span className="text-4xl" aria-hidden="true">
              {fruit.emoji}
            </span>
            <span className="text-lg font-bold leading-tight">{fruit.nameEn}</span>
            <span className="text-lg font-semibold leading-tight">{fruit.nameTa}</span>
          </button>
        ))}
      </div>
    </div>
  )
}
