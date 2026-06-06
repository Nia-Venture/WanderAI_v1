import { useState, useRef, useEffect, useCallback } from 'react';
import type { ChatMessage } from '../types/briefing';
import type { LocalProfile } from '../data/seededLocals';
import { chatWithLocalStream } from '../api/chatWithLocal';
import { useAuth } from '../lib/auth';
import {
  type TravelMode,
  TRAVEL_MODE_LABELS,
  TRAVEL_MODE_EMOJIS,
} from '../services/ai/openrouter.service';
import { MODE_STARTER_QUESTIONS } from '../services/ai/prompt.service';
import {
  extractPreferenceSignals,
  parseReply,
} from '../services/ai/conversation.service';
import {
  loadPreferences,
  buildMemoryContext,
  mergePreferences,
} from '../services/ai/memory.service';
import { X, Send, Bot, ChevronRight } from 'lucide-react';

interface ChatPanelProps {
  city: string;
  local: LocalProfile;
  onClose: () => void;
}

function Avatar({ local }: { local: LocalProfile }) {
  return (
    <div
      className="w-9 h-9 rounded-full flex items-center justify-center text-white font-sans font-semibold text-xs shrink-0"
      style={{ backgroundColor: local.avatar_color }}
    >
      {local.initials}
    </div>
  );
}

// Simple iMessage-style dots — no status text, just human-feeling
function TypingBubble() {
  return (
    <div className="chat-bubble-local px-4 py-3">
      <span className="flex gap-1 items-center h-4">
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            className="w-2 h-2 rounded-full bg-muted/70 animate-bounce"
            style={{ animationDelay: `${i * 0.18}s` }}
          />
        ))}
      </span>
    </div>
  );
}

const ALL_MODES: TravelMode[] = ['explorer', 'luxury', 'family', 'business', 'adventure', 'budget'];

