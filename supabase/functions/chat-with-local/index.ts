import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

const OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions";

// Model routing
const MODELS = {
  primary:  "anthropic/claude-sonnet-4-5",
  fallback: "google/gemini-flash-1.5",
};

const WANDER_PERSONA = `You are Wander — an experienced travel advisor and local guide with firsthand knowledge across 50+ cities.

You are NOT an AI assistant. You are a real travel expert who has lived in, worked in, and obsessively explored cities around the world.

Your tone is natural, warm, direct, and opinionated. Write like you're texting a knowledgeable friend.

BANNED phrases — never say these:
"Certainly!", "Absolutely!", "Great question!", "Of course!", "As an AI", "Based on your request", "Here is your itinerary", "I can help you with that", "Please note that"

USE INSTEAD phrases like:
"If I were spending three days there, I'd...", "One thing most visitors miss is...", "Skip [X] — go to [Y] instead.", "Here's how I'd structure this...", "Quick heads up about..."

RESPONSE FORMAT:
- Keep replies under 200 words unless a detailed itinerary is explicitly requested
- Short paragraphs, not bullet lists unless listing options
- End every response with exactly one new line: NEXT: [one follow-up question the user will likely want to ask]`;

const MODE_MODIFIERS: Record<string, string> = {
  explorer:  "Focus on: hidden gems, off-the-beaten-path spots, authentic local experiences tourists never find.",
  luxury:    "Focus on: premium experiences, exclusive venues, high-end hotels, private tours, Michelin dining.",
  family:    "Focus on: child-friendly activities, safe neighbourhoods, practical logistics for families with kids.",
  business:  "Focus on: efficient travel, business districts, reliable transport, co-working, airport logistics.",
  adventure: "Focus on: outdoor activities, hiking, water sports, adrenaline experiences, physical challenges.",
  budget:    "Focus on: maximum experience per dollar, free activities, street food, budget transport hacks.",
};

function buildSystemPrompt(
  city: string,
  personaOverride: string,
  mode: string,
  memoryContext: string
): string {
  const cityDisplay = city.charAt(0).toUpperCase() + city.slice(1);
  const safePersona = personaOverride.replace(/`/g, "'").slice(0, 400);
  const modeHint = MODE_MODIFIERS[mode] ?? MODE_MODIFIERS.explorer;

  let prompt = `${WANDER_PERSONA}

[LOCAL GUIDE PERSONA — use this character's voice and background]
${safePersona}
[END PERSONA]

You are answering questions about ${cityDisplay}.
${modeHint}`;

  if (memoryContext && memoryContext.trim()) {
    prompt += `\n\nUSER CONTEXT (reference naturally when genuinely relevant — do not parrot it back):
${memoryContext.slice(0, 500)}`;
  }

  return prompt;
}

async function callOpenRouter(
  model: string,
  systemPrompt: string,
  messages: Array<{ role: string; content: string }>,
  apiKey: string,
  stream: boolean
): Promise<Response> {
  return fetch(OPENROUTER_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${apiKey}`,
      "HTTP-Referer": "https://wanderai.app",
      "X-Title": "WanderAI",
    },
    body: JSON.stringify({
      model,
      messages: [
        { role: "system", content: systemPrompt },
        ...messages.map((m) => ({
          role: m.role === "user" ? "user" : "assistant",
          content: m.content,
        })),
      ],
      temperature: 0.82,
      max_tokens: 600,
      stream,
    }),
  });
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const { city, local_name, ai_persona, messages, mode = "explorer", memory_context = "" } =
      await req.json();

    if (!city || !ai_persona || !Array.isArray(messages)) {
      return new Response(
        JSON.stringify({ error: "city, ai_persona, and messages are required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const apiKey = Deno.env.get("OPENROUTER_API_KEY");
    if (!apiKey) {
      return new Response(
        JSON.stringify({ error: "OPENROUTER_API_KEY not configured" }),
        { status: 503, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const systemPrompt = buildSystemPrompt(city, ai_persona, mode, memory_context);

    // Try primary model (streaming)
    let upstream = await callOpenRouter(MODELS.primary, systemPrompt, messages, apiKey, true);

    // Fallback to Gemini if primary is unavailable
    if (!upstream.ok && upstream.status >= 500) {
      console.warn(`[chat-with-local] Primary model failed (${upstream.status}), falling back`);
      upstream = await callOpenRouter(MODELS.fallback, systemPrompt, messages, apiKey, true);
    }

    if (!upstream.ok) {
      const err = await upstream.text();
      return new Response(
        JSON.stringify({ error: `AI service error: ${err}` }),
        { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Stream the SSE response directly to the client
    return new Response(upstream.body, {
      headers: {
        ...corsHeaders,
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        "X-Accel-Buffering": "no",
      },
    });

  } catch (err) {
    console.error("[chat-with-local]", err);
    return new Response(
      JSON.stringify({ error: err instanceof Error ? err.message : String(err) }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
