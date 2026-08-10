-- CaçaMarket — adicionar telefone e email ao perfil (para contacto direto)
-- Corre no Supabase: "SQL Editor" → "New query" → cola tudo → "Run"

alter table public.profiles add column if not exists phone text;
alter table public.profiles add column if not exists email text;

-- Atualiza a função que cria o perfil automaticamente no registo,
-- para também guardar o telefone (se a pessoa o preencher) e o email
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name, role, phone, email)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', 'Utilizador'),
    coalesce((new.raw_user_meta_data->>'role')::public.user_role, 'particular'),
    new.raw_user_meta_data->>'phone',
    new.email
  );
  return new;
end;
$$ language plpgsql security definer;

-- Preenche o email para quem já se tinha registado antes desta alteração
update public.profiles p
set email = u.email
from auth.users u
where p.id = u.id and p.email is null;
