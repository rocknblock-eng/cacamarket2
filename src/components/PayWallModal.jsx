import { useState } from 'react';
import { X, CreditCard, Wallet, Smartphone, Info } from 'lucide-react';
import { supabase } from '../lib/supabaseClient.js';

// TABELA DE PRECOS (quando a cobranca for ativada):
// - Particular: 1 gratis, depois 1 cada
// - Loja: 5 primeiros gratis, depois 5 por pacote de 5
// - Admin: sempre gratis
//
// NOTA: Enquanto nenhuma data de lancamento estiver definida no painel admin,
// este modal NAO aparece (tudo e gratis).

export const PAYMENT_CONFIG = {
  stripeEnabled: false,
  // ainda nao temos as chaves do Stripe
  paypalEnabled: true,
  mbwayEnabled: false // ainda nao temos um fornecedor de MB Way
};
export default function PayWallModal({
  profile,
  onClose
}) {
  const [status, setStatus] = useState('idle'); // idle | redirecting | error
  const [error, setError] = useState('');
  const isLoja = profile.role === 'loja';
  const amount = 1;
  const label = 'Publicar este an\u00fancio';
  async function handlePayPal() {
    setStatus('redirecting');
    setError('');
    const {
      data,
      error: fnError
    } = await supabase.functions.invoke('paypal-create-order');
    if (fnError || !data?.approveLink) {
      setStatus('error');
      const detail = data?.error || fnError?.message || '';
      setError(`N\u00e3o foi poss\u00edvel iniciar o pagamento PayPal.${detail ? ` (${detail})` : ''} Verifica os Logs da fun\u00e7\u00e3o no Supabase.`);
      return;
    }

    // Leva o utilizador para o PayPal para aprovar o pagamento.
    // Quando voltar, o site confirma automaticamente e liberta os creditos.
    window.location.href = data.approveLink;
  }
  return <div className="fixed inset-0 z-50 bg-black/60 flex items-end sm:items-center justify-center">
      <div className="bg-pine-800 border border-pine-600 rounded-t-2xl sm:rounded-2xl w-full sm:max-w-sm p-6 relative">
        <button onClick={onClose} className="absolute top-4 right-4 text-bone-300 hover:text-blaze-400">
          <X size={20} />
        </button>

        <h2 className="font-display font-bold text-bone-100 text-lg mb-1">{label}</h2>
        <p className="text-bone-300/70 text-sm mb-4">
          {isLoja ? 'J\u00e1 usaste o teu pacote inicial de 5 an\u00fancios gr\u00e1tis. A partir daqui, cada an\u00fancio tem um donativo de 1\u20ac que ajuda a manter a plataforma.' : 'O teu an\u00fancio gratuito j\u00e1 foi usado. A partir do 2\u00ba an\u00fancio, pedimos um donativo de 1\u20ac para manter o WildMarket.'}
        </p>

        <div className="flex flex-col gap-2 mb-4">
          <PaymentOption icon={<Wallet size={16} />} label="PayPal" enabled={PAYMENT_CONFIG.paypalEnabled} onClick={handlePayPal} loading={status === 'redirecting'} />
          <PaymentOption icon={<CreditCard size={16} />} label='Cart\u00e3o (Stripe)' enabled={PAYMENT_CONFIG.stripeEnabled} comingSoon />
          <PaymentOption icon={<Smartphone size={16} />} label="MB Way" enabled={PAYMENT_CONFIG.mbwayEnabled} comingSoon />
        </div>

        <div className="bg-pine-700/50 rounded-lg p-3 text-sm mb-4 flex justify-between text-bone-100 font-semibold">
          <span>Donativo</span>
          <span>{amount.toFixed(2)}{' \u20ac'}</span>
        </div>

        {error && <p className="text-xs text-red-400 mb-3">{error}</p>}

        <div className="flex items-start gap-2 text-[11px] text-bone-300/50">
          <Info size={13} className="shrink-0 mt-0.5" />
          <span>{'Vais ser levado para o site do PayPal para confirmares o pagamento em seguran\u00e7a.'}</span>
        </div>
      </div>
    </div>;
}
function PaymentOption({
  icon,
  label,
  enabled,
  onClick,
  loading,
  comingSoon
}) {
  return <button onClick={enabled ? onClick : undefined} disabled={!enabled || loading} className={`flex items-center justify-between gap-2 border rounded-lg px-3 py-2.5 text-sm text-left transition-colors ${enabled ? 'border-pine-600 text-bone-100 hover:border-blaze-500' : 'border-pine-700 text-bone-300/40 cursor-not-allowed'}`}>
      <span className="flex items-center gap-2">
        {icon}
        {label}
      </span>
      {comingSoon && <span className="text-[10px] uppercase tracking-wide text-bone-300/40">Brevemente</span>}
      {loading && <span className="text-[11px] text-bone-300/60">A abrir PayPal...</span>}
    </button>;
}