import type { ChatMessage } from '../types/briefing';
import type { LocalProfile } from '../data/seededLocals';

const FUNCTION_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/chat-with-local`;

export async function chatWithLocal(
  city: string,
  local: LocalProfile,
  messages: ChatMessage[]
): Promise<string> {
  const response = await fetch(FUNCTION_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
    },
    body: JSON.stringify({
      city,
      local_name: local.name,
      ai_persona: local.ai_persona,
      messages: messages.map((m) => ({
        role: m.role === 'user' ? 'user' : 'assistant',
        content: m.content,
      })),
    }),
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`Chat failed (${response.status}): ${err}`);
  }

  const data = await response.json();
  if (!data.reply) throw new Error('No reply in response');
  return data.reply as string;
}
