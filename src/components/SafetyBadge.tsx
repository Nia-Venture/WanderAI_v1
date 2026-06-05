interface SafetyBadgeProps {
  level: 'safe' | 'caution' | 'avoid';
  pulse?: boolean;
}

const config = {
  safe: {
    dot: 'bg-accent-2',
    bg: 'bg-accent-2/10',
    text: 'text-accent-2',
    label: 'Safe',
  },
  caution: {
    dot: 'bg-yellow-500',
    bg: 'bg-yellow-50',
    text: 'text-yellow-700',
    label: 'Caution',
  },
  avoid: {
    dot: 'bg-red-500',
    bg: 'bg-red-50',
    text: 'text-red-600',
    label: 'Avoid',
  },
};

export default function SafetyBadge({ level, pulse = false }: SafetyBadgeProps) {
  const c = config[level];
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-mono font-medium ${c.bg} ${c.text}`}>
      <span className={`w-2 h-2 rounded-full ${c.dot} ${level === 'avoid' && pulse ? 'animate-pulse2' : ''}`} />
      {c.label}
    </span>
  );
}
