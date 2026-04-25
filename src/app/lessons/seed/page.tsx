
import { seedLessons } from "./actions";

export default function SeedPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900">
      <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-md text-center">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-50 mb-4">Seed Database</h1>
        <p className="text-gray-600 dark:text-gray-300 mb-6">
          Click the button below to seed the database with initial lesson data.
        </p>
        <form action={seedLessons}>
          <button
            type="submit"
            className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
          >
            Seed Lessons
          </button>
        </form>
      </div>
    </div>
  );
}
