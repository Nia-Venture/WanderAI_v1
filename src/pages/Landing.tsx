import NavBar from '../components/NavBar';
import HeroSearch from '../components/HeroSearch';
import { LogoMark } from '../components/Logo';
import { CreditCard, Shield, Map, Check } from 'lucide-react';
import { navigate } from '../lib/router';

const PAIN_POINTS = [
  {
    icon: <CreditCard size={22} className="text-accent" />,
    label: 'Local Payments',
    desc: 'Know which apps, cards & cash norms apply',
  },
  {
    icon: <Shield size={22} className="text-accent-2" />,
    label: 'Stay Safe',
    desc: 'Neighbourhood ratings & scam alerts',
  },
  {
    icon: <Map size={22} className="text-primary" />,
    label: 'Move Like a Local',
    desc: 'Transit tips, language kit & insider routes',
  },
];

const FEATURED_CITIES = ['Dubai', 'Tokyo', 'London', 'Bangkok', 'Paris', 'Nairobi'];

const HERO_IMAGE =
  'https://images.pexels.com/photos/11811982/pexels-photo-11811982.jpeg?auto=compress&cs=tinysrgb&w=1920';

const TESTIMONIALS = [
  {
    quote: 'I landed in Dubai knowing exactly which metro card to get, which exchange counter to avoid, and where to eat my first night. WanderAI is insane.',
    author: 'Ama Owusu',
    city: 'Dubai, UAE',
    initials: 'AO',
    avatar_color: '#2AB8A8',
  },
  {
    quote: 'Tokyo felt totally approachable because of WanderAI. The IC card tip alone saved me 30 minutes of confusion at Shinjuku station.',
    author: 'Luca Ferreira',
    city: 'Tokyo, Japan',
    initials: 'LF',
    avatar_color: '#1A3A4A',
  },
  {
    quote: 'The scam alerts for Bangkok were spot-on. I was warned about the tuk-tuk gem store trick and literally saw it happen to another tourist.',
    author: 'Priya Singh',
    city: 'Bangkok, Thailand',
    initials: 'PS',
    avatar_color: '#E8622A',
  },
];

const FREE_FEATURES = ['City briefings for 38+ destinations', 'Language survival kit', 'Safety ratings & scam alerts', 'AI-powered local intel'];
const PRO_FEATURES = ['Chat with verified local guides', 'Personalised trip plan', 'Offline briefing PDF export', 'Priority support'];

