/**
 * Cloudflare Pages Function proxy for Cal.com API (Bookings)
 * This handles the direct booking creation without exposing the API key.
 * It expects a JSON body compatible with Cal.com API v1.
 */
export const onRequestPost = async (context) => {
  const { request, env } = context;

  // Use the secret key set in Cloudflare Dashboard
  const apiKey = env.VITE_CAL_API_KEY;

  if (!apiKey) {
    return new Response(JSON.stringify({ 
      error: "VITE_CAL_API_KEY environment variable is not set in Cloudflare." 
    }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }

  try {
    const payload = await request.json();
    
    // Normalize payload for Cal.com API v1
    // We prefer the frontend to send the correct 'start' and 'end' fields,
    // but we'll add some safety defaults here.
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
      timeZone: payload.timeZone || "Asia/Manila",
      language: payload.language || "en",
      metadata: payload.metadata || {}
    };

    // Validate minimum required fields
    if (!calPayload.eventTypeId || !calPayload.start) {
      return new Response(JSON.stringify({ error: "Missing required fields: eventTypeId and start time are required." }), {
        status: 400,
        headers: { "Content-Type": "application/json" }
      });
    }

    // Cal.com API v1 auth: pass apiKey as a query parameter
    const calUrl = `https://api.cal.com/v1/bookings?apiKey=${apiKey}`;

    const response = await fetch(calUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(calPayload)
    });

    const data = await response.json();

    return new Response(JSON.stringify(data), {
      status: response.status,
      headers: { 
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*"
      }
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message || "Proxy request failed" }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
};
