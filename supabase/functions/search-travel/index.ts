import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

const OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions";

function todayPlus(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const body = await req.json();
    const { type, city, from, depart_date, return_date, passengers, seat_class, check_in, check_out, guests } = body;

    if (!type || !city) {
      return new Response(
        JSON.stringify({ error: "type and city are required" }),
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
    let prompt = "";

    if (type === "flights") {
      const origin = from || "London";
      const depDate = depart_date || todayPlus(7);
      const retDate = return_date || todayPlus(14);
      const pax = passengers || 1;
      const cls = seat_class || "Economy";

      prompt = `Generate 6 realistic flight options from ${origin} to ${cityDisplay} departing on ${depDate}, returning ${retDate}. ${pax} passenger(s), ${cls} class.

Use real airlines that actually operate this route (e.g. Emirates, British Airways, Qatar Airways, Ryanair, etc.). Include a mix of direct and connecting options. Make prices realistic in USD for the class.

Return ONLY a valid JSON array with NO markdown, NO explanation:
[{
  "airline": "string (full airline name)",
  "airline_code": "string (2-letter IATA code, e.g. EK)",
  "flight_number": "string (e.g. EK 007)",
  "from_airport": "string (e.g. London Heathrow LHR)",
  "to_airport": "string (e.g. Dubai International DXB)",
  "departure_time": "string (HH:MM)",
  "arrival_time": "string (HH:MM)",
  "duration": "string (e.g. 6h 55m)",
  "stops": number,
  "stop_city": "string or null",
  "price_usd": number,
  "seat_class": "${cls}",
  "seats_left": number (1–9)
}]`;
    } else {
      const ci = check_in || todayPlus(7);
      const co = check_out || todayPlus(10);
      const g = guests || 2;
      const nights = Math.max(
        1,
        Math.round((new Date(co).getTime() - new Date(ci).getTime()) / 86400000)
      );

      prompt = `Generate 6 realistic hotel options in ${cityDisplay} for ${nights} night(s), check-in ${ci}, check-out ${co}, ${g} guest(s).

Include a mix of budget guesthouses, mid-range hotels, and luxury 5-star properties. Use real hotel chains OR realistic boutique hotel names specific to ${cityDisplay}. Make prices realistic per night in USD.

Return ONLY a valid JSON array with NO markdown, NO explanation:
[{
  "name": "string (hotel name)",
  "stars": number (1–5),
  "rating": number (6.0–9.9, one decimal),
  "reviews_count": number,
  "price_per_night_usd": number,
  "total_price_usd": number (price_per_night * ${nights}),
  "location": "string (neighbourhood or landmark, ${cityDisplay})",
  "amenities": ["string"] (3–6 items like Pool, Free WiFi, Breakfast, Gym, Spa, Beach Access),
  "highlights": "string (one sentence selling point)",
  "booking_class": "string (e.g. Deluxe Double, Superior Suite)"
}]`;
    }

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
        temperature: 0.6,
        max_tokens: 2048,
      }),
    });

    if (!response.ok) {
      const err = await response.text();
      return new Response(
        JSON.stringify({ error: `OpenRouter API error: ${err}` }),
        { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const result = await response.json();
    const rawText: string = result.choices?.[0]?.message?.content ?? "[]";

    const clean = rawText.replace(/```json|```/g, "").trim();
    const arrayMatch = clean.match(/\[[\s\S]*\]/);

    if (!arrayMatch) {
      return new Response(
        JSON.stringify({ error: "Could not parse OpenRouter response", raw: rawText }),
        { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const items = JSON.parse(arrayMatch[0]);
    const resultData = type === "flights"
      ? { type: "flights", flights: items }
      : { type: "hotels", hotels: items };

    return new Response(JSON.stringify(resultData), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(
      JSON.stringify({ error: err instanceof Error ? err.message : String(err) }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
