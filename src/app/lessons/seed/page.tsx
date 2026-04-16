'use client';

import { useState } from 'react';
import { seedLessons } from './actions';

export default function SeedPage() {
  const [status, setStatus] = useState('');

  const handleSeed = async () => {
    setStatus('Seeding...');
    const result = await seedLessons();
    if (result.success) {
      setStatus('Seeding successful!');
    } else {
      setStatus(`Seeding failed: ${result.error?.message}`)
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 flex items-center justify-center">
      <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-md text-center">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-50 mb-4">Seed Lessons</h1>
        <button
          onClick={handleSeed}
          className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
        >
          Seed Lessons
        </button>
        {status && <p className="mt-4 text-gray-600 dark:text-gray-300">{status}</p>}
      </div>
    </div>
  );
}
