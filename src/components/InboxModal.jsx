import { useState, useEffect, useCallback } from 'react'
import { X, MessageCircle, ChevronRight, ShieldCheck, Trash2, ArrowRight } from 'lucide-react'
import { supabase } from '../lib/supabaseClient.js'

export default function InboxModal({ user, profile, onOpenChat, onClose }) {
  const [conversations, setConversations] = useState([])
  const [loading, setLoading] = useState(true)
  const [deleting, setDeleting] = useState(null) // id da conversa a apagar

  const isAdmin = profile?.role === 'admin'

  const loadConversations = useCallback(async () => {
    setLoading(true)

    let query = supabase
      .from('conversations')
      .select(`
        id,
        created_at,
        listing_id,
        buyer_id,
        seller_id,
        listings(id, title, price, image_url),
        buyer:profiles!conversations_buyer_id_fkey(id, full_name, verified),
        seller:profiles!conversations_seller_id_fkey(id, full_name, verified)
      `)
      .order('created_at', { ascending: false })

    if (!isAdmin) {
      query = query.or(`buyer_id.eq.${user.id},seller_id.eq.${user.id}`)
    }

    const { data, error } = await query
    if (error || !data) { setLoading(false); return }

    const enriched = await Promise.all(
      data.map(async (conv) => {
        const { data: lastMsg } = await supabase
          .from('messages')
          .select('content, created_at, sender_id')
          .eq('conversation_id', conv.id)
          .order('created_at', { ascending: false })
          .limit(1)
          .single()

        const { count: unread } = await supabase
          .from('messages')
          .select('id', { count: 'exact', head: true })
          .eq('conversation_id', conv.id)
          .neq('sender_id', user.id)
          .is('read_at', null)

        return { ...conv, lastMsg, unread: unread || 0 }
      })
    )

    enriched.sort((a, b) => {
      const aTime = a.lastMsg?.created_at || a.created_at
      const bTime = b.lastMsg?.created_at || b.created_at
      return new Date(bTime) - new Date(aTime)
    })

    setConversations(enriched)
    setLoading(false)
  }, [user, isAdmin])

  useEffect(() => {
    loadConversations()
    const channel = supabase
      .channel('inbox-updates')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages' }, loadConversations)
      .subscribe()
    return () => supabase.removeChannel(channel)
  }, [loadConversations])

  // Admin apaga conversa (e todas as mensagens por CASCADE)
  async function handleDelete(e, convId) {
    e.stopPropagation()
    if (!window.confirm('Tens a certeza que queres apagar esta conversa? Esta ação é irreversível.')) return
    setDeleting(convId)
    await supabase.from('conversations').delete().eq('id', convId)
    setConversations((prev) => prev.filter((c) => c.id !== convId))
    setDeleting(null)
  }

  const formatTime = (ts) => {
    if (!ts) return ''
    const d = new Date(ts)
    const today = new Date()
    if (d.toDateString() === today.toDateString())
      return d.toLocaleTimeString('pt-PT', { hour: '2-digit', minute: '2-digit' })
    return d.toLocaleDateString('pt-PT', { day: '2-digit', month: '2-digit' })
  }

  const totalUnread = conversations.reduce((sum, c) => sum + c.unread, 0)

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="bg-pine-900 border border-pine-700 rounded-t-2xl sm:rounded-2xl w-full sm:max-w-md shadow-2xl overflow-hidden flex flex-col" style={{ maxHeight: '85vh' }}>

        {/* Cabeçalho */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-pine-700 shrink-0">
          <div className="flex items-center gap-2">
            <h2 className="text-bone-100 font-display font-bold text-base">
              {isAdmin ? 'Todas as conversas' : 'Mensagens'}
            </h2>
            {totalUnread > 0 && (
              <span className="bg-blaze-500 text-pine-950 text-xs font-bold px-1.5 py-0.5 rounded-full min-w-[20px] text-center">
                {totalUnread}
              </span>
            )}
            {isAdmin && (
              <span className="text-[10px] text-blaze-400 bg-blaze-500/10 border border-blaze-500/20 rounded-full px-2 py-0.5">
                Admin
              </span>
            )}
          </div>
          <button onClick={onClose} className="text-bone-300/60 hover:text-bone-100 transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* Lista */}
        <div className="flex-1 overflow-y-auto">
          {loading && (
            <div className="flex items-center justify-center py-16">
              <span className="text-bone-300/40 text-sm">A carregar...</span>
            </div>
          )}

          {!loading && conversations.length === 0 && (
            <div className="flex flex-col items-center justify-center py-16 gap-3">
              <MessageCircle size={36} className="text-bone-300/20" />
              <p className="text-bone-300/40 text-sm text-center px-6">
                {isAdmin ? 'Não há conversas na plataforma ainda.' : 'Ainda não tens nenhuma conversa.\nAbre um anúncio e clica em "Chat com o vendedor".'}
              </p>
            </div>
          )}

          {!loading && conversations.map((conv) => {
            const isBuyer = conv.buyer_id === user.id
            // Admin vê sempre "Comprador → Vendedor"
            // Utilizador normal vê o "outro"
            const other = isAdmin ? null : (isBuyer ? conv.seller : conv.buyer)

            return (
              <div
                key={conv.id}
                className="flex items-center border-b border-pine-800 hover:bg-pine-800/50 transition-colors"
              >
                {/* Linha clicável */}
                <button
                  onClick={() => onOpenChat(conv)}
                  className="flex-1 flex items-center gap-3 px-4 py-4 text-left min-w-0"
                >
                  {/* Avatar */}
                  <div className="w-11 h-11 rounded-full bg-pine-700 border border-pine-600 flex items-center justify-center font-display font-bold text-bone-100 shrink-0 text-sm relative">
                    {isAdmin
                      ? conv.buyer?.full_name?.charAt(0) || '?'
                      : other?.full_name?.charAt(0) || '?'}
                    {conv.unread > 0 && (
                      <span className="absolute -top-0.5 -right-0.5 bg-blaze-500 text-pine-950 text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                        {conv.unread > 9 ? '9+' : conv.unread}
                      </span>
                    )}
                  </div>

                  {/* Conteúdo */}
                  <div className="flex-1 min-w-0">
                    {/* ETIQUETA ADMIN: "Comprador → Vendedor" */}
                    {isAdmin ? (
                      <div className="flex items-center gap-1.5 mb-0.5 flex-wrap">
                        <span className="text-sm font-semibold text-bone-100 truncate">
                          {conv.buyer?.full_name || '—'}
                        </span>
                        {conv.buyer?.verified && <ShieldCheck size={11} className="text-brass-400 shrink-0" />}
                        <ArrowRight size={12} className="text-bone-300/40 shrink-0" />
                        <span className="text-sm font-semibold text-bone-100 truncate">
                          {conv.seller?.full_name || '—'}
                        </span>
                        {conv.seller?.verified && <ShieldCheck size={11} className="text-brass-400 shrink-0" />}
                      </div>
                    ) : (
                      <div className="flex items-center gap-1.5">
                        <span className={`text-sm font-semibold truncate ${conv.unread > 0 ? 'text-bone-100' : 'text-bone-200'}`}>
                          {other?.full_name || '—'}
                        </span>
                        {other?.verified && <ShieldCheck size={12} className="text-brass-400 shrink-0" />}
                      </div>
                    )}

                    {/* Anúncio */}
                    <p className="text-xs text-bone-300/50 truncate mt-0.5">
                      📦 {conv.listings?.title || 'Anúncio removido'}
                    </p>

                    {/* Última mensagem + hora */}
                    <div className="flex items-center justify-between gap-2 mt-0.5">
                      {conv.lastMsg ? (
                        <p className={`text-xs truncate flex-1 ${conv.unread > 0 ? 'text-bone-200 font-medium' : 'text-bone-300/50'}`}>
                          {conv.lastMsg.sender_id === user.id ? 'Tu: ' : ''}
                          {conv.lastMsg.content}
                        </p>
                      ) : (
                        <p className="text-xs text-bone-300/30 italic flex-1">Sem mensagens ainda</p>
                      )}
                      <span className="text-[11px] text-bone-300/40 shrink-0">
                        {formatTime(conv.lastMsg?.created_at || conv.created_at)}
                      </span>
                    </div>
                  </div>

                  <ChevronRight size={16} className="text-bone-300/30 shrink-0 ml-1" />
                </button>

                {/* Botão apagar — só admin */}
                {isAdmin && (
                  <button
                    onClick={(e) => handleDelete(e, conv.id)}
                    disabled={deleting === conv.id}
                    className="px-3 py-4 text-red-400/50 hover:text-red-400 transition-colors shrink-0 disabled:opacity-30"
                    title="Apagar conversa"
                  >
                    <Trash2 size={16} />
                  </button>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
