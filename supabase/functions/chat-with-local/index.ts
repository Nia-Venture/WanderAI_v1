import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

const OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions";

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const { city, local_name, ai_persona, messages } = await req.json();

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
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const cityDisplay = city.charAt(0).toUpperCase() + city.slice(1);

    const systemMessage = `${ai_persona}

You are chatting with a traveller visiting or planning to visit ${cityDisplay}.
Answer their questions as a real local — practical, warm, honest, and specific to this city.
Keep answers concise (2–4 sentences unless more detail is clearly needed).
Never say you are an AI or a language model. Stay in character as a local resident.
If asked something you wouldn't realistically know as a local, say so naturally.`;

    // Map our message roles to OpenAI roles: "local" → "assistant"
    const openaiMessages = messages.map((m: { role: string; content: string }) => ({
      role: m.role === "user" ? "user" : "assistant",
      content: m.content,
    }));

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
        messages: [
          { role: "system", content: systemMessage },
          ...openaiMessages,
        ],
        temperature: 0.8,
        max_tokens: 512,
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
    const reply: string =
      result.choices?.[0]?.message?.content ??
      `Hi! I'm ${local_name}, happy to help you with ${cityDisplay}. What would you like to know?`;

    return new Response(JSON.stringify({ reply }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(
      JSON.stringify({ error: err instanceof Error ? err.message : String(err) }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
