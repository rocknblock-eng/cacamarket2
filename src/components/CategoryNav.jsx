import { CATEGORIES } from '../data/listings.js'

export default function CategoryNav({ active, setActive }) {
  return (
    <div className="max-w-6xl mx-auto px-4 pt-4">
      <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
        <button
          onClick={() => setActive(null)}
          className={`shrink-0 text-sm font-medium px-4 py-1.5 rounded-full border transition-colors ${
            active === null
              ? 'bg-blaze-500 border-blaze-500 text-pine-950'
              : 'border-pine-600 text-bone-200 hover:border-blaze-500'
          }`}
        >
          Todas
        </button>
        {CATEGORIES.map((c) => (
          <button
            key={c.id}
            onClick={() => setActive(c.id)}
            className={`shrink-0 text-sm font-medium px-4 py-1.5 rounded-full border transition-colors ${
              active === c.id
                ? 'bg-blaze-500 border-blaze-500 text-pine-950'
                : 'border-pine-600 text-bone-200 hover:border-blaze-500'
            }`}
          >
            {c.label}
          </button>
        ))}
      </div>
    </div>
  )
}
