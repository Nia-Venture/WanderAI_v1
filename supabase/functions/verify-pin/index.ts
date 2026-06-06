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
  return users.find((u: { id: string; email: string }) => u.email?.toLowerCase() === email.toLowerCase()) ?? null;
}

async function updateUserPassword(supabaseUrl: string, serviceRoleKey: string, userId: string, password: string) {
  const res = await fetch(`${supabaseUrl}/auth/v1/admin/users/${userId}`, {
    method: 'PUT',
    headers: {
      Authorization: `Bearer ${serviceRoleKey}`,
      apikey: serviceRoleKey,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ password }),
  });
  return res.ok;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { status: 200, headers: corsHeaders });

  try {
    const { email, pin, newPassword } = await req.json();
    if (!email || !pin || !newPassword) {
      return new Response(JSON.stringify({ error: 'email, pin and newPassword are required.' }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    if (newPassword.length < 8) {
      return new Response(JSON.stringify({ error: 'Password must be at least 8 characters.' }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
    const SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

    const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

    // ── Verify PIN hash ─────────────────────────────────────────────────────
    const encoder = new TextEncoder();
    const data = encoder.encode(pin + (Deno.env.get('OTP_SALT') ?? 'wanderai-otp-salt'));
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const pinHash = Array.from(new Uint8Array(hashBuffer))
      .map((b) => b.toString(16).padStart(2, '0')).join('');

    const { data: otpRow } = await supabase
      .from('otp_pins')
      .select('id, expires_at')
      .eq('email', email.toLowerCase())
      .eq('pin_hash', pinHash)
      .eq('used', false)
      .gt('expires_at', new Date().toISOString())
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (!otpRow) {
      return new Response(JSON.stringify({ error: 'Invalid or expired PIN. Please try again.' }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // ── Lookup user via REST API ─────────────────────────────────────────────
    const user = await getUserByEmail(SUPABASE_URL, SERVICE_ROLE_KEY, email);
    if (!user) {
      return new Response(JSON.stringify({ error: 'User not found.' }), {
        status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // ── Update password via REST API ────────────────────────────────────────
    const updated = await updateUserPassword(SUPABASE_URL, SERVICE_ROLE_KEY, user.id, newPassword);
    if (!updated) {
      return new Response(JSON.stringify({ error: 'Failed to update password.' }), {
        status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Mark PIN used only after password update succeeds
    await supabase.from('otp_pins').update({ used: true }).eq('id', otpRow.id);

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (err) {
    console.error('[verify-pin] Unexpected error:', err);
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
