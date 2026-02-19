'use client';

import { FiMessageCircle } from 'react-icons/fi';

interface CommentProps {
  comment: {
    id: string;
    text: string;
    author: string;
  };
}

export default function Comment({ comment }: CommentProps) {
  return (
    <div className="flex items-start space-x-4 p-4 border-b border-gray-200 dark:border-gray-700">
      <FiMessageCircle className="text-gray-500 dark:text-gray-400 mt-1" />
      <div>
        <p className="font-semibold text-gray-900 dark:text-gray-50">{comment.author}</p>
        <p className="text-gray-700 dark:text-gray-300">{comment.text}</p>
      </div>
    </div>
  );
}
