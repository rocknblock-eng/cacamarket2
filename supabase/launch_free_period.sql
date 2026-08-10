-- CaçaMarket — período gratuito de lançamento (3 meses) + modelo de donativo
-- Corre no Supabase: "SQL Editor" → "New query" → cola tudo → "Run"

create table public.platform_settings (
  id integer primary key default 1,
  launch_date date,
  free_period_days integer not null default 90,
  constraint singleton check (id = 1)
);

insert into public.platform_settings (id, launch_date, free_period_days) values (1, null, 90);

alter table public.platform_settings enable row level security;

create policy "Definições são visíveis publicamente"
  on public.platform_settings for select
  using (true);

create policy "Só administradores podem alterar as definições"
  on public.platform_settings for update
  using (
    exists (select 1 from public.profiles where profiles.id = auth.uid() and profiles.role = 'admin')
  );

-- Atualiza a regra de publicação: enquanto não definires a data de lançamento
-- (launch_date fica vazia), ou enquanto estiveres dentro dos 3 meses depois
-- dela, publicar é sempre grátis para todos, independentemente do tipo de conta.
create or replace function public.consume_listing_credit()
returns trigger as $$
declare
  seller record;
  settings record;
begin
  select * into settings from public.platform_settings where id = 1;

  if settings.launch_date is not null
     and current_date < settings.launch_date + settings.free_period_days then
    return new; -- ainda dentro do período gratuito de lançamento
  end if;

  select * into seller from public.profiles where id = new.seller_id for update;

  if seller.role = 'admin' then
    return new;
  end if;

  if seller.role = 'particular' and not seller.free_listing_used then
    update public.profiles set free_listing_used = true where id = seller.id;
    return new;
  end if;

  if seller.listing_credits > 0 then
    update public.profiles set listing_credits = seller.listing_credits - 1 where id = seller.id;
    return new;
  end if;

  raise exception 'PAYMENT_REQUIRED';
end;
$$ language plpgsql security definer;
