import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.7";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const SUPABASE_URL = Deno.env.get("SUPABASE_URL") || "";
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
const NOTIFY_EMAIL = Deno.env.get("NOTIFY_EMAIL") || "admin@example.com";
const GROQ_API_KEY = Deno.env.get("GROQ_API_KEY") || "";
const GROQ_MODEL = "llama3-70b-8192";

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

// ─── CONSTANTS ────────────────────────────────────────────────────────────────
const STAGES = {
  GREETING: "greeting",
  IDENTIFY_SERVICE: "identify_service",
  COLLECT_DETAILS: "collect_details",
  COLLECT_CONTACT: "collect_contact",
  COMPLETED: "completed",
  CANCELLED: "cancelled",
};

const SERVICES = {
  WEB_DEVELOPMENT: "web_development",
  PHOTOGRAPHY: "photography",
  AI_PHOTOGRAPHY: "ai_photography",
};

const REQUIRED_FIELDS: Record<string, string[]> = {
  [SERVICES.WEB_DEVELOPMENT]: ["project_type", "page_count", "timeline", "full_name", "email", "phone", "budget"],
  [SERVICES.PHOTOGRAPHY]: ["shoot_type", "shoot_date", "location", "full_name", "email", "phone", "budget"],
  [SERVICES.AI_PHOTOGRAPHY]: ["campaign_type", "product_description", "timeline", "full_name", "email", "phone", "budget"],
};

const FIELD_LABELS: Record<string, string> = {
  service_type: "Service type (web_development | photography | ai_photography)",
  project_type: "Project type (landing_page | ecommerce | business | custom_app)",
  page_count: "Number of pages (1-5 | 6-10 | 10+)",
  timeline: "Launch timeline (asap | 1_month | flexible)",
  full_name: "Client full name",
  email: "Client email address",
  phone: "Client phone number",
  budget: "Budget range (<1k | 1-5k | 5-10k | 10k+)",
  shoot_type: "Shoot type (corporate | product | event | lifestyle)",
  shoot_date: "Preferred shoot date",
  location: "Shoot location",
  campaign_type: "Campaign type (social_ads | hero_shots | catalog)",
  product_description: "Product or brand description",
};

// ─── SYSTEM PROMPT ────────────────────────────────────────────────────────────
function buildSystemPrompt(
  metadata: Record<string, string>,
  conversationHistory: Array<{ role: string; content: string }>
): string {
  const collected = Object.entries(metadata)
    .filter(([, v]) => v)
    .map(([k, v]) => `  ${k}: ${v}`)
    .join("\n") || "  (none yet)";

  const service = metadata.service_type;
  const requiredFields = service ? REQUIRED_FIELDS[service] || [] : [];
  const missingFields = requiredFields.filter((f) => !metadata[f]);
  const missingLabels = missingFields.map((f) => `  - ${f}: ${FIELD_LABELS[f]}`).join("\n") || "  (all collected!)";

  return `You are a professional sales assistant for a creative agency. Collect project details naturally.

## OUR SERVICES
1. Web Development (landing pages, e-commerce, custom apps)
2. Photography (corporate, product, event)
3. AI Photography (visuals, ads)

## YOUR PERSONALITY
- Warm and professional.
- Ask ONE question at a time.
- Return ONLY a valid JSON object. No other text.

## INFORMATION COLLECTED
${collected}

## INFORMATION NEEDED
${missingLabels}

## RESPONSE FORMAT (STRICT JSON ONLY)
{
  "message": "Conversational reply",
  "extracted": { "field": "value" },
  "quick_replies": [{ "title": "Label", "payload": "SET:field:value" }],
  "needs_human": false,
  "wants_cancel": false
}`;
}

// ─── GROQ API CALL ────────────────────────────────────────────────────────────
interface GroqResponse {
  message: string;
  extracted: Record<string, string>;
  quick_replies: { title: string; payload: string }[];
  needs_human: boolean;
  wants_cancel: boolean;
}

