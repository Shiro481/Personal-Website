/**
 * Cloudflare Worker entry point
 * Handles /api/slots proxy to Cal.com + serves static assets (SPA mode)
 */
export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const origin = request.headers.get('Origin') || '*';

    // Handle CORS preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        headers: {
          'Access-Control-Allow-Origin': origin,
          'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type',
          'Access-Control-Max-Age': '86400',
        },
      });
    }

    const apiKey = env.VITE_CAL_API_KEY;
    if (!apiKey) {
      return new Response(
        JSON.stringify({ error: 'VITE_CAL_API_KEY is not set in Cloudflare environment variables.' }),
        { status: 500, headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': origin } }
      );
    }

    // Handle /api/slots proxy
    if (url.pathname === '/api/slots') {
      try {
        let eventTypeId, startTime, endTime, timeZone;

        if (request.method === 'POST') {
          const body = await request.json();
          eventTypeId = body.eventTypeId;
          startTime = body.startTime;
          endTime = body.endTime;
          timeZone = body.timeZone;
        } else if (request.method === 'GET') {
          eventTypeId = url.searchParams.get('eventTypeId');
          startTime = url.searchParams.get('startTime');
          endTime = url.searchParams.get('endTime');
          timeZone = url.searchParams.get('timeZone');
        } else {
          return new Response('Method Not Allowed', { status: 405 });
        }

        if (!eventTypeId || !startTime || !endTime) {
          return new Response(
            JSON.stringify({ error: 'Missing required parameters: eventTypeId, startTime, and endTime are required.' }),
            { status: 400, headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': origin } }
          );
        }

        // Cal.com API v1 auth uses apiKey as a query parameter
        let calUrl = `https://api.cal.com/v1/slots?apiKey=${apiKey}&eventTypeId=${eventTypeId}&startTime=${encodeURIComponent(startTime)}&endTime=${encodeURIComponent(endTime)}`;
        if (timeZone) {
          calUrl += `&timeZone=${encodeURIComponent(timeZone)}`;
        }

        const calResponse = await fetch(calUrl, {
          headers: { 'Content-Type': 'application/json' },
        });

        const data = await calResponse.json();

        return new Response(JSON.stringify(data), {
          status: calResponse.status,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': origin,
          },
        });
      } catch (error) {
        return new Response(
          JSON.stringify({ error: error.message || 'Slots proxy request failed' }),
          { status: 500, headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': origin } }
        );
      }
    }

    // Handle /api/book proxy
    if (url.pathname === '/api/book' && request.method === 'POST') {
      try {
        const payload = await request.json();
        
        // Normalize payload for Cal.com API v1
        const calPayload = {
          eventTypeId: payload.eventTypeId,
          start: payload.start || payload.startTime,
          end: payload.end,
          responses: payload.responses || {
            name: payload.name,
            email: payload.email,
            notes: payload.notes,
            location: payload.location || {
              value: "integrations:daily",
              optionValue: ""
            }
          },
          timeZone: payload.timeZone || "UTC",
          language: payload.language || 'en',
          metadata: payload.metadata || {}
        };

        if (!calPayload.eventTypeId || !calPayload.start) {
          return new Response(
            JSON.stringify({ error: 'Missing required booking fields: eventTypeId and start time are required.' }),
            { status: 400, headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': origin } }
          );
        }

        const calUrl = `https://api.cal.com/v1/bookings?apiKey=${apiKey}`;

        const bookResponse = await fetch(calUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(calPayload)
        });

        const data = await bookResponse.json();

        return new Response(JSON.stringify(data), {
          status: bookResponse.status,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': origin,
          },
        });
      } catch (error) {
        return new Response(
          JSON.stringify({ error: error.message || 'Booking proxy request failed' }),
          { status: 500, headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': origin } }
        );
      }
    }

    // All other requests: serve static assets (SPA fallback handled by wrangler.jsonc)
    return env.ASSETS.fetch(request);
  },
};
