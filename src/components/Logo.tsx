interface LogoMarkProps {
  size?: number;
}

export function LogoMark({ size = 40 }: LogoMarkProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 40 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Globe background */}
      <circle cx="20" cy="20" r="20" fill="#1A3A4A" />

      {/* Globe grid — latitude lines */}
      <ellipse cx="20" cy="20" rx="20" ry="7.5" stroke="white" strokeWidth="0.6" strokeOpacity="0.18" fill="none" />
      <ellipse cx="20" cy="13.5" rx="15" ry="5" stroke="white" strokeWidth="0.5" strokeOpacity="0.12" fill="none" />
      <ellipse cx="20" cy="26.5" rx="15" ry="5" stroke="white" strokeWidth="0.5" strokeOpacity="0.12" fill="none" />

      {/* Globe grid — meridians */}
      <path d="M20 0 Q32 10 32 20 Q32 30 20 40" stroke="white" strokeWidth="0.5" strokeOpacity="0.13" fill="none" />
      <path d="M20 0 Q8 10 8 20 Q8 30 20 40" stroke="white" strokeWidth="0.5" strokeOpacity="0.13" fill="none" />

      {/* Flight path arc */}
      <path d="M6 30 Q12 6 35 10" stroke="#E8622A" strokeWidth="2.4" fill="none" strokeLinecap="round" />

      {/* Departure dot — teal with glow ring */}
      <circle cx="6" cy="30" r="3.5" fill="#2AB8A8" fillOpacity="0.25" />
      <circle cx="6" cy="30" r="2.2" fill="#2AB8A8" />
      <circle cx="6" cy="30" r="1" fill="white" />

      {/* Airplane at destination — top-down silhouette, rotate ~75° to follow arc */}
      <g transform="translate(35,10) rotate(75)">
        <path
          d="M0,-5.5 L1.5,-1 L5.5,1.5 L2.5,2 L2,5 L0,4 L-2,5 L-2.5,2 L-5.5,1.5 L-1.5,-1 Z"
          fill="white"
        />
      </g>
    </svg>
  );
}

interface LogoProps {
  size?: 'sm' | 'md' | 'lg';
  inverted?: boolean;
}

export default function Logo({ size = 'md', inverted = false }: LogoProps) {
  const markSize = size === 'sm' ? 28 : size === 'lg' ? 56 : 36;
  const textClass =
    size === 'sm'
      ? 'text-base'
      : size === 'lg'
      ? 'text-3xl'
      : 'text-xl';

  return (
    <div className="flex items-center gap-2.5">
      <LogoMark size={markSize} />
      <div className="flex items-baseline gap-0">
        <span
          className={`font-display font-bold ${textClass} tracking-tight ${
            inverted ? 'text-white' : 'text-primary'
          }`}
        >
          Wander
        </span>
        <span
          className={`font-display font-bold ${textClass} tracking-tight text-accent`}
        >
          AI
        </span>
      </div>
    </div>
  );
}
