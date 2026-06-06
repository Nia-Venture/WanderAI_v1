export const OPENROUTER_MODELS = {
  // Primary models per task
  travelPlanning:        'anthropic/claude-sonnet-4-5',
  destinationResearch:   'anthropic/claude-sonnet-4-5',
  travelBriefings:       'openai/gpt-4o',
  conversationalChat:    'anthropic/claude-sonnet-4-5',
  fallback:              'google/gemini-flash-1.5',
} as const;

export type ModelKey = keyof typeof OPENROUTER_MODELS;

export type TravelMode =
  | 'explorer'
  | 'luxury'
  | 'family'
  | 'business'
  | 'adventure'
  | 'budget';

export const TRAVEL_MODE_LABELS: Record<TravelMode, string> = {
  explorer:  'Explorer',
  luxury:    'Luxury',
  family:    'Family',
  business:  'Business',
  adventure: 'Adventure',
  budget:    'Budget',
};

export const TRAVEL_MODE_EMOJIS: Record<TravelMode, string> = {
  explorer:  '🧭',
  luxury:    '✨',
  family:    '👨‍👩‍👧',
  business:  '💼',
  adventure: '🏔️',
  budget:    '💰',
};
