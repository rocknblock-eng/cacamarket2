import { Search, User, ShieldCheck, LogOut, Plus, MessageCircle } from 'lucide-react';
export default function Header({
  onOpenAuth,
  onOpenAdmin,
  onOpenSell,
  onOpenProfile,
  onOpenInbox,
  search,
  setSearch,
  profile,
  onLogout,
  unreadCount
}) {
  return (
    <header className="sticky top-0 z-30 bg-pine-950/95 backdrop-blur border-b border-pine-700">
      <div className="max-w-6xl mx-auto px-3 py-2 flex items-center gap-2">

        {/* Logo -- menor em mobile, normal em desktop */}
        <div className="shrink-0">
          <img src="/logo.svg" alt="WildMarket" className="h-10 sm:h-14 w-auto" />
        </div>

        {/* Barra de pesquisa -- ocupa o espaco disponivel */}
        <div className="flex-1 min-w-0 flex items-center bg-pine-800 border border-pine-600 rounded-full px-3 py-1.5 gap-2">
          <Search size={15} className="text-bone-300 shrink-0" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder={'Procurar ca\u00e7a...'}
            className="bg-transparent outline-none text-sm text-bone-100 placeholder:text-bone-300/50 w-full min-w-0"
          />
        </div>

        {/* Botoes de acao -- so icones em mobile */}
        <div className="flex items-center gap-1 shrink-0">

          {profile && (
            <button
              onClick={onOpenSell}
              className="flex items-center gap-1.5 bg-pine-700 hover:bg-pine-600 transition-colors text-bone-100 font-semibold text-sm px-2.5 py-1.5 rounded-full"
              title={'Vender'}
            >
              <Plus size={16} />
              <span className="hidden sm:inline">Vender</span>
            </button>
          )}

          {profile && (
            <button
              onClick={onOpenInbox}
              className="relative flex items-center bg-pine-700 hover:bg-pine-600 transition-colors text-bone-300 hover:text-bone-100 p-2 rounded-full"
              title="Mensagens"
            >
              <MessageCircle size={18} />
              {unreadCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 bg-blaze-500 text-pine-950 text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </button>
          )}

          {profile?.role === 'admin' && (
            <button
              onClick={onOpenAdmin}
              className="flex items-center p-2 text-bone-300 hover:text-blaze-400 transition-colors"
              title={'Painel de administra\u00e7\u00e3o'}
            >
              <ShieldCheck size={18} />
            </button>
          )}

          {profile ? (
            <div className="flex items-center gap-1">
              <button
                onClick={onOpenProfile}
                className="flex items-center gap-2 bg-pine-700 hover:bg-pine-600 transition-colors text-bone-100 font-semibold text-sm px-2.5 py-1.5 rounded-full"
                title="O meu perfil"
              >
                <User size={16} />
                <span className="hidden sm:inline max-w-[90px] truncate">{profile.full_name}</span>
              </button>
              <button
                onClick={onLogout}
                className="flex items-center bg-pine-700 hover:bg-pine-600 transition-colors text-bone-300 hover:text-bone-100 p-2 rounded-full"
                title="Sair"
              >
                <LogOut size={16} />
              </button>
            </div>
          ) : (
            <button
              onClick={onOpenAuth}
              className="flex items-center gap-1.5 bg-blaze-500 hover:bg-blaze-600 transition-colors text-pine-950 font-semibold text-sm px-2.5 py-1.5 rounded-full"
            >
              <User size={16} />
              <span className="hidden sm:inline">Entrar</span>
            </button>
          )}
        </div>

      </div>
    </header>
  );
}
