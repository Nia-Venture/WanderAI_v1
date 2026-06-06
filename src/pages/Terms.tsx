import NavBar from '../components/NavBar';
import { navigate } from '../lib/router';

export default function Terms() {
  return (
    <div className="min-h-screen bg-bg">
      <NavBar />
      <div className="pt-24 pb-20 px-6">
        <div className="max-w-3xl mx-auto">
          <div className="mb-10">
            <p className="font-mono text-xs text-accent uppercase tracking-widest mb-2">Legal</p>
            <h1 className="font-display font-bold text-3xl text-primary mb-2">Terms of Service</h1>
            <p className="font-sans text-sm text-muted">Last updated: June 2026</p>
          </div>

          <div className="space-y-8">
            {[
              {
                title: '1. Acceptance',
                body: 'By accessing or using WanderAI, you agree to be bound by these Terms of Service and our Privacy Policy. If you do not agree to these terms, please do not use the service. WanderAI reserves the right to update these terms at any time, with changes taking effect upon posting.',
              },
              {
                title: '2. Use of Service',
                body: 'WanderAI is intended for personal, non-commercial use. You may not use the platform to scrape data, resell briefings, or engage in any activity that disrupts the service. You are responsible for maintaining the confidentiality of your account credentials.',
              },
              {
                title: '3. Local Guide Rules',
                body: 'Local guides who apply to join WanderAI must provide accurate information about their residency and expertise. When a live local is unavailable, AI generates responses informed by verified local knowledge profiles. WanderAI does not guarantee the accuracy of any advice provided through the chat feature and recommends independent verification for safety-critical decisions.',
              },
              {
                title: '4. Disclaimers',
                body: 'WanderAI provides city briefings for informational purposes only. Travel conditions, safety situations, payment norms, and local regulations may change rapidly. Always verify critical safety or legal information with official local sources before making travel decisions. WanderAI is not liable for any loss or damage arising from reliance on briefing content.',
              },
              {
                title: '5. Governing Law',
                body: 'These Terms are governed by and construed in accordance with applicable law. Any disputes arising under these Terms shall be subject to the exclusive jurisdiction of the relevant courts. If any provision of these Terms is found to be unenforceable, the remaining provisions will remain in full force.',
              },
            ].map((s) => (
              <section key={s.title} className="bg-surface border border-border rounded-2xl p-6">
                <h2 className="font-display font-semibold text-primary text-lg mb-3">{s.title}</h2>
                <p className="font-sans text-sm text-text-main leading-relaxed">{s.body}</p>
              </section>
            ))}
          </div>

          <div className="mt-10 pt-8 border-t border-border">
            <button onClick={() => navigate('/')} className="font-sans text-sm text-accent hover:underline">
              ← Back to WanderAI
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
