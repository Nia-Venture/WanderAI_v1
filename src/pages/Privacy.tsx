import NavBar from '../components/NavBar';
import { navigate } from '../lib/router';

export default function Privacy() {
  return (
    <div className="min-h-screen bg-bg">
      <NavBar />
      <div className="pt-24 pb-20 px-6">
        <div className="max-w-3xl mx-auto">
          <div className="mb-10">
            <p className="font-mono text-xs text-accent uppercase tracking-widest mb-2">Legal</p>
            <h1 className="font-display font-bold text-3xl text-primary mb-2">Privacy Policy</h1>
            <p className="font-sans text-sm text-muted">Last updated: June 2026</p>
          </div>

          <div className="prose-content space-y-8">
            {[
              {
                title: '1. Data We Collect',
                body: 'We collect information you provide directly to us when you create an account, such as your name and email address. We also collect information about your use of WanderAI, including the cities you search, briefings you view, and chats you engage in. Certain technical data such as browser type, IP address, and device information is collected automatically.',
              },
              {
                title: '2. How We Use It',
                body: 'We use the information we collect to provide, maintain, and improve WanderAI. This includes generating personalised city briefings, matching you with local guides, tracking your visited cities dashboard, and sending important service updates. We do not sell your personal data to third parties.',
              },
              {
                title: '3. Third Parties',
                body: 'WanderAI uses Supabase for authentication and database storage, and Google Gemini for AI-powered city briefing generation. Each service has its own privacy policy. We do not share personally identifiable information with advertisers.',
              },
              {
                title: '4. Your Rights',
                body: 'You have the right to access, correct, or delete your personal data at any time. You can update your display name in Account Settings or contact us directly. To request full data deletion, email us at the address below.',
              },
              {
                title: '5. Contact',
                body: 'For any privacy-related questions or requests, please contact us at: hello@wanderai.app',
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
