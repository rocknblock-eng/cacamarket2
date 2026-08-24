import { useState, useEffect, useRef, useCallback } from 'react';
import { X, Send, ShieldCheck, ArrowLeft, Ban, Trash2 } from 'lucide-react';
import { supabase } from '../lib/supabaseClient.js';
export default function ChatModal({
  user,
  profile,
  listing,
  seller,
  conversationId: initialConvId,
  onClose
}) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const [conversationId, setConversationId] = useState(initialConvId || null);
  const [loading, setLoading] = useState(true);
  const [blocking, setBlocking] = useState(false);
  const [blocked, setBlocked] = useState(false);
  const [showAdminMenu, setShowAdminMenu] = useState(false);
  const bottomRef = useRef(null);
  const isAdmin = profile?.role === 'admin';
  const isSeller = user?.id === seller?.id;

  // Vai buscar ou cria a conversa
  const initConversation = useCallback(async () => {
    if (initialConvId) {
      setConversationId(initialConvId);
      return;
    }
    if (!listing?.id || !user?.id || !seller?.id) return;
    if (user.id === seller.id && !isAdmin) return;
    let {
      data: existing
    } = await supabase.from('conversations').select('id').eq('listing_id', listing.id).eq('buyer_id', user.id).single();
    if (existing) {
      setConversationId(existing.id);
      return;
    }
    const {
      data: created,
      error
    } = await supabase.from('conversations').insert({
      listing_id: listing.id,
      buyer_id: user.id,
      seller_id: seller.id
    }).select('id').single();
    if (!error && created) setConversationId(created.id);
  }, [listing, user, seller, initialConvId]);
  const loadMessages = useCallback(async convId => {
    const {
      data
    } = await supabase.from('messages').select('*, profiles(full_name, role)').eq('conversation_id', convId).order('created_at', {
      ascending: true
    });
    if (data) setMessages(data);
    setLoading(false);

    // Marca como lidas
    await supabase.from('messages').update({
      read_at: new Date().toISOString()
    }).eq('conversation_id', convId).neq('sender_id', user.id).is('read_at', null);
  }, [user]);
  useEffect(() => {
    initConversation();
  }, [initConversation]);
  useEffect(() => {
    if (!conversationId) return;
    loadMessages(conversationId);
    const channel = supabase.channel(`chat:${conversationId}`).on('postgres_changes', {
      event: 'INSERT',
      schema: 'public',
      table: 'messages',
      filter: `conversation_id=eq.${conversationId}`
    }, async payload => {
      const {
        data: msgWithProfile
      } = await supabase.from('messages').select('*, profiles(full_name, role)').eq('id', payload.new.id).single();
      if (msgWithProfile) setMessages(prev => [...prev, msgWithProfile]);
      if (payload.new.sender_id !== user.id) {
        await supabase.from('messages').update({
          read_at: new Date().toISOString()
        }).eq('id', payload.new.id);
      }
    }).subscribe();
    return () => supabase.removeChannel(channel);
  }, [conversationId, loadMessages, user]);
  useEffect(() => {
    bottomRef.current?.scrollIntoView({
      behavior: 'smooth'
    });
  }, [messages]);
  async function handleSend() {
    const text = input.trim();
    if (!text || !conversationId || sending) return;
    setSending(true);
    setInput('');
    await supabase.from('messages').insert({
      conversation_id: conversationId,
      sender_id: user.id,
      content: text
    });
    setSending(false);
  }
  function handleKeyDown(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  // Admin bloqueia o utilizador (comprador ou vendedor identificado na conversa)
  async function handleBlock(targetId, targetName) {
    if (!window.confirm(`Tens a certeza que queres bloquear ${targetName}? O utilizador n\u00e3o poder\u00e1 publicar novos an\u00fancios nem enviar mensagens.`)) return;
    setBlocking(true);
    const {
      error
    } = await supabase.from('profiles').update({
      blocked: true
    }).eq('id', targetId);
    setBlocking(false);
    if (error) {
      alert('Erro ao bloquear utilizador: ' + error.message);
    } else {
      setBlocked(true);
      setShowAdminMenu(false);
      alert(`${targetName} foi bloqueado com sucesso.`);
    }
  }

  // Admin apaga esta conversa
  async function handleDeleteConversation() {
    if (!window.confirm('Apagar esta conversa e todas as mensagens? Esta a\u00e7\u00e3o \u00e9 irrevers\u00edvel.')) return;
    await supabase.from('conversations').delete().eq('id', conversationId);
    onClose();
  }
  const isSelf = msg => msg.sender_id === user.id;
  const formatTime = ts => new Date(ts).toLocaleTimeString('pt-PT', {
    hour: '2-digit',
    minute: '2-digit'
  });
  const formatDate = ts => {
    const d = new Date(ts);
    const today = new Date();
    if (d.toDateString() === today.toDateString()) return 'Hoje';
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    if (d.toDateString() === yesterday.toDateString()) return 'Ontem';
    return d.toLocaleDateString('pt-PT');
  };
  const grouped = messages.reduce((acc, msg) => {
    const label = formatDate(msg.created_at);
    if (!acc[label]) acc[label] = [];
    acc[label].push(msg);
    return acc;
  }, {});

  // Nome do vendedor  compativel com dados vindos do inbox (full_name) e do anuncio (name)
  const sellerName = seller?.full_name || seller?.name || '\u2014';
  const sellerVerified = seller?.verified;
  return <div className="fixed inset-0 z-[60] bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="bg-pine-900 border border-pine-700 rounded-t-2xl sm:rounded-2xl w-full sm:max-w-md flex flex-col shadow-2xl" style={{
      height: '85vh',
      maxHeight: '600px'
    }}>

        {/* Cabecalho */}
        <div className="flex items-center gap-3 px-4 py-3 border-b border-pine-700 shrink-0">
          <button onClick={onClose} className="text-bone-300/60 hover:text-bone-100 transition-colors">
            <ArrowLeft size={20} />
          </button>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="text-bone-100 font-semibold text-sm truncate">{sellerName}</span>
              {sellerVerified && <ShieldCheck size={13} className="text-brass-400 shrink-0" />}
            </div>
            <p className="text-bone-300/50 text-xs truncate">Sobre: {listing?.title}</p>
          </div>

          {/* Menu de moderacao (so admin) */}
          {isAdmin && <div className="relative">
              <button onClick={() => setShowAdminMenu(v => !v)} className="flex items-center gap-1 text-xs text-blaze-400 bg-blaze-500/10 border border-blaze-500/20 px-2 py-1 rounded-lg hover:bg-blaze-500/20 transition-colors">
                <ShieldCheck size={13} />
                Admin
              </button>

              {showAdminMenu && <div className="absolute right-0 top-full mt-1 bg-pine-800 border border-pine-600 rounded-xl shadow-xl z-10 min-w-[200px] overflow-hidden">
                  <div className="px-3 py-2 border-b border-pine-700">
                    <p className="text-xs text-bone-300/50 font-semibold uppercase tracking-wide">{'Modera\u00e7\u00e3o'}</p>
                  </div>

                  {/* Bloquear comprador */}
                  {seller?.id && <button onClick={() => handleBlock(seller.id, sellerName)} disabled={blocking || blocked} className="w-full flex items-center gap-2 px-3 py-2.5 text-sm text-red-400 hover:bg-red-400/10 transition-colors disabled:opacity-40 text-left">
                      <Ban size={15} />
                      Bloquear vendedor
                    </button>}

                  {/* Apagar conversa */}
                  <button onClick={handleDeleteConversation} className="w-full flex items-center gap-2 px-3 py-2.5 text-sm text-red-400 hover:bg-red-400/10 transition-colors text-left border-t border-pine-700">
                    <Trash2 size={15} />
                    Apagar conversa
                  </button>
                </div>}
            </div>}

          <button onClick={onClose} className="text-bone-300/60 hover:text-bone-100 transition-colors">
            <X size={18} />
          </button>
        </div>

        {/* Aviso de utilizador bloqueado */}
        {blocked && <div className="px-4 py-2 bg-red-400/10 border-b border-red-400/20 text-xs text-red-400 flex items-center gap-2 shrink-0">
            <Ban size={13} />{'Utilizador bloqueado. N\u00e3o pode enviar novas mensagens.'}</div>}

        {/* Area de mensagens */}
        <div className="flex-1 overflow-y-auto px-4 py-3 space-y-4" onClick={() => setShowAdminMenu(false)}>

          {loading && <div className="flex items-center justify-center h-full">
              <span className="text-bone-300/40 text-sm">A carregar...</span>
            </div>}

          {!loading && isSeller && !isAdmin && <div className="flex items-center justify-center h-full">
              <p className="text-bone-300/40 text-sm text-center px-6">{'N\u00e3o podes iniciar uma conversa sobre o teu pr\u00f3prio an\u00fancio.'}</p>
            </div>}

          {!loading && (isSeller === false || isAdmin || true) && Object.entries(grouped).map(([dateLabel, msgs]) => <div key={dateLabel}>
              <div className="flex items-center gap-3 my-3">
                <div className="flex-1 border-t border-pine-700" />
                <span className="text-xs text-bone-300/40 shrink-0">{dateLabel}</span>
                <div className="flex-1 border-t border-pine-700" />
              </div>

              {msgs.map(msg => <div key={msg.id} className={`flex mb-2 ${isSelf(msg) ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[78%] flex flex-col ${isSelf(msg) ? 'items-end' : 'items-start'}`}>
                    {/* Admin ve sempre o nome de quem enviou */}
                    {(isAdmin || !isSelf(msg)) && <span className="text-xs text-bone-300/50 mb-0.5 mx-1">
                        {msg.profiles?.full_name}
                      </span>}
                    <div className={`px-3 py-2 rounded-2xl text-sm leading-relaxed break-words ${isSelf(msg) ? 'bg-blaze-500 text-pine-950 rounded-br-sm' : 'bg-pine-700 text-bone-100 rounded-bl-sm'}`}>
                      {msg.content}
                    </div>
                    <span className="text-[10px] text-bone-300/40 mt-0.5 mx-1">
                      {formatTime(msg.created_at)}
                      {isSelf(msg) && msg.read_at && <span className="ml-1 text-blaze-400/60">{'\u00b7 lida'}</span>}
                    </span>
                  </div>
                </div>)}
            </div>)}

          {!loading && !isSeller && !(isAdmin && !isSeller) && messages.length === 0 && <div className="flex flex-col items-center justify-center h-full gap-2">
              <p className="text-bone-300/40 text-sm text-center px-6">{'Inicia a conversa com o vendedor sobre este an\u00fancio.'}</p>
            </div>}

          <div ref={bottomRef} />
        </div>

        {/* Campo de envio:
            - Comprador: sempre pode escrever
            - Admin vendedor (isSeller=true): pode responder
            - Admin a moderar (isSeller=false): so leitura */}
        {(isSeller || !isAdmin || isAdmin) && <div className="px-4 py-3 border-t border-pine-700 shrink-0">
            <div className="flex items-end gap-2">
              <textarea value={input} onChange={e => setInput(e.target.value)} onKeyDown={handleKeyDown} placeholder="Escreve uma mensagem..." rows={1} maxLength={1000} className="flex-1 bg-pine-800 border border-pine-600 rounded-xl px-3 py-2.5 text-sm text-bone-100 placeholder:text-bone-300/40 outline-none focus:border-blaze-500 transition-colors resize-none" style={{
            minHeight: '42px',
            maxHeight: '120px'
          }} onInput={e => {
            e.target.style.height = 'auto';
            e.target.style.height = Math.min(e.target.scrollHeight, 120) + 'px';
          }} />
              <button onClick={handleSend} disabled={!input.trim() || sending} className="bg-blaze-500 hover:bg-blaze-600 disabled:opacity-40 disabled:cursor-not-allowed transition-colors text-pine-950 p-2.5 rounded-xl shrink-0">
                <Send size={18} />
              </button>
            </div>
            <p className="text-[10px] text-bone-300/30 mt-1 text-right">{input.length}/1000</p>
          </div>}

        {/* Rodape para admin a moderar  so leitura */}
        {isAdmin && !isSeller && false && <div className="px-4 py-3 border-t border-pine-700 shrink-0 text-center">
            <p className="text-xs text-bone-300/40">{'A ver como administrador \u2014 s\u00f3 leitura'}</p>
          </div>}

      </div>
    </div>;
}