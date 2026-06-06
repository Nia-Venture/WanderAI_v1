import type { CityBriefing } from '../types/briefing';

const FUNCTION_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/generate-briefing`;
const CACHE_TTL_MS = 30 * 60 * 1000;

interface CacheEntry {
  data: CityBriefing;
  timestamp: number;
}

const cache = new Map<string, CacheEntry>();

export async function generateBriefing(cityName: string): Promise<CityBriefing> {
  const key = cityName.toLowerCase().trim();
  const cached = cache.get(key);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
    return cached.data;
  }

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

  const result = data as CityBriefing;
  cache.set(key, { data: result, timestamp: Date.now() });
  return result;
}
