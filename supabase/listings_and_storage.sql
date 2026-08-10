-- CaçaMarket — tabela de anúncios + fotografias
-- Corre este ficheiro no Supabase: "SQL Editor" → "New query" → cola tudo → "Run"
-- (depois de já teres corrido o schema.sql da base de dados de utilizadores)

create table public.listings (
  id uuid primary key default gen_random_uuid(),
  seller_id uuid references public.profiles(id) on delete cascade not null,
  title text not null,
  category text not null,
  price numeric(10,2) not null,
  condition text,
  description text,
  image_url text,
  created_at timestamptz not null default now()
);

alter table public.listings enable row level security;

-- Todos podem ver os anúncios (é um marketplace público)
create policy "Anúncios são visíveis publicamente"
  on public.listings for select
  using (true);

-- Só o próprio vendedor pode criar anúncios em seu nome
create policy "Utilizador autenticado pode criar o seu próprio anúncio"
  on public.listings for insert
  with check (auth.uid() = seller_id);

-- Só o próprio vendedor pode editar ou apagar os seus anúncios
create policy "Utilizador só pode editar o seu próprio anúncio"
  on public.listings for update
  using (auth.uid() = seller_id);

create policy "Utilizador só pode apagar o seu próprio anúncio"
  on public.listings for delete
  using (auth.uid() = seller_id);


-- ============================================================
-- FOTOGRAFIAS (Supabase Storage)
-- ============================================================
-- Isto não se faz por SQL, faz-se com alguns cliques no painel:
--
-- 1. No menu lateral da Supabase, vai a "Storage"
-- 2. Clica "New bucket"
-- 3. Nome do bucket: listing-images
-- 4. Ativa a opção "Public bucket" (para as fotos aparecerem no site)
-- 5. Clica "Create bucket"
--
-- Depois de criares o bucket, corre este bloco aqui em baixo no SQL Editor
-- para definir quem pode enviar fotos (só utilizadores com sessão iniciada):

create policy "Qualquer pessoa pode ver as fotografias"
  on storage.objects for select
  using (bucket_id = 'listing-images');

create policy "Utilizador autenticado pode enviar fotografias"
  on storage.objects for insert
  with check (bucket_id = 'listing-images' and auth.role() = 'authenticated');