export default function ChatPanel({ city, local, onClose }: ChatPanelProps) {
  const { user } = useAuth();
  const cityDisplay = city.charAt(0).toUpperCase() + city.slice(1);

  const [mode, setMode] = useState<TravelMode>('explorer');
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      role: 'local',
      content: `Hey! I'm ${local.name} — ${local.years_local} years in ${cityDisplay}. Ask me anything.`,
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const [showTyping, setShowTyping] = useState(false);
  const [streamingMsgId, setStreamingMsgId] = useState<string | null>(null);
  const [suggestion, setSuggestion] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [memoryContext, setMemoryContext] = useState('');

  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const typeIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (!user) return;
    loadPreferences(user.id).then((prefs) => {
      setMemoryContext(buildMemoryContext(prefs));
    });
  }, [user]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, showTyping]);

  // Cleanup typing interval on unmount
  useEffect(() => {
    return () => {
      if (typeIntervalRef.current) clearInterval(typeIntervalRef.current);
    };
  }, []);

  const send = useCallback(
    async (text?: string) => {
      const content = (text ?? input).trim();
      if (!content || sending) return;
      setInput('');
      setError(null);
      setSuggestion(null);

      const userMsg: ChatMessage = {
        id: crypto.randomUUID(),
        role: 'user',
        content,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, userMsg]);
      setSending(true);
      setShowTyping(true);

      if (user) {
        const signals = extractPreferenceSignals(content);
        if (Object.keys(signals).length > 0) {
          mergePreferences(user.id, signals).catch(() => {});
        }
      }

      const replyId = crypto.randomUUID();

      // Mutable state shared between stream callbacks and the typing interval
      // (plain objects so no stale-closure issues with React state)
      let hasStartedBubble = false;
      const pending = { text: '', done: false, suggestion: undefined as string | undefined };

      // Clear any leftover interval from a previous send
      if (typeIntervalRef.current) clearInterval(typeIntervalRef.current);

      // Word-by-word drain: release one word at ~75 ms so it looks like typing
      typeIntervalRef.current = setInterval(() => {
        if (!pending.text) {
          if (pending.done) {
            clearInterval(typeIntervalRef.current!);
            typeIntervalRef.current = null;

            // Finalise: strip NEXT: marker, show suggestion chip
            setStreamingMsgId(null);
            setSending(false);
            if (pending.suggestion) setSuggestion(pending.suggestion);
            setMessages((prev) =>
              prev.map((m) => {
                if (m.id !== replyId) return m;
                const { reply } = parseReply(m.content);
                return { ...m, content: reply };
              })
            );
            inputRef.current?.focus();
          }
          return;
        }

        // Grab the next word (up to and including the next space, max 12 chars)
        const spaceIdx = pending.text.indexOf(' ');
        let chunk: string;
        if (spaceIdx === -1 || spaceIdx > 12) {
          chunk = pending.text.slice(0, Math.min(12, pending.text.length));
        } else {
          chunk = pending.text.slice(0, spaceIdx + 1);
        }
        pending.text = pending.text.slice(chunk.length);

        setMessages((prev) =>
          prev.map((m) => (m.id === replyId ? { ...m, content: m.content + chunk } : m))
        );
      }, 75);

      await chatWithLocalStream(
        city,
        local,
        [...messages, userMsg],
        mode,
        memoryContext,
        {
          onToken: (token) => {
            if (!hasStartedBubble) {
              hasStartedBubble = true;
              setShowTyping(false);
              setStreamingMsgId(replyId);
              // Create the empty bubble — interval will fill it word-by-word
              setMessages((prev) => [
                ...prev,
                { id: replyId, role: 'local', content: '', timestamp: new Date() },
              ]);
            }
            pending.text += token;
          },

          onDone: (sugg) => {
            setShowTyping(false);
            pending.suggestion = sugg;
            pending.done = true;
            // Interval will flush remaining text then call finalise
          },

          onError: () => {
            clearInterval(typeIntervalRef.current!);
            typeIntervalRef.current = null;
            setShowTyping(false);
            setStreamingMsgId(null);
            setSending(false);
            setError('Something went wrong — please try again.');
            inputRef.current?.focus();
          },
        }
      );
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [input, sending, messages, mode, memoryContext, city, local, user]
  );

  function handleKey(e: React.KeyboardEvent) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  }

  const starterQuestions = MODE_STARTER_QUESTIONS[mode];
  const showStarters = messages.length < 3 && !sending;

  return (
    <div className="flex flex-col h-full bg-bg">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3 bg-surface border-b border-border shrink-0">
        <Avatar local={local} />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-sans font-semibold text-primary text-sm">{local.name}</span>
            <span className="flex items-center gap-1 text-xs text-accent-2 font-mono">
              <span className="w-1.5 h-1.5 rounded-full bg-accent-2 animate-pulse" />
              Online
            </span>
          </div>
          <p className="font-sans text-xs text-muted truncate">{local.tagline}</p>
        </div>
        <button
          onClick={onClose}
          className="p-2 rounded-lg hover:bg-bg text-muted hover:text-primary transition-colors"
        >
          <X size={16} />
        </button>
      </div>

      {/* AI note — kept minimal, single line */}
      <div className="px-3 py-1.5 bg-primary/5 border-b border-border flex items-center gap-1.5 shrink-0">
        <Bot size={11} className="text-primary shrink-0" />
        <p className="font-mono text-xs text-muted">
          Local knowledge · AI-powered · {cityDisplay}
        </p>
      </div>

      {/* Travel Mode selector */}
      <div className="px-3 py-2 border-b border-border bg-surface shrink-0">
        <div className="flex gap-1 overflow-x-auto scrollbar-none">
          {ALL_MODES.map((m) => (
            <button
              key={m}
              onClick={() => { setMode(m); setSuggestion(null); }}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-lg font-sans text-xs font-semibold whitespace-nowrap transition-all ${
                mode === m
                  ? 'bg-accent text-white'
                  : 'bg-bg border border-border text-muted hover:text-primary hover:border-primary/30'
              }`}
            >
              <span>{TRAVEL_MODE_EMOJIS[m]}</span>
              {TRAVEL_MODE_LABELS[m]}
            </button>
          ))}
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex gap-2.5 animate-fade-in ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
          >
            {msg.role === 'local' && <Avatar local={local} />}
            <div className="max-w-[82%]">
              <div
                className={`px-3.5 py-2.5 text-sm font-sans leading-relaxed ${
                  msg.role === 'user' ? 'chat-bubble-traveller' : 'chat-bubble-local'
                }`}
              >
                {msg.content}
                {msg.id === streamingMsgId && (
                  <span className="inline-block w-0.5 h-[1em] bg-current opacity-50 ml-0.5 animate-pulse align-middle" />
                )}
              </div>
              <p className={`font-mono text-xs text-muted mt-1 ${msg.role === 'user' ? 'text-right' : ''}`}>
                {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>
          </div>
        ))}

        {/* iMessage-style typing indicator */}
        {showTyping && (
          <div className="flex gap-2.5 animate-fade-in">
            <Avatar local={local} />
            <TypingBubble />
          </div>
        )}

        {error && (
          <p className="font-sans text-xs text-red-500 text-center px-4 animate-fade-in">{error}</p>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Follow-up suggestion */}
      {suggestion && !sending && (
        <div className="px-4 pb-2 shrink-0 animate-fade-in">
          <button
            onClick={() => send(suggestion)}
            className="flex items-center gap-2 font-sans text-xs text-primary border border-primary/20 hover:border-accent hover:text-accent bg-surface px-3 py-2 rounded-xl transition-all w-full text-left"
          >
            <ChevronRight size={12} className="shrink-0 text-accent" />
            <span>{suggestion}</span>
          </button>
        </div>
      )}

      {/* Starter questions */}
      {showStarters && (
        <div className="px-4 pb-2 flex gap-1.5 flex-wrap shrink-0">
          {starterQuestions.map((q) => (
            <button
              key={q}
              onClick={() => send(q)}
              disabled={sending}
              className="font-sans text-xs text-primary border border-primary/20 hover:border-accent hover:text-accent bg-surface px-3 py-1.5 rounded-full transition-all disabled:opacity-50"
            >
              {q}
            </button>
          ))}
        </div>
      )}

      {/* Input */}
      <div className="px-4 pb-4 pt-2 shrink-0 border-t border-border bg-surface">
        <div className="flex items-center gap-2 bg-bg rounded-xl border border-border focus-within:border-accent transition-colors">
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKey}
            placeholder={`Ask ${local.name} anything about ${cityDisplay}...`}
            disabled={sending}
            className="flex-1 px-4 py-3 bg-transparent text-text-main placeholder-muted font-sans text-sm outline-none"
          />
          <button
            onClick={() => send()}
            disabled={sending || !input.trim()}
            className="mr-2 w-9 h-9 rounded-lg bg-accent hover:bg-accent-dark disabled:opacity-40 flex items-center justify-center transition-all active:scale-95"
          >
            <Send size={15} className="text-white" />
          </button>
        </div>
      </div>
    </div>
  );
}
