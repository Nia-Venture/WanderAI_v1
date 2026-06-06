import { supabase } from '../lib/supabase';

// Called after user clicks the recovery link in email — Supabase has already
// established a recovery session, so we just update the password directly.
export async function verifyPin(_email: string, _pin: string, newPassword: string): Promise<void> {
  const { error } = await supabase.auth.updateUser({ password: newPassword });
  if (error) throw new Error(error.message);
}
