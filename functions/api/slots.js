/**
 * Cloudflare Pages Function proxy for Cal.com API
 * Support both GET (query params) and POST (JSON body)
 */
export const onRequest = async (context) => {
  const { request, env } = context;
  const apiKey = env.VITE_CAL_API_KEY;

  if (!apiKey) {
    return new Response(JSON.stringify({ error: "API Key missing" }), { status: 500 });
  }

  try {
    let eventTypeId, startTime, endTime;

    if (request.method === "POST") {
      const payload = await request.json();
      eventTypeId = payload.eventTypeId;
      startTime = payload.startTime;
      endTime = payload.endTime;
    } else {
      const url = new URL(request.url);
      eventTypeId = url.searchParams.get("eventTypeId");
      startTime = url.searchParams.get("startTime");
      endTime = url.searchParams.get("endTime");
    }

    if (!eventTypeId || !startTime || !endTime) {
      return new Response(JSON.stringify({ error: "Missing required parameters" }), { status: 400 });
    }

    const calUrl = `https://api.cal.com/v1/slots?apiKey=${apiKey}&eventTypeId=${eventTypeId}&startTime=${encodeURIComponent(startTime)}&endTime=${encodeURIComponent(endTime)}`;

    const response = await fetch(calUrl);
    const data = await response.json();

    return new Response(JSON.stringify(data), {
      status: response.status,
      headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" }
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
};
