import type { LocalProfile } from '../data/seededLocals';
import LocalProfileCard from './LocalProfileCard';
import { Users } from 'lucide-react';

interface LocalsPanelProps {
  cityName: string;
  locals: LocalProfile[];
  onChat: (local: LocalProfile) => void;
}

export default function LocalsPanel({ cityName, locals, onChat }: LocalsPanelProps) {
  const cityDisplay = cityName.charAt(0).toUpperCase() + cityName.slice(1);

  return (
    <div className="flex flex-col gap-5">
      <div>
        <div className="flex items-center gap-2 mb-1">
          <Users size={18} className="text-accent" />
          <h2 className="font-display font-semibold text-primary text-xl">
            Chat with a Local
          </h2>
        </div>
        <p className="font-sans text-sm text-muted">
          Real people, currently in {cityDisplay}, ready to help.
        </p>
      </div>

      <div className="space-y-4">
        {locals.map((local) => (
          <LocalProfileCard key={local.id} local={local} onChat={onChat} />
        ))}
      </div>

      <div className="bg-surface rounded-card border border-border p-4 text-center">
        <p className="font-sans text-xs text-muted leading-relaxed">
          All locals are{' '}
          <span className="font-semibold text-accent-2">Native Verified</span> through a
          3-step authenticity check before joining WanderAI.
        </p>
      </div>
    </div>
  );
}
