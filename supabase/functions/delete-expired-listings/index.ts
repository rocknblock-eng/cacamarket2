// CaçaMarket — Edge Function: apagar anúncios expirados
// Localização: supabase/functions/delete-expired-listings/index.ts
//
// INSTRUÇÕES DE DEPLOY:
// 1. Instale o Supabase CLI: npm install -g supabase
// 2. Na pasta do projeto, corra:
//    supabase functions deploy delete-expired-listings
// 3. No painel Supabase → Edge Functions → delete-expired-listings
//    → Cron → adicione: 0 3 * * * (corre todos os dias às 3h da manhã)

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

Deno.serve(async (req) => {
  // Verificação de segurança — só aceita chamadas autorizadas
  const authHeader = req.headers.get('Authorization')
  if (!authHeader) {
    return new Response(JSON.stringify({ error: 'Não autorizado' }), { status: 401 })
  }

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
  )

  // Chama a função que apaga anúncios expirados
  const { data, error } = await supabase.rpc('delete_expired_listings')

  if (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 })
  }

  console.log(`Anúncios expirados apagados: ${data}`)

  return new Response(
    JSON.stringify({ 
      success: true, 
      deleted: data,
      timestamp: new Date().toISOString()
    }),
    { headers: { 'Content-Type': 'application/json' } }
  )
})
