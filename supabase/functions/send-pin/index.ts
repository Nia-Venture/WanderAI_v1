import 'jsr:@supabase/functions-js/edge-runtime.d.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const ALLOWED_ORIGIN = Deno.env.get('ALLOWED_ORIGIN') ?? '*';

const corsHeaders = {
  'Access-Control-Allow-Origin': ALLOWED_ORIGIN,
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

async function getUserByEmail(supabaseUrl: string, serviceRoleKey: string, email: string) {
  const res = await fetch(
    `${supabaseUrl}/auth/v1/admin/users?email=${encodeURIComponent(email)}&page=1&per_page=1`,
    { headers: { Authorization: `Bearer ${serviceRoleKey}`, apikey: serviceRoleKey } }
  );
  if (!res.ok) return null;
  const body = await res.json();
  const users = body?.users ?? [];
  return users.find((u: { email: string }) => u.email?.toLowerCase() === email.toLowerCase()) ?? null;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { status: 200, headers: corsHeaders });

  try {
    const { email } = await req.json();
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return new Response(JSON.stringify({ error: 'Valid email required.' }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
    const SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

    const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

    // ── Rate-limit: max 1 PIN per email per 60 seconds ──────────────────────
    const oneMinuteAgo = new Date(Date.now() - 60_000).toISOString();
    const { count: recentCount } = await supabase
      .from('otp_pins')
      .select('id', { count: 'exact', head: true })
      .eq('email', email.toLowerCase())
      .gte('created_at', oneMinuteAgo);

    if ((recentCount ?? 0) > 0) {
      return new Response(
        JSON.stringify({ error: 'Please wait 60 seconds before requesting another PIN.' }),
        { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // ── User lookup via REST API ─────────────────────────────────────────────
    const user = await getUserByEmail(SUPABASE_URL, SERVICE_ROLE_KEY, email);

    // Always return success to prevent email enumeration
    if (!user) {
      return new Response(JSON.stringify({ success: true }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // ── Generate & store PIN ────────────────────────────────────────────────
    const pin = String(Math.floor(100000 + Math.random() * 900000));
    const encoder = new TextEncoder();
    const data = encoder.encode(pin + (Deno.env.get('OTP_SALT') ?? 'wanderai-otp-salt'));
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const pinHash = Array.from(new Uint8Array(hashBuffer))
      .map((b) => b.toString(16).padStart(2, '0')).join('');

    // Invalidate any previous unused PINs for this email
    await supabase.from('otp_pins').update({ used: true })
      .eq('email', email.toLowerCase()).eq('used', false);

    const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString();
    await supabase.from('otp_pins').insert({
      email: email.toLowerCase(), pin_hash: pinHash, expires_at: expiresAt,
    });

    // ── Send email via Resend ───────────────────────────────────────────────
    const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY');
    if (!RESEND_API_KEY) {
      console.error('[send-pin] RESEND_API_KEY secret is not set.');
      return new Response(
        JSON.stringify({ error: 'Email service not configured. Contact support.' }),
        { status: 503, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const emailRes = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'WanderAI <noreply@wanderai.app>',
        to: [email],
        subject: `Your WanderAI reset PIN: ${pin}`,
        html: `
          <div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:32px;">
            <h2 style="color:#1A3A4A;margin-bottom:8px;">Reset your WanderAI password</h2>
            <p style="color:#666;margin-bottom:24px;">
              Enter this 6-digit PIN in the app. It expires in <strong>10 minutes</strong>.
            </p>
            <div style="background:#f5f5f5;border-radius:12px;padding:24px;text-align:center;margin-bottom:24px;">
              <span style="font-family:monospace;font-size:40px;font-weight:bold;letter-spacing:12px;color:#1A3A4A;">
                ${pin}
              </span>
            </div>
            <p style="color:#999;font-size:13px;">
              If you did not request this, you can safely ignore this email.
            </p>
          </div>`,
      }),
    });

    const resendBody = await emailRes.text();
    if (!emailRes.ok) {
      console.error('[send-pin] Resend error', emailRes.status, resendBody);
      return new Response(
        JSON.stringify({ error: `Failed to send PIN email (Resend ${emailRes.status}): ${resendBody}` }),
        { status: 502, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('[send-pin] Resend accepted email for', email, '| response:', resendBody);
    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (err) {
    console.error('[send-pin] Unexpected error:', err);
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