async function callGroq(
  conversationHistory: Array<{ role: string; content: string }>,
  systemPrompt: string
): Promise<GroqResponse> {
  const fallback: GroqResponse = {
    message: "I'm having a moment of trouble thinking clearly 😅 Could you repeat that? Or would you like to talk to a human agent?",
    extracted: {},
    quick_replies: [
      { title: "🧑💻 Talk to Human", payload: "HANDOVER_REQUEST" },
      { title: "🔄 Start Over", payload: "RESTART" },
    ],
    needs_human: false,
    wants_cancel: false,
  };

  try {
    const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${GROQ_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: GROQ_MODEL,
        messages: [
          { role: "system", content: systemPrompt },
          ...conversationHistory.slice(-16), // last 16 messages for context
        ],
        temperature: 0.65,
        max_tokens: 600,
        response_format: { type: "json_object" },
      }),
    });

    if (!res.ok) {
      const errorText = await res.text();
      console.error("Groq API Error Status:", res.status);
      console.error("Groq API Error Response:", errorText);
      if (res.status === 401) console.error("DEBUG: Check if GROQ_API_KEY is correctly set in secrets!");
      return fallback;
    }

    const data = await res.json();
    let raw = data.choices?.[0]?.message?.content || "{}";
    console.log("Groq raw response:", raw);

    // Hardened markdown cleaning - handles both ```json and plain ```
    raw = raw.replace(/```json\s?/g, "").replace(/```\s?/g, "").trim();

    let parsed: Partial<GroqResponse>;
    try {
      parsed = JSON.parse(raw);
    } catch {
      console.error("Groq JSON parse failed on raw content (after cleaning):", raw);
      return fallback;
    }

    return {
      message: parsed.message || fallback.message,
      extracted: parsed.extracted || {},
      quick_replies: Array.isArray(parsed.quick_replies) ? parsed.quick_replies.slice(0, 4) : [],
      needs_human: parsed.needs_human ?? false,
      wants_cancel: parsed.wants_cancel ?? false,
    };
  } catch (e: any) {
    console.error("Groq fetch failed:", e.message);
    return fallback;
  }
}

// ─── EMAIL ────────────────────────────────────────────────────────────────────
async function sendNotificationEmail(
  sessionId: string,
  type: "handover" | "lead_completed",
  metadata: Record<string, string>
) {
  if (!RESEND_API_KEY) return;

  const subject = type === "lead_completed"
    ? `🎉 New Lead! (${metadata.full_name || sessionId})`
    : `🚨 Human Agent Requested (${metadata.full_name || sessionId})`;

  const rows = Object.entries(metadata)
    .filter(([, v]) => v)
    .map(([k, v]) =>
      `<tr><td style="padding:8px;border:1px solid #ddd;font-weight:600;text-transform:capitalize">${k.replace(/_/g, " ")}</td><td style="padding:8px;border:1px solid #ddd">${v}</td></tr>`
    ).join("");

  const html = `
    <div style="font-family:sans-serif;max-width:600px;margin:auto;border:1px solid #eee;padding:24px;border-radius:8px">
      <h2 style="color:#1a1a2e;margin-bottom:16px">${subject}</h2>
      <p><strong>Session:</strong> ${sessionId}</p>
      <table style="width:100%;border-collapse:collapse;margin-top:16px">
        <thead><tr style="background:#f8f9fa">
          <th style="padding:8px;border:1px solid #ddd;text-align:left">Field</th>
          <th style="padding:8px;border:1px solid #ddd;text-align:left">Value</th>
        </tr></thead>
        <tbody>${rows}</tbody>
      </table>
    </div>`;

  try {
    await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${RESEND_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        from: "Bot Notifications <onboarding@resend.dev>",
        to: NOTIFY_EMAIL,
        subject,
        html,
      }),
    });
  } catch (e: any) {
    console.error("Email failed:", e.message);
  }
}

// ─── UTILITY REPLIES always appended ─────────────────────────────────────────
const UTILITY: { title: string; payload: string }[] = [
  { title: "🧑💻 Talk to Human", payload: "HANDOVER_REQUEST" },
  { title: "🔄 Restart", payload: "RESTART" },
  { title: "❌ Cancel", payload: "CANCEL_CONVERSATION" },
];

function withUtility(replies: { title: string; payload: string }[]): { title: string; payload: string }[] {
  // Merge AI replies + utility, dedupe by payload, cap at 13
  const all = [...replies, ...UTILITY];
  const seen = new Set<string>();
  return all.filter(r => {
    if (seen.has(r.payload)) return false;
    seen.add(r.payload);
    return true;
  }).slice(0, 13);
}

// ─── CORE HANDLER ─────────────────────────────────────────────────────────────
interface BotResponse {
  text: string;
  replies: { title: string; payload: string }[];
}

