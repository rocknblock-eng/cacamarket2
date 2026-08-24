import { useState, useEffect, useCallback } from 'react'
import { X, Star, AlertCircle } from 'lucide-react'
import { supabase } from '../lib/supabaseClient.js'

export default function FeatureListingsModal({ user, onClose, onFeatured }) {
  const [listings, setListings] = useState([])
  const [featuredSettings, setFeaturedSettings] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [featuring, setFeaturing] = useState(null)

  const loadData = useCallback(async () => {
    setLoading(true)
    const [listingsRes, settingsRes] = await Promise.all([
      supabase
        .from('listings')
        .select('id, title, price, featured, featured_until')
        .eq('seller_id', user.id)
        .order('created_at', { ascending: false }),
      supabase
        .from('platform_settings')
        .select('featured_price_credits, featured_duration_days')
        .eq('id', 1)
        .single(),
    ])
    setLoading(false)
    if (listingsRes.error) {
      setError(listingsRes.error.message)
      return
    }
    setError(null)
    setListings(listingsRes.data || [])
    if (settingsRes.data) setFeaturedSettings(settingsRes.data)
  }, [user])

  useEffect(() => { loadData() }, [loadData])

  function isActiveFeatured(l) {
    return l.featured === true && (!l.featured_until || new Date(l.featured_until) > new Date())
  }

  async function handleFeature(listing) {
    if (!featuredSettings) return
    const confirmMsg = `Destacar "${listing.title}" por ${featuredSettings.featured_duration_days} dias, por ${featuredSettings.featured_price_credits} creditos?`
    if (!window.confirm(confirmMsg)) return

    setFeaturing(listing.id)
    const { error: rpcError } = await supabase.rpc('purchase_featured_listing', { target_listing_id: listing.id })
    setFeaturing(null)

    if (rpcError) {
      alert(rpcError.message)
      return
    }
    loadData()
    onFeatured?.()
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
      <div className="bg-pine-800 border border-pine-600 rounded-2xl w-full max-w-lg p-6 space-y-4 max-h-[80vh] flex flex-col">
        <div className="flex items-center justify-between">
          <h3 className="text-bone-100 font-display font-bold text-base flex items-center gap-2">
            <Star size={18} className="text-brass-400" />
            {'Destacar um anuncio'}
          </h3>
          <button onClick={onClose} className="text-bone-300/50 hover:text-bone-100">
            <X size={20} />
          </button>
        </div>

        {featuredSettings && (
          <p className="text-xs text-bone-300/60">
            {'Cada destaque custa '}<strong className="text-brass-400">{featuredSettings.featured_price_credits}{' creditos'}</strong>
            {' e dura '}<strong className="text-bone-100">{featuredSettings.featured_duration_days}{' dias'}</strong>.
          </p>
        )}

        {error && (
          <div className="text-sm text-red-400 bg-red-400/10 rounded-lg p-3">{error}</div>
        )}

        <div className="flex-1 overflow-y-auto -mx-2 px-2">
          {loading && (
            <div className="text-center text-bone-300/40 text-sm py-8">A carregar...</div>
          )}
          {!loading && listings.length === 0 && (
            <div className="text-center text-bone-300/40 text-sm py-8">
              {'Ainda nao tens anuncios publicados.'}
            </div>
          )}
          {!loading && listings.map((l) => {
            const active = isActiveFeatured(l)
            return (
              <div key={l.id} className="flex items-center justify-between gap-3 py-2.5 border-b border-pine-700/50 last:border-0">
                <div className="min-w-0">
                  <div className="text-bone-100 text-sm font-medium truncate">{l.title}</div>
                  <div className="text-bone-300/50 text-xs">{l.price}{' \u20ac'}</div>
                </div>
                {active ? (
                  <div className="text-xs text-brass-400 shrink-0 flex items-center gap-1">
                    <Star size={12} className="fill-brass-400" />
                    {'Ate '}{new Date(l.featured_until).toLocaleDateString('pt-PT')}
                  </div>
                ) : (
                  <button
                    onClick={() => handleFeature(l)}
                    disabled={featuring === l.id || !featuredSettings}
                    className="text-xs bg-brass-500 hover:bg-brass-400 disabled:opacity-50 text-pine-950 font-semibold px-3 py-1.5 rounded-lg transition-colors shrink-0"
                  >
                    {featuring === l.id ? 'A destacar...' : 'Destacar'}
                  </button>
                )}
              </div>
            )
          })}
        </div>

        <button
          onClick={onClose}
          className="w-full text-bone-300/60 hover:text-bone-100 text-sm py-1 transition-colors"
        >
          Fechar
        </button>
      </div>
    </div>
  )
}
