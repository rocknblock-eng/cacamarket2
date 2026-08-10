-- CaçaMarket — FIX: Adicionar campo "blocked" para admin bloquear utilizadores
-- Corre no Supabase: "SQL Editor" → "New query" → cola tudo → "Run"

-- Adiciona coluna "blocked" à tabela profiles (false por defeito)
alter table public.profiles
  add column if not exists blocked boolean not null default false;

-- Garante que utilizadores bloqueados não podem publicar anúncios
create or replace function public.consume_listing_credit()
returns trigger as $$
declare
  seller record;
begin
  select * into seller from public.profiles where id = new.seller_id for update;

  -- REGRA: Utilizadores bloqueados não podem publicar
  if seller.blocked then
    raise exception 'USER_BLOCKED';
  end if;

  -- REGRA 0: Período de graça → toda a gente publica grátis
  if public.is_free_period() then
    return new;
  end if;

  -- REGRA 1: Admins publicam sempre grátis
  if seller.role = 'admin' then
    return new;
  end if;

  -- REGRA 2: Particulares têm o 1º anúncio grátis
  if seller.role = 'particular' and not seller.free_listing_used then
    update public.profiles set free_listing_used = true where id = seller.id;
    return new;
  end if;

  -- REGRA 3: Quem tem créditos comprados, usa um crédito
  if seller.listing_credits > 0 then
    update public.profiles set listing_credits = seller.listing_credits - 1 where id = seller.id;
    return new;
  end if;

  -- Sem créditos e fora do período de graça: bloqueia publicação
  raise exception 'PAYMENT_REQUIRED';
end;
$$ language plpgsql security definer;

-- Política: admin pode atualizar o campo blocked
drop policy if exists "Admin pode bloquear utilizadores" on public.profiles;
create policy "Admin pode bloquear utilizadores"
  on public.profiles for update
  using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'admin'
    )
  );
