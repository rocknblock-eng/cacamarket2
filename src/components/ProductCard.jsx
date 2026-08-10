import { MapPin, ShieldCheck } from 'lucide-react'

export default function ProductCard({ listing, onOpenSeller, onView, sellers }) {
  const seller = sellers[listing.sellerId]
  if (!seller) return null

  return (
    <div className="bg-pine-800 border border-pine-700 rounded-xl overflow-hidden flex flex-col hover:border-blaze-500/60 transition-colors">
      <button
        onClick={() => onView(listing)}
        className="aspect-[4/3] bg-pine-700 flex items-center justify-center text-bone-300/40 text-xs w-full overflow-hidden"
      >
        {listing.image ? (
          <img src={listing.image} alt={listing.title} className="w-full h-full object-cover" />
        ) : (
          'Sem imagem'
        )}
      </button>
      <div className="p-3 flex flex-col gap-2 flex-1">
        <h3 className="text-bone-100 text-sm font-medium leading-snug line-clamp-2">
          {listing.title}
        </h3>
        <div className="text-blaze-400 font-display font-bold text-lg">
          {listing.price} €
        </div>

        <button
          onClick={() => onOpenSeller(seller)}
          className="flex items-center gap-1.5 text-xs text-bone-300 hover:text-blaze-400 transition-colors text-left"
        >
          {seller.verified && <ShieldCheck size={13} className="text-brass-400 shrink-0" />}
          <span className="truncate">{seller.name}</span>
        </button>

        <div className="flex items-center gap-1 text-[11px] text-bone-300/60">
          <MapPin size={11} />
          {seller.location}
        </div>

        <button
          onClick={() => onView(listing)}
          className="mt-auto w-full bg-pine-700 hover:bg-blaze-500 hover:text-pine-950 text-bone-100 text-sm font-semibold py-2 rounded-lg transition-colors"
        >
          Ver anúncio
        </button>
      </div>
    </div>
  )
}
