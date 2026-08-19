import { useState, useEffect, useCallback } from 'react'
import { ArrowLeft, Users, ListChecks, BarChart3, Trash2, Settings, Coins, Plus, Minus, Ban, ShieldOff, ShieldCheck, Star } from 'lucide-react'
import { LISTINGS, SELLERS } from '../data/listings.js'
import { supabase } from '../lib/supabaseClient.js'

const TABS = [
  { id: 'stats', label: 'Estatisticas', icon: BarChart3 },
  { id: 'users', label: 'Utilizadores', icon: Users },
  { id: 'credits', label: 'Creditos', icon: Coins },
  { id: 'moderation', label: 'Moderacao', icon: ListChecks },
  { id: 'settings', label: 'Definicoes', icon: Settings }
]

export default function AdminPanel({
  onBack,
  dbListings,
  dbSellers,
  onDeleteListing,
  platformSettings,
  onSettingsSaved
}) {
  const [tab, setTab] = useState('stats')

  const allListings = [...dbListings, ...LISTINGS]
  const allSellers = { ...SELLERS, ...dbSellers }

  return (
    <div className="max-w-6xl mx-auto px-4 py-6">
      <button
        onClick={onBack}
        className="flex items-center gap-2 text-bone-300 hover:text-blaze-400 text-sm mb-5"
      >
        <ArrowLeft size={16} /> Voltar ao mercado
      </button>

      <h1 className="font-display font-bold text-2xl text-bone-100 mb-5">Painel de Administracao</h1>

      <div className="flex flex-wrap gap-2 mb-6">
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`flex items-center gap-1.5 text-sm font-medium px-3 py-1.5 rounded-full border transition-colors ${
              tab === t.id
                ? 'bg-blaze-500 border-blaze-500 text-pine-950'
                : 'border-pine-600 text-bone-200'
            }`}
          >
            <t.icon size={14} />
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'stats' && <StatsTab listings={allListings} sellers={allSellers} />}
      {tab === 'users' && <UsersTab sellers={allSellers} />}
      {tab === 'credits' && <CreditsTab />}
      {tab === 'moderation' && (
        <ModerationTab listings={allListings} onDeleteListing={onDeleteListing} dbListings={dbListings} />
      )}
      {tab === 'settings' && (
        <SettingsTab settings={platformSettings} onSaved={onSettingsSaved} />
      )}
    </div>
  )
}

function StatsTab({ listings, sellers }) {
  const stats = [
    { label: 'anúncios ativos', value: listings.length },
    { label: 'Vendedores registados', value: Object.keys(sellers).length },
    { label: 'Vendedores verificados', value: Object.values(sellers).filter((s) => s.verified).length },
    { label: 'Valor total em anúncios', value: `${listings.reduce((a, l) => a + Number(l.price), 0)} EUR` }
  ]
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
      {stats.map((s) => (
        <div key={s.label} className="bg-pine-800 border border-pine-700 rounded-xl p-4">
          <div className="text-2xl font-display font-bold text-blaze-400">{s.value}</div>
          <div className="text-xs text-bone-300/70 mt-1">{s.label}</div>
        </div>
      ))}
    </div>
  )
}

function UsersTab() {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [acting, setActing] = useState(null)

  const loadUsers = useCallback(async () => {
    setLoading(true)
    const { data } = await supabase
      .from('profiles')
      .select('id, full_name, email, role, verified, blocked, suspended')
      .order('full_name', { ascending: true })
    if (data) setUsers(data)
    setLoading(false)
  }, [])

  useEffect(() => { loadUsers() }, [loadUsers])

  async function handleAction(userId, field, value, userName) {
    const label = field === 'blocked'
      ? (value ? `banir ${userName}` : `desbanir ${userName}`)
      : (value ? `suspender ${userName}` : `reativar ${userName}`)
    if (!window.confirm(`Tens a certeza que queres ${label}?`)) return
    setActing(userId)
    await supabase.from('profiles').update({ [field]: value }).eq('id', userId)
    setUsers(prev => prev.map(u => u.id === userId ? { ...u, [field]: value } : u))
    setActing(null)
  }

  async function handleDeleteAccount(user) {
    if (!window.confirm(`Tens a certeza que queres eliminar a conta de ${user.full_name}? Esta acao nao pode ser desfeita.\n\nOs creditos do utilizador serao transferidos para o admin.`)) return

    setActing(user.id)

    const { data: userProfile } = await supabase
      .from('profiles')
      .select('listing_credits')
      .eq('id', user.id)
      .single()

    const creditsToTransfer = userProfile?.listing_credits || 0

    const { data: adminProfile } = await supabase
      .from('profiles')
      .select('id, listing_credits')
      .eq('role', 'admin')
      .single()

    if (creditsToTransfer > 0 && adminProfile) {
      const newAdminCredits = (adminProfile.listing_credits || 0) + creditsToTransfer
      await supabase
        .from('profiles')
        .update({ listing_credits: newAdminCredits })
        .eq('id', adminProfile.id)
    }

    await supabase.from('listings').delete().eq('seller_id', user.id)
    await supabase.from('profiles').delete().eq('id', user.id)
    await supabase.functions.invoke('delete-user', { body: { userId: user.id } })

    setUsers(prev => prev.filter(u => u.id !== user.id))
    setActing(null)

    alert(`Conta de ${user.full_name} eliminada.${creditsToTransfer > 0 ? ` ${creditsToTransfer} credito(s) transferido(s) para o admin.` : ''}`)
  }

  const roleLabel =
