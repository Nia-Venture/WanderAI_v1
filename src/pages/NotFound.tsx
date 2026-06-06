import { LogoMark } from '../components/Logo';
import { navigate } from '../lib/router';
import { Search } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-bg flex flex-col items-center justify-center px-6 text-center">
      <button onClick={() => navigate('/')} className="flex items-center gap-2.5 mb-10">
        <LogoMark size={44} />
        <div className="flex items-baseline">
          <span className="font-display font-bold text-2xl text-primary">Wander</span>
          <span className="font-display font-bold text-2xl text-accent">AI</span>
        </div>
      </button>

      <p className="font-mono text-xs text-muted uppercase tracking-widest mb-3">Error</p>
      <h1 className="font-display font-bold text-[8rem] leading-none text-primary/10 select-none mb-2">
        404
      </h1>
      <h2 className="font-display font-bold text-2xl text-primary mb-3">
        We couldn&apos;t find that destination.
      </h2>
      <p className="font-sans text-sm text-muted max-w-xs mb-8">
        The page you&apos;re looking for doesn&apos;t exist or may have been moved.
      </p>

      <button
        onClick={() => navigate('/')}
        className="inline-flex items-center gap-2 bg-accent hover:bg-accent-dark text-white font-sans font-semibold text-sm py-3 px-6 rounded-xl transition-all active:scale-[0.98]"
      >
        <Search size={16} />
        Back to Search
      </button>
    </div>
  );
}
