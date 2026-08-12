import { useState } from 'react'
import { X, FileText, Shield } from 'lucide-react'

const CONTACT_EMAIL = 'cacamarket@proton.me'
const PLATFORM_NAME = 'WildMarket'
const LAST_UPDATED = 'agosto de 2026'

function TermsContent() {
  return (
    <div className="space-y-6 text-sm text-bone-300/80 leading-relaxed">

      <section>
        <h3 className="text-bone-100 font-semibold text-base mb-2">1. Objeto e Âmbito</h3>
        <p>
          Os presentes Termos e Condições regulam o acesso e utilização da plataforma <strong className="text-bone-100">{PLATFORM_NAME}</strong>,
          um mercado online dedicado à compra e venda de equipamento de caça entre particulares e profissionais,
          operando exclusivamente em território português e em conformidade com a legislação portuguesa e europeia aplicável.
        </p>
        <p className="mt-2">
          Ao registar-se na plataforma, o utilizador declara ter lido, compreendido e aceite integralmente
          os presentes Termos e Condições, bem como a Política de Privacidade da plataforma.
        </p>
      </section>

      <section>
        <h3 className="text-bone-100 font-semibold text-base mb-2">2. Definições</h3>
        <ul className="space-y-1.5 list-none">
          <li><strong className="text-bone-200">Plataforma:</strong> o sítio web e aplicação móvel {PLATFORM_NAME}.</li>
          <li><strong className="text-bone-200">Utilizador:</strong> qualquer pessoa singular ou coletiva que aceda ou utilize a plataforma.</li>
          <li><strong className="text-bone-200">Vendedor:</strong> utilizador que publique anúncios de venda na plataforma.</li>
          <li><strong className="text-bone-200">Comprador:</strong> utilizador que contacte vendedores ou adquira produtos através da plataforma.</li>
          <li><strong className="text-bone-200">Anúncio:</strong> publicação de oferta de venda de produto ou serviço na plataforma.</li>
        </ul>
      </section>

      <section>
        <h3 className="text-bone-100 font-semibold text-base mb-2">3. Condições de Acesso e Registo</h3>
        <p>
          O acesso à plataforma é permitido a qualquer pessoa singular com idade igual ou superior a 18 anos,
          ou a pessoas coletivas legalmente constituídas. O registo implica a criação de uma conta pessoal com
          dados verdadeiros, completos e atualizados.
        </p>
        <p className="mt-2">
          O utilizador é o único responsável pela confidencialidade das suas credenciais de acesso e por todas
          as atividades realizadas com a sua conta. Em caso de suspeita de utilização indevida, deverá contactar
          imediatamente a plataforma através de <strong className="text-bone-100">{CONTACT_EMAIL}</strong>.
        </p>
      </section>

      <section>
        <h3 className="text-bone-100 font-semibold text-base mb-2">4. Produtos Permitidos e Proibidos</h3>
        <p>A plataforma destina-se exclusivamente à compra e venda de:</p>
        <ul className="mt-2 space-y-1 list-disc list-inside">
          <li>Óptica de caça (lunetas, binóculos, visores)</li>
          <li>Vestuário e calçado de caça</li>
          <li>Acessórios de caça</li>
          <li>Cães de caça</li>
          <li>Eletrónicos de caça</li>
          <li>Facas e ferramentas</li>
          <li>Serviços relacionados com a atividade cinegética</li>
          <li>Diversos e outros artigos relacionados</li>
        </ul>
        <p className="mt-3 text-red-400/80">
          <strong>São expressamente proibidos</strong> anúncios de armas de fogo, munições, explosivos,
          substâncias controladas, produtos falsificados, espécies protegidas ou qualquer artigo cuja
          comercialização seja proibida por lei portuguesa ou europeia, nomeadamente ao abrigo do
          Regime Jurídico das Armas e suas Munições (Lei n.º 5/2006, de 23 de fevereiro, e legislação complementar)
          e da Lei de Proteção da Natureza.
        </p>
      </section>

      <section>
        <h3 className="text-bone-100 font-semibold text-base mb-2">5. Responsabilidades do Vendedor</h3>
        <p>O vendedor declara e garante que:</p>
        <ul className="mt-2 space-y-1.5 list-disc list-inside">
          <li>É legítimo proprietário ou tem autorização para vender os artigos anunciados.</li>
          <li>As descrições, fotografias e preços dos artigos são verdadeiros e não induzem em erro.</li>
          <li>Os artigos anunciados cumprem toda a legislação portuguesa aplicável.</li>
          <li>Não publicará conteúdos ilegais, ofensivos, difamatórios ou que violem direitos de terceiros.</li>
          <li>Cumprirá as obrigações fiscais decorrentes das vendas realizadas, nomeadamente ao abrigo do Código do IRS ou IRC.</li>
        </ul>
      </section>

      <section>
        <h3 className="text-bone-100 font-semibold text-base mb-2">6. Responsabilidades da Plataforma</h3>
        <p>
          A plataforma atua como intermediário entre vendedores e compradores, não sendo parte nos contratos
          celebrados entre utilizadores. A plataforma não garante a qualidade, segurança, legalidade ou
          exatidão dos anúncios publicados, nem a capacidade dos utilizadores para concluir transações.
        </p>
        <p className="mt-2">
          A plataforma reserva-se o direito de remover anúncios ou suspender contas que violem os presentes
          Termos e Condições, sem necessidade de aviso prévio e sem direito a qualquer indemnização.
        </p>
      </section>

      <section>
        <h3 className="text-bone-100 font-semibold text-base mb-2">7. Donativos e Sustentabilidade da Plataforma</h3>
        <p>
          A plataforma {PLATFORM_NAME} assenta num modelo de donativo para garantir a sua sustentabilidade
          e continuidade. Durante o período de lançamento, a publicação de anúncios é inteiramente gratuita
          para todos os utilizadores.
        </p>
        <p className="mt-2">
          Após o período de lançamento, aplicam-se as seguintes condições:
        </p>
        <ul className="mt-2 space-y-1.5 list-disc list-inside">
          <li><strong className="text-bone-200">Particulares:</strong> primeiro anúncio gratuito; a publicação de anúncios adicionais requer um donativo voluntário à plataforma.</li>
          <li><strong className="text-bone-200">Lojas e Profissionais:</strong> primeiros cinco anúncios gratuitos; a publicação de anúncios adicionais requer um donativo voluntário à plataforma.</li>
        </ul>
        <p className="mt-2">
          O valor do donativo é definido pelo utilizador de forma livre e consciente, como forma de apoio
          à manutenção e desenvolvimento da plataforma. A plataforma reserva-se o direito de estabelecer
          um valor mínimo sugerido, mediante aviso prévio aos utilizadores registados com antecedência
          mínima de 30 dias.
        </p>
      </section>

      <section>
        <h3 className="text-bone-100 font-semibold text-base mb-2">8. Propriedade Intelectual</h3>
        <p>
          Todos os conteúdos da plataforma (marca, design, código, textos) são propriedade exclusiva
          dos seus titulares e estão protegidos pela legislação portuguesa e europeia de propriedade
          intelectual. É proibida a reprodução, distribuição ou utilização não autorizada.
        </p>
        <p className="mt-2">
          O utilizador mantém os direitos sobre os conteúdos que publica, mas concede à plataforma
          uma licença não exclusiva para os exibir e promover no âmbito da plataforma.
        </p>
      </section>

      <section>
        <h3 className="text-bone-100 font-semibold text-base mb-2">9. Resolução de Litígios</h3>
        <p>
          Em caso de litígio, o utilizador pode recorrer à plataforma de resolução de litígios em linha
          da União Europeia disponível em <strong className="text-bone-100">ec.europa.eu/consumers/odr</strong>,
          ou aos centros de arbitragem de conflitos de consumo reconhecidos em Portugal, nos termos da
          Lei n.º 144/2015, de 8 de setembro.
        </p>
        <p className="mt-2">
          Os presentes Termos e Condições são regidos pela lei portuguesa. Para resolução de litígios
          não sujeitos a arbitragem, é competente o tribunal da comarca de Lisboa.
        </p>
      </section>

      <section>
        <h3 className="text-bone-100 font-semibold text-base mb-2">10. Alterações aos Termos</h3>
        <p>
          A plataforma reserva-se o direito de alterar os presentes Termos e Condições a qualquer momento,
          mediante aviso aos utilizadores registados com antecedência mínima de 30 dias. A continuação da
          utilização da plataforma após esse prazo implica a aceitação das alterações.
        </p>
      </section>

      <section>
        <h3 className="text-bone-100 font-semibold text-base mb-2">11. Contactos</h3>
        <p>
          Para qualquer questão relacionada com estes Termos e Condições, contacte-nos através de:
          <strong className="text-bone-100"> {CONTACT_EMAIL}</strong>
        </p>
      </section>

      <p className="text-xs text-bone-300/40 pt-4 border-t border-pine-700">
        Última atualização: {LAST_UPDATED}
      </p>
    </div>
  )
}

