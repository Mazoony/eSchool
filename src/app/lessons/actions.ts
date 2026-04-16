'use server';

import { createClient } from "@/utils/supabase/client";

export async function getLessons() {
  const supabase = createClient();
  const { data: lessons, error } = await supabase.from('lessons').select('*');

  if (error) {
    console.error('Error fetching lessons:', error);
    return [];
  }

  return lessons || [];
}

export async function getLesson(id: string) {
    const supabase = createClient();
    const { data: lesson, error } = await supabase
        .from('lessons')
        .select('*')
        .eq('id', id)
        .single();

    if (error) {
        console.error('Error fetching lesson:', error);
        return null;
    }

    return lesson;
}
