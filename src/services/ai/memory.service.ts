import { supabase } from '../../lib/supabase';

export interface UserPreferences {
  travel_style?: string;
  budget_level?: string;
  family_size?: number;
  food_preferences?: string[];
  hotel_preferences?: string;
  interests?: string[];
  previous_destinations?: string[];
  notes?: string;
}

export async function loadPreferences(userId: string): Promise<UserPreferences> {
  const { data } = await supabase
    .from('user_preferences')
    .select('*')
    .eq('user_id', userId)
    .maybeSingle();

  if (!data) return {};

  return {
    travel_style: data.travel_style ?? undefined,
    budget_level: data.budget_level ?? undefined,
    family_size: data.family_size ?? undefined,
    food_preferences: data.food_preferences ?? undefined,
    hotel_preferences: data.hotel_preferences ?? undefined,
    interests: data.interests ?? undefined,
    previous_destinations: data.previous_destinations ?? undefined,
    notes: data.notes ?? undefined,
  };
}

export async function savePreferences(
  userId: string,
  prefs: Partial<UserPreferences>
): Promise<void> {
  await supabase.from('user_preferences').upsert(
    { user_id: userId, ...prefs, updated_at: new Date().toISOString() },
    { onConflict: 'user_id' }
  );
}

export async function mergePreferences(
  userId: string,
  signals: Record<string, string>
): Promise<void> {
  if (Object.keys(signals).length === 0) return;
  const current = await loadPreferences(userId);

  const updated: Partial<UserPreferences> = { ...current };
  if (signals.travel_style) updated.travel_style = signals.travel_style;
  if (signals.budget_level) updated.budget_level = signals.budget_level;
  if (signals.food_preferences) {
    const existing = current.food_preferences ?? [];
    if (!existing.includes(signals.food_preferences)) {
      updated.food_preferences = [...existing, signals.food_preferences];
    }
  }

  await savePreferences(userId, updated);
}

export function buildMemoryContext(prefs: UserPreferences): string {
  const parts: string[] = [];
  if (prefs.travel_style) parts.push(`Travel style: ${prefs.travel_style}`);
  if (prefs.budget_level) parts.push(`Budget level: ${prefs.budget_level}`);
  if (prefs.family_size) parts.push(`Travelling with ${prefs.family_size} in the group`);
  if (prefs.food_preferences?.length) parts.push(`Food preferences: ${prefs.food_preferences.join(', ')}`);
  if (prefs.hotel_preferences) parts.push(`Hotel preference: ${prefs.hotel_preferences}`);
  if (prefs.interests?.length) parts.push(`Interests: ${prefs.interests.join(', ')}`);
  if (prefs.previous_destinations?.length) {
    parts.push(`Previously visited: ${prefs.previous_destinations.join(', ')}`);
  }
  if (prefs.notes) parts.push(prefs.notes);
  return parts.join('\n');
}
