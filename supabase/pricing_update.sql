-- CaçaMarket — atualização de preços
-- Corre no Supabase: "SQL Editor" → "New query" → cola tudo → "Run"
--
-- Novo modelo:
--  - Particular: 1º anúncio grátis, a partir do 2º custa 1€ (era 2,50€).
--  - Loja/Profissional: recebe automaticamente um pacote de 5 anúncios
--    grátis ao registar-se. A partir do 6º, cada anúncio custa 1€
--    (deixa de ser um pacote de 5€, passa a ser 1€ de cada vez).

-- Lojas que se registarem a partir de agora recebem logo 5 créditos grátis.
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name, role, phone, email, listing_credits)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', 'Utilizador'),
    coalesce((new.raw_user_meta_data->>'role')::public.user_role, 'particular'),
    new.raw_user_meta_data->>'phone',
    new.email,
    case
      when coalesce((new.raw_user_meta_data->>'role')::public.user_role, 'particular') = 'loja' then 5
      else 0
    end
  );
  return new;
end;
$$ language plpgsql security definer;

-- OPCIONAL — só corre esta parte se quiseres que lojas que já se registaram
-- ANTES desta alteração também recebam agora os 5 créditos grátis.
-- Não corras isto se já tiveres lojas reais que usaram/compraram créditos
-- e queres manter o saldo delas tal como está.
--
-- update public.profiles
-- set listing_credits = 5
-- where role = 'loja' and listing_credits = 0;
