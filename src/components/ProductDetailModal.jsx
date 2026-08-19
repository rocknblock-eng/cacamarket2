import { useState } from 'react'
import { X, MapPin, ShieldCheck, Trash2, Pencil, MessageCircle, Mail, Phone, ChevronLeft, ChevronRight, ZoomIn } from 'lucide-react'

function whatsappLink(phone, listingTitle) {
  const digits = phone.replace(/[^\d]/g, '')
  const message = encodeURIComponent(`Olá! Tenho interesse no anúncio "${listingTitle}" no WildMarket.`)
  return `https://wa.me/${digits}?text=${message}`
}

function emailLink(email, listingTitle) {
  const subject = encodeURIComponent(`Interesse no anúncio: ${listingTitle}`)
  const body = encodeURIComponent(`Olá! Tenho interesse no anúncio "${listingTitle}" no WildMarket.`)
  return `mailto:${email}?subject=${subject}&body=${body}`
}

function PhotoGallery({ listing, onOpenLightbox }) {
  const [current, setCurrent] = useState(0)
  const [lightbox, setLightbox] = useState(false)

  function parseImages(listing) {
    const urls = listing.image_urls
    if (Array.isArray(urls) && urls.length > 0) return urls
    if (listing.image_url) return [listing.image_url]
    if (listing.image) return [listing.image]
    return []
  }

  const images = parseImages(listing)

  if (images.length === 0) {
    return (
      <div className="aspect-[4/3] bg-pine-700 flex items-center justify-center text-bone-300/40 text-sm">
        Sem imagem
      </div>
    )
  }

  function prev() { setCurrent(i => (i - 1 + images.length) % images.length) }
  function next() { setCurrent(i => (i + 1) % images.length) }

  function open(i) {
    setCurrent(i)
    setLightbox(true)
  }

  return (
    <>
      <div className="aspect-[4/3] bg-pine-700 relative overflow-hidden group">
        <img
          src={images[current]}
          alt={listing.title}
          className="w-full h-full object-cover cursor-zoom-in"
          onClick={() => open(current)}
        />
        <div className="absolute bottom-2 left-2 bg-black/50 text-white rounded-full p-1.5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
          <ZoomIn size={16} />
        </div>
        {images.length > 1 && (
          <div className="absolute bottom-2 right-2 bg-black/50 text-white text-xs px-2 py-0.5 rounded-full">
            {current + 1} / {images.length}
          </div>
        )}
      </div>

      {images.length > 1 && (
        <div className="flex gap-2 px-4 pt-2">
          {images.map((img, i) => (
            <button
              key={i}
              onClick={() => open(i)}
              className={`relative w-14 h-14 rounded-md overflow-hidden border-2 transition-colors flex-shrink-0 group/thumb ${i === current ? 'border-blaze-400' : 'border-pine-600 opacity-60 hover:opacity-100'}`}
            >
              <img src={img} alt={`Foto ${i + 1}`} className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover/thumb:opacity-100 transition-opacity">
                <ZoomIn size={14} className="text-white" />
              </div>
            </button>
          ))}
        </div>
      )}

      {lightbox && (
        <div
          style={{ position: 'fixed', inset: 0, zIndex: 99999, background: 'rgba(0,0,0,0.95)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          onClick={() => setLightbox(false)}
        >
          <img
            src={images[current]}
            alt={listing.title}
            style={{ maxWidth: '95vw', maxHeight: '90vh', objectFit: 'contain' }}
            onClick={e => e.stopPropagation()}
          />
          <button
            onClick={() => setLightbox(false)}
            style={{ position: 'absolute', top: 16, right: 16, background: 'rgba(0,0,0,0.5)', border: 'none', borderRadius: '50%', padding: 8, cursor: 'pointer', color: 'white' }}
          >
            <X size={24} />
          </button>
          {images.length > 1 && (
            <>
              <button
                onClick={e => { e.stopPropagation(); prev() }}
                style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', background: 'rgba(0,0,0,0.5)', border: 'none', borderRadius: '50%', padding: 8, cursor: 'pointer', color: 'white' }}
              >
                <ChevronLeft size={24} />
              </button>
              <button
                onClick={e => { e.stopPropagation(); next() }}
                style={{ position: 'absolute', right: 16, top: '50%', transform: 'translateY(-50%)', background: 'rgba(0,0,0,0.5)', border: 'none', borderRadius: '50%', padding: 8, cursor: 'pointer', color: 'white' }}
              >
                <ChevronRight size={24} />
              </button>
              <div style={{ position: 'absolute', bottom: 16, left: '50%', transform: 'translateX(-50%)', background: 'rgba(0,0,0,0.5)', color: 'white', padding: '4px 12px', borderRadius: 20, fontSize: 14 }}>
                {current + 1} / {images.length}
              </div>
            </>
          )}
        </div>
      )}
    </>
  )
}

export default function ProductDetailModal({ listing, onClose, onOpenSeller, onOpenChat, sellers, onDelete, canDelete, onEdit, user, profile, onOpenLightbox, authLoading }) {
  const [showContact, setShowContact] = useState(false)

  if (!listing) return null

  const seller = sellers[listing.sellerId]
  if (!seller) return null

  const isLoggedIn = !authLoading && user !== null && user !== undefined
  const hasContact = seller.phone || seller.email
  const isSeller = user?.id === listing.sellerId
  const isAdmin = profile?.role === 'admin'
  const canEdit = isSeller && listing.source === 'db'

  return (
    <div className="fixed inset-0 z-50 bg-black/60 flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="bg-pine-800 border border-pine-600 rounded-t-2xl sm:rounded-2xl w-full sm:max-w-lg max-h-[90vh] overflow-y-auto relative">
        <button onClick={onClose} className="absolute top-4 right-4 text-bone-300 hover:text-blaze-400 z-10">
          <X size={20} />
        </button>

        <PhotoGallery listing={listing} onOpenLightbox={onOpenLightbox} />

        <div className="p-5 flex flex-col gap-4">
          <div>
            <h2 className="font-display font-bold text-bone-100 text-xl leading-snug">{listing.title}</h2>
            <div className="text-blaze-400 font-display font-bold text-2xl mt-2">{listing.price} €</div>
          </div>

          {listing.condition && listing.condition !== '—' && (
            <div className="inline-flex w-fit bg-pine-700/50 text-bone-100 text-xs font-medium px-3 py-1.5 rounded-full">
              {listing.condition}
            </div>
          )}

          {listing.description && (
            <p className="text-bone-300 text-sm leading-relaxed">{listing.description}</p>
          )}

          {authLoading ? (
            <div className="bg-pine-700/30 rounded-lg p-4 text-center">
              <p className="text-bone-300/40 text-sm">A carregar...</p>
            </div>
          ) : isLoggedIn ? (
            <button onClick={() => onOpenSeller(seller)} className="flex items-center justify-between gap-2 bg-pine-700/50 hover:bg-pine-700 rounded-lg p-3 transition-colors text-left">
              <div className="flex items-center gap-2 min-w-0">
                <div className="w-9 h-9 rounded-full bg-pine-700 flex items-center justify-center font-display font-bold text-bone-100 shrink-0">
                  {seller.name.charAt(0)}
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="text-bone-100 text-sm font-medium truncate">{seller.name}</span>
                    {seller.verified && <ShieldCheck size={13} className="text-brass-400 shrink-0" />}
                  </div>
                  <div className="flex items-center gap-1 text-[11px] text-bone-300/60">
                    <MapPin size={11} />
                    {seller.location}
                  </div>
                </div>
              </div>
            </button>
          ) : (
            <div className="bg-pine-700/30 rounded-lg p-4 text-center">
              <p className="text-bone-300/70 text-sm">
                <span className="font-semibold text-blaze-400">Regista-te</span> para ver o vendedor e entrar em contacto.
              </p>
            </div>
          )}

          {isLoggedIn && (!isSeller || isAdmin) && (
            <button onClick={() => onOpenChat(listing, seller)} className="w-full flex items-center justify-center gap-2 bg-blaze-500 hover:bg-blaze-400 text-pine-950 text-sm font-semibold py-3 rounded-lg transition-colors">
              <MessageCircle size={17} />
              Chat com o vendedor
            </button>
          )}

          {isLoggedIn && (!isSeller || isAdmin) && (
            <>
              <button onClick={() => setShowContact((v) => !v)} className="w-full bg-pine-700 hover:bg-pine-600 text-bone-100 text-sm font-semibold py-2.5 rounded-lg transition-colors">
                {showContact ? 'Fechar contactos' : 'Outros contactos'}
              </button>

              {showContact && (
                <div className="flex flex-col gap-2 bg-pine-700/40 rounded-lg p-3">
                  {!hasContact && (
                    <p className="text-xs text-bone-300/60">Este vendedor ainda não adicionou informação de contacto.</p>
                  )}
                  {seller.phone && (
                    <a href={whatsappLink(seller.phone, listing.title)} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 bg-[#25D366] hover:brightness-95 text-pine-950 text-sm font-semibold py-2.5 px-3 rounded-lg transition-all">
                      <MessageCircle size={16} />
                      WhatsApp
                    </a>
                  )}
                  {seller.phone && (
                    <a href={`tel:${seller.phone}`} className="flex items-center gap-2 bg-pine-700 hover:bg-pine-600 text-bone-100 text-sm font-semibold py-2.5 px-3 rounded-lg transition-colors">
                      <Phone size={16} />
                      Ligar · {seller.phone}
                    </a>
                  )}
                  {seller.email && (
                    <a href={emailLink(seller.email, listing.title)} className="flex items-center gap-2 bg-pine-700 hover:bg-pine-600 text-bone-100 text-sm font-semibold py-2.5 px-3 rounded-lg transition-colors">
                      <Mail size={16} />
                      Enviar email
                    </a>
                  )}
                </div>
              )}
            </>
          )}

          {canEdit && (
            <button onClick={() => onEdit(listing)} className="w-full flex items-center justify-center gap-2 bg-pine-700 hover:bg-pine-600 text-bone-100 text-sm font-semibold py-2.5 rounded-lg transition-colors">
              <Pencil size={15} />
              Editar anúncio
            </button>
          )}

          {canDelete && (
            <button onClick={() => onDelete(listing)} className="w-full flex items-center justify-center gap-2 text-red-400 hover:text-red-300 text-sm font-medium py-2 transition-colors">
              <Trash2 size={15} />
              Apagar anúncio
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