export default function Landing() {
  return (
    <div className="min-h-screen bg-bg">
      <NavBar transparent />

      {/* Hero */}
      <section className="relative min-h-screen flex flex-col items-center justify-center px-6 pt-20 pb-16 overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: `url(${HERO_IMAGE})` }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/35 to-black/70" />
        <div className="absolute inset-0 bg-gradient-to-t from-primary/40 via-transparent to-transparent" />

        <div className="relative w-full max-w-3xl mx-auto text-center">
          <div className="flex justify-center mb-6">
            <div className="relative">
              <LogoMark size={72} />
              <div className="absolute -inset-3 rounded-full bg-white/5 blur-xl" />
            </div>
          </div>

          <div className="flex items-baseline justify-center gap-1 mb-2">
            <span className="font-display font-bold text-white tracking-tight" style={{ fontSize: 'clamp(1.5rem, 4vw, 2.5rem)' }}>Wander</span>
            <span className="font-display font-bold text-accent tracking-tight" style={{ fontSize: 'clamp(1.5rem, 4vw, 2.5rem)' }}>AI</span>
          </div>

          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-4 py-1.5 mb-7">
            <span className="w-2 h-2 rounded-full bg-accent-2 animate-pulse" />
            <span className="font-mono text-xs text-white/80">Live locals in 38+ cities</span>
          </div>

          <h1 className="font-display font-bold text-white leading-[1.1] mb-5 drop-shadow-lg" style={{ fontSize: 'clamp(2.6rem, 7vw, 5rem)' }}>
            Travel Like a{' '}
            <span className="italic text-accent">Native.</span>
          </h1>

          <p className="font-sans text-lg text-white/80 max-w-xl mx-auto leading-relaxed mb-10 drop-shadow">
            Get a local's instinct for any city — in 60 seconds. Stop travelling like a tourist.
          </p>

          <HeroSearch />

          <div className="mt-8 flex flex-wrap justify-center gap-2">
            {FEATURED_CITIES.map((city) => (
              <button
                key={city}
                onClick={() => navigate(`/city/${city.toLowerCase()}`)}
                className="font-sans text-sm text-white/70 hover:text-white border border-white/20 hover:border-white/50 bg-white/10 backdrop-blur-sm px-4 py-1.5 rounded-full transition-all"
              >
                {city}
              </button>
            ))}
          </div>
        </div>

        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1.5 opacity-50">
          <span className="font-mono text-xs text-white tracking-widest uppercase">Explore</span>
          <div className="w-px h-10 bg-gradient-to-b from-white to-transparent" />
        </div>
      </section>

      {/* Pain points */}
      <section className="px-6 py-20 max-w-4xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {PAIN_POINTS.map((p) => (
            <div key={p.label} className="bg-surface rounded-card border border-border shadow-card p-6 text-center hover:shadow-card-hover transition-shadow">
              <div className="w-12 h-12 rounded-xl bg-bg flex items-center justify-center mx-auto mb-3 border border-border">
                {p.icon}
              </div>
              <h3 className="font-display font-semibold text-primary mb-1">{p.label}</h3>
              <p className="font-sans text-sm text-muted leading-relaxed">{p.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="px-6 pb-24 max-w-3xl mx-auto text-center">
        <h2 className="font-display font-semibold text-primary text-3xl mb-3">
          From arrival to local intel in 60 seconds
        </h2>
        <p className="font-sans text-muted mb-12">
          The knowledge every local carries, made accessible to you — before you even land.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { step: '01', title: 'Search your city', desc: 'Type any city on earth and land instantly on your briefing.' },
            { step: '02', title: 'Read your briefing', desc: 'AI-generated local intel: payments, safety, scams & hidden gems.' },
            { step: '03', title: 'Chat with a local', desc: 'Ask a verified local your specific question — in real time.' },
          ].map((s) => (
            <div key={s.step} className="flex flex-col items-center gap-3">
              <span className="font-mono text-2xl font-bold text-accent/30">{s.step}</span>
              <h4 className="font-display font-semibold text-primary">{s.title}</h4>
              <p className="font-sans text-sm text-muted leading-relaxed">{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Testimonials */}
      <section className="px-6 py-20 bg-surface border-y border-border">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <p className="font-mono text-xs text-accent uppercase tracking-widest mb-2">Travellers love it</p>
            <h2 className="font-display font-semibold text-primary text-3xl">Real trips. Real feedback.</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {TESTIMONIALS.map((t) => (
              <div key={t.author} className="bg-bg rounded-card border border-border p-6 flex flex-col gap-4">
                <p className="font-sans text-sm italic text-text-main leading-relaxed flex-1">
                  &ldquo;{t.quote}&rdquo;
                </p>
                <div className="flex items-center gap-3 pt-3 border-t border-border">
                  <div
                    className="w-9 h-9 rounded-full flex items-center justify-center text-white font-sans font-semibold text-xs shrink-0"
                    style={{ backgroundColor: t.avatar_color }}
                  >
                    {t.initials}
                  </div>
                  <div>
                    <p className="font-sans font-semibold text-primary text-sm">{t.author}</p>
                    <p className="font-mono text-xs text-muted">{t.city}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="px-6 py-24 max-w-4xl mx-auto text-center" id="pricing">
        <p className="font-mono text-xs text-accent uppercase tracking-widest mb-2">Pricing</p>
        <h2 className="font-display font-semibold text-primary text-3xl mb-3">Simple, honest pricing</h2>
        <p className="font-sans text-muted mb-12">Start for free. Upgrade when you're ready.</p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl mx-auto">
          {/* Free tier */}
          <div className="bg-surface border-2 border-accent rounded-2xl p-8 relative text-left">
            <div className="absolute -top-3 left-1/2 -translate-x-1/2">
              <span className="bg-accent text-white font-sans font-semibold text-xs px-3 py-1 rounded-full shadow">Always free</span>
            </div>
            <p className="font-mono text-xs text-accent uppercase tracking-widest mb-2">Free</p>
            <div className="flex items-baseline gap-1 mb-1">
              <span className="font-display font-bold text-4xl text-primary">$0</span>
              <span className="font-sans text-sm text-muted">/ forever</span>
            </div>
            <p className="font-sans text-sm text-muted mb-6">Everything a smart traveller needs.</p>
            <ul className="space-y-3 mb-8">
              {FREE_FEATURES.map((f) => (
                <li key={f} className="flex items-center gap-2.5">
                  <Check size={15} className="text-accent shrink-0" />
                  <span className="font-sans text-sm text-text-main">{f}</span>
                </li>
              ))}
            </ul>
            <button
              onClick={() => navigate('/auth?mode=signup')}
              className="w-full bg-accent hover:bg-accent-dark text-white font-sans font-semibold text-sm py-3 rounded-xl transition-all"
            >
              Get Started Free
            </button>
          </div>

          {/* Pro tier — coming soon */}
          <div className="bg-surface border border-border rounded-2xl p-8 relative text-left opacity-60">
            <div className="absolute -top-3 left-1/2 -translate-x-1/2">
              <span className="bg-muted text-white font-sans font-semibold text-xs px-3 py-1 rounded-full">Coming soon</span>
            </div>
            <p className="font-mono text-xs text-muted uppercase tracking-widest mb-2">Pro</p>
            <div className="flex items-baseline gap-1 mb-1">
              <span className="font-display font-bold text-4xl text-primary">$9</span>
              <span className="font-sans text-sm text-muted">/ month</span>
            </div>
            <p className="font-sans text-sm text-muted mb-6">For the serious explorer.</p>
            <ul className="space-y-3 mb-8">
              {PRO_FEATURES.map((f) => (
                <li key={f} className="flex items-center gap-2.5">
                  <Check size={15} className="text-muted shrink-0" />
                  <span className="font-sans text-sm text-text-main">{f}</span>
                </li>
              ))}
            </ul>
            <button
              disabled
              className="w-full bg-bg border border-border text-muted font-sans font-semibold text-sm py-3 rounded-xl cursor-not-allowed"
            >
              Join Waitlist
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border bg-bg px-6 py-12">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-10">
          {/* Col 1: Brand */}
          <div>
            <div className="flex items-center gap-2.5 mb-3">
              <LogoMark size={28} />
              <div className="flex items-baseline">
                <span className="font-display font-bold text-lg text-primary">Wander</span>
                <span className="font-display font-bold text-lg text-accent">AI</span>
              </div>
            </div>
            <p className="font-sans text-sm text-muted leading-relaxed max-w-xs">
              Travel Like a Native. Get a local's instinct for any city in 60 seconds.
            </p>
            <p className="font-sans text-xs text-muted mt-4">© 2026 WanderAI</p>
          </div>

          {/* Col 2: Product */}
          <div>
            <p className="font-mono text-xs text-muted uppercase tracking-widest mb-4">Product</p>
            <ul className="space-y-3">
              <li>
                <button onClick={() => navigate('/')} className="font-sans text-sm text-text-main hover:text-accent transition-colors">
                  Explore Cities
                </button>
              </li>
              <li>
                <button onClick={() => navigate('/become-a-local')} className="font-sans text-sm text-text-main hover:text-accent transition-colors">
                  Become a Local Guide
                </button>
              </li>
              <li>
                <button onClick={() => { const el = document.getElementById('pricing'); el?.scrollIntoView({ behavior: 'smooth' }); }} className="font-sans text-sm text-text-main hover:text-accent transition-colors">
                  Pricing
                </button>
              </li>
            </ul>
          </div>

          {/* Col 3: Legal */}
          <div>
            <p className="font-mono text-xs text-muted uppercase tracking-widest mb-4">Legal & Info</p>
            <ul className="space-y-3">
              <li>
                <button onClick={() => navigate('/privacy')} className="font-sans text-sm text-text-main hover:text-accent transition-colors">
                  Privacy Policy
                </button>
              </li>
              <li>
                <button onClick={() => navigate('/terms')} className="font-sans text-sm text-text-main hover:text-accent transition-colors">
                  Terms of Service
                </button>
              </li>
              <li>
                <a href="mailto:hello@wanderai.app" className="font-sans text-sm text-text-main hover:text-accent transition-colors">
                  Contact
                </a>
              </li>
            </ul>
          </div>
        </div>
      </footer>
    </div>
  );
}
