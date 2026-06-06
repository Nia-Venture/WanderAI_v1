import { supabase } from '../lib/supabase';

export async function sendPin(email: string): Promise<void> {
  const redirectTo = `${window.location.origin}/auth?mode=reset`;
  const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), { redirectTo });
  if (error) throw new Error(error.message);
}
