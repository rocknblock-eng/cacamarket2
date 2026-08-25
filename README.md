# WildMarket

Mercado online portugues de equipamento de caca e tiro desportivo.
Site: wildmarket.app

Sem armas de fogo nem municoes - o WildMarket nao aceita anuncios que
promovam o comercio de armas e municoes, conforme a Lei n.o 5/2006
(armas e municoes) e legislacao subsequente.

---

## Stack tecnico

| Camada | Tecnologia |
|---|---|
| Frontend | React + Vite |
| Alojamento do site | Cloudflare Pages |
| Base de dados, autenticacao, storage | Supabase |
| Logica de servidor (pagamentos, moderacao) | Supabase Edge Functions |
| Servico de cameras (relay + bot Telegram) | Python, VPS dedicado (fora deste repositorio) |
| Pagamentos | PayPal (Sandbox - ainda nao passou a Live) |
| App Android (futuro) | Capacitor, ainda nao lancada |

---

## Funcionalidades atuais

### Anuncios
- Publicacao de anuncios com multiplas fotos (lightbox)
- Validade de 60 dias (90 dias durante o periodo de lancamento gratuito)
- Edicao e eliminacao pelo proprio vendedor
- Destaque de anuncios (pago em creditos, configuravel no admin)
- Perfil publico do vendedor, com grelha de todos os seus anuncios ativos

### Contas e autenticacao
- Registo/login via Supabase Auth
- Modal de boas-vindas na primeira visita, com apresentacao da plataforma
- Perfis de Particular e Loja, com regras de precos diferentes
- Contacto com vendedor via WhatsApp, telefone, email, ou chat interno

### Creditos e pagamentos
- Sistema de creditos para publicar anuncios e comprar destaque
- Particular: 1o anuncio gratis, depois 1 euro cada
- Loja: 5 primeiros anuncios gratis, depois 1 euro cada
- Pagamento via PayPal (Edge Functions `paypal-create-order` /
  `paypal-capture-order`)
- Historico de creditos consultavel pelo utilizador

### Periodo de lancamento gratuito
- Data configuravel no Admin -> Definicoes (`launch_date`)
- Enquanto ativo, tudo e gratuito e os anuncios ficam validos por 90 dias
- Findo o periodo, aplicam-se os precos normais e a validade passa a 60 dias

### Camaras de fototrapagem (Suntek) para Telegram
- Servico pago em creditos (10 creditos / 90 dias) que envia as fotos da
  camara diretamente para o Telegram do utilizador
- Fluxo de ligacao: utilizador fala com o bot do Telegram, recebe um
  codigo de 6 digitos, cola-o no site
- Geracao do ficheiro de configuracao da camara (`Parameter.dat`) feita
  no proprio browser, sem passar pelo servidor
- Aviso visivel no site: cada configuracao serve uma unica camara fisica;
  uso indevido (mesma configuracao em varias camaras) pode levar a
  suspensao do servico sem aviso previo
- O relay que recebe o email da camara e reencaminha para o Telegram
  corre num servico Python dedicado, fora deste repositorio

### Painel de administracao
Separadores: Estatisticas, Utilizadores, Moderacao, Definicoes, Creditos,
Camaras.
- Estatisticas gerais da plataforma
- Gestao de utilizadores (suspensao/banimento)
- Moderacao de anuncios
- Definicoes: periodo de lancamento, precos de destaque
- Gestao de creditos
- Camaras: atividade por dispositivo, deteccao de possivel abuso
  (multiplas camaras a usar o mesmo IP de origem)

---

## Estrutura do projeto

```
src/
  App.jsx                    -> raiz da aplicacao, estado global, roteamento de modais
  main.jsx                   -> arranque
  index.css                  -> estilos globais (Tailwind)
  data/listings.js           -> categorias e dados de exemplo
  lib/supabaseClient.js      -> cliente Supabase
  components/
    Header.jsx
    CategoryNav.jsx
    ProductCard.jsx / ProductGrid.jsx
    ProductDetailModal.jsx      -> detalhe de anuncio
    SellModal.jsx                -> criar anuncio
    EditListingModal.jsx         -> editar anuncio
    FeatureListingsModal.jsx     -> comprar destaque
    SellerProfileModal.jsx       -> perfil publico do vendedor + os seus anuncios
    AuthModal.jsx                -> login / registo
    WelcomeModal.jsx              -> modal de boas-vindas na 1a visita
    UserProfileModal.jsx          -> perfil do proprio utilizador
    CameraServiceModal.jsx        -> ativacao do servico de camaras
    CreditHistoryModal.jsx        -> historico de creditos
    ChatModal.jsx / InboxModal.jsx -> mensagens entre utilizadores
    PaymentModal.jsx / PayWallModal.jsx
    LegalModal.jsx                -> termos e condicoes
    ResetPassword.jsx
    AdminPanel.jsx                 -> painel de administracao

supabase/
  schema.sql                       -> tabelas base
  listings_and_storage.sql         -> anuncios + storage de fotos
  listing_pricing.sql / pricing_update.sql
  listing_expiry.sql               -> regras de validade
  launch_free_period.sql / close_test_mode.sql / fix_free_period.sql
  chat.sql                         -> mensagens
  contact_info.sql
  delete_permissions.sql
  fix_blocked_users.sql / fix_chat_admin.sql
  functions/
    paypal-create-order/index.ts
    paypal-capture-order/index.ts
    delete-expired-listings/index.ts   -> limpeza automatica de anuncios expirados
```

---

## Tabela de precos

| Tipo de conta | Regra |
|---|---|
| Particular | 1o anuncio gratis, depois 1 euro cada |
| Loja | 5 primeiros anuncios gratis, depois 1 euro cada |
| Admin | Sempre gratis |
| Camara para Telegram | 10 creditos / 90 dias |

Durante o periodo de lancamento (data definida no Admin -> Definicoes),
tudo e gratuito e a validade dos anuncios sobe para 90 dias.

---

## Notas de manutencao

- Todos os ficheiros de codigo sao escritos em ASCII puro (caracteres
  acentuados como sequencias `\uXXXX`), verificado automaticamente no
  prebuild pelo `check-ascii.cjs`. Isto evita corrupcao de acentos ao
  editar pelo editor web do GitHub.
- O trabalho de codigo e feito quase exclusivamente pelo editor web do
  GitHub e pelo terminal do painel Hostinger - sem IDE local.
