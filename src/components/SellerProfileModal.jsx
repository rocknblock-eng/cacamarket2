import { X, ShieldCheck, MapPin, Calendar, Package } from 'lucide-react';
import ProductCard from './ProductCard.jsx';

export default function SellerProfileModal({
  seller,
  onClose,
  listings,
  sellers,
  onView
}) {
  if (!seller) return null;

  const sellerListings = (listings || []).filter(l => l.sellerId === seller.id);

  return <div className="fixed inset-0 z-50 bg-black/60 flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="bg-pine-800 border border-pine-600 rounded-t-2xl sm:rounded-2xl w-full sm:max-w-3xl p-5 relative max-h-[90vh] overflow-y-auto">
        <button onClick={onClose} className="absolute top-4 right-4 text-bone-300 hover:text-blaze-400">
          <X size={20} />
        </button>
        <div className="flex items-center gap-3 mb-4">
          <div className="w-14 h-14 rounded-full bg-pine-700 flex items-center justify-center font-display font-bold text-xl text-bone-100">
            {seller.name.charAt(0)}
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h2 className="font-display font-bold text-bone-100 text-lg">{seller.name}</h2>
              {seller.verified && <ShieldCheck size={16} className="text-brass-400" />}
            </div>
            <span className="text-xs text-bone-300/70">{seller.type}</span>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3 text-sm mb-5">
          <div className="bg-pine-700/50 rounded-lg p-3 flex items-center gap-2 col-span-2 sm:col-span-1">
            <MapPin size={16} className="text-blaze-400" />
            <div className="text-bone-100">{seller.location}</div>
          </div>
          <div className="bg-pine-700/50 rounded-lg p-3 flex items-center gap-2 col-span-2 sm:col-span-1">
            <Calendar size={16} className="text-blaze-400" />
            <div className="text-bone-100 text-xs">Membro desde {seller.memberSince}</div>
          </div>
        </div>
        {!seller.verified && <p className="text-[11px] text-bone-300/60 mb-4">{'Este vendedor ainda n\u00e3o completou a verificacao de identidade.'}</p>}

        <div className="border-t border-pine-700 pt-4">
          <div className="flex items-center gap-2 mb-3">
            <Package size={16} className="text-brass-400" />
            <span className="text-bone-100 font-semibold text-sm">
              {'An\u00fancios de '}{seller.name}
            </span>
            <span className="text-bone-300/50 text-xs">{'('}{sellerListings.length}{')'}</span>
          </div>

          {sellerListings.length === 0 ? (
            <p className="text-bone-300/60 text-sm py-6 text-center">
              {'Este vendedor n\u00e3o tem an\u00fancios ativos de momento.'}
            </p>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {sellerListings.map(l => (
                <ProductCard key={l.id} listing={l} onOpenSeller={() => {}} onView={onView} sellers={sellers} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>;
}
