import NavBar from '../components/NavBar';
import HeroSearch from '../components/HeroSearch';
import { LogoMark } from '../components/Logo';
import { CreditCard, Shield, Map } from 'lucide-react';
import { navigate } from '../lib/router';

const PAIN_POINTS = [
  {
    icon: <CreditCard size={22} className="text-accent" />,
    label: 'Local Payments',
    desc: 'Know which apps, cards & cash rules apply',
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

// African sunset — acacia silhouette, South Africa golden hour (Pexels #11811982)
const HERO_IMAGE =
  'https://images.pexels.com/photos/11811982/pexels-photo-11811982.jpeg?auto=compress&cs=tinysrgb&w=1920';

export default function Landing() {
  return (
    <div className="min-h-screen bg-bg">
      <NavBar transparent />

      {/* Hero — full-screen African sunset */}
      <section className="relative min-h-screen flex flex-col items-center justify-center px-6 pt-20 pb-16 overflow-hidden">
        {/* Background image */}
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: `url(${HERO_IMAGE})` }}
        />
        {/* Overlays */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/35 to-black/70" />
        <div className="absolute inset-0 bg-gradient-to-t from-primary/40 via-transparent to-transparent" />

        <div className="relative w-full max-w-3xl mx-auto text-center">
          {/* Large logo mark in hero */}
          <div className="flex justify-center mb-6">
            <div className="relative">
              <LogoMark size={72} />
              <div className="absolute -inset-3 rounded-full bg-white/5 blur-xl" />
            </div>
          </div>

          {/* Brand name */}
          <div className="flex items-baseline justify-center gap-1 mb-2">
            <span className="font-display font-bold text-white tracking-tight"
              style={{ fontSize: 'clamp(1.5rem, 4vw, 2.5rem)' }}>
              Wander
            </span>
            <span className="font-display font-bold text-accent tracking-tight"
              style={{ fontSize: 'clamp(1.5rem, 4vw, 2.5rem)' }}>
              AI
            </span>
          </div>

          {/* Badge */}
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-4 py-1.5 mb-7">
            <span className="w-2 h-2 rounded-full bg-accent-2 animate-pulse" />
            <span className="font-mono text-xs text-white/80">Live locals in 38+ cities</span>
          </div>

          <h1
            className="font-display font-bold text-white leading-[1.1] mb-5 drop-shadow-lg"
            style={{ fontSize: 'clamp(2.6rem, 7vw, 5rem)' }}
          >
            Travel Like a{' '}
            <span className="italic text-accent">Native.</span>
          </h1>

          <p className="font-sans text-lg text-white/80 max-w-xl mx-auto leading-relaxed mb-10 drop-shadow">
            Get a local's instinct for any city — in 60 seconds. Stop travelling like a tourist.
            Start living like a local.
          </p>

          <HeroSearch />

          {/* Featured cities */}
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

        {/* Scroll hint */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1.5 opacity-50">
          <span className="font-mono text-xs text-white tracking-widest uppercase">Explore</span>
          <div className="w-px h-10 bg-gradient-to-b from-white to-transparent" />
        </div>
      </section>

      {/* Pain points */}
      <section className="px-6 py-20 max-w-4xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {PAIN_POINTS.map((p) => (
            <div
              key={p.label}
              className="bg-surface rounded-card border border-border shadow-card p-6 text-center hover:shadow-card-hover transition-shadow"
            >
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
          From landing page to local intel in 60 seconds
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

      {/* Footer */}
      <footer className="border-t border-border px-6 py-8 bg-bg">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <LogoMark size={24} />
            <p className="font-sans text-sm text-muted">
              WanderAI — Travel Like a Native. Powered by Gemini 1.5 Flash.
            </p>
          </div>
          <button
            onClick={() => navigate('/become-a-local')}
            className="font-sans text-sm text-accent hover:underline"
          >
            Become a verified local guide
          </button>
        </div>
      </footer>
    </div>
  );
}
