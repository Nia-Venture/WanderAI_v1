import NavBar from '../components/NavBar';
import { navigate } from '../lib/router';
import { ArrowRight, Globe, Clock, Star } from 'lucide-react';

const BENEFITS = [
  { icon: <Globe size={18} className="text-accent" />, text: 'Help travellers from all over the world understand your city' },
  { icon: <Clock size={18} className="text-accent-2" />, text: 'Flexible — answer questions in your own time, on your own schedule' },
  { icon: <Star size={18} className="text-primary" />, text: 'Earn from knowledge you already have just by living where you live' },
];

const VERIFICATION_STEPS = [
  { n: '1', title: 'Create your guide account', desc: 'Fill in your profile and tell us about your city expertise.' },
  { n: '2', title: 'Knowledge review (24–48 hrs)', desc: 'Our team verifies your local credentials.' },
  { n: '3', title: 'Go live as a verified guide', desc: 'Travellers heading to your city can start chatting with you.' },
];

export default function BecomeALocal() {
  return (
    <div className="min-h-screen bg-bg">
      <NavBar />

      <div className="max-w-5xl mx-auto px-6 pt-24 pb-20">
        {/* Hero */}
        <div className="text-center mb-14">
          <div className="inline-flex items-center gap-2 bg-surface border border-border rounded-full px-4 py-1.5 mb-6 shadow-card">
            <span className="w-2 h-2 rounded-full bg-accent-2" />
            <span className="font-mono text-xs text-muted">Locals across 38+ cities are already helping travellers</span>
          </div>
          <h1
            className="font-display font-bold text-primary mb-4"
            style={{ fontSize: 'clamp(2rem, 5vw, 3.5rem)', lineHeight: 1.15 }}
          >
            Share your city.{' '}
            <span className="italic text-accent">Earn from what you already know.</span>
          </h1>
          <p className="font-sans text-lg text-muted max-w-xl mx-auto leading-relaxed mb-8">
            You carry more city knowledge in your head than any guidebook. WanderAI lets you
            share it — and get paid for it.
          </p>
          <button
            onClick={() => navigate('/auth?mode=local')}
            className="inline-flex items-center gap-2 bg-accent hover:bg-accent-dark text-white font-sans font-semibold px-8 py-4 rounded-2xl transition-all active:scale-[0.98] shadow-card-hover text-base"
          >
            Apply as a Local Guide
            <ArrowRight size={18} />
          </button>
          <p className="font-sans text-xs text-muted mt-3">
            Already have an account?{' '}
            <button onClick={() => navigate('/auth')} className="text-accent hover:underline">
              Sign in
            </button>
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
          {/* Left: Benefits */}
          <div className="space-y-10">
            <div>
              <h2 className="font-display font-semibold text-primary text-xl mb-5">Why join?</h2>
              <div className="space-y-4">
                {BENEFITS.map((b, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-lg bg-surface border border-border flex items-center justify-center shrink-0">
                      {b.icon}
                    </div>
                    <p className="font-sans text-sm text-text-main leading-relaxed pt-1">{b.text}</p>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h2 className="font-display font-semibold text-primary text-xl mb-2">How it works</h2>
              <p className="font-sans text-sm text-muted mb-5">
                Every guide goes through a quick 3-step verification before going live.
              </p>
              <div className="space-y-3">
                {VERIFICATION_STEPS.map((s) => (
                  <div key={s.n} className="flex items-start gap-4 bg-surface rounded-xl border border-border p-4">
                    <span className="font-mono text-lg font-bold text-accent/40">{s.n}</span>
                    <div>
                      <p className="font-sans font-semibold text-primary text-sm">{s.title}</p>
                      <p className="font-sans text-xs text-muted">{s.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right: CTA card */}
          <div className="bg-primary rounded-card shadow-chat p-8 text-surface">
            <h3 className="font-display font-bold text-2xl mb-3">
              Ready to share your city?
            </h3>
            <p className="font-sans text-surface/70 text-sm leading-relaxed mb-8">
              Join as a verified local guide and start helping travellers experience your city
              the way only you know it.
            </p>

            <div className="space-y-3 mb-8">
              {[
                'Earn per session you help a traveller',
                'Work on your own schedule — no commitments',
                'Build a reputation as a top local expert',
                'Help people avoid tourist traps in real time',
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="w-5 h-5 rounded-full bg-accent-2/20 flex items-center justify-center shrink-0">
                    <div className="w-2 h-2 rounded-full bg-accent-2" />
                  </div>
                  <span className="font-sans text-sm text-surface/80">{item}</span>
                </div>
              ))}
            </div>

            <button
              onClick={() => navigate('/auth?mode=local')}
              className="w-full flex items-center justify-center gap-2 bg-accent hover:bg-accent-dark text-white font-sans font-semibold py-4 rounded-xl transition-all active:scale-[0.98]"
            >
              Create My Guide Account
              <ArrowRight size={16} />
            </button>

            <p className="font-sans text-xs text-surface/40 text-center mt-4">
              Free to join · No upfront costs
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
