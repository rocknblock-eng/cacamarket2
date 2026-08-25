import { PartyPopper, X } from 'lucide-react';

export const WELCOME_MODAL_STORAGE_KEY = 'wildmarket_hide_welcome';

export default function WelcomeModal({ onClose, onRegister }) {
  function handleDontShowAgain() {
    try {
      localStorage.setItem(WELCOME_MODAL_STORAGE_KEY, '1');
    } catch (err) {
      // localStorage indisponivel (modo privado, etc.) - ignora, sem
      // consequencias graves para alem de o modal voltar a aparecer.
    }
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/60 flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="bg-pine-800 border border-pine-600 rounded-t-2xl sm:rounded-2xl w-full sm:max-w-lg p-6 space-y-5 relative max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-bone-300/60 hover:text-bone-100"
        >
          <X size={20} />
        </button>

        <h2 className="font-display font-bold text-bone-100 text-xl pr-8">
          {'Bem-vindo ao WildMarket \ud83c\udff9'}
        </h2>

        <div className="space-y-4 text-sm text-bone-300/80 leading-relaxed">
          <p>
            {'O WildMarket \u00e9 o mercado portugu\u00eas dedicado a quem vive a ca\u00e7a e o tiro desportivo \u2014 feito por e para ca\u00e7adores e atiradores, de Norte a Sul do pa\u00eds.'}
          </p>
          <p>
            {'Aqui encontras vestu\u00e1rio t\u00e9cnico, \u00f3tica, equipamento de campo, acess\u00f3rios de tiro desportivo e muito mais, publicado por gente que percebe do que fala. Mais do que uma montra de an\u00fancios, o WildMarket \u00e9 uma '}
            <strong className="text-bone-100">{'comunidade'}</strong>
            {': um espa\u00e7o de confian\u00e7a entre pessoas que partilham a mesma paix\u00e3o.'}
          </p>
          <p>
            {'Por quest\u00f5es legais, n\u00e3o vendemos armas de fogo nem muni\u00e7\u00f5es \u2014 o nosso foco \u00e9 tudo o resto que faz a diferen\u00e7a numa sa\u00edda de campo ou numa sess\u00e3o de tiro.'}
          </p>

          <div className="bg-blaze-500/10 border border-blaze-500/30 rounded-xl px-4 py-3 flex gap-3 items-start">
            <PartyPopper size={20} className="text-blaze-400 shrink-0 mt-0.5" />
            <p className="text-bone-100">
              <strong>{'Estamos em per\u00edodo de lan\u00e7amento'}</strong>
              {' \u2014 publicar an\u00fancios \u00e9 '}
              <strong className="text-blaze-400">{'totalmente gratuito'}</strong>
              {' por tempo limitado. \u00c9 a melhor altura para te registares e garantires o teu lugar na comunidade.'}
            </p>
          </div>

          <p className="text-bone-100 font-semibold">
            {'Regista-te agora e publica o teu primeiro an\u00fancio em minutos.'}
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 pt-1">
          <button
            onClick={onRegister}
            className="bg-blaze-500 hover:bg-blaze-600 transition-colors text-pine-950 font-semibold text-sm px-5 py-2.5 rounded-lg flex-1"
          >
            {'Registar agora'}
          </button>
          <button
            onClick={onClose}
            className="bg-pine-700 hover:bg-pine-600 transition-colors text-bone-100 font-semibold text-sm px-5 py-2.5 rounded-lg flex-1"
          >
            {'Ver an\u00fancios primeiro'}
          </button>
        </div>

        <button
          onClick={handleDontShowAgain}
          className="text-xs text-bone-300/50 hover:text-bone-300/80 underline block mx-auto"
        >
          {'N\u00e3o voltar a mostrar'}
        </button>
      </div>
    </div>
  );
}
