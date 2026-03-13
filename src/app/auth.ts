'use server';

import { supabase } from './supabase';

export async function resetPassword(email: string) {
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: '/reset-password',
  });

  if (error) {
    throw new Error(error.message);
  }
}
