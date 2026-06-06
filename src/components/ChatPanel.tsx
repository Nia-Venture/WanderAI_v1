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
import {
  TYPING_STATUSES,
  MODE_STARTER_QUESTIONS,
} from '../services/ai/prompt.service';
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

function TypingDots() {
  return (
    <span className="flex gap-1 items-center h-4">
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          className="w-1.5 h-1.5 rounded-full bg-muted animate-bounce"
          style={{ animationDelay: `${i * 0.15}s` }}
        />
      ))}
    </span>
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
      content: `Hey! I'm ${local.name} — ${local.years_local} years in ${cityDisplay}. What do you want to know?`,
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const [typingStatus, setTypingStatus] = useState('');
  const [streamingId, setStreamingId] = useState<string | null>(null);
  const [suggestion, setSuggestion] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [memoryContext, setMemoryContext] = useState('');

  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const typingTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Load memory for authenticated users
  useEffect(() => {
    if (!user) return;
    loadPreferences(user.id).then((prefs) => {
      setMemoryContext(buildMemoryContext(prefs));
    });
  }, [user]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, streamingId]);

  function startTypingCycle() {
    let idx = Math.floor(Math.random() * TYPING_STATUSES.length);
    setTypingStatus(TYPING_STATUSES[idx]);
    typingTimerRef.current = setInterval(() => {
      idx = (idx + 1) % TYPING_STATUSES.length;
      setTypingStatus(TYPING_STATUSES[idx]);
    }, 1800);
  }

  function stopTypingCycle() {
    if (typingTimerRef.current) {
      clearInterval(typingTimerRef.current);
      typingTimerRef.current = null;
    }
    setTypingStatus('');
  }

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
      startTypingCycle();

      // Passively update user preferences in background
      if (user) {
        const signals = extractPreferenceSignals(content);
        if (Object.keys(signals).length > 0) {
          mergePreferences(user.id, signals).catch(() => {});
        }
      }

      const replyId = crypto.randomUUID();

      await chatWithLocalStream(
        city,
        local,
        [...messages, userMsg],
        mode,
        memoryContext,
        {
          onToken: (token) => {
            // First token — replace typing indicator with streaming message
            if (!streamingId) {
              stopTypingCycle();
              setStreamingId(replyId);
              setMessages((prev) => [
                ...prev,
                { id: replyId, role: 'local', content: token, timestamp: new Date() },
              ]);
            } else {
              setMessages((prev) =>
                prev.map((m) =>
                  m.id === replyId ? { ...m, content: m.content + token } : m
                )
              );
            }
          },
          onDone: (sugg) => {
            stopTypingCycle();
            setStreamingId(null);
            setSending(false);
            if (sugg) setSuggestion(sugg);

            // Strip NEXT: line from the final message
            setMessages((prev) =>
              prev.map((m) => {
                if (m.id !== replyId) return m;
                const { reply } = parseReply(m.content);
                return { ...m, content: reply };
              })
            );

            inputRef.current?.focus();
          },
          onError: (err) => {
            stopTypingCycle();
            setStreamingId(null);
            setSending(false);
            setError('Could not reach the network. Please try again.');
            console.error(err);
          },
        }
      );
    },
    [input, sending, messages, mode, memoryContext, city, local, user, streamingId]
  );

  function handleKey(e: React.KeyboardEvent) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  }

  function handleModeChange(m: TravelMode) {
    setMode(m);
    setSuggestion(null);
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

      {/* AI note */}
      <div className="px-3 py-2 bg-primary/5 border-b border-border flex items-start gap-2 shrink-0">
        <Bot size={13} className="text-primary mt-0.5 shrink-0" />
        <p className="font-sans text-xs text-muted leading-relaxed">
          {local.name}'s local knowledge, powered by AI — answers based on verified local expertise of {cityDisplay}.
        </p>
      </div>

      {/* Travel Mode selector */}
      <div className="px-3 py-2 border-b border-border bg-surface shrink-0">
        <div className="flex gap-1 overflow-x-auto scrollbar-none">
          {ALL_MODES.map((m) => (
            <button
              key={m}
              onClick={() => handleModeChange(m)}
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
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
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
                } ${msg.id === streamingId ? 'border-l-2 border-accent/40' : ''}`}
              >
                {msg.content}
                {msg.id === streamingId && (
                  <span className="inline-block w-0.5 h-4 bg-accent/60 ml-0.5 animate-pulse align-middle" />
                )}
              </div>
              <p
                className={`font-mono text-xs text-muted mt-1 ${
                  msg.role === 'user' ? 'text-right' : ''
                }`}
              >
                {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>
          </div>
        ))}

        {/* Typing indicator */}
        {sending && !streamingId && (
          <div className="flex gap-2.5 animate-fade-in">
            <Avatar local={local} />
            <div className="chat-bubble-local px-3.5 py-2.5 space-y-1">
              <TypingDots />
              {typingStatus && (
                <p className="font-mono text-xs text-muted">{typingStatus}</p>
              )}
            </div>
          </div>
        )}

        {error && (
          <p className="font-sans text-xs text-red-500 text-center px-4 animate-fade-in">{error}</p>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Suggested follow-up */}
      {suggestion && !sending && (
        <div className="px-4 pb-2 shrink-0 animate-fade-in">
          <p className="font-mono text-xs text-muted mb-1.5">You might also want to ask:</p>
          <button
            onClick={() => send(suggestion)}
            className="flex items-center gap-2 font-sans text-xs text-primary border border-primary/25 hover:border-accent hover:text-accent bg-surface px-3 py-2 rounded-xl transition-all w-full text-left"
          >
            <ChevronRight size={13} className="shrink-0 text-accent" />
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
              className="font-sans text-xs text-primary border border-primary/25 hover:border-accent hover:text-accent bg-surface px-3 py-1.5 rounded-full transition-all disabled:opacity-50"
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
            placeholder={`Ask about ${cityDisplay} in ${TRAVEL_MODE_LABELS[mode].toLowerCase()} mode...`}
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
