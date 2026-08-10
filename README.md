# CaçaMarket — projeto de código

Este é o código real do CaçaMarket, como projeto React, pronto para:
1. Correr no teu computador para continuares a desenvolver;
2. Publicar num site em hospedagem partilhada normal (site web);
3. Ser embrulhado numa app Android através do Android Studio.

Sem armas, munições ou acessórios de arma — conforme decidido, para evitar
questões regulatórias com a Lei n.º 5/2006 (armas e munições).

---

## 1. Preparar o computador (só uma vez)

Precisas de ter o **Node.js** instalado (já o tens, disseste que já o usaste).
Confirma no terminal:

```
node -v
npm -v
```

Se aparecer um número de versão em cada comando, está tudo pronto.

---

## 2. Correr o projeto localmente (para veres e continuares a trabalhar)

Dentro da pasta do projeto:

```
npm install
npm run dev
```

Isto abre o site em `http://localhost:5173`. Qualquer alteração que faças
aos ficheiros aparece logo ali, sem teres de reiniciar nada.

---

## 3. Publicar como site (hospedagem partilhada)

Quando estiveres satisfeito com o resultado:

```
npm run build
```

Isto cria uma pasta `dist/` com o site já "compilado" — só ficheiros HTML,
CSS e JavaScript simples, que **qualquer hospedagem partilhada aceita**
(a maioria dos serviços portugueses de hosting funciona assim: fazes upload
por FTP ou pelo painel de ficheiros, tipo cPanel).

Passos práticos:
1. Corre `npm run build`
2. Abre a pasta `dist/`
3. Envia **o conteúdo** dessa pasta (não a pasta em si) para a pasta
   `public_html` (ou equivalente) da tua hospedagem, por FTP ou pelo
   gestor de ficheiros do painel de controlo
4. Acede ao teu domínio — o site está no ar

Alternativa mais simples, sem FTP: serviços como **Vercel** ou **Netlify**
publicam isto gratuitamente e de forma automática (arrastas a pasta `dist/`
para o site deles, ou ligas a uma conta GitHub), se preferires não mexer
em FTP.

---

## 4. Embrulhar como app Android (Android Studio)

Isto usa o **Capacitor**, que pega no mesmo site e transforma-o numa app
instalável no telemóvel, mantendo o mesmo código.

Passos (correr no terminal, dentro da pasta do projeto):

```
npm install @capacitor/core @capacitor/cli @capacitor/android
npm run build
npx cap add android
npm run cap:sync
npm run cap:open
```

O último comando abre o **Android Studio** automaticamente, já com o
projeto Android configurado. A partir daí, dentro do Android Studio,
usa o botão "Run" para testar num emulador ou telemóvel ligado por USB,
ou "Build > Generate Signed Bundle/APK" quando quiseres gerar o ficheiro
final para instalar ou publicar na Play Store.

Sempre que alterares o código React, repete só:
```
npm run build
npm run cap:sync
```
e volta a correr no Android Studio.

---

## 5. Tabela de Preços

A aplicação está **atualmente em modo grátis** — ninguém paga nada.
Quando o admin definir uma data de lançamento no painel de "Definições",
os preços passam a ser:

| Tipo de Conta | Regra |
|---|---|
| **Particular** | 1º anúncio grátis, depois 1€ cada |
| **Loja** | 5 primeiros anúncios grátis, depois 5€ por pacote de 5 |
| **Admin** | Sempre grátis |

---

## 6. Próximo passo: backend de pagamentos

O ficheiro `src/components/PaymentModal.jsx` já tem a estrutura visual dos
3 métodos de pagamento (Stripe, PayPal, MB Way/IBAN) e um objeto
`PAYMENT_CONFIG` no topo para ligares/desligares cada um. Mas os pagamentos
são só **simulados** por agora — para serem reais, precisam de um servidor
(backend) com os endpoints:

- `/api/create-payment-intent` (Stripe)
- `/api/paypal/create-order`
- `/api/paypal/capture-order`

Este projeto atual é só o **frontend** (o que se vê). O backend é a peça
que falta a seguir, e pode correr, por exemplo, num serviço como o Render,
Railway, ou num servidor próprio — dependendo de onde a hospedagem
partilhada permitir correr código Node.js (nem todas permitem; a maioria
das hospedagens partilhadas serve só ficheiros estáticos como este).

---

## Estrutura do projeto

```
cacamarket/
├── index.html
├── src/
│   ├── App.jsx              → junta tudo, controla período de graça
│   ├── main.jsx              → arranque da aplicação
│   ├── index.css             → estilos globais
│   ├── data/listings.js      → categorias, anúncios e vendedores (exemplo)
│   ├── lib/
│   │   └── supabaseClient.js → cliente Supabase
│   └── components/
│       ├── Header.jsx
│       ├── CategoryNav.jsx
│       ├── ProductCard.jsx
│       ├── ProductGrid.jsx
│       ├── ProductDetailModal.jsx
│       ├── SellerProfileModal.jsx
│       ├── AuthModal.jsx
│       ├── PaymentModal.jsx     → interface de pagamentos (métodos configuráveis)
│       ├── PayWallModal.jsx     → modal de cobrança (aparece quando período de graça termina)
│       ├── SellModal.jsx        → criar novo anúncio
│       └── AdminPanel.jsx       → painel admin com definições e moderação
├── supabase/
│   ├── schema.sql                      → tabelas base (profiles, auth)
│   ├── listings_and_storage.sql        → tabela de anúncios + storage de fotos
│   ├── listing_pricing.sql             → regras de créditos e preços
│   ├── launch_free_period.sql          → ativar período de graça
│   ├── close_test_mode.sql             → fechar período de teste
│   └── functions/
│       ├── paypal-create-order/index.ts
│       └── paypal-capture-order/index.ts
├── capacitor.config.json     → configuração da app Android
├── vite.config.js            → build config
├── tailwind.config.js        → estilos Tailwind
└── package.json
```

**Dados:**
- `listings.js` contém dados de exemplo e categorias
- Dados reais vêm da Supabase (BD na nuvem)
- Fotos guardadas no Supabase Storage
- Durante período de graça, tudo é grátis
