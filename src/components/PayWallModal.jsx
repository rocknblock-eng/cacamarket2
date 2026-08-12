import { useState } from 'react'
import { X, CreditCard, Wallet, Smartphone, Info } from 'lucide-react'
import { supabase } from '../lib/supabaseClient.js'

// TABELA DE PREÇOS (quando a cobrança for ativada):
// - Particular: 1º grátis, depois 1€ cada
// - Loja: 5 primeiros grátis, depois 5€ por pacote de 5
// - Admin: sempre grátis
//
// NOTA: Enquanto nenhuma data de lançamento estiver definida no painel admin,
// este modal NÃO aparece (tudo é grátis).

export const PAYMENT_CONFIG = {
  stripeEnabled: false, // ainda não temos as chaves do Stripe
  paypalEnabled: true,
  mbwayEnabled: false // ainda não temos um fornecedor de MB Way
}

export default function PayWallModal({ profile, onClose }) {
  const [status, setStatus] = useState('idle') // idle | redirecting | error
  const [error, setError] = useState('')

  const isLoja = profile.role === 'loja'
  const amount = 1
  const label = 'Publicar este anúncio'

  async function handlePayPal() {
    setStatus('redirecting')
    setError('')

    const { data, error: fnError } = await supabase.functions.invoke('paypal-create-order')

    if (fnError || !data?.approveLink) {
      setStatus('error')
      const detail = data?.error || fnError?.message || ''
      setError(
        `Não foi possível iniciar o pagamento PayPal.${detail ? ` (${detail})` : ''} Verifica os Logs da função no Supabase.`
      )
      return
    }

    // Leva o utilizador para o PayPal para aprovar o pagamento.
    // Quando voltar, o site confirma automaticamente e liberta os créditos.
    window.location.href = data.approveLink
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/60 flex items-end sm:items-center justify-center">
      <div className="bg-pine-800 border border-pine-600 rounded-t-2xl sm:rounded-2xl w-full sm:max-w-sm p-6 relative">
        <button onClick={onClose} className="absolute top-4 right-4 text-bone-300 hover:text-blaze-400">
          <X size={20} />
        </button>

        <h2 className="font-display font-bold text-bone-100 text-lg mb-1">{label}</h2>
        <p className="text-bone-300/70 text-sm mb-4">
          {isLoja
            ? 'Já usaste o teu pacote inicial de 5 anúncios grátis. A partir daqui, cada anúncio tem um donativo de 1€ que ajuda a manter a plataforma.'
            : 'O teu anúncio gratuito já foi usado. A partir do 2º anúncio, pedimos um donativo de 1€ para manter o WildMarket.'}
        </p>

        <div className="flex flex-col gap-2 mb-4">
          <PaymentOption
            icon={<Wallet size={16} />}
            label="PayPal"
            enabled={PAYMENT_CONFIG.paypalEnabled}
            onClick={handlePayPal}
            loading={status === 'redirecting'}
          />
          <PaymentOption
            icon={<CreditCard size={16} />}
            label="Cartão (Stripe)"
            enabled={PAYMENT_CONFIG.stripeEnabled}
            comingSoon
          />
          <PaymentOption
            icon={<Smartphone size={16} />}
            label="MB Way"
            enabled={PAYMENT_CONFIG.mbwayEnabled}
            comingSoon
          />
        </div>

        <div className="bg-pine-700/50 rounded-lg p-3 text-sm mb-4 flex justify-between text-bone-100 font-semibold">
          <span>Donativo</span>
          <span>{amount.toFixed(2)} €</span>
        </div>

        {error && <p className="text-xs text-red-400 mb-3">{error}</p>}

        <div className="flex items-start gap-2 text-[11px] text-bone-300/50">
          <Info size={13} className="shrink-0 mt-0.5" />
          <span>Vais ser levado para o site do PayPal para confirmares o pagamento em segurança.</span>
        </div>
      </div>
    </div>
  )
}

function PaymentOption({ icon, label, enabled, onClick, loading, comingSoon }) {
  return (
    <button
      onClick={enabled ? onClick : undefined}
      disabled={!enabled || loading}
      className={`flex items-center justify-between gap-2 border rounded-lg px-3 py-2.5 text-sm text-left transition-colors ${
        enabled
          ? 'border-pine-600 text-bone-100 hover:border-blaze-500'
          : 'border-pine-700 text-bone-300/40 cursor-not-allowed'
      }`}
    >
      <span className="flex items-center gap-2">
        {icon}
        {label}
      </span>
      {comingSoon && <span className="text-[10px] uppercase tracking-wide text-bone-300/40">Brevemente</span>}
      {loading && <span className="text-[11px] text-bone-300/60">A abrir PayPal...</span>}
    </button>
  )
}
