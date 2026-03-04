'use client';

interface PostProps {
  id: string;
  content: string;
  authorName: string;
}

export default function Post({ id, content, authorName }: PostProps) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6 transition-all duration-300 hover:shadow-xl">
      <div className="flex items-center mb-4">
        {/* Placeholder for a profile picture */}
        <div className="w-12 h-12 bg-gray-300 dark:bg-gray-700 rounded-full mr-4"></div>
        <div>
          <h3 className="font-bold text-lg text-gray-900 dark:text-white">{authorName}</h3>
        </div>
      </div>
      <p className="text-gray-800 dark:text-gray-300 text-base">
        {content}
      </p>
    </div>
  );
}
