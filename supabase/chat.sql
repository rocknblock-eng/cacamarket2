-- CaçaMarket — Sistema de Chat Interno
-- Corre no Supabase: "SQL Editor" → "New query" → cola tudo → "Run"
--
-- Cria duas tabelas:
--   conversations — uma conversa por par (comprador + vendedor + anúncio)
--   messages      — mensagens dentro de cada conversa
--
-- O admin pode ver tudo (para moderação).
-- Cada utilizador só vê as suas próprias conversas.

-- ============================================================
-- TABELA: conversations
-- ============================================================
create table if not exists public.conversations (
  id          uuid primary key default gen_random_uuid(),
  listing_id  uuid references public.listings(id) on delete cascade,
  buyer_id    uuid references public.profiles(id) on delete cascade,
  seller_id   uuid references public.profiles(id) on delete cascade,
  created_at  timestamptz not null default now(),
  -- Garante que não existem duas conversas do mesmo par para o mesmo anúncio
  unique (listing_id, buyer_id)
);

-- Segurança: cada utilizador só vê conversas onde é comprador ou vendedor
alter table public.conversations enable row level security;

create policy "Utilizador vê as suas conversas"
  on public.conversations for select
  using (auth.uid() = buyer_id or auth.uid() = seller_id);

create policy "Admin vê todas as conversas"
  on public.conversations for select
  using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'admin'
    )
  );

create policy "Comprador pode iniciar conversa"
  on public.conversations for insert
  with check (auth.uid() = buyer_id);

-- ============================================================
-- TABELA: messages
-- ============================================================
create table if not exists public.messages (
  id              uuid primary key default gen_random_uuid(),
  conversation_id uuid references public.conversations(id) on delete cascade,
  sender_id       uuid references public.profiles(id) on delete cascade,
  content         text not null check (char_length(content) between 1 and 1000),
  created_at      timestamptz not null default now(),
  read_at         timestamptz -- null = não lida
);

-- Segurança: só quem faz parte da conversa pode ver e enviar mensagens
alter table public.messages enable row level security;

create policy "Participantes veem mensagens"
  on public.messages for select
  using (
    exists (
      select 1 from public.conversations c
      where c.id = conversation_id
        and (c.buyer_id = auth.uid() or c.seller_id = auth.uid())
    )
  );

create policy "Admin vê todas as mensagens"
  on public.messages for select
  using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'admin'
    )
  );

create policy "Participantes podem enviar mensagens"
  on public.messages for insert
  with check (
    auth.uid() = sender_id
    and exists (
      select 1 from public.conversations c
      where c.id = conversation_id
        and (c.buyer_id = auth.uid() or c.seller_id = auth.uid())
    )
  );

create policy "Participantes podem marcar como lida"
  on public.messages for update
  using (
    exists (
      select 1 from public.conversations c
      where c.id = conversation_id
        and (c.buyer_id = auth.uid() or c.seller_id = auth.uid())
    )
  );

-- ============================================================
-- REALTIME (mensagens em tempo real)
-- Ativa o realtime para a tabela messages
-- ============================================================
alter publication supabase_realtime add table public.messages;
alter publication supabase_realtime add table public.conversations;
