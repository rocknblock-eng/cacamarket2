import { useState, useEffect, useCallback } from 'react'
import { X, Receipt } from 'lucide-react'
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

export default function CreditHistoryModal({ user, onClose }) {
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

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
