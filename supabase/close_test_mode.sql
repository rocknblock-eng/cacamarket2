-- CaçaMarket — fechar a porta de testes agora que o PayPal está ligado a sério
-- Corre no Supabase: "SQL Editor" → "New query" → cola tudo → "Run"
--
-- Até agora, qualquer utilizador autenticado conseguia chamar a função
-- grant_listing_credits diretamente (útil para testar, mas inseguro para
-- dinheiro real). Agora que a "paypal-capture-order" confirma o pagamento
-- antes de atribuir créditos, deixamos de precisar que o site consiga
-- chamar esta função diretamente.

revoke execute on function public.grant_listing_credits(integer) from public;
revoke execute on function public.grant_listing_credits(integer) from authenticated;
revoke execute on function public.grant_listing_credits(integer) from anon;
