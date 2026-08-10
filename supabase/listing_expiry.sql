-- CaçaMarket — Múltiplas fotos e expiração de anúncios aos 90 dias
-- Corre no Supabase: "SQL Editor" → "New query" → cola tudo → "Run"

-- Adiciona coluna para múltiplas fotos (array de URLs)
alter table public.listings
  add column if not exists image_urls text[] default '{}';

-- Adiciona coluna de expiração
alter table public.listings
  add column if not exists expires_at timestamptz;

-- Define expiração de 90 dias para anúncios existentes que não têm data
update public.listings
  set expires_at = created_at + interval '90 days'
  where expires_at is null;

-- Função que apaga automaticamente anúncios expirados
-- O Supabase não tem cron jobs nativos no plano gratuito,
-- mas esta função pode ser chamada periodicamente via Edge Function
-- ou manualmente quando necessário.
create or replace function public.delete_expired_listings()
returns integer as $$
declare
  deleted_count integer;
begin
  delete from public.listings
  where expires_at is not null and expires_at < now();

  get diagnostics deleted_count = row_count;
  return deleted_count;
end;
$$ language plpgsql security definer;

-- ============================================================
-- OPCIONAL: Ativar pg_cron para limpeza automática diária
-- (só funciona se o teu plano Supabase tiver pg_cron ativo)
-- Se der erro, ignora este bloco — não afeta o resto.
-- ============================================================
-- select cron.schedule('apagar-anuncios-expirados', '0 3 * * *', 'select public.delete_expired_listings()');
