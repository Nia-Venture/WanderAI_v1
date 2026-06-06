import { LogoMark } from '../components/Logo';
import { navigate } from '../lib/router';
import { ArrowRight } from 'lucide-react';

export default function Welcome() {
  const firstName = new URLSearchParams(window.location.search).get('name') ?? 'Traveler';

  return (
    <div className="min-h-screen bg-bg flex flex-col items-center justify-center px-6 py-16 text-center">
      <div className="w-20 h-20 rounded-full bg-accent/10 flex items-center justify-center mx-auto mb-6">
        <LogoMark size={48} />
      </div>

      <h1 className="font-display font-bold text-3xl text-primary mb-3">
        Welcome to WanderAI, {firstName}!
      </h1>
      <p className="font-sans text-muted mb-10 max-w-sm">
        You're all set. Here's how to get started:
      </p>

      <div className="w-full max-w-md space-y-3 mb-8 text-left">
        {[
          { num: '01', title: 'Search any city', desc: 'Type a city name to get your instant local briefing.' },
          { num: '02', title: 'Read your briefing', desc: 'Payments, safety, scams & hidden gems in 60 seconds.' },
          { num: '03', title: 'Chat with a local', desc: 'Ask a verified local your specific question, in real time.' },
        ].map((s) => (
          <div key={s.num} className="bg-surface border border-border rounded-xl p-4 flex items-start gap-4">
            <span className="font-mono text-xl font-bold text-accent/30 shrink-0">{s.num}</span>
            <div>
              <p className="font-display font-semibold text-primary text-sm">{s.title}</p>
              <p className="font-sans text-xs text-muted leading-relaxed mt-0.5">{s.desc}</p>
            </div>
          </div>
        ))}
      </div>

      <button
        onClick={() => navigate('/')}
        className="bg-accent hover:bg-accent-dark text-white font-sans font-semibold px-8 py-4 rounded-2xl mt-2 inline-flex items-center gap-2 transition-all active:scale-[0.98]"
      >
        Explore your first city
        <ArrowRight size={16} />
      </button>
    </div>
  );
}
