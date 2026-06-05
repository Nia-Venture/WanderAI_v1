import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

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
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const cityLower = city.toLowerCase().trim();
    const country = CITY_COUNTRY[cityLower] ?? "the world";
    const cityDisplay = city.charAt(0).toUpperCase() + city.slice(1);

    const prompt = `You are a verified local expert for ${cityDisplay}, ${country}.
Your job is to give a newly arrived international traveller the insider knowledge
that only a long-time local would know — not tourist brochure content.

Your briefing must cover:
1. PAYMENTS: Which apps/wallets locals use, whether foreign cards work, ATM tips, cash norms at markets/taxis/restaurants.
2. NEIGHBOURHOOD SAFETY: 3–5 key areas with safety ratings (Safe / Caution / Avoid), best areas for first-timers, areas to avoid after dark.
3. SCAM & TRAP ALERTS: Top 3 known tourist scams, overcharging spots, how locals avoid them — be specific, not generic.
4. LANGUAGE SURVIVAL KIT: 5–8 essential phrases in the local language with phonetic pronunciation, key transport words.
5. INSIDER TIPS: 2–3 things only a true local would know — not listed on TripAdvisor.

Tone: Friendly, direct, practical. Write like a knowledgeable local friend, not a guidebook. Be specific to ${cityDisplay}.

IMPORTANT: Respond ONLY with a valid JSON object. No preamble, no markdown fences, no explanation.
Use exactly these keys:
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

    const response = await fetch(OPENROUTER_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`,
        "HTTP-Referer": "https://wanderai.app",
        "X-Title": "WanderAI",
      },
      body: JSON.stringify({
        model: "openai/gpt-4o-mini",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.7,
        max_tokens: 2048,
      }),
    });

    if (!response.ok) {
      const err = await response.text();
      return new Response(
        JSON.stringify({ error: `OpenAI API error: ${err}` }),
        { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const result = await response.json();
    const rawText: string = result.choices?.[0]?.message?.content ?? "";

    const clean = rawText.replace(/```json|```/g, "").trim();
    const jsonMatch = clean.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      return new Response(
        JSON.stringify({ error: "Could not parse OpenAI response as JSON", raw: rawText }),
        { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const briefing = JSON.parse(jsonMatch[0]);

    return new Response(JSON.stringify(briefing), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(
      JSON.stringify({ error: err instanceof Error ? err.message : String(err) }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
