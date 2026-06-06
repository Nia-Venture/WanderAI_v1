import type { LocalProfile } from '../data/seededLocals';
import { Star, CheckCircle2 } from 'lucide-react';

interface LocalProfileCardProps {
  local: LocalProfile;
  onChat: (local: LocalProfile) => void;
}

function Avatar({ local }: { local: LocalProfile }) {
  return (
    <div
      className="w-12 h-12 rounded-full flex items-center justify-center text-white font-sans font-semibold text-base shrink-0"
      style={{ backgroundColor: local.avatar_color }}
    >
      {local.initials}
    </div>
  );
}

export default function LocalProfileCard({ local, onChat }: LocalProfileCardProps) {
  return (
    <div className="bg-surface rounded-card border border-border shadow-card hover:shadow-card-hover transition-all duration-200 p-5 group">
      <div className="flex items-start gap-4">
        <Avatar local={local} />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-sans font-semibold text-primary">{local.name}</span>
            <span className="flex items-center gap-1 text-xs text-accent-2 font-mono">
              <CheckCircle2 size={12} />
              Verified Local
            </span>
          </div>
          <p className="font-sans text-xs text-muted mt-0.5 leading-relaxed">{local.tagline}</p>
          <div className="flex items-center gap-1.5 mt-1.5">
            <Star size={12} className="text-yellow-500 fill-yellow-500" />
            <span className="font-mono text-xs text-text-main font-medium">{local.rating}</span>
            <span className="font-sans text-xs text-muted">({local.trips_helped} helped)</span>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap gap-1.5 mt-3">
        {local.topics.map((t) => (
          <span
            key={t}
            className="font-mono text-xs bg-primary/10 text-primary px-2.5 py-1 rounded-md"
          >
            {t}
          </span>
        ))}
      </div>

      <button
        onClick={() => onChat(local)}
        className="mt-4 w-full bg-primary hover:bg-primary-light text-surface font-sans font-semibold text-sm py-2.5 rounded-xl transition-all duration-150 active:scale-[0.98]"
      >
        Start Chat
      </button>
    </div>
  );
}
