import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const ALLOWED_ORIGIN = Deno.env.get('ALLOWED_ORIGIN') ?? '*';

const corsHeaders = {
  'Access-Control-Allow-Origin': ALLOWED_ORIGIN,
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  try {
    const { email } = await req.json();
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return new Response(JSON.stringify({ error: 'Valid email required.' }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

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

    // ── User lookup via direct API (replaces broken listUsers pagination) ───
    const { data: { user }, error: lookupError } =
      await supabase.auth.admin.getUserByEmail(email.toLowerCase());

    // Always return success to prevent email enumeration
    if (lookupError || !user) {
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
      console.error('[send-pin] RESEND_API_KEY secret is not set in Supabase dashboard. ' +
        'Go to: Supabase Dashboard → Edge Functions → Secrets → Add RESEND_API_KEY');
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

    if (!emailRes.ok) {
      const errBody = await emailRes.text();
      console.error('[send-pin] Resend API error:', emailRes.status, errBody);
      return new Response(
        JSON.stringify({ error: 'Failed to send PIN email. Please try again.' }),
        { status: 502, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (err) {
    console.error('[send-pin] Unexpected error:', err);
    return new Response(JSON.stringify({ error: 'Failed to send PIN.' }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
