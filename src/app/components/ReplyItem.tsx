'use client';

import { formatDistanceToNow } from 'date-fns';
import { Reply } from '../types';
import Image from 'next/image';
import PaidBadge from './PaidBadge';
import ExpandableText from './ExpandableText';

interface ReplyItemProps {
  reply: Reply;
}

export default function ReplyItem({ reply }: ReplyItemProps) {
  return (
    <div id={`comment-${reply.id}`} className="scroll-mt-24 flex items-start space-x-3 mt-3">
      <Image src={reply.commenter.avatar_url || '/user.svg'} alt={reply.commenter.full_name || 'User'} width={32} height={32} className="w-8 h-8 rounded-full" priority />
      <div className="flex-1">
        <div className="flex items-center">
          <span className="inline-flex items-center gap-1 font-semibold text-xs text-gray-900 dark:text-white">
            {reply.commenter.full_name}
            <PaidBadge isPaid={reply.commenter.is_paid} />
          </span>
          <span className="text-xs text-gray-500 dark:text-gray-400 ml-2">
            {formatDistanceToNow(new Date(reply.created_at), { addSuffix: true })}
          </span>
        </div>
        <ExpandableText
          text={reply.content}
          className="mt-1 text-sm text-gray-800 dark:text-gray-300"
        />
      </div>
    </div>
  );
}