function PrivacyContent() {
  return (
    <div className="space-y-6 text-sm text-bone-300/80 leading-relaxed">

      <section>
        <h3 className="text-bone-100 font-semibold text-base mb-2">1. Responsável pelo Tratamento</h3>
        <p>
          O responsável pelo tratamento dos dados pessoais recolhidos através da plataforma
          <strong className="text-bone-100"> {PLATFORM_NAME}</strong> pode ser contactado através do
          endereço de correio eletrónico <strong className="text-bone-100">{CONTACT_EMAIL}</strong>.
        </p>
        <p className="mt-2">
          A presente Política de Privacidade foi elaborada em conformidade com o Regulamento (UE) 2016/679
          do Parlamento Europeu e do Conselho, de 27 de abril de 2016 (RGPD), e com a Lei n.º 58/2019,
          de 8 de agosto (lei de execução do RGPD em Portugal).
        </p>
      </section>

      <section>
        <h3 className="text-bone-100 font-semibold text-base mb-2">2. Dados Recolhidos</h3>
        <p>A plataforma recolhe e trata os seguintes dados pessoais:</p>
        <ul className="mt-2 space-y-1.5 list-disc list-inside">
          <li><strong className="text-bone-200">Dados de registo:</strong> endereço de correio eletrónico, nome, palavra-passe (cifrada).</li>
          <li><strong className="text-bone-200">Dados de perfil:</strong> nome completo, número de telefone, localização (distrito/concelho).</li>
          <li><strong className="text-bone-200">Dados de anúncios:</strong> descrições, fotografias e preços dos artigos publicados.</li>
          <li><strong className="text-bone-200">Dados de comunicação:</strong> mensagens trocadas através do chat interno da plataforma.</li>
          <li><strong className="text-bone-200">Dados técnicos:</strong> endereço IP, tipo de browser, sistema operativo, páginas visitadas.</li>
        </ul>
      </section>

      <section>
        <h3 className="text-bone-100 font-semibold text-base mb-2">3. Finalidades e Base Legal do Tratamento</h3>
        <ul className="mt-2 space-y-3">
          <li>
            <strong className="text-bone-200">Prestação do serviço</strong> — execução do contrato (Art. 6.º, n.º 1, al. b) RGPD):
            gestão de contas, publicação de anúncios, comunicação entre utilizadores.
          </li>
          <li>
            <strong className="text-bone-200">Cumprimento de obrigações legais</strong> — obrigação legal (Art. 6.º, n.º 1, al. c) RGPD):
            faturação, prevenção de fraude, cumprimento de ordens judiciais.
          </li>
          <li>
            <strong className="text-bone-200">Melhoria da plataforma</strong> — interesse legítimo (Art. 6.º, n.º 1, al. f) RGPD):
            análise de utilização, deteção de erros, segurança informática.
          </li>
          <li>
            <strong className="text-bone-200">Comunicações de serviço</strong> — consentimento (Art. 6.º, n.º 1, al. a) RGPD):
            notificações sobre a conta e anúncios (pode revogar a qualquer momento).
          </li>
        </ul>
      </section>

      <section>
        <h3 className="text-bone-100 font-semibold text-base mb-2">4. Conservação dos Dados</h3>
        <p>Os dados pessoais são conservados pelos seguintes prazos:</p>
        <ul className="mt-2 space-y-1.5 list-disc list-inside">
          <li><strong className="text-bone-200">Dados de conta:</strong> enquanto a conta estiver ativa, mais 3 anos após o cancelamento.</li>
          <li><strong className="text-bone-200">Dados de faturação:</strong> 10 anos, nos termos do Código Comercial português.</li>
          <li><strong className="text-bone-200">Mensagens de chat:</strong> 1 ano após o envio, salvo obrigação legal de conservação superior.</li>
          <li><strong className="text-bone-200">Dados técnicos:</strong> máximo de 90 dias.</li>
        </ul>
      </section>

      <section>
        <h3 className="text-bone-100 font-semibold text-base mb-2">5. Partilha de Dados com Terceiros</h3>
        <p>Os dados pessoais podem ser partilhados com:</p>
        <ul className="mt-2 space-y-1.5 list-disc list-inside">
          <li><strong className="text-bone-200">Supabase Inc.</strong> — fornecedor de infraestrutura de base de dados e autenticação, nos termos do seu Data Processing Agreement, em conformidade com o RGPD.</li>
          <li><strong className="text-bone-200">Processadores de pagamento</strong> — Stripe e PayPal, exclusivamente para processamento de pagamentos, nos termos das respetivas políticas de privacidade.</li>
          <li><strong className="text-bone-200">Autoridades competentes</strong> — quando legalmente obrigado, nomeadamente por ordem judicial ou requisição de autoridade policial.</li>
        </ul>
        <p className="mt-2">
          A plataforma não vende, aluga ou cede dados pessoais a terceiros para fins comerciais ou de marketing.
        </p>
      </section>

      <section>
        <h3 className="text-bone-100 font-semibold text-base mb-2">6. Transferências Internacionais</h3>
        <p>
          Os dados podem ser transferidos para servidores localizados fora do Espaço Económico Europeu,
          nomeadamente para os Estados Unidos da América, no âmbito dos serviços Supabase e Stripe.
          Estas transferências são efetuadas com base nas Cláusulas Contratuais Tipo aprovadas pela
          Comissão Europeia, garantindo um nível de proteção equivalente ao exigido pelo RGPD.
        </p>
      </section>

      <section>
        <h3 className="text-bone-100 font-semibold text-base mb-2">7. Direitos dos Titulares dos Dados</h3>
        <p>Nos termos do RGPD, o utilizador tem os seguintes direitos:</p>
        <ul className="mt-2 space-y-1.5 list-disc list-inside">
          <li><strong className="text-bone-200">Acesso</strong> — obter confirmação sobre o tratamento e acesso aos seus dados (Art. 15.º RGPD).</li>
          <li><strong className="text-bone-200">Retificação</strong> — corrigir dados inexatos ou incompletos (Art. 16.º RGPD).</li>
          <li><strong className="text-bone-200">Apagamento</strong> — solicitar o apagamento dos seus dados ("direito ao esquecimento") (Art. 17.º RGPD).</li>
          <li><strong className="text-bone-200">Limitação</strong> — restringir o tratamento em determinadas circunstâncias (Art. 18.º RGPD).</li>
          <li><strong className="text-bone-200">Portabilidade</strong> — receber os seus dados em formato estruturado e legível por máquina (Art. 20.º RGPD).</li>
          <li><strong className="text-bone-200">Oposição</strong> — opor-se ao tratamento baseado em interesse legítimo (Art. 21.º RGPD).</li>
        </ul>
        <p className="mt-2">
          Para exercer qualquer destes direitos, contacte <strong className="text-bone-100">{CONTACT_EMAIL}</strong>.
          A resposta será fornecida no prazo máximo de 30 dias. Tem ainda o direito de apresentar
          reclamação à <strong className="text-bone-100">CNPD — Comissão Nacional de Proteção de Dados</strong> (www.cnpd.pt).
        </p>
      </section>

      <section>
        <h3 className="text-bone-100 font-semibold text-base mb-2">8. Segurança dos Dados</h3>
        <p>
          A plataforma implementa medidas técnicas e organizativas adequadas para proteger os dados
          pessoais contra acesso não autorizado, perda, destruição ou divulgação, incluindo:
          cifração de palavras-passe, comunicações HTTPS, controlo de acesso baseado em funções
          e backups regulares.
        </p>
      </section>

      <section>
        <h3 className="text-bone-100 font-semibold text-base mb-2">9. Cookies</h3>
        <p>
          A plataforma utiliza cookies técnicos estritamente necessários para o funcionamento do serviço
          (autenticação, preferências de sessão). Não são utilizados cookies de rastreamento ou publicidade
          de terceiros. Pode gerir as preferências de cookies através das definições do seu browser.
        </p>
      </section>

      <section>
        <h3 className="text-bone-100 font-semibold text-base mb-2">10. Alterações à Política de Privacidade</h3>
        <p>
          A presente Política de Privacidade pode ser atualizada periodicamente. Em caso de alterações
          significativas, os utilizadores serão notificados por correio eletrónico com antecedência
          mínima de 30 dias. A versão em vigor é sempre a publicada na plataforma.
        </p>
      </section>

      <section>
        <h3 className="text-bone-100 font-semibold text-base mb-2">11. Contactos</h3>
        <p>
          Para qualquer questão relacionada com privacidade e proteção de dados, contacte:
          <strong className="text-bone-100"> {CONTACT_EMAIL}</strong>
        </p>
      </section>

      <p className="text-xs text-bone-300/40 pt-4 border-t border-pine-700">
        Última atualização: {LAST_UPDATED} — Em conformidade com o RGPD (Regulamento UE 2016/679)
        e a Lei n.º 58/2019, de 8 de agosto.
      </p>
    </div>
  )
}

