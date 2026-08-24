import { useState } from 'react';
import { X, User, Phone, MapPin, Mail, Save, Star, Ticket, ShieldCheck, Store, AlertCircle, CheckCircle, Trash2, Camera } from 'lucide-react';
import { supabase } from '../lib/supabaseClient.js';
import CameraServiceModal from './CameraServiceModal.jsx';
import CreditHistoryModal from './CreditHistoryModal.jsx';
export default function UserProfileModal({
  user,
  profile,
  isFreePeriod,
  onClose,
  onSaved
}) {
  const [cameraServiceOpen, setCameraServiceOpen] = useState(false);
  const [creditHistoryOpen, setCreditHistoryOpen] = useState(false);
  const [fullName, setFullName] = useState(profile?.full_name || '');
  const [phone, setPhone] = useState(profile?.phone || '');
  const [location, setLocation] = useState(profile?.location || '');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState(null);
  const [emailSection, setEmailSection] = useState(false);
  const [newEmail, setNewEmail] = useState('');
  const [emailSaving, setEmailSaving] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [emailError, setEmailError] = useState(null);
  const roleLabel = profile?.role === 'loja' ? 'Loja Profissional' : profile?.role === 'admin' ? 'Administrador' : 'Particular';
  const roleIcon = profile?.role === 'loja' ? <Store size={14} /> : profile?.role === 'admin' ? <ShieldCheck size={14} /> : <User size={14} />;
  const credits = profile?.listing_credits ?? 0;
  const freeUsed = profile?.free_listing_used ?? false;
  const creditsInfo = () => {
    if (isFreePeriod) {
      return {
        label: 'Publica\u00e7\u00e3o gr\u00e1tis',
        detail: 'A plataforma est\u00e1 em per\u00edodo de lan\u00e7amento \u2014 podes publicar an\u00fancios sem limite e sem custo.',
        color: 'text-brass-400',
        bg: 'bg-brass-400/10 border-brass-400/20'
      };
    }
    if (profile?.role === 'admin') {
      return {
        label: 'Publica\u00e7\u00e3o ilimitada',
        detail: 'Como administrador, podes publicar sempre sem custo.',
        color: 'text-blaze-400',
        bg: 'bg-blaze-500/10 border-blaze-500/20'
      };
    }
    if (profile?.role === 'particular') {
      if (!freeUsed) {
        return {
          label: '1 an\u00fancio gr\u00e1tis dispon\u00edvel',
          detail: 'Tens o teu primeiro an\u00fancio por usar. A partir do 2.\u00ba, cada an\u00fancio custa 1\u20ac.',
          color: 'text-brass-400',
          bg: 'bg-brass-400/10 border-brass-400/20'
        };
      }
      return {
        label: `${credits} cr\u00e9dito${credits !== 1 ? 's' : ''} dispon\u00edvel${credits !== 1 ? 'is' : ''}`,
        detail: credits > 0 ? `Tens ${credits} an\u00fancio${credits !== 1 ? 's' : ''} pago${credits !== 1 ? 's' : ''} por publicar. Cada cr\u00e9dito = 1 an\u00fancio.` : 'Sem cr\u00e9ditos. Ao tentares publicar, poder\u00e1s comprar mais (1\u20ac por an\u00fancio).',
        color: credits > 0 ? 'text-brass-400' : 'text-bone-300/50',
        bg: credits > 0 ? 'bg-brass-400/10 border-brass-400/20' : 'bg-pine-700/40 border-pine-600/40'
      };
    }
    if (profile?.role === 'loja') {
      return {
        label: `${credits} cr\u00e9dito${credits !== 1 ? 's' : ''} dispon\u00edvel${credits !== 1 ? 'is' : ''}`,
        detail: credits > 0 ? `Tens ${credits} an\u00fancio${credits !== 1 ? 's' : ''} dispon\u00edvel${credits !== 1 ? 'is' : ''}. Pacotes de 5 an\u00fancios por 5\u20ac.` : 'Sem cr\u00e9ditos. Ao tentares publicar, poder\u00e1s comprar pacotes (5 an\u00fancios por 5\u20ac).',
        color: credits > 0 ? 'text-brass-400' : 'text-bone-300/50',
        bg: credits > 0 ? 'bg-brass-400/10 border-brass-400/20' : 'bg-pine-700/40 border-pine-600/40'
      };
    }
    return {
      label: '\u2014',
      detail: '',
      color: 'text-bone-300',
      bg: ''
    };
  };
  const creditStatus = creditsInfo();
  async function handleSave() {
    setError(null);
    setSaving(true);
    const {
      error: profileError
    } = await supabase.from('profiles').update({
      full_name: fullName.trim(),
      phone: phone.trim() || null,
      location: location.trim() || null
    }).eq('id', user.id);
    setSaving(false);
    if (profileError) {
      setError('N\u00e3o foi poss\u00edvel guardar as altera\u00e7\u00f5es. Tenta novamente.');
      return;
    }
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
    onSaved?.();
  }
  async function handleEmailChange() {
    setEmailError(null);
    const trimmed = newEmail.trim().toLowerCase();
    if (!trimmed || !trimmed.includes('@')) {
      setEmailError('Introduz um email v\u00e1lido.');
      return;
    }
    if (trimmed === user?.email) {
      setEmailError('O novo email \u00e9 igual ao atual.');
      return;
    }
    setEmailSaving(true);
    const {
      error: emailErr
    } = await supabase.auth.updateUser({
      email: trimmed
    });
    setEmailSaving(false);
    if (emailErr) {
      setEmailError('N\u00e3o foi poss\u00edvel enviar o link. Verifica o email e tenta novamente.');
      return;
    }
    setEmailSent(true);
    setNewEmail('');
  }
  function handleDeleteRequest() {
    const subject = encodeURIComponent('Pedido de cancelamento de conta \u2014 WildMarket');
    const body = encodeURIComponent(`Ol\u00e1,\\n\\nVenho por este meio solicitar o cancelamento da minha conta no WildMarket.\\n\\nEmail da conta: ${user?.email}\n\nObrigado.`);
    window.open(`mailto:cacamarket@proton.me?subject=${subject}&body=${body}`, '_blank');
  }
  return <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-pine-900 border border-pine-700 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden">

        {/* Cabecalho */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-pine-700">
          <h2 className="text-bone-100 font-display font-bold text-base">O meu perfil</h2>
          <button onClick={onClose} className="text-bone-300/60 hover:text-bone-100 transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="p-5 space-y-5 overflow-y-auto max-h-[80vh]">

          {/* Avatar e tipo de conta */}
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-blaze-500/20 border border-blaze-500/40 flex items-center justify-center shrink-0">
              <User size={26} className="text-blaze-400" />
            </div>
            <div>
              <div className="text-bone-100 font-semibold text-sm">{profile?.full_name || '\u2014'}</div>
              <div className="flex items-center gap-1.5 mt-1">
                <span className="flex items-center gap-1 text-xs text-bone-300/60 bg-pine-800 border border-pine-600 rounded-full px-2 py-0.5">
                  {roleIcon}
                  {roleLabel}
                </span>
                {profile?.verified && <span className="flex items-center gap-1 text-xs text-blaze-400 bg-blaze-500/10 border border-blaze-500/20 rounded-full px-2 py-0.5">
                    <ShieldCheck size={11} />
                    Verificado
                  </span>}
              </div>
              {profile?.rating > 0 && <div className="flex items-center gap-1 mt-1 text-xs text-bone-300/60">
                  <Star size={11} className="text-brass-400 fill-brass-400" />
                  {profile.rating.toFixed(1)} ({profile.reviews_count}{' avalia\u00e7\u00f5es)'}</div>}
            </div>
          </div>

          {/* Bloco de creditos */}
          <div className={`rounded-xl border px-4 py-3 ${creditStatus.bg}`}>
            <div className="flex items-center gap-2 mb-1">
              <Ticket size={15} className={creditStatus.color} />
              <span className={`text-sm font-semibold ${creditStatus.color}`}>
                {creditStatus.label}
              </span>
            </div>
            <p className="text-xs text-bone-300/60 leading-relaxed">
              {creditStatus.detail}
            </p>
            <button
              onClick={() => setCreditHistoryOpen(true)}
              className="mt-2 text-xs text-brass-400 hover:text-brass-300 transition-colors underline underline-offset-2"
            >
              {'Ver conta corrente'}
            </button>
          </div>

          {/* Servico de camara para Telegram */}
          <button onClick={() => setCameraServiceOpen(true)} className="w-full flex items-center gap-2 bg-pine-800/50 border border-pine-700 hover:border-brass-400/50 rounded-lg px-3 py-2.5 text-sm text-bone-100 transition-colors">
            <Camera size={15} className="text-brass-400" />{'C\u00e2mara para Telegram'}</button>

          {/* Email atual + botao para alterar */}
          <div>
            <label className="text-xs text-bone-300/60 block mb-1.5 flex items-center gap-1.5">
              <Mail size={12} />
              Email
            </label>
            <div className="bg-pine-800/50 border border-pine-700 rounded-lg px-3 py-2.5 text-sm text-bone-300/70 select-all">
              {user?.email || '\u2014'}
            </div>

            {!emailSection && !emailSent && <button onClick={() => {
            setEmailSection(true);
            setEmailError(null);
          }} className="mt-2 text-xs text-blaze-400 hover:text-blaze-300 transition-colors underline underline-offset-2">
                Alterar email
              </button>}

            {emailSection && !emailSent && <div className="mt-3 space-y-2">
                <input type="email" value={newEmail} onChange={e => setNewEmail(e.target.value)} placeholder="Novo email" className="w-full bg-pine-800 border border-pine-600 rounded-lg px-3 py-2.5 text-sm text-bone-100 placeholder:text-bone-300/40 outline-none focus:border-blaze-500 transition-colors" />
                {emailError && <div className="flex items-center gap-2 text-xs text-red-400 bg-red-400/10 border border-red-400/20 rounded-lg px-3 py-2">
                    <AlertCircle size={13} />
                    {emailError}
                  </div>}
                <div className="flex gap-2">
                  <button onClick={handleEmailChange} disabled={emailSaving || !newEmail.trim()} className="flex-1 bg-blaze-500 hover:bg-blaze-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-pine-950 font-bold text-xs py-2 rounded-lg">
                    {emailSaving ? 'A enviar...' : 'Enviar link de confirma\u00e7\u00e3o'}
                  </button>
                  <button onClick={() => {
                setEmailSection(false);
                setNewEmail('');
                setEmailError(null);
              }} className="px-3 text-xs text-bone-300/60 hover:text-bone-100 bg-pine-800 border border-pine-700 rounded-lg transition-colors">
                    Cancelar
                  </button>
                </div>
                <p className="text-xs text-bone-300/40 leading-relaxed">{'Ser\u00e1 enviado um link de confirma\u00e7\u00e3o para o novo email. O email s\u00f3 muda depois de clicares no link.'}</p>
              </div>}

            {emailSent && <div className="mt-2 flex items-start gap-2 text-xs text-brass-400 bg-brass-400/10 border border-brass-400/20 rounded-lg px-3 py-2">
                <CheckCircle size={13} className="mt-0.5 shrink-0" />
                <span>{'Link enviado! Verifica o teu novo email e clica no link para confirmar a altera\u00e7\u00e3o.'}</span>
              </div>}
          </div>

          {/* Nome */}
          <div>
            <label className="text-xs text-bone-300/60 block mb-1.5 flex items-center gap-1.5">
              <User size={12} />
              Nome
            </label>
            <input type="text" value={fullName} onChange={e => setFullName(e.target.value)} placeholder="O teu nome" className="w-full bg-pine-800 border border-pine-600 rounded-lg px-3 py-2.5 text-sm text-bone-100 placeholder:text-bone-300/40 outline-none focus:border-blaze-500 transition-colors" />
          </div>

          {/* Telefone */}
          <div>
            <label className="text-xs text-bone-300/60 block mb-1.5 flex items-center gap-1.5">
              <Phone size={12} />
              Telefone
            </label>
            <input type="tel" value={phone} onChange={e => setPhone(e.target.value)} placeholder="+351 9XX XXX XXX" className="w-full bg-pine-800 border border-pine-600 rounded-lg px-3 py-2.5 text-sm text-bone-100 placeholder:text-bone-300/40 outline-none focus:border-blaze-500 transition-colors" />
          </div>

          {/* Localizacao */}
          <div>
            <label className="text-xs text-bone-300/60 block mb-1.5 flex items-center gap-1.5">
              <MapPin size={12} />{'Localiza\u00e7\u00e3o'}</label>
            <input type="text" value={location} onChange={e => setLocation(e.target.value)} placeholder="Ex: Porto, Lisboa, Braga..." className="w-full bg-pine-800 border border-pine-600 rounded-lg px-3 py-2.5 text-sm text-bone-100 placeholder:text-bone-300/40 outline-none focus:border-blaze-500 transition-colors" />
          </div>

          {/* Feedback guardar */}
          {error && <div className="flex items-center gap-2 text-sm text-red-400 bg-red-400/10 border border-red-400/20 rounded-lg px-3 py-2">
              <AlertCircle size={15} />
              {error}
            </div>}
          {saved && <div className="flex items-center gap-2 text-sm text-brass-400 bg-brass-400/10 border border-brass-400/20 rounded-lg px-3 py-2">
              <CheckCircle size={15} />
              Perfil guardado com sucesso!
            </div>}

          {/* Botao guardar */}
          <button onClick={handleSave} disabled={saving || !fullName.trim()} className="w-full flex items-center justify-center gap-2 bg-blaze-500 hover:bg-blaze-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-pine-950 font-bold text-sm py-2.5 rounded-xl">
            <Save size={16} />
            {saving ? 'A guardar...' : 'Guardar altera\u00e7\u00f5es'}
          </button>

          {/* Info membro desde */}
          {profile?.member_since && <p className="text-center text-xs text-bone-300/40">
              Membro desde {new Date(profile.member_since).toLocaleDateString('pt-PT', {
            month: 'long',
            year: 'numeric'
          })}
            </p>}

          {/* Cancelamento de conta */}
          <div className="border-t border-pine-700 pt-4">
            <div className="flex items-start gap-3 bg-pine-800/40 border border-pine-700 rounded-xl px-4 py-3">
              <Trash2 size={15} className="text-bone-300/40 mt-0.5 shrink-0" />
              <div>
                <p className="text-xs text-bone-300/60 leading-relaxed">
                  Para cancelar a tua conta e eliminar os teus dados, envia-nos um pedido por email. Responderemos no prazo de 48 horas.
                </p>
                <button onClick={handleDeleteRequest} className="mt-2 text-xs text-red-400/70 hover:text-red-400 transition-colors underline underline-offset-2">
                  Solicitar cancelamento de conta
                </button>
              </div>
            </div>
          </div>

        </div>
      </div>

      {cameraServiceOpen && <CameraServiceModal profile={profile} onClose={() => setCameraServiceOpen(false)} onCreditsChanged={onSaved} />}
      {creditHistoryOpen && <CreditHistoryModal user={user} onClose={() => setCreditHistoryOpen(false)} />}
    </div>;
}