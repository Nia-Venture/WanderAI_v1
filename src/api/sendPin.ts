import { supabase } from '../lib/supabase';
import { FunctionsHttpError } from '@supabase/supabase-js';

export async function sendPin(email: string): Promise<void> {
  const { data, error } = await supabase.functions.invoke('send-pin', { body: { email } });

  if (error) {
    if (error instanceof FunctionsHttpError && error.context) {
      try {
        const body = await (error.context as Response).json();
        if (body?.error) throw new Error(body.error);
      } catch (parseErr) {
        if (parseErr instanceof Error && parseErr.message !== error.message) throw parseErr;
      }
    }
    throw new Error(error.message ?? 'Failed to send PIN.');
  }

  if (data?.error) throw new Error(data.error);
}
