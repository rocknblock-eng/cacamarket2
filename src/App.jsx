import { useState, useMemo, useEffect, useCallback } from 'react'
import { X, ChevronLeft, ChevronRight } from 'lucide-react'
import Header from './components/Header.jsx'
import CategoryNav from './components/CategoryNav.jsx'
import ProductGrid from './components/ProductGrid.jsx'
import ProductDetailModal from './components/ProductDetailModal.jsx'
import SellerProfileModal from './components/SellerProfileModal.jsx'
import AuthModal from './components/AuthModal.jsx'
import SellModal from './components/SellModal.jsx'
import PayWallModal from './components/PayWallModal.jsx'
import AdminPanel from './components/AdminPanel.jsx'
import UserProfileModal from './components/UserProfileModal.jsx'
import ChatModal from './components/ChatModal.jsx'
import InboxModal from './components/InboxModal.jsx'
import LegalModal from './components/LegalModal.jsx'
import EditListingModal from './components/EditListingModal.jsx'
import ResetPassword from './components/ResetPassword.jsx'
import { LISTINGS, SELLERS } from './data/listings.js'
import { supabase } from './lib/supabaseClient.js'

function roleToType(role) {
  if (role === 'loja') return 'Loja Profissional'
  if (role === 'admin') return 'Administrador'
  return 'Particular'
}

// Detetar se estamos na página de reset de password
const isResetPasswordPage = window.location.pathname === '/reset-password'

