-- CaçaMarket — permissões para apagar anúncios e fotografias
-- Corre no Supabase: "SQL Editor" → "New query" → cola tudo → "Run"
-- (depois de já teres corrido schema.sql e listings_and_storage.sql)

-- Um administrador pode apagar qualquer anúncio (não só os seus)
create policy "Administrador pode apagar qualquer anúncio"
  on public.listings for delete
  using (
    exists (
      select 1 from public.profiles
      where profiles.id = auth.uid() and profiles.role = 'admin'
    )
  );

-- O próprio vendedor pode apagar as fotografias que carregou
create policy "Utilizador pode apagar as suas fotografias"
  on storage.objects for delete
  using (
    bucket_id = 'listing-images'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

-- Um administrador pode apagar qualquer fotografia
create policy "Administrador pode apagar qualquer fotografia"
  on storage.objects for delete
  using (
    bucket_id = 'listing-images'
    and exists (
      select 1 from public.profiles
      where profiles.id = auth.uid() and profiles.role = 'admin'
    )
  );

-- Nota: a permissão para o próprio vendedor apagar o seu anúncio
-- ("Utilizador só pode apagar o seu próprio anúncio") já foi criada
-- no ficheiro listings_and_storage.sql, não precisas de a repetir.
