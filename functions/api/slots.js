/**
 * Cloudflare Pages Function proxy for Cal.com API
 * This bypasses CORS by being on the same domain and securely injects the API Key.
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
    const { eventTypeId, startTime, endTime } = payload;

    const response = await fetch(
      `https://api.cal.com/v1/slots?eventTypeId=${eventTypeId}&startTime=${startTime}&endTime=${endTime}`,
      {
        headers: {
          "Authorization": `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
      }
    );

    const data = await response.json();

    return new Response(JSON.stringify(data), {
      status: response.status,
      headers: { "Content-Type": "application/json" }
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message || "Proxy request failed" }), {
      status: 400,
      headers: { "Content-Type": "application/json" }
    });
  }
};
