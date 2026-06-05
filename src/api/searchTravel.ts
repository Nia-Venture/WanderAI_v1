import type { TravelSearchParams, TravelSearchResult } from '../types/travel';

const FUNCTION_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/search-travel`;

export async function searchTravel(params: TravelSearchParams): Promise<TravelSearchResult> {
  const response = await fetch(FUNCTION_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
    },
    body: JSON.stringify(params),
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`Travel search failed (${response.status}): ${err}`);
  }

  const data = await response.json();
  if (!data.type) throw new Error('Invalid travel search response');
  return data as TravelSearchResult;
}
