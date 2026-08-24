import { useState } from 'react';
import { X, FileText, Shield } from 'lucide-react';
const CONTACT_EMAIL = 'cacamarket@proton.me';
const PLATFORM_NAME = 'WildMarket';
const LAST_UPDATED = 'agosto de 2026';
function TermsContent() {
  return <div className="space-y-6 text-sm text-bone-300/80 leading-relaxed">

      <section>
        <h3 className="text-bone-100 font-semibold text-base mb-2">{'1. Objeto e \u00c2mbito'}</h3>
        <p>{'Os presentes Termos e Condi\u00e7\u00f5es regulam o acesso e utiliza\u00e7\u00e3o da plataforma '}<strong className="text-bone-100">{PLATFORM_NAME}</strong>{', um mercado online dedicado \u00e0 compra e venda de equipamento de ca\u00e7a entre particulares e profissionais, operando exclusivamente em territ\u00f3rio portugu\u00eas e em conformidade com a legisla\u00e7\u00e3o portuguesa e europeia aplic\u00e1vel.'}</p>
        <p className="mt-2">{'Ao registar-se na plataforma, o utilizador declara ter lido, compreendido e aceite integralmente os presentes Termos e Condi\u00e7\u00f5es, bem como a Pol\u00edtica de Privacidade da plataforma.'}</p>
      </section>

      <section>
        <h3 className="text-bone-100 font-semibold text-base mb-2">{'2. Defini\u00e7\u00f5es'}</h3>
        <ul className="space-y-1.5 list-none">
          <li><strong className="text-bone-200">Plataforma:</strong>{' o s\u00edtio web e aplica\u00e7\u00e3o m\u00f3vel '}{PLATFORM_NAME}.</li>
          <li><strong className="text-bone-200">Utilizador:</strong> qualquer pessoa singular ou coletiva que aceda ou utilize a plataforma.</li>
          <li><strong className="text-bone-200">Vendedor:</strong>{' utilizador que publique an\u00fancios de venda na plataforma.'}</li>
          <li><strong className="text-bone-200">Comprador:</strong>{' utilizador que contacte vendedores ou adquira produtos atrav\u00e9s da plataforma.'}</li>
          <li><strong className="text-bone-200">{'An\u00fancio:'}</strong>{' publica\u00e7\u00e3o de oferta de venda de produto ou servi\u00e7o na plataforma.'}</li>
        </ul>
      </section>

      <section>
        <h3 className="text-bone-100 font-semibold text-base mb-2">{'3. Condi\u00e7\u00f5es de Acesso e Registo'}</h3>
        <p>{'O acesso \u00e0 plataforma \u00e9 permitido a qualquer pessoa singular com idade igual ou superior a 18 anos, ou a pessoas coletivas legalmente constitu\u00eddas. O registo implica a cria\u00e7\u00e3o de uma conta pessoal com dados verdadeiros, completos e atualizados.'}</p>
        <p className="mt-2">{'O utilizador \u00e9 o \u00fanico respons\u00e1vel pela confidencialidade das suas credenciais de acesso e por todas as atividades realizadas com a sua conta. Em caso de suspeita de utiliza\u00e7\u00e3o indevida, dever\u00e1 contactar imediatamente a plataforma atrav\u00e9s de '}<strong className="text-bone-100">{CONTACT_EMAIL}</strong>.
        </p>
      </section>

      <section>
        <h3 className="text-bone-100 font-semibold text-base mb-2">4. Produtos Permitidos e Proibidos</h3>
        <p>{'A plataforma destina-se exclusivamente \u00e0 compra e venda de:'}</p>
        <ul className="mt-2 space-y-1 list-disc list-inside">
          <li>{'\u00d3ptica de ca\u00e7a (lunetas, bin\u00f3culos, visores)'}</li>
          <li>{'Vestu\u00e1rio e cal\u00e7ado de ca\u00e7a'}</li>
          <li>{'Acess\u00f3rios de ca\u00e7a'}</li>
          <li>{'C\u00e3es de ca\u00e7a'}</li>
          <li>{'Eletr\u00f3nicos de ca\u00e7a'}</li>
          <li>Facas e ferramentas</li>
          <li>{'Servi\u00e7os relacionados com a atividade cineg\u00e9tica'}</li>
          <li>Diversos e outros artigos relacionados</li>
        </ul>
        <p className="mt-3 text-red-400/80">
          <strong>{'S\u00e3o expressamente proibidos'}</strong>{' an\u00fancios de armas de fogo, muni\u00e7\u00f5es, explosivos, subst\u00e2ncias controladas, produtos falsificados, esp\u00e9cies protegidas ou qualquer artigo cuja comercializa\u00e7\u00e3o seja proibida por lei portuguesa ou europeia, nomeadamente ao abrigo do Regime Jur\u00eddico das Armas e suas Muni\u00e7\u00f5es (Lei n.\u00ba 5/2006, de 23 de fevereiro, e legisla\u00e7\u00e3o complementar) e da Lei de Prote\u00e7\u00e3o da Natureza.'}</p>
      </section>

      <section>
        <h3 className="text-bone-100 font-semibold text-base mb-2">5. Responsabilidades do Vendedor</h3>
        <p>O vendedor declara e garante que:</p>
        <ul className="mt-2 space-y-1.5 list-disc list-inside">
          <li>{'\u00c9 leg\u00edtimo propriet\u00e1rio ou tem autoriza\u00e7\u00e3o para vender os artigos anunciados.'}</li>
          <li>{'As descri\u00e7\u00f5es, fotografias e pre\u00e7os dos artigos s\u00e3o verdadeiros e n\u00e3o induzem em erro.'}</li>
          <li>{'Os artigos anunciados cumprem toda a legisla\u00e7\u00e3o portuguesa aplic\u00e1vel.'}</li>
          <li>{'N\u00e3o publicar\u00e1 conte\u00fados ilegais, ofensivos, difamat\u00f3rios ou que violem direitos de terceiros.'}</li>
          <li>{'Cumprir\u00e1 as obriga\u00e7\u00f5es fiscais decorrentes das vendas realizadas, nomeadamente ao abrigo do C\u00f3digo do IRS ou IRC.'}</li>
        </ul>
      </section>

      <section>
        <h3 className="text-bone-100 font-semibold text-base mb-2">6. Responsabilidades da Plataforma</h3>
        <p>{'A plataforma atua como intermedi\u00e1rio entre vendedores e compradores, n\u00e3o sendo parte nos contratos celebrados entre utilizadores. A plataforma n\u00e3o garante a qualidade, seguran\u00e7a, legalidade ou exatid\u00e3o dos an\u00fancios publicados, nem a capacidade dos utilizadores para concluir transa\u00e7\u00f5es.'}</p>
        <p className="mt-2">{'A plataforma reserva-se o direito de remover an\u00fancios ou suspender contas que violem os presentes Termos e Condi\u00e7\u00f5es, sem necessidade de aviso pr\u00e9vio e sem direito a qualquer indemniza\u00e7\u00e3o.'}</p>
      </section>

      <section>
        <h3 className="text-bone-100 font-semibold text-base mb-2">7. Donativos e Sustentabilidade da Plataforma</h3>
        <p>
          A plataforma {PLATFORM_NAME}{' assenta num modelo de donativo para garantir a sua sustentabilidade e continuidade. Durante o per\u00edodo de lan\u00e7amento, a publica\u00e7\u00e3o de an\u00fancios \u00e9 inteiramente gratuita para todos os utilizadores.'}</p>
        <p className="mt-2">{'Ap\u00f3s o per\u00edodo de lan\u00e7amento, aplicam-se as seguintes condi\u00e7\u00f5es:'}</p>
        <ul className="mt-2 space-y-1.5 list-disc list-inside">
          <li><strong className="text-bone-200">Particulares:</strong>{' primeiro an\u00fancio gratuito; a publica\u00e7\u00e3o de an\u00fancios adicionais requer um donativo volunt\u00e1rio \u00e0 plataforma.'}</li>
          <li><strong className="text-bone-200">Lojas e Profissionais:</strong>{' primeiros cinco an\u00fancios gratuitos; a publica\u00e7\u00e3o de an\u00fancios adicionais requer um donativo volunt\u00e1rio \u00e0 plataforma.'}</li>
        </ul>
        <p className="mt-2">{'O valor do donativo \u00e9 definido pelo utilizador de forma livre e consciente, como forma de apoio \u00e0 manuten\u00e7\u00e3o e desenvolvimento da plataforma. A plataforma reserva-se o direito de estabelecer um valor m\u00ednimo sugerido, mediante aviso pr\u00e9vio aos utilizadores registados com anteced\u00eancia m\u00ednima de 30 dias.'}</p>
      </section>

      <section>
        <h3 className="text-bone-100 font-semibold text-base mb-2">8. Propriedade Intelectual</h3>
        <p>{'Todos os conte\u00fados da plataforma (marca, design, c\u00f3digo, textos) s\u00e3o propriedade exclusiva dos seus titulares e est\u00e3o protegidos pela legisla\u00e7\u00e3o portuguesa e europeia de propriedade intelectual. \u00c9 proibida a reprodu\u00e7\u00e3o, distribui\u00e7\u00e3o ou utiliza\u00e7\u00e3o n\u00e3o autorizada.'}</p>
        <p className="mt-2">{'O utilizador mant\u00e9m os direitos sobre os conte\u00fados que publica, mas concede \u00e0 plataforma uma licen\u00e7a n\u00e3o exclusiva para os exibir e promover no \u00e2mbito da plataforma.'}</p>
      </section>

      <section>
        <h3 className="text-bone-100 font-semibold text-base mb-2">{'9. Resolu\u00e7\u00e3o de Lit\u00edgios'}</h3>
        <p>{'Em caso de lit\u00edgio, o utilizador pode recorrer \u00e0 plataforma de resolu\u00e7\u00e3o de lit\u00edgios em linha da Uni\u00e3o Europeia dispon\u00edvel em '}<strong className="text-bone-100">ec.europa.eu/consumers/odr</strong>{', ou aos centros de arbitragem de conflitos de consumo reconhecidos em Portugal, nos termos da Lei n.\u00ba 144/2015, de 8 de setembro.'}</p>
        <p className="mt-2">{'Os presentes Termos e Condi\u00e7\u00f5es s\u00e3o regidos pela lei portuguesa. Para resolu\u00e7\u00e3o de lit\u00edgios n\u00e3o sujeitos a arbitragem, \u00e9 competente o tribunal da comarca de Lisboa.'}</p>
      </section>

      <section>
        <h3 className="text-bone-100 font-semibold text-base mb-2">{'10. Altera\u00e7\u00f5es aos Termos'}</h3>
        <p>{'A plataforma reserva-se o direito de alterar os presentes Termos e Condi\u00e7\u00f5es a qualquer momento, mediante aviso aos utilizadores registados com anteced\u00eancia m\u00ednima de 30 dias. A continua\u00e7\u00e3o da utiliza\u00e7\u00e3o da plataforma ap\u00f3s esse prazo implica a aceita\u00e7\u00e3o das altera\u00e7\u00f5es.'}</p>
      </section>

      <section>
        <h3 className="text-bone-100 font-semibold text-base mb-2">11. Contactos</h3>
        <p>{'Para qualquer quest\u00e3o relacionada com estes Termos e Condi\u00e7\u00f5es, contacte-nos atrav\u00e9s de:'}<strong className="text-bone-100"> {CONTACT_EMAIL}</strong>
        </p>
      </section>

      <p className="text-xs text-bone-300/40 pt-4 border-t border-pine-700">{'\u00daltima atualiza\u00e7\u00e3o: '}{LAST_UPDATED}
      </p>
    </div>;
}
function PrivacyContent() {
  return <div className="space-y-6 text-sm text-bone-300/80 leading-relaxed">

      <section>
        <h3 className="text-bone-100 font-semibold text-base mb-2">{'1. Respons\u00e1vel pelo Tratamento'}</h3>
        <p>{'O respons\u00e1vel pelo tratamento dos dados pessoais recolhidos atrav\u00e9s da plataforma'}<strong className="text-bone-100"> {PLATFORM_NAME}</strong>{' pode ser contactado atrav\u00e9s do endere\u00e7o de correio eletr\u00f3nico '}<strong className="text-bone-100">{CONTACT_EMAIL}</strong>.
        </p>
        <p className="mt-2">{'A presente Pol\u00edtica de Privacidade foi elaborada em conformidade com o Regulamento (UE) 2016/679 do Parlamento Europeu e do Conselho, de 27 de abril de 2016 (RGPD), e com a Lei n.\u00ba 58/2019, de 8 de agosto (lei de execu\u00e7\u00e3o do RGPD em Portugal).'}</p>
      </section>

      <section>
        <h3 className="text-bone-100 font-semibold text-base mb-2">2. Dados Recolhidos</h3>
        <p>A plataforma recolhe e trata os seguintes dados pessoais:</p>
        <ul className="mt-2 space-y-1.5 list-disc list-inside">
          <li><strong className="text-bone-200">Dados de registo:</strong>{' endere\u00e7o de correio eletr\u00f3nico, nome, palavra-passe (cifrada).'}</li>
          <li><strong className="text-bone-200">Dados de perfil:</strong>{' nome completo, n\u00famero de telefone, localiza\u00e7\u00e3o (distrito/concelho).'}</li>
          <li><strong className="text-bone-200">{'Dados de an\u00fancios:'}</strong>{' descri\u00e7\u00f5es, fotografias e pre\u00e7os dos artigos publicados.'}</li>
          <li><strong className="text-bone-200">{'Dados de comunica\u00e7\u00e3o:'}</strong>{' mensagens trocadas atrav\u00e9s do chat interno da plataforma.'}</li>
          <li><strong className="text-bone-200">{'Dados t\u00e9cnicos:'}</strong>{' endere\u00e7o IP, tipo de browser, sistema operativo, p\u00e1ginas visitadas.'}</li>
        </ul>
      </section>

      <section>
        <h3 className="text-bone-100 font-semibold text-base mb-2">3. Finalidades e Base Legal do Tratamento</h3>
        <ul className="mt-2 space-y-3">
          <li>
            <strong className="text-bone-200">{'Presta\u00e7\u00e3o do servi\u00e7o'}</strong>{' \u2014 execu\u00e7\u00e3o do contrato (Art. 6.\u00ba, n.\u00ba 1, al. b) RGPD): gest\u00e3o de contas, publica\u00e7\u00e3o de an\u00fancios, comunica\u00e7\u00e3o entre utilizadores.'}</li>
          <li>
            <strong className="text-bone-200">{'Cumprimento de obriga\u00e7\u00f5es legais'}</strong>{' \u2014 obriga\u00e7\u00e3o legal (Art. 6.\u00ba, n.\u00ba 1, al. c) RGPD): fatura\u00e7\u00e3o, preven\u00e7\u00e3o de fraude, cumprimento de ordens judiciais.'}</li>
          <li>
            <strong className="text-bone-200">Melhoria da plataforma</strong>{' \u2014 interesse leg\u00edtimo (Art. 6.\u00ba, n.\u00ba 1, al. f) RGPD): an\u00e1lise de utiliza\u00e7\u00e3o, dete\u00e7\u00e3o de erros, seguran\u00e7a inform\u00e1tica.'}</li>
          <li>
            <strong className="text-bone-200">{'Comunica\u00e7\u00f5es de servi\u00e7o'}</strong>{' \u2014 consentimento (Art. 6.\u00ba, n.\u00ba 1, al. a) RGPD): notifica\u00e7\u00f5es sobre a conta e an\u00fancios (pode revogar a qualquer momento).'}</li>
        </ul>
      </section>

      <section>
        <h3 className="text-bone-100 font-semibold text-base mb-2">{'4. Conserva\u00e7\u00e3o dos Dados'}</h3>
        <p>{'Os dados pessoais s\u00e3o conservados pelos seguintes prazos:'}</p>
        <ul className="mt-2 space-y-1.5 list-disc list-inside">
          <li><strong className="text-bone-200">Dados de conta:</strong>{' enquanto a conta estiver ativa, mais 3 anos ap\u00f3s o cancelamento.'}</li>
          <li><strong className="text-bone-200">{'Dados de fatura\u00e7\u00e3o:'}</strong>{' 10 anos, nos termos do C\u00f3digo Comercial portugu\u00eas.'}</li>
          <li><strong className="text-bone-200">Mensagens de chat:</strong>{' 1 ano ap\u00f3s o envio, salvo obriga\u00e7\u00e3o legal de conserva\u00e7\u00e3o superior.'}</li>
          <li><strong className="text-bone-200">{'Dados t\u00e9cnicos:'}</strong>{' m\u00e1ximo de 90 dias.'}</li>
        </ul>
      </section>

      <section>
        <h3 className="text-bone-100 font-semibold text-base mb-2">5. Partilha de Dados com Terceiros</h3>
        <p>Os dados pessoais podem ser partilhados com:</p>
        <ul className="mt-2 space-y-1.5 list-disc list-inside">
          <li><strong className="text-bone-200">Supabase Inc.</strong>{' \u2014 fornecedor de infraestrutura de base de dados e autentica\u00e7\u00e3o, nos termos do seu Data Processing Agreement, em conformidade com o RGPD.'}</li>
          <li><strong className="text-bone-200">Processadores de pagamento</strong>{' \u2014 Stripe e PayPal, exclusivamente para processamento de pagamentos, nos termos das respetivas pol\u00edticas de privacidade.'}</li>
          <li><strong className="text-bone-200">Autoridades competentes</strong>{' \u2014 quando legalmente obrigado, nomeadamente por ordem judicial ou requisi\u00e7\u00e3o de autoridade policial.'}</li>
        </ul>
        <p className="mt-2">{'A plataforma n\u00e3o vende, aluga ou cede dados pessoais a terceiros para fins comerciais ou de marketing.'}</p>
      </section>

      <section>
        <h3 className="text-bone-100 font-semibold text-base mb-2">{'6. Transfer\u00eancias Internacionais'}</h3>
        <p>{'Os dados podem ser transferidos para servidores localizados fora do Espa\u00e7o Econ\u00f3mico Europeu, nomeadamente para os Estados Unidos da Am\u00e9rica, no \u00e2mbito dos servi\u00e7os Supabase e Stripe. Estas transfer\u00eancias s\u00e3o efetuadas com base nas Cl\u00e1usulas Contratuais Tipo aprovadas pela Comiss\u00e3o Europeia, garantindo um n\u00edvel de prote\u00e7\u00e3o equivalente ao exigido pelo RGPD.'}</p>
      </section>

      <section>
        <h3 className="text-bone-100 font-semibold text-base mb-2">7. Direitos dos Titulares dos Dados</h3>
        <p>Nos termos do RGPD, o utilizador tem os seguintes direitos:</p>
        <ul className="mt-2 space-y-1.5 list-disc list-inside">
          <li><strong className="text-bone-200">Acesso</strong>{' \u2014 obter confirma\u00e7\u00e3o sobre o tratamento e acesso aos seus dados (Art. 15.\u00ba RGPD).'}</li>
          <li><strong className="text-bone-200">{'Retifica\u00e7\u00e3o'}</strong>{' \u2014 corrigir dados inexatos ou incompletos (Art. 16.\u00ba RGPD).'}</li>
          <li><strong className="text-bone-200">Apagamento</strong>{' \u2014 solicitar o apagamento dos seus dados ("direito ao esquecimento") (Art. 17.\u00ba RGPD).'}</li>
          <li><strong className="text-bone-200">{'Limita\u00e7\u00e3o'}</strong>{' \u2014 restringir o tratamento em determinadas circunst\u00e2ncias (Art. 18.\u00ba RGPD).'}</li>
          <li><strong className="text-bone-200">Portabilidade</strong>{' \u2014 receber os seus dados em formato estruturado e leg\u00edvel por m\u00e1quina (Art. 20.\u00ba RGPD).'}</li>
          <li><strong className="text-bone-200">{'Oposi\u00e7\u00e3o'}</strong>{' \u2014 opor-se ao tratamento baseado em interesse leg\u00edtimo (Art. 21.\u00ba RGPD).'}</li>
        </ul>
        <p className="mt-2">
          Para exercer qualquer destes direitos, contacte <strong className="text-bone-100">{CONTACT_EMAIL}</strong>{'. A resposta ser\u00e1 fornecida no prazo m\u00e1ximo de 30 dias. Tem ainda o direito de apresentar reclama\u00e7\u00e3o \u00e0 '}<strong className="text-bone-100">{'CNPD \u2014 Comiss\u00e3o Nacional de Prote\u00e7\u00e3o de Dados'}</strong> (www.cnpd.pt).
        </p>
      </section>

      <section>
        <h3 className="text-bone-100 font-semibold text-base mb-2">{'8. Seguran\u00e7a dos Dados'}</h3>
        <p>{'A plataforma implementa medidas t\u00e9cnicas e organizativas adequadas para proteger os dados pessoais contra acesso n\u00e3o autorizado, perda, destrui\u00e7\u00e3o ou divulga\u00e7\u00e3o, incluindo: cifra\u00e7\u00e3o de palavras-passe, comunica\u00e7\u00f5es HTTPS, controlo de acesso baseado em fun\u00e7\u00f5es e backups regulares.'}</p>
      </section>

      <section>
        <h3 className="text-bone-100 font-semibold text-base mb-2">9. Cookies</h3>
        <p>{'A plataforma utiliza cookies t\u00e9cnicos estritamente necess\u00e1rios para o funcionamento do servi\u00e7o (autentica\u00e7\u00e3o, prefer\u00eancias de sess\u00e3o). N\u00e3o s\u00e3o utilizados cookies de rastreamento ou publicidade de terceiros. Pode gerir as prefer\u00eancias de cookies atrav\u00e9s das defini\u00e7\u00f5es do seu browser.'}</p>
      </section>

      <section>
        <h3 className="text-bone-100 font-semibold text-base mb-2">{'10. Altera\u00e7\u00f5es \u00e0 Pol\u00edtica de Privacidade'}</h3>
        <p>{'A presente Pol\u00edtica de Privacidade pode ser atualizada periodicamente. Em caso de altera\u00e7\u00f5es significativas, os utilizadores ser\u00e3o notificados por correio eletr\u00f3nico com anteced\u00eancia m\u00ednima de 30 dias. A vers\u00e3o em vigor \u00e9 sempre a publicada na plataforma.'}</p>
      </section>

      <section>
        <h3 className="text-bone-100 font-semibold text-base mb-2">11. Contactos</h3>
        <p>{'Para qualquer quest\u00e3o relacionada com privacidade e prote\u00e7\u00e3o de dados, contacte:'}<strong className="text-bone-100"> {CONTACT_EMAIL}</strong>
        </p>
      </section>

      <p className="text-xs text-bone-300/40 pt-4 border-t border-pine-700">{'\u00daltima atualiza\u00e7\u00e3o: '}{LAST_UPDATED}{' \u2014 Em conformidade com o RGPD (Regulamento UE 2016/679) e a Lei n.\u00ba 58/2019, de 8 de agosto.'}</p>
    </div>;
}
export default function LegalModal({
  initialTab = 'terms',
  onClose
}) {
  const [tab, setTab] = useState(initialTab);
  return <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="bg-pine-900 border border-pine-700 rounded-t-2xl sm:rounded-2xl w-full sm:max-w-2xl shadow-2xl flex flex-col overflow-hidden" style={{
      maxHeight: '90vh'
    }}>

        {/* Cabecalho */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-pine-700 shrink-0">
          <h2 className="text-bone-100 font-display font-bold text-base">Documentos Legais</h2>
          <button onClick={onClose} className="text-bone-300/60 hover:text-bone-100 transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-pine-700 shrink-0">
          <button onClick={() => setTab('terms')} className={`flex-1 flex items-center justify-center gap-2 py-3 text-sm font-semibold transition-colors ${tab === 'terms' ? 'text-blaze-400 border-b-2 border-blaze-400' : 'text-bone-300/60 hover:text-bone-100'}`}>
            <FileText size={15} />{'Termos e Condi\u00e7\u00f5es'}</button>
          <button onClick={() => setTab('privacy')} className={`flex-1 flex items-center justify-center gap-2 py-3 text-sm font-semibold transition-colors ${tab === 'privacy' ? 'text-blaze-400 border-b-2 border-blaze-400' : 'text-bone-300/60 hover:text-bone-100'}`}>
            <Shield size={15} />{'Pol\u00edtica de Privacidade'}</button>
        </div>

        {/* Conteudo */}
        <div className="flex-1 overflow-y-auto px-5 py-5">
          {tab === 'terms' ? <TermsContent /> : <PrivacyContent />}
        </div>

        {/* Rodape */}
        <div className="px-5 py-3 border-t border-pine-700 shrink-0 text-center">
          <p className="text-xs text-bone-300/40">
            {PLATFORM_NAME}{' \u00b7 '}{CONTACT_EMAIL}
          </p>
        </div>

      </div>
    </div>;
}