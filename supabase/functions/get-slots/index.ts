import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { eventTypeId, startTime, endTime } = await req.json()
    const apiKey = Deno.env.get('CAL_API_KEY')

    if (!apiKey) {
      throw new Error('CAL_API_KEY environment variable is not set')
    }

    const response = await fetch(
      `https://api.cal.com/v1/slots?eventTypeId=${eventTypeId}&startTime=${startTime}&endTime=${endTime}&apiKey=${apiKey}`
    )

    const data = await response.json()

    return new Response(JSON.stringify(data), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: response.status,
    })
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    })
  }
})
