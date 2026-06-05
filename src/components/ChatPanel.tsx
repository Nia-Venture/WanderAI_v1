import { useState, useRef, useEffect } from 'react';
import type { ChatMessage } from '../types/briefing';
import type { LocalProfile } from '../data/seededLocals';
import { chatWithLocal } from '../api/chatWithLocal';
import { X, Send, Bot } from 'lucide-react';

interface ChatPanelProps {
  city: string;
  local: LocalProfile;
  onClose: () => void;
}

const STARTER_QUESTIONS = [
  'Is it safe to use my credit card here?',
  "What's the best way to get from the airport?",
  'Any food markets I shouldn\'t miss?',
  'What should I avoid as a tourist?',
];

function Avatar({ local }: { local: LocalProfile }) {
  return (
    <div
      className="w-10 h-10 rounded-full flex items-center justify-center text-white font-sans font-semibold text-sm shrink-0"
      style={{ backgroundColor: local.avatar_color }}
    >
      {local.initials}
    </div>
  );
}

export default function ChatPanel({ city, local, onClose }: ChatPanelProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      role: 'local',
      content: `Hey! I'm ${local.name} — I've lived in ${city.charAt(0).toUpperCase() + city.slice(1)} for ${local.years_local} years. What do you want to know?`,
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  async function send(text?: string) {
    const content = (text ?? input).trim();
    if (!content || sending) return;
    setInput('');
    setError(null);

    const userMsg: ChatMessage = {
      id: crypto.randomUUID(),
      role: 'user',
      content,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, userMsg]);
    setSending(true);

    try {
      const allMsgs = [...messages, userMsg];
      const reply = await chatWithLocal(city, local, allMsgs);
      setMessages((prev) => [
        ...prev,
        { id: crypto.randomUUID(), role: 'local', content: reply, timestamp: new Date() },
      ]);
    } catch {
      setError('Could not reach the network. Please try again.');
    } finally {
      setSending(false);
      inputRef.current?.focus();
    }
  }

  function handleKey(e: React.KeyboardEvent) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  }

  const cityDisplay = city.charAt(0).toUpperCase() + city.slice(1);

  return (
    <div className="flex flex-col h-full bg-bg">
      {/* Header */}
      <div className="flex items-center gap-3 px-5 py-4 bg-surface border-b border-border shrink-0">
        <Avatar local={local} />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-sans font-semibold text-primary text-sm">{local.name}</span>
            <span className="flex items-center gap-1 text-xs text-accent-2 font-mono">
              <span className="w-1.5 h-1.5 rounded-full bg-accent-2 animate-pulse" />
              Online now
            </span>
          </div>
          <p className="font-sans text-xs text-muted truncate">{local.tagline}</p>
        </div>
        <button
          onClick={onClose}
          className="p-2 rounded-lg hover:bg-bg text-muted hover:text-primary transition-colors"
        >
          <X size={18} />
        </button>
      </div>

      {/* AI fallback banner */}
      <div className="px-4 py-2.5 bg-primary/5 border-b border-border flex items-start gap-2 shrink-0">
        <Bot size={14} className="text-primary mt-0.5 shrink-0" />
        <p className="font-sans text-xs text-muted leading-relaxed">
          No live local available right now — our AI is answering on {local.name}'s behalf,
          based on verified local knowledge of {cityDisplay}.
        </p>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4 scrollbar-thin">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex gap-3 animate-fade-in ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
          >
            {msg.role === 'local' && <Avatar local={local} />}
            <div className="max-w-[80%]">
              <div
                className={`px-4 py-3 text-sm font-sans leading-relaxed ${
                  msg.role === 'user' ? 'chat-bubble-traveller' : 'chat-bubble-local'
                }`}
              >
                {msg.content}
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
        {sending && (
          <div className="flex gap-3 animate-fade-in">
            <Avatar local={local} />
            <div className="chat-bubble-local px-4 py-3">
              <span className="flex gap-1">
                {[0, 1, 2].map((i) => (
                  <span
                    key={i}
                    className="w-2 h-2 rounded-full bg-muted animate-bounce"
                    style={{ animationDelay: `${i * 0.15}s` }}
                  />
                ))}
              </span>
            </div>
          </div>
        )}
        {error && (
          <p className="font-sans text-xs text-red-500 text-center px-4">{error}</p>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Starter questions */}
      {messages.length < 3 && (
        <div className="px-4 pb-3 flex gap-2 flex-wrap shrink-0">
          {STARTER_QUESTIONS.map((q) => (
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
            placeholder="Ask anything about this city..."
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
