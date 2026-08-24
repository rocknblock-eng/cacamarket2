import { useState, useEffect } from 'react';
import { Loader2 } from 'lucide-react';
import { supabase } from '../lib/supabaseClient.js';
export default function ResetPassword() {
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [validSession, setValidSession] = useState(false);
  useEffect(() => {
    // O Supabase processa o token do URL automaticamente via onAuthStateChange
    const {
      data: {
        subscription
      }
    } = supabase.auth.onAuthStateChange(event => {
      if (event === 'PASSWORD_RECOVERY') {
        setValidSession(true);
      }
    });
    return () => subscription.unsubscribe();
  }, []);
  async function handleReset(e) {
    e.preventDefault();
    setError('');
    if (password !== confirm) {
      setError('As palavras-passe n\u00e3o coincidem.');
      return;
    }
    if (password.length < 6) {
      setError('A palavra-passe deve ter pelo menos 6 caracteres.');
      return;
    }
    setLoading(true);
    const {
      error
    } = await supabase.auth.updateUser({
      password
    });
    setLoading(false);
    if (error) {
      setError('N\u00e3o foi poss\u00edvel redefinir a palavra-passe. O link pode ter expirado.');
      return;
    }
    setSuccess(true);
    // Redirecionar para a pagina principal apos 3 segundos
    setTimeout(() => {
      window.location.href = '/';
    }, 3000);
  }
  return <div className="min-h-screen bg-pine-950 flex items-center justify-center p-4">
      <div className="bg-pine-800 border border-pine-600 rounded-2xl w-full max-w-sm p-6">

        {/* Logo / titulo */}
        <div className="text-center mb-6">
          <h1 className="text-bone-100 font-bold text-xl">WildMarket</h1>
          <p className="text-bone-300/70 text-sm mt-1">Redefinir palavra-passe</p>
        </div>

        {success ? <div className="text-center">
            <div className="bg-pine-700 border border-pine-500 rounded-lg p-4 mb-4">
              <p className="text-bone-200 text-sm">{'\u2713 Palavra-passe alterada com sucesso!'}</p>
              <p className="text-bone-300/60 text-xs mt-1">{'A redirecionar para a p\u00e1gina principal\u2026'}</p>
            </div>
            <a href="/" className="text-xs text-blaze-400 hover:underline">{'Clica aqui se n\u00e3o fores redirecionado'}</a>
          </div> : !validSession ? <div className="text-center">
            <p className="text-bone-300/70 text-sm">{'A verificar o link de recupera\u00e7\u00e3o\u2026'}</p>
            <p className="text-bone-300/50 text-xs mt-2">{'Se esta p\u00e1gina n\u00e3o carregar, o link pode ter expirado.'}{' '}
              <a href="/" className="text-blaze-400 hover:underline">{'Voltar ao in\u00edcio'}</a>
            </p>
          </div> : <form onSubmit={handleReset} className="flex flex-col gap-3">
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} required minLength={6} placeholder="Nova palavra-passe" className="bg-pine-700 border border-pine-600 rounded-lg px-3 py-2 text-sm text-bone-100 placeholder:text-bone-300/40 outline-none focus:border-blaze-500" />
            <input type="password" value={confirm} onChange={e => setConfirm(e.target.value)} required placeholder="Confirmar nova palavra-passe" className="bg-pine-700 border border-pine-600 rounded-lg px-3 py-2 text-sm text-bone-100 placeholder:text-bone-300/40 outline-none focus:border-blaze-500" />

            {error && <p className="text-xs text-red-400">{error}</p>}

            <button type="submit" disabled={loading} className="bg-blaze-500 hover:bg-blaze-600 transition-colors text-pine-950 font-semibold text-sm py-2.5 rounded-lg mt-1 flex items-center justify-center gap-2 disabled:opacity-60">
              {loading && <Loader2 size={16} className="animate-spin" />}
              Guardar nova palavra-passe
            </button>
          </form>}
      </div>
    </div>;
}