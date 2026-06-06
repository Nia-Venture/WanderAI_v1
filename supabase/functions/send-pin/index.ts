import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
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

    const { data: userData } = await supabase.auth.admin.listUsers();
    const userExists = userData?.users?.some(
      (u) => u.email?.toLowerCase() === email.toLowerCase()
    );
    if (!userExists) {
      return new Response(JSON.stringify({ success: true }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const pin = String(Math.floor(100000 + Math.random() * 900000));
    const encoder = new TextEncoder();
    const data = encoder.encode(pin + (Deno.env.get('OTP_SALT') ?? 'wanderai-otp-salt'));
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const pinHash = Array.from(new Uint8Array(hashBuffer))
      .map((b) => b.toString(16).padStart(2, '0')).join('');

    await supabase.from('otp_pins').update({ used: true })
      .eq('email', email.toLowerCase()).eq('used', false);

    const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString();
    await supabase.from('otp_pins').insert({
      email: email.toLowerCase(), pin_hash: pinHash, expires_at: expiresAt,
    });

    const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY');
    if (RESEND_API_KEY) {
      await fetch('https://api.resend.com/emails', {
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
    }

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (err) {
    console.error('send-pin error:', err);
    return new Response(JSON.stringify({ error: 'Failed to send PIN.' }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
