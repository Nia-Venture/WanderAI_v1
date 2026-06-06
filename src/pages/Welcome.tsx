import { useAuth } from '../lib/auth';
import { LogoMark } from '../components/Logo';
import { navigate } from '../lib/router';
import { Search, FileText, MessageCircle, ArrowRight } from 'lucide-react';

const STEPS = [
  {
    icon: <Search size={22} />,
    title: 'Search a city',
    description: 'Type any destination and get instant local context.',
  },
  {
    icon: <FileText size={22} />,
    title: 'Read your briefing',
    description: 'AI-generated insider knowledge — safety, payments, food, culture.',
  },
  {
    icon: <MessageCircle size={22} />,
    title: 'Chat with a Local',
    description: 'Ask a verified local guide your specific questions before you land.',
  },
];

export default function Welcome() {
  const { profile } = useAuth();
  const firstName = profile?.name?.split(' ')[0] ?? 'Traveler';

  return (
    <div className="min-h-screen bg-bg flex flex-col items-center justify-center px-6 py-16 text-center">
      <button onClick={() => navigate('/')} className="flex items-center gap-2.5 mb-10">
        <LogoMark size={48} />
        <div className="flex items-baseline">
          <span className="font-display font-bold text-2xl text-primary">Wander</span>
          <span className="font-display font-bold text-2xl text-accent">AI</span>
        </div>
      </button>

      <p className="font-mono text-xs text-accent uppercase tracking-widest mb-3">You're in!</p>
      <h1 className="font-display font-bold text-3xl md:text-4xl text-primary mb-3">
        Welcome to WanderAI, {firstName}!
      </h1>
      <p className="font-sans text-sm text-muted max-w-sm mb-12">
        You're moments away from travelling like a local. Here's how it works:
      </p>

      <div className="w-full max-w-2xl grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        {STEPS.map((step, i) => (
          <div key={i} className="relative bg-surface border border-border rounded-2xl p-6 text-left">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary shrink-0">
                {step.icon}
              </div>
              <span className="font-mono text-xs text-muted uppercase tracking-widest">Step {i + 1}</span>
            </div>
            <h3 className="font-display font-bold text-primary text-base mb-1">{step.title}</h3>
            <p className="font-sans text-sm text-muted leading-relaxed">{step.description}</p>

            {i < STEPS.length - 1 && (
              <div className="hidden md:flex absolute -right-4 top-1/2 -translate-y-1/2 z-10 w-8 h-8 bg-bg border border-border rounded-full items-center justify-center">
                <ArrowRight size={14} className="text-muted" />
              </div>
            )}
          </div>
        ))}
      </div>

      <button
        onClick={() => navigate('/')}
        className="inline-flex items-center gap-2.5 bg-accent hover:bg-accent-dark text-white font-sans font-semibold text-sm py-4 px-8 rounded-xl transition-all active:scale-[0.98] shadow-lg shadow-accent/20"
      >
        <Search size={16} />
        Explore your first city
      </button>
    </div>
  );
}
