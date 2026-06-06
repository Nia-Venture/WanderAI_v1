import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

const OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions";

const MODELS = {
  primary:  "anthropic/claude-sonnet-4-5",
  fallback: "google/gemini-flash-1.5",
};

const MODE_HINTS: Record<string, string> = {
  explorer:  "They're the adventurous type — want hidden gems and off-beat spots, not tourist traps.",
  luxury:    "They want premium — best hotels, exclusive spots, high-end restaurants.",
  family:    "Travelling with kids — keep it practical, safe, and family-friendly.",
  business:  "On a work trip — they need efficiency: best areas, reliable transport, quick food.",
  adventure: "Into outdoors and thrills — hiking, water sports, physical stuff.",
  budget:    "Watching their wallet — free things, cheap eats, local transport hacks.",
};

function buildSystemPrompt(
  city: string,
  personaOverride: string,
  mode: string,
  memoryContext: string
): string {
  const cityDisplay = city.charAt(0).toUpperCase() + city.slice(1);
  const modeHint = MODE_HINTS[mode] ?? MODE_HINTS.explorer;
  const safePersona = personaOverride.replace(/`/g, "'").slice(0, 350);

  let prompt = `You are texting a traveller on WhatsApp. You're ${safePersona}

You're chatting about ${cityDisplay}. ${modeHint}

HARD RULES — every single response must follow all of these:
1. Max 2-3 sentences. That's it. If you want to say more, choose the single most useful thing.
2. No bullet points. No numbered lists. No headers. No bold text. Plain conversational text only.
3. Lead with the actual answer immediately — no preamble, no "great question".
4. Use casual language — contractions, slang, personal opinions are encouraged.
5. Give YOUR take: "I'd skip that", "my go-to is...", "honestly the X is overrated".
6. If there's a natural follow-up, end with a short casual question. Otherwise just stop.

Style examples:
GOOD: "Honestly skip the Creek area for food, all tourist traps. Head to Satwa — there's a shawarma spot on Al Wasl with a queue that tells you everything. You into spicy food?"
GOOD: "Yeah it's totally safe, just avoid the back streets past midnight. Most areas you'll be walking around are fine. Where are you staying?"
BAD: "Certainly! Here are some tips for staying safe: 1. Stay aware... 2. Avoid..."
BAD: "Dubai has a vibrant food scene with many options to suit all tastes..."

If someone asks for recommendations, give 2 max. Pick the best one and say why.
If someone asks a yes/no question, just answer it directly.

Optional: if there's a genuinely useful follow-up, end with: NEXT: [casual follow-up question]
Only include NEXT if it's natural — don't force it.`;

  if (memoryContext && memoryContext.trim()) {
    prompt += `\n\nAbout this traveller (use naturally if relevant, don't repeat back):
${memoryContext.slice(0, 400)}`;
  }

  return prompt;
}

async function callOpenRouter(
  model: string,
  systemPrompt: string,
  messages: Array<{ role: string; content: string }>,
  apiKey: string
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
      temperature: 0.9,
      max_tokens: 180,
      stream: true,
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

    let upstream = await callOpenRouter(MODELS.primary, systemPrompt, messages, apiKey);

    if (!upstream.ok && upstream.status >= 500) {
      console.warn(`[chat-with-local] primary failed (${upstream.status}), trying fallback`);
      upstream = await callOpenRouter(MODELS.fallback, systemPrompt, messages, apiKey);
    }

    if (!upstream.ok) {
      const err = await upstream.text();
      return new Response(
        JSON.stringify({ error: `AI error: ${err}` }),
        { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

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
