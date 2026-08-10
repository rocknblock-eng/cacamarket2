-- ============================================================
-- CaçaMarket — FIX: Período de Graça na Base de Dados
-- ============================================================
-- INSTRUÇÕES:
-- 1. Abra o Supabase (supabase.com → o seu projeto)
-- 2. Clique em "SQL Editor" no menu da esquerda
-- 3. Clique em "New query"
-- 4. Copie TODO este ficheiro e cole lá
-- 5. Clique em "Run"
-- 6. Deve aparecer "Success" no fundo
-- ============================================================

-- PASSO 1: Criar função que verifica se estamos em período de graça
-- Esta função vai à tabela platform_settings e verifica:
--   - Se não há data de lançamento → GRÁTIS (retorna true)
--   - Se a data ainda não passou → GRÁTIS (retorna true)  
--   - Se o período de graça acabou → COBRANÇA ATIVA (retorna false)
create or replace function public.is_free_period()
returns boolean as $$
declare
  s record;
  free_until date;
begin
  select * into s from public.platform_settings where id = 1;

  -- Sem definições ou sem data = sempre grátis
  if not found then return true; end if;
  if s.launch_date is null then return true; end if;

  -- Calcula fim do período de graça
  free_until := s.launch_date + (coalesce(s.free_period_days, 90) || ' days')::interval;

  -- Ainda dentro do período = grátis
  return current_date < free_until;
end;
$$ language plpgsql security definer;


-- PASSO 2: Atualizar a função que controla publicação de anúncios
-- Agora a PRIMEIRA coisa que faz é verificar is_free_period()
-- Se for período de graça, TODA A GENTE publica sem restrições
create or replace function public.consume_listing_credit()
returns trigger as $$
declare
  seller record;
begin
  select * into seller from public.profiles where id = new.seller_id for update;

  -- REGRA 0 (NOVA): Período de graça → toda a gente publica grátis
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


-- PASSO 3: Confirmar que o trigger ainda está ativo
drop trigger if exists before_listing_insert on public.listings;
create trigger before_listing_insert
  before insert on public.listings
  for each row execute procedure public.consume_listing_credit();


-- VERIFICAÇÃO FINAL (opcional — só para confirmar que funciona):
-- Depois de correr, pode testar assim:
--   select public.is_free_period();
-- Deve retornar "true" se não tiver data de lançamento definida.
