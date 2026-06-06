import { supabase } from '../lib/supabase';

export async function sendPin(email: string): Promise<void> {
  const { data, error } = await supabase.functions.invoke('send-pin', { body: { email } });
  if (error) throw new Error(error.message ?? 'Failed to send PIN.');
  if (data?.error) throw new Error(data.error);
}
