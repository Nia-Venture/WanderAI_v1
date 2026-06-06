import { supabase } from '../lib/supabase';
import { FunctionsHttpError } from '@supabase/supabase-js';

export async function verifyPin(email: string, pin: string, newPassword: string): Promise<void> {
  const { data, error } = await supabase.functions.invoke('verify-pin', {
    body: { email, pin, newPassword },
  });

  if (error) {
    if (error instanceof FunctionsHttpError && error.context) {
      try {
        const body = await (error.context as Response).json();
        if (body?.error) throw new Error(body.error);
      } catch (parseErr) {
        if (parseErr instanceof Error && parseErr.message !== error.message) throw parseErr;
      }
    }
    throw new Error(error.message ?? 'Failed to verify PIN.');
  }

  if (data?.error) throw new Error(data.error);
}
