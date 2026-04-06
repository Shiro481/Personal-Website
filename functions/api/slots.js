/**
 * Cloudflare Pages Function proxy for Cal.com API
 * This bypasses CORS by being on the same domain and securely injects the API Key.
 * Cal.com API v1 requires the key as a URL query parameter: ?apiKey=xxx
 */
export const onRequestPost = async (context) => {
  const { request, env } = context;

  // Use the secret key set in Cloudflare Dashboard (Functions > Environment Variables)
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
    const { eventTypeId, startTime, endTime } = payload;

    // Cal.com API v1 auth: pass apiKey as a query parameter
    const calUrl = `https://api.cal.com/v1/slots?apiKey=${apiKey}&eventTypeId=${eventTypeId}&startTime=${encodeURIComponent(startTime)}&endTime=${encodeURIComponent(endTime)}`;

    const response = await fetch(calUrl, {
      headers: {
        "Content-Type": "application/json",
      },
    });

    const data = await response.json();

    // Forward the raw Cal.com response (including any errors) for easier debugging
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
