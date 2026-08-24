import { useState, useEffect, useCallback } from 'react'
import { ArrowLeft, Users, ListChecks, BarChart3, Trash2, Settings, Coins, Plus, Minus, Ban, ShieldOff, ShieldCheck, Star, Camera, AlertTriangle } from 'lucide-react'
import { LISTINGS, SELLERS } from '../data/listings.js'
import { supabase } from '../lib/supabaseClient.js'

const TABS = [
  { id: 'stats', label: 'Estatisticas', icon: BarChart3 },
  { id: 'users', label: 'Utilizadores', icon: Users },
  { id: 'credits', label: 'Creditos', icon: Coins },
  { id: 'cameras', label: 'Cameras', icon: Camera },
  { id: 'featured', label: 'Destaques', icon: Star },
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

      <div className="flex overflow-x-auto gap-2 mb-6 pb-1 -mx-4 px-4 scrollbar-hide">
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`flex items-center gap-1.5 text-sm font-medium px-3 py-1.5 rounded-full border transition-colors shrink-0 ${
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
      {tab === 'cameras' && <CamerasTab />}
      {tab === 'featured' && <FeaturedSettingsTab settings={platformSettings} onSaved={onSettingsSaved} />}
      {tab === 'moderation' && (
        <ModerationTab listings={allListings} onDeleteListing={onDeleteListing} dbListings={dbListings} sellers={allSellers} />
      )}
      {tab === 'settings' && (
        <SettingsTab settings={platformSettings} onSaved={onSettingsSaved} />
      )}
    </div>
  )
}

function StatsTab({ listings, sellers }) {
  const stats = [
    { label: 'an\u00fancios ativos', value: listings.length },
    { label: 'Vendedores registados', value: Object.keys(sellers).length },
    { label: 'Vendedores verificados', value: Object.values(sellers).filter((s) => s.verified).length },
    { label: 'Valor total em an\u00fancios', value: `${listings.reduce((a, l) => a + Number(l.price), 0)} EUR` }
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

    // Esta e a eliminacao que conta a serio (remove a conta do sistema de
    // autenticacao; o perfil, anuncios e movimentos de creditos sao
    // arrastados automaticamente). Se falhar, avisamos e NAO fingimos que
    // a conta foi eliminada.
    const { data: deleteResult, error: deleteError } = await supabase.functions.invoke('delete-user', { body: { userId: user.id } })

    if (deleteError || deleteResult?.error) {
      setActing(null)
      alert(`N\u00e3o foi poss\u00edvel eliminar a conta: ${deleteResult?.error || deleteError?.message || 'erro desconhecido'}`)
      return
    }

    setUsers(prev => prev.filter(u => u.id !== user.id))
    setActing(null)

    alert(`Conta de ${user.full_name} eliminada.${creditsToTransfer > 0 ? ` ${creditsToTransfer} credito(s) transferido(s) para o admin.` : ''}`)
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
    <div className="overflow-x-auto -mx-1">
    <div className="bg-pine-800 border border-pine-700 rounded-xl overflow-hidden min-w-[500px]">
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
              <span className="text-bone-100 text-sm font-medium truncate">{u.full_name || '\u2014'}</span>
              {u.blocked && <span className="text-[10px] bg-red-500/20 text-red-400 px-1.5 py-0.5 rounded-full shrink-0">Banido</span>}
              {u.suspended && !u.blocked && <span className="text-[10px] bg-yellow-500/20 text-yellow-400 px-1.5 py-0.5 rounded-full shrink-0">Suspenso</span>}
            </div>
            <div className="text-bone-300/50 text-xs truncate">{u.email || '\u2014'}</div>
          </div>

          <div className="flex justify-center">
            <span className="text-xs text-bone-300/60 bg-pine-700 px-2 py-0.5 rounded-full">{roleLabel(u.role)}</span>
          </div>

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

          <div className="flex justify-center">
            {u.role !== 'admin' && (
              <button
                onClick={() => handleDeleteAccount(u)}
                disabled={acting === u.id}
                className="flex items-center gap-1 text-xs px-2.5 py-1.5 rounded-lg bg-red-900/30 text-red-400 hover:bg-red-900/60 transition-colors disabled:opacity-40"
              >
                <Trash2 size={13} />
                Eliminar
              </button>
            )}
          </div>
        </div>
      ))}
    </div>
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
    if (!n || n <= 0) { setFeedback({ type: 'error', msg: 'Introduz um numero valido.' }); return }
    setSaving(true)
    setFeedback(null)

    const delta = type === 'add' ? n : -n

    // Usa a funcao admin_adjust_credits (em vez de um update direto) para que
    // este ajuste fique automaticamente registado na conta corrente do utilizador.
    const { data: newCredits, error } = await supabase
      .rpc('admin_adjust_credits', {
        target_user_id: adjusting.id,
        delta,
        reason: reason || null
      })

    setSaving(false)
    if (error) {
      setFeedback({ type: 'error', msg: 'Erro ao atualizar creditos: ' + error.message })
    } else {
      setFeedback({ type: 'success', msg: `Creditos atualizados para ${newCredits}.` })
      setUsers(prev => prev.map(u => u.id === adjusting.id ? { ...u, listing_credits: newCredits } : u))
      setTimeout(closeAdjust, 1200)
    }
  }

  const [ledgerUser, setLedgerUser] = useState(null)
  const [ledger, setLedger] = useState([])
  const [ledgerLoading, setLedgerLoading] = useState(false)

  async function openLedger(user) {
    setLedgerUser(user)
    setLedgerLoading(true)
    const { data, error } = await supabase
      .from('credit_transactions')
      .select('id, type, amount, balance_after, description, created_at')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
    if (!error && data) setLedger(data)
    setLedgerLoading(false)
  }

  function closeLedger() {
    setLedgerUser(null)
    setLedger([])
  }

  const typeLabel = (type) => {
    if (type === 'compra_paypal') return 'Compra PayPal'
    if (type === 'ajuste_admin') return 'Ajuste admin'
    if (type === 'saldo_inicial') return 'Saldo inicial'
    return type
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
      <div className="overflow-x-auto -mx-1">
      <div className="bg-pine-800 border border-pine-700 rounded-xl overflow-hidden min-w-[480px]">
        <div className="grid grid-cols-[1fr_70px_70px_70px_170px] gap-2 px-4 py-2 border-b border-pine-700 text-xs text-bone-300/50 font-semibold uppercase tracking-wide">
          <span>Utilizador</span>
          <span className="text-center">Tipo</span>
          <span className="text-center">Creditos</span>
          <span className="text-center">1. Gratis</span>
          <span className="text-center">Acao</span>
        </div>

        {users.length === 0 && (
          <div className="px-4 py-8 text-center text-bone-300/40 text-sm">
            Nenhum utilizador registado.
          </div>
        )}

        {users.map((u) => (
          <div key={u.id} className="grid grid-cols-[1fr_70px_70px_70px_170px] gap-2 items-center px-4 py-3 border-b border-pine-700/50 last:border-0">
            <div className="min-w-0">
              <div className="text-bone-100 text-sm font-medium truncate">{u.full_name || '\u2014'}</div>
              <div className="text-bone-300/50 text-xs truncate">{u.email || '\u2014'}</div>
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
              {u.role === 'particular' ? (u.free_listing_used ? '\u2705' : '\u2b1c') : '\u2014'}
            </div>
            <div className="flex justify-center gap-1.5">
              <button
                onClick={() => openLedger(u)}
                className="text-xs bg-pine-700 hover:bg-pine-600 text-bone-100 px-2.5 py-1.5 rounded-lg transition-colors"
              >
                Conta corrente
              </button>
              <button
                onClick={() => openAdjust(u)}
                className="text-xs bg-pine-700 hover:bg-pine-600 text-bone-100 px-2.5 py-1.5 rounded-lg transition-colors"
              >
                Ajustar
              </button>
            </div>
          </div>
        ))}
      </div>
      </div>

      {adjusting && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-pine-800 border border-pine-600 rounded-2xl w-full max-w-sm p-6 space-y-4">
            <h3 className="text-bone-100 font-display font-bold text-base">
              {'Ajustar creditos \u2014 '}{adjusting.full_name}
            </h3>
            <div className="bg-pine-700/50 rounded-lg px-3 py-2 text-sm">
              <span className="text-bone-300/70">Creditos actuais: </span>
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
                placeholder="Ex: Bonus de boas-vindas"
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
                <Plus size={15} /> Bonus
              </button>
              <button
                onClick={() => handleAdjust('remove')}
                disabled={saving}
                className="flex-1 flex items-center justify-center gap-1.5 bg-red-500/80 hover:bg-red-500 disabled:opacity-50 text-white font-semibold text-sm py-2.5 rounded-lg transition-colors"
              >
                <Minus size={15} /> Penalizacao
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

      {ledgerUser && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-pine-800 border border-pine-600 rounded-2xl w-full max-w-lg p-6 space-y-4 max-h-[80vh] flex flex-col">
            <div>
              <h3 className="text-bone-100 font-display font-bold text-base">
                {'Conta corrente \u2014 '}{ledgerUser.full_name}
              </h3>
              <p className="text-bone-300/50 text-xs">{ledgerUser.email}</p>
            </div>

            <div className="flex-1 overflow-y-auto -mx-2 px-2">
              {ledgerLoading && (
                <div className="text-center text-bone-300/40 text-sm py-8">A carregar...</div>
              )}
              {!ledgerLoading && ledger.length === 0 && (
                <div className="text-center text-bone-300/40 text-sm py-8">
                  Sem movimentos registados ainda.
                </div>
              )}
              {!ledgerLoading && ledger.map((mov) => (
                <div key={mov.id} className="flex items-center justify-between gap-3 py-2.5 border-b border-pine-700/50 last:border-0">
                  <div className="min-w-0">
                    <div className="text-bone-100 text-sm font-medium">{typeLabel(mov.type)}</div>
                    <div className="text-bone-300/50 text-xs truncate">
                      {mov.description || '\u2014'}
                    </div>
                    <div className="text-bone-300/40 text-[11px]">
                      {new Date(mov.created_at).toLocaleString('pt-PT')}
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <div className={`font-display font-bold text-sm ${mov.amount >= 0 ? 'text-brass-400' : 'text-red-400'}`}>
                      {mov.amount >= 0 ? '+' : ''}{mov.amount}
                    </div>
                    <div className="text-bone-300/40 text-[11px]">saldo: {mov.balance_after}</div>
                  </div>
                </div>
              ))}
            </div>

            <button
              onClick={closeLedger}
              className="w-full text-bone-300/60 hover:text-bone-100 text-sm py-1 transition-colors"
            >
              Fechar
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

function CamerasTab() {
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [clearing, setClearing] = useState(null) // codigo da camara a limpar, ou 'ALL'

  const loadData = useCallback(async () => {
    setLoading(true)
    const { data, error: rpcError } = await supabase.rpc('admin_camera_activity_summary')
    setLoading(false)
    if (rpcError) {
      setError(rpcError.message)
      return
    }
    setError(null)
    setRows(data || [])
  }, [])

  useEffect(() => { loadData() }, [loadData])

  const suspiciousCount = rows.filter((r) => r.suspicious).length

  async function handleClear(code, label) {
    const confirmMsg = code
      ? `Limpar o historico desta camara (${label})? Os registos de IP/fotos sao apagados, mas a camara continua ativa normalmente.`
      : 'Limpar o historico de TODAS as cameras? Esta acao nao pode ser desfeita.'
    if (!window.confirm(confirmMsg)) return

    setClearing(code || 'ALL')
    const { error: rpcError } = await supabase.rpc('admin_clear_camera_activity', { target_code: code || null })
    setClearing(null)

    if (rpcError) {
      alert('Erro ao limpar: ' + rpcError.message)
      return
    }
    loadData()
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-bone-100 font-display font-bold text-base">
          {'Cameras \u2014 atividade e uso'}
        </h3>
        <div className="flex gap-2">
          <button
            onClick={() => handleClear(null, null)}
            disabled={clearing === 'ALL' || rows.length === 0}
            className="text-xs text-red-400/80 hover:text-red-400 bg-pine-800 border border-pine-700 rounded-lg px-3 py-1.5 transition-colors disabled:opacity-40"
          >
            {clearing === 'ALL' ? 'A limpar...' : 'Limpar tudo'}
          </button>
          <button
            onClick={loadData}
            className="text-xs text-bone-300/60 hover:text-bone-100 bg-pine-800 border border-pine-700 rounded-lg px-3 py-1.5 transition-colors"
          >
            Atualizar
          </button>
        </div>
      </div>

      {suspiciousCount > 0 && (
        <div className="flex items-start gap-2 text-sm text-blaze-400 bg-blaze-500/10 border border-blaze-500/20 rounded-lg px-4 py-3">
          <AlertTriangle size={16} className="shrink-0 mt-0.5" />
          <span>
            {suspiciousCount}{' camara(s) com sinais de estarem a ser usadas em mais do que uma unidade fisica (v\u00e1rios IPs diferentes em 48h). N\u00e3o \u00e9 prova definitiva \u2014 vale a pena confirmar com o cliente.'}
          </span>
        </div>
      )}

      {error && (
        <div className="text-sm text-red-400 bg-red-400/10 rounded-lg p-3">{error}</div>
      )}

      {loading ? (
        <div className="text-center text-bone-300/40 text-sm py-8">A carregar...</div>
      ) : rows.length === 0 ? (
        <div className="text-center text-bone-300/40 text-sm py-8">{'Nenhuma c\u00e2mara ativada ainda.'}</div>
      ) : (
        <div className="overflow-x-auto -mx-1">
        <div className="bg-pine-800 border border-pine-700 rounded-xl overflow-hidden min-w-[600px]">
          <div className="grid grid-cols-[1.2fr_1fr_65px_65px_1fr_85px_75px] gap-2 px-4 py-2 border-b border-pine-700 text-xs text-bone-300/50 font-semibold uppercase tracking-wide">
            <div>{'Cliente / C\u00e2mara'}</div>
            <div>{'C\u00f3digo'}</div>
            <div className="text-center">{'Fotos (7d)'}</div>
            <div className="text-center">{'IPs (7d)'}</div>
            <div>{'\u00daltimo IP / hora'}</div>
            <div className="text-center">{'V\u00e1lida at\u00e9'}</div>
            <div className="text-center">{'A\u00e7\u00f5es'}</div>
          </div>
          {rows.map((r) => (
            <div
              key={r.device_code}
              className={`grid grid-cols-[1.2fr_1fr_65px_65px_1fr_85px_75px] gap-2 items-center px-4 py-3 border-b border-pine-700/50 last:border-0 ${r.suspicious ? 'bg-blaze-500/5' : ''}`}
            >
              <div className="min-w-0">
                <div className="text-bone-100 text-sm font-medium truncate flex items-center gap-1.5">
                  {r.suspicious && <AlertTriangle size={13} className="text-blaze-400 shrink-0" />}
                  {r.user_name || '\u2014'}
                </div>
                {r.label && <div className="text-bone-300/50 text-xs truncate">{r.label}</div>}
              </div>
              <div className="text-bone-300/70 text-xs font-mono truncate">{r.device_code}</div>
              <div className="text-center text-bone-100 text-sm">{r.photos_7d}</div>
              <div className={`text-center text-sm font-semibold ${r.suspicious ? 'text-blaze-400' : 'text-bone-100'}`}>
                {r.distinct_ips_7d}
              </div>
              <div className="text-bone-300/50 text-xs truncate">
                {r.last_ip || '\u2014'}
                {r.last_seen_at && (
                  <div className="text-bone-300/30">
                    {new Date(r.last_seen_at).toLocaleString('pt-PT')}
                  </div>
                )}
              </div>
              <div className="text-center text-bone-300/60 text-xs">{r.active_until}</div>
              <div className="text-center">
                <button
                  onClick={() => handleClear(r.device_code, r.label || r.user_name)}
                  disabled={clearing === r.device_code}
                  className="text-[11px] text-bone-300/50 hover:text-red-400 underline underline-offset-2 disabled:opacity-40"
                >
                  {clearing === r.device_code ? '...' : 'Limpar'}
                </button>
              </div>
            </div>
          ))}
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
        <h3 className="text-bone-100 font-semibold text-sm mb-2">Periodo gratuito de lancamento</h3>
        <div className="bg-pine-700/50 rounded-lg px-3 py-2 mb-3 text-xs">
          <div className="font-semibold text-bone-100 mb-1">
            {isCurrentlyFree ? 'ESTADO: Gratis para todos' : 'ESTADO: Cobranca ativa'}
          </div>
          <div className="text-bone-300/70">
            {isCurrentlyFree
              ? launchDate ? `Gratis ate ${freeUntilText}` : 'Sem data definida = sempre gratis'
              : 'Periodo de graca terminou. Precos ativos.'}
          </div>
        </div>
        <p className="text-bone-300/70 text-xs mb-3">
          Enquanto nenhuma data estiver definida, publicar e gratis para toda a gente.
        </p>
      </div>
      <div>
        <label className="text-xs text-bone-300/70 block mb-1">Data de lancamento ao publico</label>
        <input
          type="date"
          value={launchDate ?? ''}
          onChange={(e) => setLaunchDate(e.target.value)}
          className="bg-pine-700 border border-pine-600 rounded-lg px-3 py-2 text-sm text-bone-100 outline-none focus:border-blaze-500 w-full"
        />
      </div>
      {freeUntilText && (
        <p className="text-xs text-brass-400">{'Data definida \u2014 sera gratis para todos ate '}<strong>{freeUntilText}</strong>.</p>
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

function FeaturedSettingsTab({ settings, onSaved }) {
  const [featuredPrice, setFeaturedPrice] = useState(settings?.featured_price_credits ?? 2)
  const [featuredDays, setFeaturedDays] = useState(settings?.featured_duration_days ?? 30)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  async function handleSave() {
    setSaving(true)
    setSaved(false)
    const { error } = await supabase
      .from('platform_settings')
      .update({
        featured_price_credits: Number(featuredPrice) || 0,
        featured_duration_days: Number(featuredDays) || 1,
      })
      .eq('id', 1)
    setSaving(false)
    if (!error) {
      setSaved(true)
      onSaved?.()
    }
  }

  return (
    <div className="bg-pine-800 border border-pine-700 rounded-xl p-5 max-w-md space-y-4">
      <div>
        <h3 className="text-bone-100 font-display font-bold text-base mb-2">{'Destaque de anuncios'}</h3>
        <p className="text-bone-300/70 text-xs mb-3">
          {'Preco e duracao de quando um cliente compra destaque para o proprio anuncio. Independente da validade do anuncio (90 dias).'}
        </p>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-xs text-bone-300/70 block mb-1">{'Custo (creditos)'}</label>
          <input
            type="number"
            min="0"
            value={featuredPrice}
            onChange={(e) => setFeaturedPrice(e.target.value)}
            className="bg-pine-700 border border-pine-600 rounded-lg px-3 py-2 text-sm text-bone-100 outline-none focus:border-blaze-500 w-full"
          />
        </div>
        <div>
          <label className="text-xs text-bone-300/70 block mb-1">{'Duracao (dias)'}</label>
          <input
            type="number"
            min="1"
            value={featuredDays}
            onChange={(e) => setFeaturedDays(e.target.value)}
            className="bg-pine-700 border border-pine-600 rounded-lg px-3 py-2 text-sm text-bone-100 outline-none focus:border-blaze-500 w-full"
          />
        </div>
      </div>
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

function ModerationTab({ listings, onDeleteListing, dbListings, sellers }) {
  const [featuredIds, setFeaturedIds] = useState(
    new Set(dbListings.filter(l => l.featured).map(l => l.id))
  )
  const [toggling, setToggling] = useState(null)

  async function toggleFeatured(listing) {
    const isFeatured = featuredIds.has(listing.id)
    setToggling(listing.id)
    await supabase
      .from('listings')
      .update({ featured: !isFeatured })
      .eq('id', listing.id)
    setFeaturedIds(prev => {
      const next = new Set(prev)
      isFeatured ? next.delete(listing.id) : next.add(listing.id)
      return next
    })
    setToggling(null)
  }

  return (
    <div className="bg-pine-800 border border-pine-700 rounded-xl overflow-hidden">
      {listings.map((l) => {
        const seller = sellers?.[l.sellerId]
        return (
        <div key={l.id} className="flex items-center justify-between px-4 py-3 border-b border-pine-700 last:border-0 gap-3">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <span className="text-bone-100 text-sm font-medium truncate">{l.title}</span>
              {featuredIds.has(l.id) && (
                <span className="text-[10px] bg-brass-400/20 text-brass-400 px-1.5 py-0.5 rounded-full shrink-0">Destaque</span>
              )}
            </div>
            <div className="text-bone-300/60 text-xs">
              {l.price} {'\u20ac'} {l.source === 'demo' && '\u00b7 Artigo de exemplo'}
            </div>
            <div className="text-bone-300/40 text-[11px]">
              {'Vendedor: '}{seller?.name || '\u2014'}
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {l.source !== 'demo' && (
              <button
                onClick={() => toggleFeatured(l)}
                disabled={toggling === l.id}
                className={`flex items-center gap-1 text-xs px-2.5 py-1.5 rounded-lg transition-colors disabled:opacity-40 ${
                  featuredIds.has(l.id)
                    ? 'bg-brass-400/20 text-brass-400 hover:bg-brass-400/10'
                    : 'bg-pine-700 text-bone-300/60 hover:bg-brass-400/20 hover:text-brass-400'
                }`}
                title={featuredIds.has(l.id) ? 'Remover destaque' : 'Colocar em destaque'}
              >
                <Star size={13} className={featuredIds.has(l.id) ? 'fill-brass-400' : ''} />
                {featuredIds.has(l.id) ? 'Destaque' : 'Destacar'}
              </button>
            )}

            <button
              onClick={() => onDeleteListing(l)}
              className="text-red-400 hover:text-red-300 shrink-0"
              title={'Apagar an\u00fancio'}
            >
              <Trash2 size={18} />
            </button>
          </div>
        </div>
        )
      })}
    </div>
  )
}
