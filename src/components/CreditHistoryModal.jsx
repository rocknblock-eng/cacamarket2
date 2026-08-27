import { useState, useEffect, useCallback } from 'react'
import { X, Receipt, ShoppingCart, Wallet } from 'lucide-react'
import { supabase } from '../lib/supabaseClient.js'

function typeLabel(type) {
  const map = {
    compra_paypal: 'Compra PayPal',
    ajuste_admin: 'Ajuste admin',
    saldo_inicial: 'Saldo inicial',
    servico_camera: 'Servico camera',
  }
  return map[type] || type
}

const CREDIT_PACKAGES = [5, 10, 20]

export default function CreditHistoryModal({ user, onClose }) {
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [buying, setBuying] = useState(null)
  const [buyError, setBuyError] = useState('')

  async function handleBuyCredits(credits) {
    setBuying(credits)
    setBuyError('')
    const { data, error: fnError } = await supabase.functions.invoke('paypal-create-order', {
      body: { credits, purpose: 'credits' }
    })
    if (fnError || !data?.approveLink) {
      setBuying(null)
      const detail = data?.error || fnError?.message || ''
      setBuyError(`N\u00e3o foi poss\u00edvel iniciar o pagamento PayPal.${detail ? ` (${detail})` : ''}`)
      return
    }
    window.location.href = data.approveLink
  }

  const loadData = useCallback(async () => {
    setLoading(true)
    const { data, error: dbError } = await supabase
      .from('credit_transactions')
      .select('id, type, amount, balance_after, description, created_at')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
    setLoading(false)
    if (dbError) {
      setError(dbError.message)
      return
    }
    setError(null)
    setRows(data || [])
  }, [user])

  useEffect(() => { loadData() }, [loadData])

  return (
    <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
      <div className="bg-pine-800 border border-pine-600 rounded-2xl w-full max-w-lg p-6 space-y-4 max-h-[80vh] flex flex-col">
        <div className="flex items-center justify-between">
          <h3 className="text-bone-100 font-display font-bold text-base flex items-center gap-2">
            <Receipt size={18} className="text-brass-400" />
            {'A minha conta corrente'}
          </h3>
          <button onClick={onClose} className="text-bone-300/50 hover:text-bone-100">
            <X size={20} />
          </button>
        </div>

        {error && (
          <div className="text-sm text-red-400 bg-red-400/10 rounded-lg p-3">{error}</div>
        )}

        <div className="bg-pine-700/40 rounded-xl p-4 space-y-3 shrink-0">
          <div className="flex items-center gap-2 text-bone-100 font-display font-bold text-sm">
            <ShoppingCart size={16} className="text-brass-400" />
            {'Comprar cr\u00e9ditos'}
          </div>
          <p className="text-bone-300/60 text-xs">
            {'1\u20ac por cr\u00e9dito. Usados para ativar a C\u00e2mara e para destacar an\u00fancios.'}
          </p>
          <div className="grid grid-cols-3 gap-2">
            {CREDIT_PACKAGES.map((pkg) => (
              <button
                key={pkg}
                onClick={() => handleBuyCredits(pkg)}
                disabled={buying !== null}
                className="flex flex-col items-center justify-center gap-1 border border-pine-600 rounded-lg py-2.5 text-bone-100 hover:border-blaze-500 transition-colors disabled:opacity-50"
              >
                <span className="font-display font-bold text-sm">{pkg}</span>
                <span className="text-[11px] text-bone-300/50">{pkg}{'\u20ac'}</span>
                {buying === pkg && <span className="text-[10px] text-bone-300/60">{'A abrir...'}</span>}
              </button>
            ))}
          </div>
          {buyError && <p className="text-xs text-red-400">{buyError}</p>}
          <div className="flex items-center gap-1.5 text-[11px] text-bone-300/40">
            <Wallet size={12} />
            <span>{'Pagamento seguro via PayPal.'}</span>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto -mx-2 px-2">
          {loading && (
            <div className="text-center text-bone-300/40 text-sm py-8">A carregar...</div>
          )}
          {!loading && rows.length === 0 && (
            <div className="text-center text-bone-300/40 text-sm py-8">
              {'Ainda sem movimentos registados.'}
            </div>
          )}
          {!loading && rows.map((mov) => (
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
                <div className="text-bone-300/40 text-[11px]">{'saldo: '}{mov.balance_after}</div>
              </div>
            </div>
          ))}
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
