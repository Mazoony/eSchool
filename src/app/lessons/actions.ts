'use server';

import { createClient } from "../../utils/supabase/server";

export async function getLessons() {
  const supabase = createClient();
  const { data: lessons, error } = await supabase.from('lessons').select('*');

  if (error) {
    console.error('Error fetching lessons:', error);
    return [];
  }

  return lessons || [];
}