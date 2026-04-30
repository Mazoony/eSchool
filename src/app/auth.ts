'use server';

import { createClient } from '@/utils/supabase/server';

export async function resetPassword(email: string) {
  const supabase = await createClient();
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: '/reset-password',
  });

  if (error) {
    throw new Error(error.message);
  }
}
