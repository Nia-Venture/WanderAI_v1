import type { CityBriefing } from '../types/briefing';

const FUNCTION_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/generate-briefing`;

export async function generateBriefing(cityName: string): Promise<CityBriefing> {
  const response = await fetch(FUNCTION_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
    },
    body: JSON.stringify({ city: cityName }),
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`Briefing generation failed (${response.status}): ${err}`);
  }

  const data = await response.json();
  if (!data.payments || !data.safety || !data.scams) {
    throw new Error('Incomplete briefing data returned');
  }

  return data as CityBriefing;
}
