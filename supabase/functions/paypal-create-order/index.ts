// Supabase Edge Function: paypal-create-order
// Cria uma encomenda PayPal real, com o valor certo consoante o tipo de conta
// (2,50€ para o 2º anúncio de um particular, 5€ para o pacote de 5 anúncios de loja).
// A chave secreta do PayPal NUNCA aparece no site — só existe aqui, em segurança.

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const PAYPAL_CLIENT_ID = Deno.env.get('PAYPAL_CLIENT_ID')!
const PAYPAL_SECRET = Deno.env.get('PAYPAL_SECRET')!
const PAYPAL_API = Deno.env.get('PAYPAL_API_BASE') ?? 'https://api-m.sandbox.paypal.com'
const SITE_URL = Deno.env.get('SITE_URL')!

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
  if (!data.access_token) {
    console.error('Falha ao obter token do PayPal:', JSON.stringify(data))
    throw new Error('PAYPAL_AUTH_FAILED: ' + JSON.stringify(data))
  }
  return data.access_token
}

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })

  try {
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

    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (!profile) {
      return new Response(JSON.stringify({ error: 'Perfil não encontrado.' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    const amount = '1.00'
    const credits = 1

    const accessToken = await getAccessToken()

    const orderRes = await fetch(`${PAYPAL_API}/v2/checkout/orders`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`
      },
      body: JSON.stringify({
        intent: 'CAPTURE',
        purchase_units: [
          {
            amount: { currency_code: 'EUR', value: amount },
            custom_id: `${user.id}:${credits}`,
            description: 'CaçaMarket — Donativo para publicar anúncio'
          }
        ],
        application_context: {
          return_url: `${SITE_URL}?paypal=return`,
          cancel_url: `${SITE_URL}?paypal=cancel`,
          user_action: 'PAY_NOW'
        }
      })
    })

    const order = await orderRes.json()
    const approveLink = order.links?.find((l) => l.rel === 'approve')?.href

    if (!approveLink) {
      console.error('Resposta do PayPal ao criar encomenda:', JSON.stringify(order))
      return new Response(JSON.stringify({ error: 'Não foi possível criar a encomenda PayPal.', details: order }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    return new Response(JSON.stringify({ approveLink }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  } catch (err) {
    console.error('Erro inesperado em paypal-create-order:', err)
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }
})
