-- CaçaMarket — FIX: Admin ver todas as conversas e mensagens
-- Corre no Supabase: "SQL Editor" → "New query" → cola tudo → "Run"

-- ============================================================
-- CONVERSAS
-- ============================================================
drop policy if exists "Utilizador vê as suas conversas" on public.conversations;
drop policy if exists "Admin vê todas as conversas" on public.conversations;
drop policy if exists "Ver conversas" on public.conversations;

create policy "Ver conversas"
  on public.conversations for select
  using (
    auth.uid() = buyer_id
    or auth.uid() = seller_id
    or exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'admin'
    )
  );

-- ============================================================
-- MENSAGENS
-- ============================================================
drop policy if exists "Participantes veem mensagens" on public.messages;
drop policy if exists "Admin vê todas as mensagens" on public.messages;
drop policy if exists "Ver mensagens" on public.messages;

create policy "Ver mensagens"
  on public.messages for select
  using (
    exists (
      select 1 from public.conversations c
      where c.id = conversation_id
        and (
          c.buyer_id = auth.uid()
          or c.seller_id = auth.uid()
        )
    )
    or exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'admin'
    )
  );
