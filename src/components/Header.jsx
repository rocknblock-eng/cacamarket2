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
  return <header className="sticky top-0 z-30 bg-pine-950/95 backdrop-blur border-b border-pine-700">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center gap-3">
        <div className="flex items-center shrink-0">
          <img src="/logo.svg" alt="WildMarket" className="h-18 w-auto" />
        </div>

        <div className="flex-1 flex items-center bg-pine-800 border border-pine-600 rounded-full px-3 py-2 gap-2">
          <Search size={16} className="text-bone-300 shrink-0" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder={'Procurar equipamento de ca\u00e7a...'} className="bg-transparent outline-none text-sm text-bone-100 placeholder:text-bone-300/50 w-full" />
        </div>

        {profile && <button onClick={onOpenSell} className="flex items-center gap-1.5 bg-pine-700 hover:bg-pine-600 transition-colors text-bone-100 font-semibold text-sm px-3 py-2 rounded-full shrink-0">
            <Plus size={16} />
            <span className="hidden sm:inline">Vender</span>
          </button>}

        {profile && <button onClick={onOpenInbox} className="relative flex items-center bg-pine-700 hover:bg-pine-600 transition-colors text-bone-300 hover:text-bone-100 p-2 rounded-full shrink-0" title="Mensagens">
            <MessageCircle size={18} />
            {unreadCount > 0 && <span className="absolute -top-0.5 -right-0.5 bg-blaze-500 text-pine-950 text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>}
          </button>}

        {profile?.role === 'admin' && <button onClick={onOpenAdmin} className="hidden sm:flex items-center gap-1 text-xs text-bone-300 hover:text-blaze-400 transition-colors px-2" title={'Painel de administra\u00e7\u00e3o'}>
            <ShieldCheck size={16} />
          </button>}

        {profile ? <div className="flex items-center gap-1 shrink-0">
            <button onClick={onOpenProfile} className="flex items-center gap-2 bg-pine-700 hover:bg-pine-600 transition-colors text-bone-100 font-semibold text-sm px-3 py-2 rounded-full" title="O meu perfil">
              <User size={16} />
              <span className="hidden sm:inline max-w-[100px] truncate">{profile.full_name}</span>
            </button>
            <button onClick={onLogout} className="flex items-center bg-pine-700 hover:bg-pine-600 transition-colors text-bone-300 hover:text-bone-100 p-2 rounded-full" title="Sair">
              <LogOut size={16} />
            </button>
          </div> : <button onClick={onOpenAuth} className="flex items-center gap-2 bg-blaze-500 hover:bg-blaze-600 transition-colors text-pine-950 font-semibold text-sm px-3 py-2 rounded-full shrink-0">
            <User size={16} />
            <span className="hidden sm:inline">Entrar</span>
          </button>}
      </div>
    </header>;
}