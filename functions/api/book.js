/**
 * Cloudflare Pages Function proxy for Cal.com API (Bookings)
 * This handles the direct booking creation without redirecting to Cal.com UI.
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
    const { eventTypeId, startTime, name, email, notes, timeZone = "Asia/Manila" } = payload;

    // Calculate end time (default to 60 minutes after start)
    const startDate = new Date(startTime);
    const endDate = new Date(startDate.getTime() + 60 * 60 * 1000); // Add 60 mins

    // Cal.com API v1 auth: pass apiKey as a query parameter
    const calUrl = `https://api.cal.com/v1/bookings?apiKey=${apiKey}`;

    const response = await fetch(calUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        eventTypeId,
        start: startDate.toISOString(),
        end: endDate.toISOString(),
        responses: {
          name,
          email,
          notes,
          location: "integrations:daily" // Default to Daily for consultations
        },
        timeZone,
        language: "en"
      })
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
