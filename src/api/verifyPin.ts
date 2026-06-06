import { supabase } from '../lib/supabase';

export async function verifyPin(email: string, pin: string, newPassword: string): Promise<void> {
  const { data, error } = await supabase.functions.invoke('verify-pin', {
    body: { email, pin, newPassword },
  });
  if (error) throw new Error(error.message ?? 'Failed to verify PIN.');
  if (data?.error) throw new Error(data.error);
}