export default function App() {
  // Se o URL for /reset-password, mostra são essa pÃ¡gina
  if (isResetPasswordPage) {
    return <ResetPassword />
  }

  const [view, setView] = useState('market') // 'market' | 'admin'
  const [category, setCategory] = useState(null)
  const [search, setSearch] = useState('')
  const [selectedSeller, setSelectedSeller] = useState(null)
  const [authOpen, setAuthOpen] = useState(false)
  const [sellOpen, setSellOpen] = useState(false)
  const [payWallOpen, setPayWallOpen] = useState(false)
  const [paypalStatus, setPaypalStatus] = useState(null) // null | 'confirming' | 'success' | 'error'
  const [viewingListing, setViewingListing] = useState(null)
  const [editingListing, setEditingListing] = useState(null)
  const [profileOpen, setProfileOpen] = useState(false)
  const [inboxOpen, setInboxOpen] = useState(false)
  const [activeChat, setActiveChat] = useState(null)
  const [unreadCount, setUnreadCount] = useState(0)
  const [legalOpen, setLegalOpen] = useState(null) // 'terms' | 'privacy' | null
  const [lightbox, setLightbox] = useState(null) // { images: [], index: number } | null

  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)

  const [dbListings, setDbListings] = useState([])
  const [deletedDemoIds, setDeletedDemoIds] = useState([])
  const [dbSellers, setDbSellers] = useState({})
  const [platformSettings, setPlatformSettings] = useState(null)
  const [settingsLoaded, setSettingsLoaded] = useState(false)

  const loadSettings = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('platform_settings')
        .select('*')
        .eq('id', 1)
        .single()

      if (error) {
        console.warn('Platform settings não carregaram (esperado se tabela vazia):', error.message)
      } else if (data) {
        setPlatformSettings(data)
      }
    } catch (err) {
      console.warn('Erro ao carregar platform_settings:', err.message)
    } finally {
      setSettingsLoaded(true)
    }
  }, [])

  useEffect(() => {
    loadSettings()
  }, [loadSettings])

  const isFreePeriod = useMemo(() => {
    if (!settingsLoaded || !platformSettings) return true
    if (!platformSettings.launch_date) return true
    const launch = new Date(platformSettings.launch_date)
    const freeDays = platformSettings.free_period_days || 90
    const freeUntil = new Date(launch)
    freeUntil.setDate(freeUntil.getDate() + freeDays)
    return new Date() < freeUntil
  }, [platformSettings, settingsLoaded])

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setUser(data.session?.user ?? null)
    })

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
      if (!session?.user) setProfile(null)
    })

    return () => listener.subscription.unsubscribe()
  }, [])

  const refreshProfile = useCallback(async (userId) => {
    if (!userId) return
    const { data } = await supabase.from('profiles').select('*').eq('id', userId).single()
    setProfile(data)
  }, [])

  useEffect(() => {
    if (!user) return
    refreshProfile(user.id)
  }, [user, refreshProfile])

  const loadUnreadCount = useCallback(async () => {
    if (!user) { setUnreadCount(0); return }
    const { data: convs } = await supabase
      .from('conversations')
      .select('id')
      .or(`buyer_id.eq.${user.id},seller_id.eq.${user.id}`)
    if (!convs || convs.length === 0) { setUnreadCount(0); return }
    const { count } = await supabase
      .from('messages')
      .select('id', { count: 'exact', head: true })
      .in('conversation_id', convs.map((c) => c.id))
      .neq('sender_id', user.id)
      .is('read_at', null)
    setUnreadCount(count || 0)
  }, [user])

  useEffect(() => {
    if (!user) return
    loadUnreadCount()
    const channel = supabase
      .channel('unread-badge')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages' }, loadUnreadCount)
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'messages' }, loadUnreadCount)
      .subscribe()
    return () => supabase.removeChannel(channel)
  }, [user, loadUnreadCount])

  const loadListings = useCallback(async () => {
    const { data, error } = await supabase
      .from('listings')
      .select('id, title, category, price, condition, description, image_url, image_urls, seller_id, created_at, expires_at, featured, profiles(id, full_name, role, verified, rating, reviews_count, location, member_since, phone, email)')
      .order('created_at', { ascending: false })

    if (error || !data) return

    const now = new Date()
    const mappedListings = data
      .filter(row => !row.expires_at || new Date(row.expires_at) > now)
      .map((row) => ({
      id: row.id,
      title: row.title,
      category: row.category,
      price: row.price,
      sellerId: row.seller_id,
      condition: row.condition,
      image: row.image_url,
      image_url: row.image_url,
      image_urls: row.image_urls || null,
      description: row.description,
      featured: row.featured || false,
        source: 'db'
    }))

    const sellersFromDb = {}
    data.forEach((row) => {
      const p = row.profiles
      if (!p) return
      sellersFromDb[p.id] = {
        id: p.id,
        name: p.full_name,
        type: roleToType(p.role),
        verified: p.verified,
        rating: p.rating || 0,
        reviews: p.reviews_count || 0,
        location: p.location || 'â€”',
        memberSince: p.member_since ? new Date(p.member_since).getFullYear().toString() : 'â€”',
        phone: p.phone || null,
        email: p.email || null
      }
    })

    setDbListings(mappedListings)
    setDbSellers(sellersFromDb)
  }, [])

  useEffect(() => {
    loadListings()
  }, [loadListings])

  async function handleLogout() {
    await supabase.auth.signOut()
    setView('market')
  }

  function needsPayment(profile) {
    if (isFreePeriod) return false
    if (!profile) return true
    if (profile.role === 'admin') return false
    if (profile.role === 'particular') {
      if (!profile.free_listing_used) return false
      return profile.listing_credits <= 0
    }
    if (profile.role === 'loja') {
      return profile.listing_credits <= 0
    }
    return true
  }

  async function handleOpenSell() {
    const { data: freshProfile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single()

    if (freshProfile) setProfile(freshProfile)

    const profileToCheck = freshProfile ?? profile

    if (needsPayment(profileToCheck)) {
      setPayWallOpen(true)
    } else {
      setSellOpen(true)
    }
  }

  function handlePaymentRequiredInSell() {
    setSellOpen(false)
    setPayWallOpen(true)
  }

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const orderId = params.get('token')
    const paypalFlag = params.get('paypal')

    if (paypalFlag === 'cancel') {
      window.history.replaceState({}, '', window.location.pathname)
      return
    }

    if (paypalFlag === 'return' && orderId && user) {
      setPaypalStatus('confirming')
      supabase.functions
        .invoke('paypal-capture-order', { body: { orderId } })
        .then(async ({ data, error }) => {
          window.history.replaceState({}, '', window.location.pathname)
          if (error || !data?.success) {
            setPaypalStatus('error')
            return
          }
          await refreshProfile(user.id)
          setPaypalStatus('success')
          setSellOpen(true)
        })
    }
  }, [user, refreshProfile])

  function extractStoragePath(imageUrl) {
    if (!imageUrl) return null
    const marker = '/listing-images/'
    const idx = imageUrl.indexOf(marker)
    if (idx === -1) return null
    return imageUrl.slice(idx + marker.length)
  }

  async function handleDeleteListing(listing) {
    const confirmed = window.confirm(
      'Tens a certeza que queres apagar este anúncio? Esta ação não pode ser desfeita.'
    )
    if (!confirmed) return

    if (listing.source !== 'db') {
      setDeletedDemoIds(prev => [...prev, listing.id])
      setViewingListing(null)
      return
    }

    const storagePath = extractStoragePath(listing.image)
    if (storagePath) {
      await supabase.storage.from('listing-images').remove([storagePath])
    }

    const { error } = await supabase.from('listings').delete().eq('id', listing.id)
    if (error) {
      alert('Não foi possí­vel apagar o anúncio. Tenta novamente.')
      return
    }

    setViewingListing(null)
    loadListings()
  }

  const allListings = useMemo(
    () => [...dbListings, ...LISTINGS.filter(l => !deletedDemoIds.includes(l.id)).map((l) => ({ ...l, source: 'demo' }))],
    [dbListings, deletedDemoIds]
  )
  const allSellers = useMemo(() => ({ ...SELLERS, ...dbSellers }), [dbSellers])

  const filtered = useMemo(() => {
    return allListings.filter((l) => {
      const matchesCategory = category ? l.category === category : true
      const matchesSearch = search
        ? l.title.toLowerCase().includes(search.toLowerCase())
        : true
      return matchesCategory && matchesSearch
    })
  }, [allListings, category, search])

  return (
    <div className="min-h-screen bg-pine-900">
      <Header
        onOpenAuth={() => setAuthOpen(true)}
        onOpenAdmin={() => setView('admin')}
        onOpenSell={handleOpenSell}
        onOpenProfile={() => setProfileOpen(true)}
        onOpenInbox={() => setInboxOpen(true)}
        search={search}
        setSearch={setSearch}
        profile={profile}
        onLogout={handleLogout}
        unreadCount={unreadCount}
      />

      {view === 'admin' && profile?.role !== 'admin' ? (
        <div className="max-w-6xl mx-auto px-4 py-16 text-center text-bone-300/60">
          NÃ£o tens permissÃ£o para aceder ao painel de administraÃ§Ã£o.
        </div>
      ) : view === 'market' ? (
        <>
          <CategoryNav active={category} setActive={setCategory} />
          <ProductGrid
            listings={filtered}
            onOpenSeller={setSelectedSeller}
            onView={setViewingListing}
            sellers={allSellers}
          />
        </>
      ) : (
        <AdminPanel
          onBack={() => setView('market')}
          dbListings={dbListings}
          dbSellers={dbSellers}
          onDeleteListing={handleDeleteListing}
          platformSettings={platformSettings}
          onSettingsSaved={loadSettings}
        />
      )}

      <SellerProfileModal seller={selectedSeller} onClose={() => setSelectedSeller(null)} />
      {profileOpen && user && profile && (
        <UserProfileModal
          user={user}
          profile={profile}
          isFreePeriod={isFreePeriod}
          onClose={() => setProfileOpen(false)}
          onSaved={() => refreshProfile(user.id)}
        />
      )}
      {authOpen && (
        <AuthModal
          onClose={() => setAuthOpen(false)}
          onAuthenticated={(u) => { setUser(u); refreshProfile(u.id) }}
          onOpenLegal={(tab) => setLegalOpen(tab)}
        />
      )}
      {paypalStatus === 'confirming' && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center">
          <div className="bg-pine-800 border border-pine-600 rounded-xl px-6 py-4 text-bone-100 text-sm">
            A confirmar o teu pagamento com o PayPal...
          </div>
        </div>
      )}
      {paypalStatus === 'error' && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center">
          <div className="bg-pine-800 border border-pine-600 rounded-xl px-6 py-5 text-center max-w-xs">
            <p className="text-bone-100 text-sm mb-3">
              NÃ£o foi possÃ­vel confirmar o pagamento. Se o dinheiro foi debitado, contacta-nos.
            </p>
            <button
              onClick={() => setPaypalStatus(null)}
              className="text-blaze-400 text-sm font-semibold"
            >
              Fechar
            </button>
          </div>
        </div>
      )}
      {payWallOpen && profile && (
        <PayWallModal
          profile={profile}
          onClose={() => setPayWallOpen(false)}
        />
      )}
      {sellOpen && user && (
        <SellModal
          user={user}
          profile={profile}
          isFreePeriod={isFreePeriod}
          onClose={() => setSellOpen(false)}
          onPaymentRequired={handlePaymentRequiredInSell}
          onCreated={() => {
            loadListings()
            refreshProfile(user.id)
          }}
        />
      )}
      <ProductDetailModal
        key={viewingListing?.id || 'none'}
        listing={viewingListing}
        onClose={() => setViewingListing(null)}
        onOpenSeller={setSelectedSeller}
        onOpenChat={(listing, seller) => {
          setViewingListing(null)
          setActiveChat({ listing, seller })
        }}
        sellers={allSellers}
        user={user}
        profile={profile}
        onEdit={(listing) => { setViewingListing(null); setEditingListing(listing) }}
        onDelete={handleDeleteListing}
        canDelete={
          !!viewingListing &&
          viewingListing.source === 'db' &&
          (user?.id === viewingListing.sellerId || profile?.role === 'admin')
        }
        onOpenLightbox={(images, index) => setLightbox({ images, index })}
      />

      {editingListing && (
        <EditListingModal
          user={user}
          listing={editingListing}
          onClose={() => setEditingListing(null)}
          onUpdated={() => {
            setEditingListing(null)
            loadListings()
          }}
        />
      )}

      {lightbox && (
        <div
          className="fixed inset-0 bg-black/95 flex items-center justify-center"
          style={{ zIndex: 9999 }}
          onClick={() => setLightbox(null)}
        >
          <img
            src={lightbox.images[lightbox.index]}
            alt=""
            className="max-w-[95vw] max-h-[90vh] object-contain"
            onClick={e => e.stopPropagation()}
          />
          <button
            onClick={() => setLightbox(null)}
            className="absolute top-4 right-4 text-white hover:text-orange-400 bg-black/50 rounded-full p-2"
          >
            <X size={24} />
          </button>
          {lightbox.images.length > 1 && (
            <>
              <button
                onClick={e => { e.stopPropagation(); setLightbox(l => ({ ...l, index: (l.index - 1 + l.images.length) % l.images.length })) }}
                className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/80 text-white rounded-full p-2"
              >
                <ChevronLeft size={24} />
              </button>
              <button
                onClick={e => { e.stopPropagation(); setLightbox(l => ({ ...l, index: (l.index + 1) % l.images.length })) }}
                className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/80 text-white rounded-full p-2"
              >
                <ChevronRight size={24} />
              </button>
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/50 text-white text-sm px-3 py-1 rounded-full">
                {lightbox.index + 1} / {lightbox.images.length}
              </div>
            </>
          )}
        </div>
      )}
      {inboxOpen && user && (
        <InboxModal
          user={user}
          profile={profile}
          onClose={() => setInboxOpen(false)}
          onOpenChat={(conv) => {
            setInboxOpen(false)
            setActiveChat({
              listing: conv.listings,
              seller: conv.seller,
              conversationId: conv.id
            })
          }}
        />
      )}
      {legalOpen && (
        <LegalModal
          initialTab={legalOpen}
          onClose={() => setLegalOpen(null)}
        />
      )}

      {activeChat && user && (
        <ChatModal
          user={user}
          profile={profile}
          listing={activeChat.listing}
          seller={activeChat.seller}
          conversationId={activeChat.conversationId}
          onClose={() => { setActiveChat(null); loadUnreadCount() }}
        />
      )}

      <footer className="border-t border-pine-700 mt-8 py-5 text-center">
        <div className="flex items-center justify-center gap-4 text-xs text-bone-300/40">
          <button
            onClick={() => setLegalOpen('terms')}
            className="hover:text-bone-200 transition-colors underline underline-offset-2"
          >
            Termos e Condições
          </button>
          <span>·</span>
          <button
            onClick={() => setLegalOpen('privacy')}
            className="hover:text-bone-200 transition-colors underline underline-offset-2"
          >
            Polí­tica de Privacidade
          </button>
          <span>·</span>
          <span>© {new Date().getFullYear()} WildMarket</span>
        </div>
      </footer>
    </div>
  )
}
