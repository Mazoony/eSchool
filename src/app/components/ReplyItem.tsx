'use client';

import { formatDistanceToNow } from 'date-fns';
import { Reply } from '../types';

interface ReplyItemProps {
  reply: Reply;
}

export default function ReplyItem({ reply }: ReplyItemProps) {
  return (
    <div className="flex items-start space-x-3 mt-3">
      <img src={reply.commenter.avatar_url} alt={reply.commenter.full_name} className="w-8 h-8 rounded-full" />
      <div className="flex-1">
        <div className="flex items-center">
          <span className="font-semibold text-xs text-gray-900 dark:text-white">{reply.commenter.full_name}</span>
          <span className="text-xs text-gray-500 dark:text-gray-400 ml-2">
            {formatDistanceToNow(new Date(reply.created_at), { addSuffix: true })}
          </span>
        </div>
        <p className="text-sm text-gray-800 dark:text-gray-300 mt-1">{reply.content}</p>
      </div>
    </div>
  );
}
