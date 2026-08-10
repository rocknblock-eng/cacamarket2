import ProductCard from './ProductCard.jsx'

export default function ProductGrid({ listings, onOpenSeller, onView, sellers }) {
  if (listings.length === 0) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-16 text-center text-bone-300/60">
        Sem anúncios para este filtro.
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-6 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
      {listings.map((l) => (
        <ProductCard key={l.id} listing={l} onOpenSeller={onOpenSeller} onView={onView} sellers={sellers} />
      ))}
    </div>
  )
}
