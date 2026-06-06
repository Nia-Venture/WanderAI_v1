import type { ChatMessage } from '../../types/briefing';

export interface OpenRouterMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export function formatMessagesForAPI(
  messages: ChatMessage[]
): OpenRouterMessage[] {
  return messages
    .filter((m) => m.id !== 'welcome')
    .map((m) => ({
      role: m.role === 'user' ? 'user' : 'assistant',
      content: m.content,
    }));
}

// Strip the NEXT: suggestion line from AI reply
export function parseReply(raw: string): { reply: string; suggestion?: string } {
  const lines = raw.split('\n');
  const suggIdx = lines.findLastIndex((l) => l.trim().startsWith('NEXT:'));
  if (suggIdx === -1) return { reply: raw.trim() };
  const suggestion = lines[suggIdx].replace(/^NEXT:\s*/i, '').trim();
  const reply = lines.slice(0, suggIdx).join('\n').trim();
  return { reply, suggestion: suggestion || undefined };
}

// Extract lightweight preference signals from a user message
export function extractPreferenceSignals(message: string): Record<string, string> {
  const signals: Record<string, string> = {};
  const lower = message.toLowerCase();

  if (/\b(family|kids?|children|child|toddler|baby)\b/.test(lower)) {
    signals.travel_style = 'family';
  }
  if (/\b(budget|cheap|affordable|backpack|hostel|save money)\b/.test(lower)) {
    signals.budget_level = 'budget';
  }
  if (/\b(luxury|5-star|five.star|high.end|premium|splurge)\b/.test(lower)) {
    signals.budget_level = 'luxury';
  }
  if (/\b(business|work trip|conference|meeting|corporate)\b/.test(lower)) {
    signals.travel_style = 'business';
  }
  if (/\b(vegetarian|vegan|halal|kosher|gluten.free)\b/.test(lower)) {
    signals.food_preferences = lower.match(
      /\b(vegetarian|vegan|halal|kosher|gluten.free)\b/
    )?.[0] ?? '';
  }

  return signals;
}
