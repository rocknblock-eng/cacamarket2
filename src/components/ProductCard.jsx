import { MapPin, Star } from 'lucide-react'
export default function ProductCard({ listing, onOpenSeller, onView, sellers }) {
  const seller = sellers[listing.sellerId]
  if (!seller) return null
  const isDemo = listing.source === 'demo'
  const isFeatured = listing.featured === true
  return (
    <div className={`bg-pine-800 rounded-xl overflow-hidden flex flex-col transition-colors ${
      isFeatured
        ? 'border-2 border-brass-400 shadow-[0_0_12px_rgba(180,140,60,0.3)] hover:border-brass-300'
        : 'border border-pine-700 hover:border-blaze-500/60'
    }`}>
      <button
        onClick={() => onView(listing)}
        className="aspect-[4/3] bg-pine-700 flex items-center justify-center text-bone-300/40 text-xs w-full overflow-hidden relative"
      >
        {listing.image ? (
          <img src={listing.image} alt={listing.title} className="w-full h-full object-cover" />
        ) : (
          'Sem imagem'
        )}
        {isFeatured && (
          <div className="absolute top-2 left-2 flex items-center gap-1 bg-brass-400 text-pine-950 text-[10px] font-bold px-2 py-0.5 rounded-full shadow">
            <Star size={10} className="fill-pine-950" />
            Destaque
          </div>
        )}
        {isDemo && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <span
              className="text-white/60 font-bold text-2xl tracking-widest select-none"
              style={{ transform: 'rotate(-30deg)', textShadow: '0 1px 4px rgba(0,0,0,0.6)' }}
            >
              EXEMPLO
            </span>
          </div>
        )}
      </button>
      <div className="p-3 flex flex-col gap-2 flex-1">
        <h3 className="text-bone-100 text-sm font-medium leading-snug line-clamp-2">
          {listing.title}
        </h3>
        <div className="text-blaze-400 font-display font-bold text-lg">
          {listing.price} €
        </div>
        <div className="flex items-center gap-1 text-[11px] text-bone-300/60">
          <MapPin size={11} />
          {seller.location}
        </div>
        <button
          onClick={() => onView(listing)}
          className="mt-auto w-full bg-pine-700 hover:bg-blaze-500 hover:text-pine-950 text-bone-100 text-sm font-semibold py-2 rounded-lg transition-colors"
        >
          Ver anuncio
        </button>
      </div>
    </div>
  )
}
