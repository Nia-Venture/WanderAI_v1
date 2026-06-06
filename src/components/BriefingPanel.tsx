import type { CityBriefing } from '../types/briefing';
import SafetyBadge from './SafetyBadge';
import {
  CreditCard,
  Shield,
  AlertTriangle,
  MessageSquare,
  Lightbulb,
} from 'lucide-react';

interface BriefingPanelProps {
  briefing: CityBriefing;
  cityName: string;
  generatedAt?: Date;
}

function Card({
  icon,
  title,
  accent,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  accent: string;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-surface rounded-card border border-border shadow-card hover:shadow-card-hover transition-shadow duration-200 p-6 animate-slide-up">
      <div className="flex items-center gap-3 mb-4">
        <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${accent}`}>
          {icon}
        </div>
        <h3 className="font-display font-semibold text-primary text-lg">{title}</h3>
      </div>
      {children}
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-0.5 py-2 border-b border-border last:border-0">
      <span className="font-mono text-xs text-muted uppercase tracking-wide">{label}</span>
      <span className="font-sans text-sm text-text-main leading-relaxed">{value}</span>
    </div>
  );
}

export default function BriefingPanel({ briefing, cityName, generatedAt }: BriefingPanelProps) {
  return (
    <div className="space-y-5">
      {/* Payments */}
      <Card
        icon={<CreditCard size={18} className="text-accent" />}
        title="Payments & Money"
        accent="bg-accent/10"
      >
        <Row label="Local payment apps" value={briefing.payments.apps.join(', ')} />
        <Row label="Foreign cards" value={briefing.payments.foreign_cards} />
        <Row label="ATM tip" value={briefing.payments.atm_tip} />
        <Row label="Cash norms" value={briefing.payments.cash_norms} />
      </Card>

      {/* Safety */}
      <Card
        icon={<Shield size={18} className="text-accent-2" />}
        title="Neighbourhood Safety"
        accent="bg-accent-2/10"
      >
        <div className="space-y-3 mb-3">
          {briefing.safety.neighbourhoods.map((n) => (
            <div key={n.name} className="flex items-start gap-3">
              <SafetyBadge level={n.level} pulse />
              <div>
                <span className="font-sans font-semibold text-sm text-primary">{n.name}</span>
                <p className="font-sans text-xs text-muted leading-relaxed mt-0.5">{n.note}</p>
              </div>
            </div>
          ))}
        </div>
        <div className="mt-3 pt-3 border-t border-border space-y-2">
          <Row label="Best for first-timers" value={briefing.safety.best_for_first_timers} />
          <Row label="Avoid after dark" value={briefing.safety.avoid_after_dark} />
          <Row label="Key safety tip" value={briefing.safety.key_tip} />
        </div>
      </Card>

      {/* Scams */}
      <Card
        icon={<AlertTriangle size={18} className="text-yellow-600" />}
        title="Scam & Tourist Trap Alerts"
        accent="bg-yellow-50"
      >
        <div className="space-y-4">
          {briefing.scams.map((scam, i) => (
            <div key={i} className="relative pl-4 border-l-2 border-yellow-300">
              <p className="font-sans font-semibold text-sm text-primary">{scam.name}</p>
              <p className="font-sans text-xs text-text-main leading-relaxed mt-0.5">{scam.description}</p>
              <p className="font-sans text-xs text-accent-2 mt-1">
                <span className="font-semibold">How locals avoid it:</span> {scam.how_locals_avoid}
              </p>
            </div>
          ))}
        </div>
      </Card>

      {/* Language */}
      <Card
        icon={<MessageSquare size={18} className="text-primary" />}
        title="Language Survival Kit"
        accent="bg-primary/10"
      >
        <div className="space-y-2 mb-4">
          {briefing.language.phrases.map((p, i) => (
            <div key={i} className="flex items-start gap-3 py-1.5 border-b border-border last:border-0">
              <div className="flex-1">
                <span className="font-display font-semibold text-primary text-sm">{p.phrase}</span>
                <span className="font-mono text-xs text-muted ml-2">/{p.phonetic}/</span>
              </div>
              <span className="font-sans text-xs text-text-main text-right">{p.meaning}</span>
            </div>
          ))}
        </div>
        {briefing.language.transport_vocab.length > 0 && (
          <div className="mb-3">
            <p className="font-mono text-xs text-muted uppercase tracking-wide mb-2">Transport vocab</p>
            <div className="flex flex-wrap gap-2">
              {briefing.language.transport_vocab.map((v, i) => (
                <span key={i} className="font-mono text-xs bg-primary/10 text-primary px-2.5 py-1 rounded-md">{v}</span>
              ))}
            </div>
          </div>
        )}
        <p className="font-sans text-xs text-muted italic border-t border-border pt-3">{briefing.language.script_tip}</p>
      </Card>

      {/* Insider Tips */}
      <Card
        icon={<Lightbulb size={18} className="text-accent" />}
        title="Local Insider Tips"
        accent="bg-accent/10"
      >
        <ul className="space-y-3 mb-3">
          {briefing.insider_tips.tips.map((tip, i) => (
            <li key={i} className="flex gap-3">
              <span className="font-mono text-xs font-bold text-accent mt-0.5">{String(i + 1).padStart(2, '0')}</span>
              <span className="font-sans text-sm text-text-main leading-relaxed">{tip}</span>
            </li>
          ))}
        </ul>
        <div className="mt-3 pt-3 border-t border-border">
          <p className="font-mono text-xs text-muted uppercase tracking-wide mb-1">Cultural etiquette</p>
          <p className="font-sans text-sm text-text-main leading-relaxed">{briefing.insider_tips.etiquette_tip}</p>
        </div>
      </Card>

      {generatedAt && (
        <p className="font-mono text-xs text-muted text-right pt-1">
          Updated {generatedAt.toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' })}
        </p>
      )}
    </div>
  );
}
