'use server';

import { createClient } from "../../../utils/supabase/client";

export async function seedLessons() {
  const supabase = createClient();
  const lessons = [
    {
      title: 'Introduction to Next.js',
      description: 'Learn the basics of Next.js, a powerful React framework for building server-rendered applications.',
    },
    {
      title: 'Styling in Next.js',
      description: 'Explore different styling options in Next.js, including CSS Modules, Tailwind CSS, and styled-components.',
    },
    {
      title: 'Data Fetching in Next.js',
      description: 'Discover how to fetch data in Next.js using server-side rendering (SSR), static site generation (SSG), and client-side fetching.',
    },
    {
      title: 'Introduction to Supabase',
      description: 'Get started with Supabase, an open-source Firebase alternative, and learn how to use its powerful features like authentication, database, and storage.',
    },
    {
      title: 'Building a simple app with Next.js and Supabase',
      description: 'Learn how to build a full-stack application from scratch using Next.js for the frontend and Supabase for the backend.',
    },
  ];

  const { data, error } = await supabase.from('lessons').insert(lessons);

  if (error) {
    console.error('Error seeding lessons:', error);
    return { success: false, error };
  }

  console.log('Seeded lessons:', data);
  return { success: true };
}
