/**
 * Cloudflare Worker entry point
 * Handles /api/slots proxy to Cal.com + serves static assets (SPA mode)
 */
export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    // Handle CORS preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type',
        },
      });
    }

    // Handle /api/slots proxy
    if (url.pathname === '/api/slots' && request.method === 'POST') {
      const apiKey = env.VITE_CAL_API_KEY;

      if (!apiKey) {
        return new Response(
          JSON.stringify({ error: 'VITE_CAL_API_KEY is not set in Cloudflare environment variables.' }),
          { status: 500, headers: { 'Content-Type': 'application/json' } }
        );
      }

      try {
        const { eventTypeId, startTime, endTime } = await request.json();

        // Cal.com API v1 auth uses apiKey as a query parameter
        const calUrl = `https://api.cal.com/v1/slots?apiKey=${apiKey}&eventTypeId=${eventTypeId}&startTime=${encodeURIComponent(startTime)}&endTime=${encodeURIComponent(endTime)}`;

        const calResponse = await fetch(calUrl, {
          headers: { 'Content-Type': 'application/json' },
        });

        const data = await calResponse.json();

        return new Response(JSON.stringify(data), {
          status: calResponse.status,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
          },
        });
      } catch (error) {
        return new Response(
          JSON.stringify({ error: error.message || 'Proxy request failed' }),
          { status: 500, headers: { 'Content-Type': 'application/json' } }
        );
      }
    }

    // All other requests: serve static assets (SPA fallback handled by wrangler.jsonc)
    return env.ASSETS.fetch(request);
  },
};
