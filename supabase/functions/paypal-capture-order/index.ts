// Supabase Edge Function: paypal-capture-order
// Confirma junto do PayPal que o pagamento foi mesmo recebido, e só depois
// disso atribui os créditos ao utilizador. Usa a chave de serviço da Supabase
// (que ignora as permissões normais) precisamente porque corre no servidor,
// nunca no site — por isso é seguro fazê-lo aqui.

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const PAYPAL_CLIENT_ID = Deno.env.get('PAYPAL_CLIENT_ID')!
const PAYPAL_SECRET = Deno.env.get('PAYPAL_SECRET')!
const PAYPAL_API = Deno.env.get('PAYPAL_API_BASE') ?? 'https://api-m.sandbox.paypal.com'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type'
}

async function getAccessToken() {
  const auth = btoa(`${PAYPAL_CLIENT_ID}:${PAYPAL_SECRET}`)
  const res = await fetch(`${PAYPAL_API}/v1/oauth2/token`, {
    method: 'POST',
    headers: {
      Authorization: `Basic ${auth}`,
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    body: 'grant_type=client_credentials'
  })
  const data = await res.json()
  return data.access_token
}

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })

  try {
    const { orderId } = await req.json()
    const authHeader = req.headers.get('Authorization')!

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_ANON_KEY')!,
      { global: { headers: { Authorization: authHeader } } }
    )

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return new Response(JSON.stringify({ error: 'Não autenticado.' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    const accessToken = await getAccessToken()

    const captureRes = await fetch(`${PAYPAL_API}/v2/checkout/orders/${orderId}/capture`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`
      }
    })
    const capture = await captureRes.json()

    const status = capture.status
    const customId =
      capture.purchase_units?.[0]?.payments?.captures?.[0]?.custom_id ??
      capture.purchase_units?.[0]?.custom_id

    if (status !== 'COMPLETED' || !customId) {
      return new Response(JSON.stringify({ error: 'Pagamento não confirmado pelo PayPal.' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    const [paidUserId, creditsStr] = customId.split(':')
    const credits = parseInt(creditsStr, 10)

    if (paidUserId !== user.id) {
      return new Response(JSON.stringify({ error: 'Pagamento não corresponde a este utilizador.' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    // A partir daqui usamos a chave de serviço: só o servidor a tem,
    // por isso só o servidor consegue atribuir créditos.
    const adminClient = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    )

    const { data: currentProfile } = await adminClient
      .from('profiles')
      .select('listing_credits')
      .eq('id', user.id)
      .single()

    const newCredits = (currentProfile?.listing_credits ?? 0) + credits

    await adminClient.from('profiles').update({ listing_credits: newCredits }).eq('id', user.id)

    return new Response(JSON.stringify({ success: true, creditsAdded: credits }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  } catch (err) {
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }
})