export default function LegalModal({ initialTab = 'terms', onClose }) {
  const [tab, setTab] = useState(initialTab)

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="bg-pine-900 border border-pine-700 rounded-t-2xl sm:rounded-2xl w-full sm:max-w-2xl shadow-2xl flex flex-col overflow-hidden" style={{ maxHeight: '90vh' }}>

        {/* Cabeçalho */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-pine-700 shrink-0">
          <h2 className="text-bone-100 font-display font-bold text-base">Documentos Legais</h2>
          <button onClick={onClose} className="text-bone-300/60 hover:text-bone-100 transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-pine-700 shrink-0">
          <button
            onClick={() => setTab('terms')}
            className={`flex-1 flex items-center justify-center gap-2 py-3 text-sm font-semibold transition-colors ${
              tab === 'terms'
                ? 'text-blaze-400 border-b-2 border-blaze-400'
                : 'text-bone-300/60 hover:text-bone-100'
            }`}
          >
            <FileText size={15} />
            Termos e Condições
          </button>
          <button
            onClick={() => setTab('privacy')}
            className={`flex-1 flex items-center justify-center gap-2 py-3 text-sm font-semibold transition-colors ${
              tab === 'privacy'
                ? 'text-blaze-400 border-b-2 border-blaze-400'
                : 'text-bone-300/60 hover:text-bone-100'
            }`}
          >
            <Shield size={15} />
            Política de Privacidade
          </button>
        </div>

        {/* Conteúdo */}
        <div className="flex-1 overflow-y-auto px-5 py-5">
          {tab === 'terms' ? <TermsContent /> : <PrivacyContent />}
        </div>

        {/* Rodapé */}
        <div className="px-5 py-3 border-t border-pine-700 shrink-0 text-center">
          <p className="text-xs text-bone-300/40">
            {PLATFORM_NAME} · {CONTACT_EMAIL}
          </p>
        </div>

      </div>
    </div>
  )
}
