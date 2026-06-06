import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

// Whitelisted cities — only these are accepted to prevent prompt injection
const CITY_COUNTRY: Record<string, string> = {
  dubai: "United Arab Emirates",
  tokyo: "Japan",
  london: "United Kingdom",
  bangkok: "Thailand",
  paris: "France",
  nairobi: "Kenya",
  "new york": "United States",
  singapore: "Singapore",
  amsterdam: "Netherlands",
  istanbul: "Turkey",
  "mexico city": "Mexico",
  mumbai: "India",
  sydney: "Australia",
  "cape town": "South Africa",
  barcelona: "Spain",
  lisbon: "Portugal",
  seoul: "South Korea",
  berlin: "Germany",
  rome: "Italy",
  cairo: "Egypt",
  "buenos aires": "Argentina",
  toronto: "Canada",
  marrakech: "Morocco",
  bali: "Indonesia",
  colombo: "Sri Lanka",
};

const OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions";

// Model routing
const MODELS = {
  primary:  "openai/gpt-4o",
  fallback: "anthropic/claude-sonnet-4-5",
};

function buildBriefingPrompt(city: string, country: string): string {
  return `You are a seasoned travel insider who has spent years living in ${city}, ${country}.

A traveller is arriving in ${city} soon. Give them the real local knowledge — the stuff guidebooks don't tell you.

Your briefing must cover these five areas with genuine, city-specific insight:

1. PAYMENTS — Which payment apps locals actually use, whether foreign cards work reliably, ATM tips (which banks charge less, which to avoid), cash norms at markets/taxis/street food
2. NEIGHBOURHOOD SAFETY — Rate 4–5 key areas (Safe / Caution / Avoid), best areas for first-timers, what to know after dark. Be specific, not generic.
3. SCAM & TRAP ALERTS — Top 3 known tourist scams in this specific city. Describe exactly how they work and how locals sidestep them. No generic advice.
4. LANGUAGE SURVIVAL — 6 essential phrases with phonetic pronunciation, key transport vocabulary, one tip about the script/language that helps navigation
5. INSIDER TIPS — 3 things that only someone who lived there would know. Not TripAdvisor content.

Write like a knowledgeable local friend briefing someone before their trip. Direct, warm, and specific.

Respond ONLY with a valid JSON object — no preamble, no markdown fences.
Exactly this structure:
{
  "payments": {
    "apps": ["string"],
    "foreign_cards": "string",
    "atm_tip": "string",
    "cash_norms": "string"
  },
  "safety": {
    "neighbourhoods": [{ "name": "string", "level": "safe|caution|avoid", "note": "string" }],
    "best_for_first_timers": "string",
    "avoid_after_dark": "string",
    "key_tip": "string"
  },
  "scams": [{ "name": "string", "description": "string", "how_locals_avoid": "string" }],
  "language": {
    "phrases": [{ "phrase": "string", "phonetic": "string", "meaning": "string" }],
    "transport_vocab": ["string"],
    "script_tip": "string"
  },
  "insider_tips": {
    "tips": ["string"],
    "etiquette_tip": "string"
  }
}`;
}

async function callModel(
  model: string,
  prompt: string,
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
      messages: [{ role: "user", content: prompt }],
      temperature: 0.65,
      max_tokens: 2048,
    }),
  });
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const { city } = await req.json();
    if (!city || typeof city !== "string") {
      return new Response(
        JSON.stringify({ error: "city is required" }),
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

    const cityLower = city.toLowerCase().trim();
    if (!Object.prototype.hasOwnProperty.call(CITY_COUNTRY, cityLower)) {
      return new Response(
        JSON.stringify({ error: "City not supported" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const country = CITY_COUNTRY[cityLower];
    const cityDisplay = city.charAt(0).toUpperCase() + city.slice(1);
    const prompt = buildBriefingPrompt(cityDisplay, country);

    // Try primary model, fallback if unavailable
    let response = await callModel(MODELS.primary, prompt, apiKey);
    if (!response.ok && response.status >= 500) {
      console.warn(`[generate-briefing] Primary model failed (${response.status}), falling back`);
      response = await callModel(MODELS.fallback, prompt, apiKey);
    }

    if (!response.ok) {
      const err = await response.text();
      return new Response(
        JSON.stringify({ error: `AI service error: ${err}` }),
        { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const result = await response.json();
    const rawText: string = result.choices?.[0]?.message?.content ?? "";

    const clean = rawText.replace(/```json|```/g, "").trim();
    const jsonMatch = clean.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      return new Response(
        JSON.stringify({ error: "Could not parse briefing response", raw: rawText }),
        { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const briefing = JSON.parse(jsonMatch[0]);
    return new Response(JSON.stringify(briefing), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (err) {
    console.error("[generate-briefing]", err);
    return new Response(
      JSON.stringify({ error: err instanceof Error ? err.message : String(err) }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
