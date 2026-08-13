import { useState, useEffect, useCallback } from 'react'
import { ArrowLeft, Users, ListChecks, BarChart3, Trash2, Settings, Coins, Plus, Minus, Ban, ShieldOff, ShieldCheck } from 'lucide-react'
import { LISTINGS, SELLERS } from '../data/listings.js'
import { supabase } from '../lib/supabaseClient.js'

const TABS = [
  { id: 'stats', label: 'Estatísticas', icon: BarChart3 },
  { id: 'users', label: 'Utilizadores', icon: Users },
  { id: 'credits', label: 'Créditos', icon: Coins },
  { id: 'moderation', label: 'Moderação', icon: ListChecks },
  { id: 'settings', label: 'Definições', icon: Settings }
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

      <h1 className="font-display font-bold text-2xl text-bone-100 mb-5">Painel de Administração</h1>

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
        <ModerationTab listings={allListings} onDeleteListing={onDeleteListing} />
      )}
      {tab === 'settings' && (
        <SettingsTab settings={platformSettings} onSaved={onSettingsSaved} />
      )}
    </div>
  )
}

function StatsTab({ listings, sellers }) {
  const stats = [
    { label: 'Anúncios ativos', value: listings.length },
    { label: 'Vendedores registados', value: Object.keys(sellers).length },
    { label: 'Vendedores verificados', value: Object.values(sellers).filter((s) => s.verified).length },
    { label: 'Valor total em anúncios', value: `${listings.reduce((a, l) => a + Number(l.price), 0)} €` }
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
    if (!window.confirm(`Tens a certeza que queres eliminar a conta de ${user.full_name}? Esta ação não pode ser desfeita.\n\nOs créditos do utilizador serão transferidos para o admin.`)) return

    setActing(user.id)

    // 1. Buscar créditos do utilizador
    const { data: userProfile } = await supabase
      .from('profiles')
      .select('listing_credits')
      .eq('id', user.id)
      .single()

    const creditsToTransfer = userProfile?.listing_credits || 0

    // 2. Buscar perfil do admin
    const { data: adminProfile } = await supabase
      .from('profiles')
      .select('id, listing_credits')
      .eq('role', 'admin')
      .single()

    // 3. Transferir créditos para o admin (se houver)
    if (creditsToTransfer > 0 && adminProfile) {
      const newAdminCredits = (adminProfile.listing_credits || 0) + creditsToTransfer
      await supabase
        .from('profiles')
        .update({ listing_credits: newAdminCredits })
        .eq('id', adminProfile.id)
    }

    // 4. Apagar anuncios do utilizador
    await supabase.from('listings').delete().eq('seller_id', user.id)

    // 5. Apagar perfil
    await supabase.from('profiles').delete().eq('id', user.id)

    // 6. Remover da lista local
    setUsers(prev => prev.filter(u => u.id !== user.id))
    setActing(null)

    alert(`Conta de ${user.full_name} eliminada.${creditsToTransfer > 0 ? ` ${creditsToTransfer} crédito(s) transferido(s) para o admin.` : ''}`)
  }

  const roleLabel = (role) => {
    if (role === 'admin') return 'Admin'
    if (role === 'loja') return 'Loja'
    return 'Particular'
  }

  if (loading) return (
    <div className="flex items-center justify-center py-16">
      <span className="text-bone-300/40 text-sm">A carregar...</span>
    </div>
  )

  return (
    <div className="bg-pine-800 border border-pine-700 rounded-xl overflow-hidden">
      {/* Cabeçalho */}
      <div className="grid grid-cols-[1fr_70px_100px_110px_90px] gap-2 px-4 py-2 border-b border-pine-700 text-xs text-bone-300/50 font-semibold uppercase tracking-wide">
        <span>Utilizador</span>
        <span className="text-center">Tipo</span>
        <span className="text-center">Suspender</span>
        <span className="text-center">Banir</span>
        <span className="text-center">Eliminar</span>
      </div>

      {users.length === 0 && (
        <div className="px-4 py-8 text-center text-bone-300/40 text-sm">Nenhum utilizador registado.</div>
      )}

      {users.map((u) => (
        <div key={u.id} className={`grid grid-cols-[1fr_70px_100px_110px_90px] gap-2 items-center px-4 py-3 border-b border-pine-700/50 last:border-0 ${u.blocked ? 'opacity-50' : ''}`}>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="text-bone-100 text-sm font-medium truncate">{u.full_name || '—'}</span>
              {u.blocked && <span className="text-[10px] bg-red-500/20 text-red-400 px-1.5 py-0.5 rounded-full shrink-0">Banido</span>}
              {u.suspended && !u.blocked && <span className="text-[10px] bg-yellow-500/20 text-yellow-400 px-1.5 py-0.5 rounded-full shrink-0">Suspenso</span>}
            </div>
            <div className="text-bone-300/50 text-xs truncate">{u.email || '—'}</div>
          </div>

          <div className="flex justify-center">
            <span className="text-xs text-bone-300/60 bg-pine-700 px-2 py-0.5 rounded-full">{roleLabel(u.role)}</span>
          </div>

          {/* Suspender / Reativar */}
          <div className="flex justify-center">
            {u.role !== 'admin' && (
              <button
                onClick={() => handleAction(u.id, 'suspended', !u.suspended, u.full_name)}
                disabled={acting === u.id || u.blocked}
                className={`flex items-center gap-1 text-xs px-2.5 py-1.5 rounded-lg transition-colors disabled:opacity-40 ${
                  u.suspended
                    ? 'bg-brass-500/20 text-brass-400 hover:bg-brass-500/30'
                    : 'bg-pine-700 text-bone-300 hover:bg-yellow-500/20 hover:text-yellow-400'
                }`}
              >
                {u.suspended ? <ShieldCheck size={13} /> : <ShieldOff size={13} />}
                {u.suspended ? 'Reativar' : 'Suspender'}
              </button>
            )}
          </div>

          {/* Banir / Desbanir */}
          <div className="flex justify-center">
            {u.role !== 'admin' && (
              <button
                onClick={() => handleAction(u.id, 'blocked', !u.blocked, u.full_name)}
                disabled={acting === u.id}
                className={`flex items-center gap-1 text-xs px-2.5 py-1.5 rounded-lg transition-colors disabled:opacity-40 ${
                  u.blocked
                    ? 'bg-pine-700 text-bone-300 hover:bg-brass-500/20 hover:text-brass-400'
                    : 'bg-red-500/10 text-red-400 hover:bg-red-500/20'
                }`}
              >
                <Ban size={13} />
                {u.blocked ? 'Desbanir' : 'Banir'}
              </button>
            )}
          </div>

          {/* Eliminar conta */}
          <div className="flex justify-center">
            {u.role !== 'admin' && (
              <button
                onClick={() => handleDeleteAccount(u)}
                disabled={acting === u.id}
                className="flex items-center gap-1 text-xs px-2.5 py-1.5 rounded-lg bg-red-900/30 text-red-400 hover:bg-red-900/60 transition-colors disabled:opacity-40"
                title="Eliminar conta permanentemente"
              >
                <Trash2 size={13} />
                Eliminar
              </button>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}

function CreditsTab() {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [adjusting, setAdjusting] = useState(null)
  const [amount, setAmount] = useState('')
  const [reason, setReason] = useState('')
  const [saving, setSaving] = useState(false)
  const [feedback, setFeedback] = useState(null)

  const loadUsers = useCallback(async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('profiles')
      .select('id, full_name, email, role, listing_credits, free_listing_used, blocked')
      .order('full_name', { ascending: true })
    // Excluir utilizadores banidos
    if (!error && data) setUsers(data.filter(u => !u.blocked))
    setLoading(false)
  }, [])

  useEffect(() => { loadUsers() }, [loadUsers])

  function openAdjust(user) {
    setAdjusting(user)
    setAmount('')
    setReason('')
    setFeedback(null)
  }

  function closeAdjust() {
    setAdjusting(null)
    setAmount('')
    setReason('')
    setFeedback(null)
  }

  async function handleAdjust(type) {
    const n = parseInt(amount)
    if (!n || n <= 0) { setFeedback({ type: 'error', msg: 'Introduz um número válido.' }); return }
    setSaving(true)
    setFeedback(null)

    const delta = type === 'add' ? n : -n
    const newCredits = Math.max(0, (adjusting.listing_credits || 0) + delta)

    const { error } = await supabase
      .from('profiles')
      .update({ listing_credits: newCredits })
      .eq('id', adjusting.id)

    setSaving(false)
    if (error) {
      setFeedback({ type: 'error', msg: 'Erro ao atualizar créditos: ' + error.message })
    } else {
      setFeedback({ type: 'success', msg: `Créditos atualizados para ${newCredits}.` })
      setUsers(prev => prev.map(u => u.id === adjusting.id ? { ...u, listing_credits: newCredits } : u))
      setTimeout(closeAdjust, 1200)
    }
  }

  const roleLabel = (role) => {
    if (role === 'admin') return 'Admin'
    if (role === 'loja') return 'Loja'
    return 'Particular'
  }

  const roleColor = (role) => {
    if (role === 'admin') return 'text-blaze-400 bg-blaze-500/10'
    if (role === 'loja') return 'text-brass-400 bg-brass-500/10'
    return 'text-bone-300 bg-pine-700'
  }

  if (loading) return (
    <div className="flex items-center justify-center py-16">
      <span className="text-bone-300/40 text-sm">A carregar utilizadores...</span>
    </div>
  )

  return (
    <div className="space-y-4">
      <div className="bg-pine-800 border border-pine-700 rounded-xl overflow-hidden">
        <div className="grid grid-cols-[1fr_80px_80px_80px_100px] gap-2 px-4 py-2 border-b border-pine-700 text-xs text-bone-300/50 font-semibold uppercase tracking-wide">
          <span>Utilizador</span>
          <span className="text-center">Tipo</span>
          <span className="text-center">Créditos</span>
          <span className="text-center">1.º Grátis</span>
          <span className="text-center">Ação</span>
        </div>

        {users.length === 0 && (
          <div className="px-4 py-8 text-center text-bone-300/40 text-sm">
            Nenhum utilizador registado.
          </div>
        )}

        {users.map((u) => (
          <div key={u.id} className="grid grid-cols-[1fr_80px_80px_80px_100px] gap-2 items-center px-4 py-3 border-b border-pine-700/50 last:border-0">
            <div className="min-w-0">
              <div className="text-bone-100 text-sm font-medium truncate">{u.full_name || '—'}</div>
              <div className="text-bone-300/50 text-xs truncate">{u.email || '—'}</div>
            </div>

            <div className="flex justify-center">
              <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${roleColor(u.role)}`}>
                {roleLabel(u.role)}
              </span>
            </div>

            <div className="text-center font-display font-bold text-blaze-400 text-lg">
              {u.listing_credits ?? 0}
            </div>

            <div className="text-center text-sm">
              {u.role === 'particular'
                ? (u.free_listing_used ? '✅' : '⬜')
                : '—'}
            </div>

            <div className="flex justify-center">
              <button
                onClick={() => openAdjust(u)}
                className="text-xs bg-pine-700 hover:bg-pine-600 text-bone-100 px-3 py-1.5 rounded-lg transition-colors"
              >
                Ajustar
              </button>
            </div>
          </div>
        ))}
      </div>

      {adjusting && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-pine-800 border border-pine-600 rounded-2xl w-full max-w-sm p-6 space-y-4">
            <h3 className="text-bone-100 font-display font-bold text-base">
              Ajustar créditos — {adjusting.full_name}
            </h3>
            <div className="bg-pine-700/50 rounded-lg px-3 py-2 text-sm">
              <span className="text-bone-300/70">Créditos actuais: </span>
              <span className="text-blaze-400 font-bold">{adjusting.listing_credits ?? 0}</span>
            </div>

            <div>
              <label className="text-xs text-bone-300/70 block mb-1">Quantidade</label>
              <input
                type="number"
                min="1"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="Ex: 5"
                className="bg-pine-700 border border-pine-600 rounded-lg px-3 py-2 text-sm text-bone-100 outline-none focus:border-blaze-500 w-full"
              />
            </div>

            <div>
              <label className="text-xs text-bone-300/70 block mb-1">Motivo (opcional)</label>
              <input
                type="text"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Ex: Bónus de boas-vindas"
                className="bg-pine-700 border border-pine-600 rounded-lg px-3 py-2 text-sm text-bone-100 outline-none focus:border-blaze-500 w-full"
              />
            </div>

            {feedback && (
              <p className={`text-xs ${feedback.type === 'success' ? 'text-brass-400' : 'text-red-400'}`}>
                {feedback.msg}
              </p>
            )}

            <div className="flex gap-2">
              <button
                onClick={() => handleAdjust('add')}
                disabled={saving}
                className="flex-1 flex items-center justify-center gap-1.5 bg-brass-500 hover:bg-brass-400 disabled:opacity-50 text-pine-950 font-semibold text-sm py-2.5 rounded-lg transition-colors"
              >
                <Plus size={15} /> Bónus
              </button>
              <button
                onClick={() => handleAdjust('remove')}
                disabled={saving}
                className="flex-1 flex items-center justify-center gap-1.5 bg-red-500/80 hover:bg-red-500 disabled:opacity-50 text-white font-semibold text-sm py-2.5 rounded-lg transition-colors"
              >
                <Minus size={15} /> Penalização
              </button>
            </div>

            <button
              onClick={closeAdjust}
              className="w-full text-bone-300/60 hover:text-bone-100 text-sm py-1 transition-colors"
            >
              Cancelar
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

function SettingsTab({ settings, onSaved }) {
  const [launchDate, setLaunchDate] = useState(settings?.launch_date ?? '')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  async function handleSave() {
    setSaving(true)
    setSaved(false)
    const { error } = await supabase
      .from('platform_settings')
      .update({ launch_date: launchDate || null })
      .eq('id', 1)
    setSaving(false)
    if (!error) {
      setSaved(true)
      onSaved?.()
    }
  }

  const freeDays = settings?.free_period_days ?? 90

  const freeUntilText = (() => {
    if (!launchDate) return null
    const launch = new Date(launchDate)
    const until = new Date(launch)
    until.setDate(until.getDate() + freeDays)
    return until.toLocaleDateString('pt-PT')
  })()

  const isCurrentlyFree = (() => {
    if (!launchDate) return true
    const launch = new Date(launchDate)
    const until = new Date(launch)
    until.setDate(until.getDate() + freeDays)
    return new Date() < until
  })()

  return (
    <div className="bg-pine-800 border border-pine-700 rounded-xl p-5 max-w-md space-y-4">
      <div>
        <h3 className="text-bone-100 font-semibold text-sm mb-2">Período gratuito de lançamento</h3>
        <div className="bg-pine-700/50 rounded-lg px-3 py-2 mb-3 text-xs">
          <div className="font-semibold text-bone-100 mb-1">
            {isCurrentlyFree ? '🟢 ESTADO: Grátis para todos' : '🔴 ESTADO: Cobrança ativa'}
          </div>
          <div className="text-bone-300/70">
            {isCurrentlyFree
              ? launchDate
                ? `Grátis até ${freeUntilText}`
                : 'Sem data definida = sempre grátis'
              : 'Período de graça terminou. Preços ativos.'}
          </div>
        </div>
        <p className="text-bone-300/70 text-xs mb-3">
          Enquanto nenhuma data estiver definida, publicar é grátis para toda a gente. Assim que
          definirem uma data, o site fica grátis durante {freeDays} dias a partir dessa data —
          depois disso, aplicam-se as regras de preços (1€ particular, 5€ pacote loja).
        </p>
      </div>

      <div>
        <label className="text-xs text-bone-300/70 block mb-1">Data de lançamento ao público</label>
        <input
          type="date"
          value={launchDate ?? ''}
          onChange={(e) => setLaunchDate(e.target.value)}
          className="bg-pine-700 border border-pine-600 rounded-lg px-3 py-2 text-sm text-bone-100 outline-none focus:border-blaze-500 w-full"
        />
      </div>

      {freeUntilText && (
        <p className="text-xs text-brass-400">Data definida — será grátis para todos até <strong>{freeUntilText}</strong>.</p>
      )}

      <div className="flex items-center gap-3">
        <button
          onClick={handleSave}
          disabled={saving}
          className="bg-blaze-500 hover:bg-blaze-600 disabled:opacity-60 transition-colors text-pine-950 font-semibold text-sm px-4 py-2 rounded-lg"
        >
          {saving ? 'A guardar...' : 'Guardar'}
        </button>
        {saved && <span className="text-xs text-brass-400">Guardado.</span>}
      </div>
    </div>
  )
}

function ModerationTab({ listings, onDeleteListing }) {
  return (
    <div className="bg-pine-800 border border-pine-700 rounded-xl overflow-hidden">
      {listings.map((l) => (
        <div key={l.id} className="flex items-center justify-between px-4 py-3 border-b border-pine-700 last:border-0 gap-3">
          <div className="min-w-0">
            <div className="text-bone-100 text-sm font-medium truncate">{l.title}</div>
            <div className="text-bone-300/60 text-xs">
              {l.price} € {l.source === 'demo' && '· Artigo de exemplo'}
            </div>
          </div>
          <button
            onClick={() => onDeleteListing(l)}
            className="text-red-400 hover:text-red-300 shrink-0"
            title="Apagar anúncio"
          >
            <Trash2 size={18} />
          </button>
        </div>
      ))}
    </div>
  )
}
