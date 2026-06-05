import NavBar from '../components/NavBar';
import { LogoMark } from '../components/Logo';
import { navigate } from '../lib/router';
import { Clock, CheckCircle2, Mail } from 'lucide-react';

const STEPS = [
  { icon: <CheckCircle2 size={18} className="text-accent-2" />, title: 'Application received', desc: 'Your profile and local expertise have been saved.' },
  { icon: <Clock size={18} className="text-yellow-500" />, title: 'Under review (24–48 hrs)', desc: 'Our team will verify your local credentials.' },
  { icon: <Mail size={18} className="text-accent" />, title: 'You\'ll hear from us', desc: 'We\'ll email you once your guide profile goes live.' },
];

export default function LocalPending() {
  return (
    <div className="min-h-screen bg-bg">
      <NavBar />
      <div className="max-w-lg mx-auto px-6 pt-32 pb-20 text-center">
        <div className="flex justify-center mb-6">
          <div className="relative">
            <div className="w-20 h-20 rounded-full bg-accent-2/15 flex items-center justify-center">
              <LogoMark size={44} />
            </div>
            <div className="absolute -bottom-1 -right-1 w-7 h-7 bg-accent-2 rounded-full flex items-center justify-center">
              <CheckCircle2 size={14} className="text-white" />
            </div>
          </div>
        </div>

        <h2 className="font-display font-bold text-primary text-3xl mb-3">
          Application submitted!
        </h2>
        <p className="font-sans text-muted leading-relaxed mb-10">
          Welcome to WanderAI. Your local guide application is now in review. Here's what happens next:
        </p>

        <div className="space-y-4 mb-10 text-left">
          {STEPS.map((s, i) => (
            <div key={i} className="flex items-start gap-4 bg-surface border border-border rounded-card p-4">
              <div className="w-9 h-9 rounded-lg bg-bg border border-border flex items-center justify-center shrink-0">
                {s.icon}
              </div>
              <div>
                <p className="font-sans font-semibold text-primary text-sm">{s.title}</p>
                <p className="font-sans text-xs text-muted mt-0.5">{s.desc}</p>
              </div>
            </div>
          ))}
        </div>

        <button
          onClick={() => navigate('/')}
          className="font-sans font-semibold text-sm text-white bg-primary hover:bg-primary-light px-8 py-3.5 rounded-xl transition-colors"
        >
          Explore the App
        </button>
      </div>
    </div>
  );
}
