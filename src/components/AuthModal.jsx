import { useState } from 'react';
import { X, Loader2 } from 'lucide-react';
import { supabase } from '../lib/supabaseClient.js';
export default function AuthModal({
  onClose,
  onAuthenticated,
  onOpenLegal,
  initialMode
}) {
  const [mode, setMode] = useState(initialMode || 'login');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('particular');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  function switchMode(newMode) {
    setMode(newMode);
    setError('');
    setSuccessMsg('');
  }
  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    if (mode === 'register' && !acceptedTerms) {
      setError('Deve aceitar os Termos e Condi\u00e7\u00f5es e a Pol\u00edtica de Privacidade para criar conta.');
      setLoading(false);
      return;
    }
    if (mode === 'login') {
      const {
        data,
        error
      } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      setLoading(false);
      if (error) {
        setError('Email ou palavra-passe incorretos.');
        return;
      }
      onAuthenticated?.(data.user);
      onClose();
    } else if (mode === 'forgot') {
      const {
        error
      } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`
      });
      setLoading(false);
      if (error) {
        setError('N\u00e3o foi poss\u00edvel enviar o email. Verifica o endere\u00e7o e tenta novamente.');
        return;
      }
      setSuccessMsg('Email enviado! Verifica a tua caixa de entrada e clica no link para redefinir a palavra-passe.');
    } else {
      const {
        data,
        error
      } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
            role,
            phone: phone || null
          }
        }
      });
      setLoading(false);
      if (error) {
        setError('N\u00e3o foi poss\u00edvel criar a conta. ' + (error.message.includes('already registered') ? 'Este email j\u00e1 est\u00e1 registado.' : ''));
        return;
      }
      setError('');
      setSuccessMsg('Conta criada! Verifica o teu email e clica no link de confirma\u00e7\u00e3o antes de entrar.');
    }
  }
  return <div className="fixed inset-0 z-50 bg-black/60 flex items-end sm:items-center justify-center">
      <div className="bg-pine-800 border border-pine-600 rounded-t-2xl sm:rounded-2xl w-full sm:max-w-sm p-6 relative">
        <button onClick={onClose} className="absolute top-4 right-4 text-bone-300 hover:text-blaze-400">
          <X size={20} />
        </button>

        {/* Tabs  so aparecem no login e registo */}
        {mode !== 'forgot' && <div className="flex gap-2 mb-5">
            <button onClick={() => switchMode('login')} className={`flex-1 text-sm font-semibold py-2 rounded-lg transition-colors ${mode === 'login' ? 'bg-blaze-500 text-pine-950' : 'bg-pine-700 text-bone-200'}`}>
              Entrar
            </button>
            <button onClick={() => switchMode('register')} className={`flex-1 text-sm font-semibold py-2 rounded-lg transition-colors ${mode === 'register' ? 'bg-blaze-500 text-pine-950' : 'bg-pine-700 text-bone-200'}`}>
              Criar conta
            </button>
          </div>}

        {/* Cabecalho do modo "Esqueci a palavra-passe" */}
        {mode === 'forgot' && <div className="mb-5">
            <h2 className="text-bone-100 font-semibold text-base">Recuperar palavra-passe</h2>
            <p className="text-bone-300/70 text-xs mt-1">Indica o teu email e enviamos um link para redefinir a palavra-passe.</p>
          </div>}

        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          {mode === 'register' && <>
              <input value={fullName} onChange={e => setFullName(e.target.value)} required placeholder="Nome completo" className="bg-pine-700 border border-pine-600 rounded-lg px-3 py-2 text-sm text-bone-100 placeholder:text-bone-300/40 outline-none focus:border-blaze-500" />
              <input value={phone} onChange={e => setPhone(e.target.value)} placeholder={'Telem\u00f3vel (para WhatsApp) \u2014 opcional'} className="bg-pine-700 border border-pine-600 rounded-lg px-3 py-2 text-sm text-bone-100 placeholder:text-bone-300/40 outline-none focus:border-blaze-500" />
              <div className="flex gap-2">
                <button type="button" onClick={() => setRole('particular')} className={`flex-1 text-xs font-medium py-2 rounded-lg transition-colors ${role === 'particular' ? 'bg-brass-400 text-pine-950' : 'bg-pine-700 text-bone-300'}`}>
                  Sou particular
                </button>
                <button type="button" onClick={() => setRole('loja')} className={`flex-1 text-xs font-medium py-2 rounded-lg transition-colors ${role === 'loja' ? 'bg-brass-400 text-pine-950' : 'bg-pine-700 text-bone-300'}`}>
                  Sou loja profissional
                </button>
              </div>
            </>}

          <input type="email" value={email} onChange={e => setEmail(e.target.value)} required placeholder="Email" className="bg-pine-700 border border-pine-600 rounded-lg px-3 py-2 text-sm text-bone-100 placeholder:text-bone-300/40 outline-none focus:border-blaze-500" />

          {mode !== 'forgot' && <input type="password" value={password} onChange={e => setPassword(e.target.value)} required minLength={6} placeholder="Palavra-passe" className="bg-pine-700 border border-pine-600 rounded-lg px-3 py-2 text-sm text-bone-100 placeholder:text-bone-300/40 outline-none focus:border-blaze-500" />}

          {/* Link "Esqueci a palavra-passe"  so no login */}
          {mode === 'login' && <button type="button" onClick={() => switchMode('forgot')} className="text-xs text-bone-300/60 hover:text-blaze-400 text-right -mt-1 transition-colors">
              Esqueci a palavra-passe
            </button>}

          {error && <p className="text-xs text-red-400">{error}</p>}
          {successMsg && <div className="bg-pine-700 border border-pine-500 rounded-lg p-3 text-center">
              <p className="text-xs text-bone-200">{successMsg}</p>
              <button onClick={onClose} className="mt-2 text-xs text-blaze-400 hover:underline">Fechar</button>
            </div>}

          {mode === 'register' && <label className="flex items-start gap-2 cursor-pointer">
              <input type="checkbox" checked={acceptedTerms} onChange={e => setAcceptedTerms(e.target.checked)} className="mt-0.5 shrink-0 accent-blaze-500" />
              <span className="text-xs text-bone-300/70 leading-relaxed">
                Li e aceito os{' '}
                <button type="button" onClick={() => onOpenLegal?.('terms')} className="text-blaze-400 hover:text-blaze-300 underline underline-offset-2">{'Termos e Condi\u00e7\u00f5es'}</button>
                {' '}e a{' '}
                <button type="button" onClick={() => onOpenLegal?.('privacy')} className="text-blaze-400 hover:text-blaze-300 underline underline-offset-2">{'Pol\u00edtica de Privacidade'}</button>
                , incluindo o tratamento dos meus dados pessoais nos termos do RGPD.
              </span>
            </label>}

          {!successMsg && <button type="submit" disabled={loading} className="bg-blaze-500 hover:bg-blaze-600 transition-colors text-pine-950 font-semibold text-sm py-2.5 rounded-lg mt-1 flex items-center justify-center gap-2 disabled:opacity-60">
              {loading && <Loader2 size={16} className="animate-spin" />}
              {mode === 'login' && 'Entrar'}
              {mode === 'register' && 'Criar conta'}
              {mode === 'forgot' && 'Enviar link de recupera\u00e7\u00e3o'}
            </button>}

          {/* Voltar ao login a partir do modo forgot */}
          {mode === 'forgot' && <button type="button" onClick={() => switchMode('login')} className="text-xs text-bone-300/60 hover:text-blaze-400 text-center transition-colors">{'\u2190 Voltar ao login'}</button>}
        </form>
      </div>
    </div>;
}