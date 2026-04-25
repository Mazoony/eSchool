'use server';

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";

export async function seedLessons() {
  const supabase = await createClient();

  // Drop the table if it exists
  await supabase.from("lessons").delete().neq("id", "00000000-0000-0000-0000-000000000000");


  const lessonsToInsert = [
    {
      title: "Introduction to Programming",
      description: "Learn the fundamentals of programming, including variables, data types, and control structures.",
    },
    {
      title: "Web Development Basics",
      description: "An introduction to HTML, CSS, and JavaScript, the core technologies for building websites.",
    },
    {
      title: "Advanced JavaScript",
      description: "Dive deeper into JavaScript and learn about concepts like closures, promises, and async/await.",
    },
    {
      title: "React for Beginners",
      description: "Learn the basics of React, a popular JavaScript library for building user interfaces.",
    },
    {
      title: "State Management with Redux",
      description: "Master state management in React applications with Redux.",
    },
    {
      title: "Building APIs with Node.js",
      description: "Learn how to build robust and scalable APIs using Node.js and Express.",
    },
    {
      title: "Database Design and SQL",
      description: "Understand the principles of database design and learn how to write SQL queries.",
    },
    {
      title: "Introduction to Python",
      description: "A beginner-friendly introduction to Python, a versatile and powerful programming language.",
    },
    {
      title: "Data Science with Pandas",
      description: "Learn how to use the Pandas library in Python for data manipulation and analysis.",
    },
  ];

  const { error } = await supabase.from("lessons").insert(lessonsToInsert);

  if (error) {
    console.error("Error seeding lessons:", error);
    return;
  }

  revalidatePath("/lessons");

  console.log("Seeding successful!");
}
