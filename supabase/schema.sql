-- CaçaMarket — esquema da base de dados de utilizadores
-- Corre este ficheiro no Supabase: menu lateral "SQL Editor" → "New query" → cola tudo → "Run"

-- Tipo de conta possível
create type public.user_role as enum ('particular', 'loja', 'admin');

-- Tabela de perfis (dados extra de cada utilizador, além do login/password
-- que a Supabase já guarda automaticamente na tabela interna auth.users)
create table public.profiles (
  id uuid references auth.users on delete cascade primary key,
  full_name text not null,
  role public.user_role not null default 'particular',
  phone text,
  location text,
  verified boolean not null default false,
  rating numeric(2,1) default 0,
  reviews_count integer default 0,
  member_since timestamptz not null default now(),
  created_at timestamptz not null default now()
);

-- Segurança: cada pessoa só pode ver e editar o seu próprio perfil,
-- mas todos podem ver os perfis de vendedores (para a página de vendedor)
alter table public.profiles enable row level security;

create policy "Perfis são visíveis publicamente"
  on public.profiles for select
  using (true);

create policy "Utilizador só pode editar o seu próprio perfil"
  on public.profiles for update
  using (auth.uid() = id);

-- Cria automaticamente um perfil "particular" sempre que alguém se regista.
-- O tipo (particular/loja) e o nome vêm do formulário de registo.
create function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name, role)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', 'Utilizador'),
    coalesce((new.raw_user_meta_data->>'role')::public.user_role, 'particular')
  );
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Nota sobre contas de administrador:
-- Por segurança, ninguém consegue criar uma conta "admin" pelo formulário do site
-- (o formulário só permite escolher "particular" ou "loja").
-- Para tornares alguém administrador, depois de essa pessoa se registar normalmente,
-- vai a "Table Editor" → tabela "profiles" → encontra a linha dela → muda "role" para "admin".
