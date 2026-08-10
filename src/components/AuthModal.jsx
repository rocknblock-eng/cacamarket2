import { useState } from 'react'
import { X, Loader2 } from 'lucide-react'
import { supabase } from '../lib/supabaseClient.js'

export default function AuthModal({ onClose, onAuthenticated, onOpenLegal }) {
  const [mode, setMode] = useState('login')
  const [fullName, setFullName] = useState('')
  const [phone, setPhone] = useState('')
  const [email, setEmail] = useState('')
  const [successMsg, setSuccessMsg] = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState('particular')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [acceptedTerms, setAcceptedTerms] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)

    if (mode === 'register' && !acceptedTerms) {
      setError('Deve aceitar os Termos e Condições e a Política de Privacidade para criar conta.')
      setLoading(false)
      return
    }

    if (mode === 'login') {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password })
      setLoading(false)
      if (error) {
        setError('Email ou palavra-passe incorretos.')
        return
      }
      onAuthenticated?.(data.user)
      onClose()
    } else {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { full_name: fullName, role, phone: phone || null }
        }
      })
      setLoading(false)
      if (error) {
        setError('Não foi possível criar a conta. ' + (error.message.includes('already registered') ? 'Este email já está registado.' : ''))
        return
      }
      // Mostrar mensagem a pedir confirmação de email em vez de entrar logo
      setError('')
      setSuccessMsg('Conta criada! Verifica o teu email e clica no link de confirmação antes de entrar.')
    }
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/60 flex items-end sm:items-center justify-center">
      <div className="bg-pine-800 border border-pine-600 rounded-t-2xl sm:rounded-2xl w-full sm:max-w-sm p-6 relative">
        <button onClick={onClose} className="absolute top-4 right-4 text-bone-300 hover:text-blaze-400">
          <X size={20} />
        </button>

        <div className="flex gap-2 mb-5">
          <button
            onClick={() => { setMode('login'); setError('') }}
            className={`flex-1 text-sm font-semibold py-2 rounded-lg transition-colors ${
              mode === 'login' ? 'bg-blaze-500 text-pine-950' : 'bg-pine-700 text-bone-200'
            }`}
          >
            Entrar
          </button>
          <button
            onClick={() => { setMode('register'); setError('') }}
            className={`flex-1 text-sm font-semibold py-2 rounded-lg transition-colors ${
              mode === 'register' ? 'bg-blaze-500 text-pine-950' : 'bg-pine-700 text-bone-200'
            }`}
          >
            Criar conta
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          {mode === 'register' && (
            <>
              <input
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
                placeholder="Nome completo"
                className="bg-pine-700 border border-pine-600 rounded-lg px-3 py-2 text-sm text-bone-100 placeholder:text-bone-300/40 outline-none focus:border-blaze-500"
              />
              <input
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="Telemóvel (para WhatsApp) — opcional"
                className="bg-pine-700 border border-pine-600 rounded-lg px-3 py-2 text-sm text-bone-100 placeholder:text-bone-300/40 outline-none focus:border-blaze-500"
              />
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setRole('particular')}
                  className={`flex-1 text-xs font-medium py-2 rounded-lg transition-colors ${
                    role === 'particular' ? 'bg-brass-400 text-pine-950' : 'bg-pine-700 text-bone-300'
                  }`}
                >
                  Sou particular
                </button>
                <button
                  type="button"
                  onClick={() => setRole('loja')}
                  className={`flex-1 text-xs font-medium py-2 rounded-lg transition-colors ${
                    role === 'loja' ? 'bg-brass-400 text-pine-950' : 'bg-pine-700 text-bone-300'
                  }`}
                >
                  Sou loja profissional
                </button>
              </div>
            </>
          )}
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            placeholder="Email"
            className="bg-pine-700 border border-pine-600 rounded-lg px-3 py-2 text-sm text-bone-100 placeholder:text-bone-300/40 outline-none focus:border-blaze-500"
          />
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={6}
            placeholder="Palavra-passe"
            className="bg-pine-700 border border-pine-600 rounded-lg px-3 py-2 text-sm text-bone-100 placeholder:text-bone-300/40 outline-none focus:border-blaze-500"
          />

          {error && <p className="text-xs text-red-400">{error}</p>}
          {successMsg && (
            <div className="bg-pine-700 border border-pine-500 rounded-lg p-3 text-center">
              <p className="text-xs text-bone-200">{successMsg}</p>
              <button onClick={onClose} className="mt-2 text-xs text-blaze-400 hover:underline">Fechar</button>
            </div>
          )}

          {mode === 'register' && (
            <label className="flex items-start gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={acceptedTerms}
                onChange={(e) => setAcceptedTerms(e.target.checked)}
                className="mt-0.5 shrink-0 accent-blaze-500"
              />
              <span className="text-xs text-bone-300/70 leading-relaxed">
                Li e aceito os{' '}
                <button
                  type="button"
                  onClick={() => onOpenLegal?.('terms')}
                  className="text-blaze-400 hover:text-blaze-300 underline underline-offset-2"
                >
                  Termos e Condições
                </button>
                {' '}e a{' '}
                <button
                  type="button"
                  onClick={() => onOpenLegal?.('privacy')}
                  className="text-blaze-400 hover:text-blaze-300 underline underline-offset-2"
                >
                  Política de Privacidade
                </button>
                , incluindo o tratamento dos meus dados pessoais nos termos do RGPD.
              </span>
            </label>
          )}

          <button
            type="submit"
            disabled={loading}
            className="bg-blaze-500 hover:bg-blaze-600 transition-colors text-pine-950 font-semibold text-sm py-2.5 rounded-lg mt-1 flex items-center justify-center gap-2 disabled:opacity-60"
          >
            {loading && <Loader2 size={16} className="animate-spin" />}
            {mode === 'login' ? 'Entrar' : 'Criar conta'}
          </button>
        </form>
      </div>
    </div>
  )
}
