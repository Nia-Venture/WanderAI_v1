import type { ChatMessage } from '../types/briefing';
import type { LocalProfile } from '../data/seededLocals';
import type { TravelMode } from '../services/ai/openrouter.service';
import { parseReply } from '../services/ai/conversation.service';

const FUNCTION_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/chat-with-local`;

export interface StreamCallbacks {
  onToken: (token: string) => void;
  onDone: (suggestion?: string) => void;
  onError: (err: Error) => void;
}

export async function chatWithLocalStream(
  city: string,
  local: LocalProfile,
  messages: ChatMessage[],
  mode: TravelMode,
  memoryContext: string,
  callbacks: StreamCallbacks
): Promise<void> {
  let response: Response;
  try {
    response = await fetch(FUNCTION_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
      },
      body: JSON.stringify({
        city,
        local_name: local.name,
        ai_persona: local.ai_persona,
        messages: messages
          .filter((m) => m.id !== 'welcome')
          .map((m) => ({ role: m.role === 'user' ? 'user' : 'assistant', content: m.content })),
        mode,
        memory_context: memoryContext,
      }),
    });
  } catch (err) {
    callbacks.onError(err instanceof Error ? err : new Error(String(err)));
    return;
  }

  if (!response.ok) {
    callbacks.onError(new Error(`Chat failed (${response.status})`));
    return;
  }

  const reader = response.body?.getReader();
  if (!reader) {
    callbacks.onError(new Error('No response stream'));
    return;
  }

  const decoder = new TextDecoder();
  let buffer = '';
  let fullText = '';

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() ?? '';

      for (const line of lines) {
        if (!line.startsWith('data: ')) continue;
        const data = line.slice(6).trim();
        if (data === '[DONE]') continue;
        try {
          const parsed = JSON.parse(data);
          const token: string = parsed.choices?.[0]?.delta?.content ?? '';
          if (token) {
            fullText += token;
            callbacks.onToken(token);
          }
        } catch {
          // malformed SSE chunk — skip
        }
      }
    }
  } finally {
    reader.releaseLock();
  }

  const { reply, suggestion } = parseReply(fullText);
  // If the stream already showed the NEXT: line, we need to signal the clean text
  // The ChatPanel will replace the streaming buffer with the clean reply
  callbacks.onDone(suggestion);
}
