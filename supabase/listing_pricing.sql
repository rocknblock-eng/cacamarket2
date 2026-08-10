-- CaçaMarket — regras de preço para publicar anúncios
-- Corre no Supabase: "SQL Editor" → "New query" → cola tudo → "Run"
--
-- Regras:
--  - Particular: o 1º anúncio que publicar (para sempre) é grátis.
--    A partir do 2º, cada anúncio custa 1€.
--  - Loja/Profissional: os 5 primeiros são grátis.
--    A partir do 6º, em pacotes de 5 anúncios por 5€.
--  - Administrador: publica sempre grátis.
--
-- NOTA: Enquanto nenhuma data de lançamento estiver definida no painel admin,
-- TODOS os utilizadores publicam de graça (período de teste/desenvolvimento).

alter table public.profiles add column if not exists free_listing_used boolean not null default false;
alter table public.profiles add column if not exists listing_credits integer not null default 0;

-- Função auxiliar que verifica se estamos em período de graça.
-- Retorna TRUE se ainda ninguém deve pagar (modo gratuito ativo).
-- Retorna FALSE se o período de graça já acabou e a cobrança está ativa.
create or replace function public.is_free_period()
returns boolean as $$
declare
  s record;
  free_until date;
begin
  -- Tenta ir buscar as definições da plataforma
  select * into s from public.platform_settings where id = 1;

  -- Se não há definições, ou não há data de lançamento: GRÁTIS
  if not found then return true; end if;
  if s.launch_date is null then return true; end if;

  -- Calcula até quando é grátis (data de lançamento + dias de graça)
  free_until := s.launch_date + (coalesce(s.free_period_days, 90) || ' days')::interval;

  -- Se ainda estamos dentro do período de graça: GRÁTIS
  return current_date < free_until;
end;
$$ language plpgsql security definer;

-- Sempre que alguém tenta publicar um anúncio, esta função verifica se pode
-- (grátis ou com créditos já pagos) e, se não puder, bloqueia a publicação.
-- Isto acontece na base de dados, não só no site — garante que a regra
-- não pode ser contornada.
create or replace function public.consume_listing_credit()
returns trigger as $$
declare
  seller record;
begin
  select * into seller from public.profiles where id = new.seller_id for update;

  -- REGRA 0: Se estamos em período de graça, TODA A GENTE publica grátis
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

  -- REGRA 3: Lojas têm os primeiros 5 grátis (via listing_credits iniciais)
  -- A partir daí, precisam de créditos comprados (pacotes de 5 por 5€)
  if seller.listing_credits > 0 then
    update public.profiles set listing_credits = seller.listing_credits - 1 where id = seller.id;
    return new;
  end if;

  -- Sem créditos e fora do período de graça: bloqueia
  raise exception 'PAYMENT_REQUIRED';
end;
$$ language plpgsql security definer;

drop trigger if exists before_listing_insert on public.listings;
create trigger before_listing_insert
  before insert on public.listings
  for each row execute procedure public.consume_listing_credit();

-- Função chamada depois de um pagamento bem-sucedido, para atribuir
-- os créditos comprados.
-- Particular: 1 crédito = 1 anúncio a 1€
-- Loja: 5 créditos = pacote a 5€
--
-- ATENÇÃO: Antes de cobrar dinheiro a sério, esta função tem de ser chamada
-- só pelo backend de pagamentos (Stripe/PayPal/MB Way), não pelo frontend.
create or replace function public.grant_listing_credits(credits_to_add integer)
returns void as $$
begin
  update public.profiles
  set listing_credits = listing_credits + credits_to_add
  where id = auth.uid();
end;
$$ language plpgsql security definer;

-- Garante que lojas criadas a partir de agora começam com 5 créditos grátis
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, role, listing_credits)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'role', 'particular'),
    case
      when coalesce(new.raw_user_meta_data->>'role', 'particular') = 'loja' then 5
      else 0
    end
  )
  on conflict (id) do update
    set email = excluded.email;
  return new;
end;
$$ language plpgsql security definer;
