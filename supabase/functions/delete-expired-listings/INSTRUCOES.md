# CaçaMarket — Limpeza Automática de Anúncios Expirados

## O Que Faz

Esta Edge Function apaga automaticamente anúncios com mais de 90 dias,
chamando a função `delete_expired_listings()` da base de dados.

---

## Passo 1 — Correr o SQL (se ainda não correu)

No Supabase → SQL Editor → New query → cole o ficheiro `listing_expiry.sql` → Run

---

## Passo 2 — Deploy da Edge Function

### Instalar o Supabase CLI (uma vez só)
```bash
npm install -g supabase
```

### Ligar ao seu projeto
```bash
supabase login
supabase link --project-ref igyfrnfwomwblwywvnbq
```

### Fazer deploy da função
```bash
supabase functions deploy delete-expired-listings
```

---

## Passo 3 — Ativar Execução Diária Automática

1. Abra o Supabase → **Edge Functions**
2. Clique em **delete-expired-listings**
3. Clique em **Schedule** (ou **Cron**)
4. Adicione o seguinte cron: `0 3 * * *`
   (corre todos os dias às 3h da manhã)
5. Guarde

---

## Alternativa Simples (sem CLI)

Se preferir não usar o CLI, pode correr manualmente quando quiser
no Supabase → SQL Editor:

```sql
select public.delete_expired_listings();
```

Isto apaga todos os anúncios expirados nesse momento.

---

## Verificar Anúncios a Expirar

Para ver quais anúncios expiram nos próximos 7 dias:

```sql
select title, expires_at, seller_id
from public.listings
where expires_at between now() and now() + interval '7 days'
order by expires_at asc;
```