async function handleUserMessage(
  sessionId: string,
  messageText: string,
  payload: string
): Promise<BotResponse> {

  // ── Load or create session ──
  let { data: userState, error } = await supabase
    .from("user_states")
    .select("*")
    .eq("psid", sessionId)
    .single();

  if (error && error.code !== "PGRST116") {
    console.error("DB Error:", error);
    return { text: "Something went wrong. Please try again! 🙏", replies: UTILITY };
  }

  if (!userState) {
    const { data: newUser } = await supabase
      .from("user_states")
      .insert([{
        psid: sessionId,
        current_step: STAGES.GREETING,
        metadata: {},
        conversation_history: [],
        is_human_managed: false,
      }])
      .select()
      .single();
    userState = newUser;
  }

  if (!userState) return { text: "Unable to start session. Please refresh! 🙏", replies: [] };

  let metadata: Record<string, string> = userState.metadata || {};
  let currentStage: string = userState.current_step || STAGES.GREETING;
  let conversationHistory: Array<{ role: string; content: string }> = userState.conversation_history || [];
  const trigger = (messageText || "").trim().toLowerCase();

  // ── Hard-coded special payloads — handled before Groq ──

  // RESTART
  if (
    payload === "RESTART" ||
    trigger === "restart" ||
    currentStage === STAGES.GREETING ||
    [STAGES.COMPLETED, STAGES.CANCELLED].includes(currentStage as never)
  ) {
    await supabase.from("user_states").update({
      current_step: STAGES.IDENTIFY_SERVICE,
      metadata: {},
      conversation_history: [],
      is_human_managed: false,
    }).eq("psid", sessionId);

    const greeting = "Hey there! 👋 I'm your virtual assistant.\n\nI can help you with:\n🌐 Web Development\n📷 Photography\n🤖 AI Photography & Commercial Ads\n\nWhat brings you here today?";
    return {
      text: greeting,
      replies: withUtility([
        { title: "🌐 Web Development", payload: "SET:service_type:web_development" },
        { title: "📷 Photography", payload: "SET:service_type:photography" },
        { title: "🤖 AI Photo Ads", payload: "SET:service_type:ai_photography" },
      ]),
    };
  }

  // HANDOVER
  if (
    payload === "HANDOVER_REQUEST" ||
    trigger === "human" ||
    trigger.includes("talk to human") ||
    trigger.includes("speak to someone") ||
    trigger.includes("human agent")
  ) {
    await supabase.from("user_states").update({ is_human_managed: true }).eq("psid", sessionId);
    await sendNotificationEmail(sessionId, "handover", metadata).catch(() => {});
    return {
      text: "I've notified our team! 🧑💻 Someone will reach out to you shortly.\n\nFeel free to leave any extra details below and we'll make sure to pass them along.",
      replies: [{ title: "🔄 Restart Bot", payload: "RESTART" }],
    };
  }

  // CANCEL
  if (payload === "CANCEL_CONVERSATION" || trigger === "cancel") {
    await supabase.from("user_states").update({
      current_step: STAGES.CANCELLED,
      metadata: {},
      conversation_history: [],
    }).eq("psid", sessionId);
    return {
      text: "No problem at all! Feel free to come back anytime. Have a great day! ✨",
      replies: [{ title: "🔄 Start New", payload: "RESTART" }],
    };
  }

  // SET: quick reply — inject as natural language for Groq context, save field directly
  let effectiveMessage = messageText;
  if (payload.startsWith("SET:")) {
    const parts = payload.replace("SET:", "").split(":");
    const field = parts.shift() || "";
    const value = parts.join(":");
    if (field && value) {
      metadata[field] = value;
      await supabase.from("user_states").update({ metadata }).eq("psid", sessionId);
      // Build a natural message so Groq has context
      const labels: Record<string, string> = {
        service_type: (({ web_development: "Web Development", photography: "Photography", ai_photography: "AI Photo Ads" }) as any)[value] || value,
        project_type: value.replace(/_/g, " "),
        page_count: `${value} pages`,
        timeline: (({ asap: "as soon as possible", "1_month": "in about a month", flexible: "flexible timeline" }) as any)[value] || value,
        budget: value,
        shoot_type: value.replace(/_/g, " "),
        campaign_type: value.replace(/_/g, " "),
      };
      effectiveMessage = labels[field] || value;
    }
  }

  // Gratitude — let Groq handle it naturally
  // (no special case needed — Groq will respond warmly)

  // ── Build conversation history for Groq ──
  const updatedHistory = [
    ...conversationHistory,
    { role: "user", content: effectiveMessage || messageText || payload },
  ].slice(-16);

  // ── Call Groq ──
  const systemPrompt = buildSystemPrompt(metadata, updatedHistory);
  const groqResult = await callGroq(updatedHistory, systemPrompt);

  // ── Handle Groq signals ──
  if (groqResult.wants_cancel) {
    await supabase.from("user_states").update({
      current_step: STAGES.CANCELLED,
      metadata: {},
      conversation_history: [],
    }).eq("psid", sessionId);
    return {
      text: groqResult.message,
      replies: [{ title: "🔄 Start New", payload: "RESTART" }],
    };
  }

  if (groqResult.needs_human) {
    await supabase.from("user_states").update({ is_human_managed: true }).eq("psid", sessionId);
    await sendNotificationEmail(sessionId, "handover", metadata).catch(() => {});
    return {
      text: groqResult.message,
      replies: [{ title: "🔄 Restart Bot", payload: "RESTART" }],
    };
  }

  // ── Merge extracted fields ──
  const freshExtracted = Object.fromEntries(
    Object.entries(groqResult.extracted).filter(([, v]) => v && String(v).trim())
  );
  metadata = { ...metadata, ...freshExtracted };

  // ── Basic validation for email and phone ──
  if (freshExtracted.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(freshExtracted.email)) {
    delete metadata.email; // reject invalid email, Groq will re-ask
  }
  if (freshExtracted.phone && !/[\d\s\+\-\(\)]{7,}/.test(freshExtracted.phone)) {
    delete metadata.phone; // reject invalid phone
  }

  // ── Determine next stage ──
  const service = metadata.service_type;
  const required = service ? REQUIRED_FIELDS[service] || [] : [];
  const missing = required.filter((f) => !metadata[f]);
  const isComplete = service && missing.length === 0;

  let nextStage = currentStage;
  if (!service) nextStage = STAGES.IDENTIFY_SERVICE;
  else if (missing.some((f) => ["full_name", "email", "phone"].includes(f))) nextStage = STAGES.COLLECT_CONTACT;
  else if (missing.length > 0) nextStage = STAGES.COLLECT_DETAILS;
  else nextStage = STAGES.COMPLETED;

  // ── Update conversation history ──
  const newHistory = [
    ...updatedHistory,
    { role: "assistant", content: groqResult.message },
  ].slice(-16);

  // ── Save state ──
  await supabase.from("user_states").update({
    metadata,
    current_step: nextStage,
    conversation_history: newHistory,
    updated_at: new Date().toISOString(),
  }).eq("psid", sessionId);

  // ── Save lead if just completed ──
  if (isComplete && currentStage !== STAGES.COMPLETED) {
    // Mark completed first to prevent duplicate on retry
    await supabase.from("user_states")
      .update({ current_step: STAGES.COMPLETED })
      .eq("psid", sessionId);

    await supabase.from("leads").insert([{
      psid: sessionId,
      service_type: metadata.service_type,
      full_name: metadata.full_name,
      email: metadata.email,
      phone: metadata.phone,
      project_type: metadata.project_type,
      page_count: metadata.page_count,
      shoot_type: metadata.shoot_type,
      shoot_date: metadata.shoot_date,
      location: metadata.location,
      campaign_type: metadata.campaign_type,
      product_description: metadata.product_description,
      timeline: metadata.timeline,
      budget: metadata.budget,
      extra_notes: metadata.extra_notes,
      created_at: new Date().toISOString(),
    }]);

    await sendNotificationEmail(sessionId, "lead_completed", metadata).catch(() => {});

    return {
      text: groqResult.message + "\n\n🎉 That's everything! One of our experts will be in touch with you soon.",
      replies: [{ title: "🔄 Start New Inquiry", payload: "RESTART" }],
    };
  }

  // ── Normal reply with Groq's suggested quick replies + utility ──
  return {
    text: groqResult.message,
    replies: withUtility(groqResult.quick_replies),
  };
}

// ─── SERVER ───────────────────────────────────────────────────────────────────
serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return new Response(null, { status: 405 });

  let body: { sessionId?: string; messageText?: string; payload?: string };
  try {
    body = await req.json();
  } catch {
    return new Response("Bad Request", { status: 400 });
  }

  const { sessionId, messageText, payload } = body;
  if (!sessionId) {
    return new Response(JSON.stringify({ error: "Missing sessionId" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const response = await handleUserMessage(sessionId, messageText || "", payload || "");

  return new Response(JSON.stringify(response), {
    status: 200,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
});
