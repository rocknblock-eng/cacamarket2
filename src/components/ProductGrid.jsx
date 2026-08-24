import ProductCard from './ProductCard.jsx'

export default function ProductGrid({ listings, onOpenSeller, onView, sellers }) {
  if (listings.length === 0) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-16 text-center text-bone-300/60">
        Sem anuncios para este filtro.
      </div>
    )
  }

  function isActiveFeatured(l) {
    return l.featured === true && l.source !== 'demo' &&
      (!l.featuredUntil || new Date(l.featuredUntil) > new Date())
  }

  const featured = listings.filter(isActiveFeatured)
  const rest = listings.filter(l => !isActiveFeatured(l))

  return (
    <div className="max-w-6xl mx-auto px-4 py-6 space-y-6">

      {/* Fila de destaques */}
      {featured.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-3">
            <span className="text-brass-400 font-semibold text-sm">Em Destaque</span>
            <div className="flex-1 h-px bg-brass-400/20" />
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {featured.map(l => (
              <ProductCard key={l.id} listing={l} onOpenSeller={onOpenSeller} onView={onView} sellers={sellers} />
            ))}
          </div>
        </div>
      )}

      {/* Restantes anuncios */}
      {rest.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {rest.map(l => (
            <ProductCard key={l.id} listing={l} onOpenSeller={onOpenSeller} onView={onView} sellers={sellers} />
          ))}
        </div>
      )}

    </div>
  )
}
