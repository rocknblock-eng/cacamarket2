import { useState } from 'react'
import { X, CreditCard, Wallet, Smartphone, Info } from 'lucide-react'

// ---------------------------------------------------------------------------
// PAYMENT_CONFIG
// Ativa/desativa métodos de pagamento aqui. Cada método fica "simulado"
// (não processa pagamentos reais) até o backend estar ligado a chaves
// secretas de Stripe/PayPal e a um IBAN/MB Way real.
// Ver README.md -> secção "Próximo passo: backend de pagamentos".
//
// TABELA DE PREÇOS (atual):
// - Particular: 1º grátis, depois 1€ cada
// - Loja: 5 primeiros grátis, depois pacotes de 5 por 5€
// - Admin: sempre grátis
//
// NOTA: Enquanto nenhuma data de lançamento for definida no painel admin,
// TODOS os utilizadores publicam de graça (modo teste/desenvolvimento).
// ---------------------------------------------------------------------------
export const PAYMENT_CONFIG = {
  stripeEnabled: true,
  paypalEnabled: true,
  mbwayEnabled: true,
  donationFeePercent: 0 // valor da comissão/donativo da plataforma (não aplicável agora)
}

export default function PaymentModal({ listing, onClose }) {
  const [method, setMethod] = useState('stripe')
  const [status, setStatus] = useState('idle') // idle | processing | done

  if (!listing) return null

  const fee = +(listing.price * (PAYMENT_CONFIG.donationFeePercent / 100)).toFixed(2)
  const total = +(listing.price + fee).toFixed(2)

  function handlePay() {
    setStatus('processing')
    // SIMULAÇÃO: aqui é onde, no futuro, se chamam os endpoints reais:
    // /api/create-payment-intent (Stripe), /api/paypal/create-order,
    // /api/paypal/capture-order, ou o fluxo manual de MB Way/IBAN.
    setTimeout(() => setStatus('done'), 1200)
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/60 flex items-end sm:items-center justify-center">
      <div className="bg-pine-800 border border-pine-600 rounded-t-2xl sm:rounded-2xl w-full sm:max-w-sm p-6 relative">
        <button onClick={onClose} className="absolute top-4 right-4 text-bone-300 hover:text-blaze-400">
          <X size={20} />
        </button>

        {status === 'done' ? (
          <div className="text-center py-6">
            <div className="text-blaze-400 font-display font-bold text-lg mb-2">Pedido simulado ✓</div>
            <p className="text-bone-300/70 text-sm">
              Em produção, aqui confirmaríamos o pagamento real e notificaríamos o vendedor.
            </p>
            <button
              onClick={onClose}
              className="mt-5 w-full bg-pine-700 hover:bg-blaze-500 hover:text-pine-950 text-bone-100 font-semibold text-sm py-2.5 rounded-lg transition-colors"
            >
              Fechar
            </button>
          </div>
        ) : (
          <>
            <h2 className="font-display font-bold text-bone-100 text-lg mb-1">Finalizar compra</h2>
            <p className="text-bone-300/70 text-sm mb-4 line-clamp-1">{listing.title}</p>

            <div className="flex flex-col gap-2 mb-4">
              <PaymentOption
                id="stripe"
                icon={<CreditCard size={16} />}
                label="Cartão (Stripe)"
                enabled={PAYMENT_CONFIG.stripeEnabled}
                selected={method === 'stripe'}
                onSelect={setMethod}
              />
              <PaymentOption
                id="paypal"
                icon={<Wallet size={16} />}
                label="PayPal"
                enabled={PAYMENT_CONFIG.paypalEnabled}
                selected={method === 'paypal'}
                onSelect={setMethod}
              />
              <PaymentOption
                id="mbway"
                icon={<Smartphone size={16} />}
                label="MB Way / Transferência IBAN"
                enabled={PAYMENT_CONFIG.mbwayEnabled}
                selected={method === 'mbway'}
                onSelect={setMethod}
              />
            </div>

            <div className="bg-pine-700/50 rounded-lg p-3 text-sm mb-4 space-y-1">
              <div className="flex justify-between text-bone-300/70">
                <span>Artigo</span>
                <span>{listing.price.toFixed(2)} €</span>
              </div>
              {fee > 0 && (
                <div className="flex justify-between text-bone-300/70">
                  <span>Donativo à plataforma</span>
                  <span>{fee.toFixed(2)} €</span>
                </div>
              )}
              <div className="flex justify-between text-bone-100 font-semibold pt-1 border-t border-pine-600">
                <span>Total</span>
                <span>{total.toFixed(2)} €</span>
              </div>
            </div>

            <div className="flex items-start gap-2 text-[11px] text-bone-300/50 mb-4">
              <Info size={13} className="shrink-0 mt-0.5" />
              <span>Modo de demonstração — nenhum pagamento real é processado até o backend estar ligado.</span>
            </div>

            <button
              onClick={handlePay}
              disabled={status === 'processing'}
              className="w-full bg-blaze-500 hover:bg-blaze-600 disabled:opacity-60 transition-colors text-pine-950 font-semibold text-sm py-2.5 rounded-lg"
            >
              {status === 'processing' ? 'A processar...' : `Pagar ${total.toFixed(2)} €`}
            </button>
          </>
        )}
      </div>
    </div>
  )
}

function PaymentOption({ id, icon, label, enabled, selected, onSelect }) {
  if (!enabled) return null
  return (
    <button
      onClick={() => onSelect(id)}
      className={`flex items-center gap-2 border rounded-lg px-3 py-2.5 text-sm text-left transition-colors ${
        selected
          ? 'border-blaze-500 bg-blaze-500/10 text-bone-100'
          : 'border-pine-600 text-bone-300 hover:border-pine-500'
      }`}
    >
      {icon}
      {label}
    </button>
  )
}
