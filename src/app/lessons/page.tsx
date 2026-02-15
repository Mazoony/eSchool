"use client";
import Image from 'next/image';

export default function Lessons() {
  const lessons = [
    {
      title: "Introduction to English Grammar",
      description: "Learn the basics of English grammar, including parts of speech and sentence structure.",
      thumbnail: "https://placehold.co/600x400/000000/FFFFFF?text=Video+1"
    },
    {
      title: "Mastering English Pronunciation",
      description: "Improve your pronunciation with tips and tricks for common English sounds.",
      thumbnail: "https://placehold.co/600x400/000000/FFFFFF?text=Video+2"
    },
    {
      title: "Advanced English Conversation",
      description: "Take your conversational skills to the next level with advanced phrases and idioms.",
      thumbnail: "https://placehold.co/600x400/000000/FFFFFF?text=Video+3"
    },
    {
      title: "Business English Essentials",
      description: "Learn the key vocabulary and phrases for professional success.",
      thumbnail: "https://placehold.co/600x400/000000/FFFFFF?text=Video+4"
    },
    {
      title: "English for Travel",
      description: "Get ready for your next trip with essential English for travelers.",
      thumbnail: "https://placehold.co/600x400/000000/FFFFFF?text=Video+5"
    },
    {
      title: "Writing Effective Emails in English",
      description: "Learn how to write clear, concise, and professional emails in English.",
      thumbnail: "https://placehold.co/600x400/000000/FFFFFF?text=Video+6"
    }
  ];

  return (
    <main className="flex flex-col items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900 p-8">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white sm:text-5xl md:text-6xl">
          Video Lessons
        </h1>
        <p className="mt-3 text-base text-gray-500 dark:text-gray-400 sm:mt-5 sm:text-lg sm:max-w-xl sm:mx-auto md:mt-5 md:text-xl">
          Browse through our collection of English video lessons. New lessons are added weekly.
        </p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
        {lessons.map((lesson, index) => (
          <div key={index} className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden">
            <div className="relative h-56">
              <Image
                src={lesson.thumbnail}
                alt={lesson.title}
                layout="fill"
                objectFit="cover"
              />
            </div>
            <div className="p-6">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">{lesson.title}</h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">{lesson.description}</p>
              <button className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors">
                Watch Now
              </button>
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}