'use client';

import { useState } from 'react';
import { useAuth } from '../AuthContext';
import { usePost } from './PostContext';
import { Comment } from '../types';
import { HeartIcon, TrashIcon, ArrowUturnLeftIcon } from '@heroicons/react/24/solid';
import { formatDistanceToNow } from 'date-fns';

interface CommentItemProps {
  comment: Comment;
}

export default function CommentItem({ comment }: CommentItemProps) {
  const { user } = useAuth();
  const { deleteComment, likeComment, replyToComment, likingCommentId } = usePost();
  const [isReplying, setIsReplying] = useState(false);
  const [replyContent, setReplyContent] = useState('');

  const userHasLikedComment = comment.comment_likes?.some(like => like.user_id === user?.id);
  const isLiking = likingCommentId === comment.id;

  const handleReplySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (replyContent.trim()) {
      await replyToComment(comment.id, replyContent);
      setReplyContent('');
      setIsReplying(false);
    }
  };

  return (
    <div className="flex items-start space-x-3 py-3 border-t border-gray-200 dark:border-gray-700">
      <img src={comment.commenter.avatar_url} alt={comment.commenter.full_name} className="w-10 h-10 rounded-full" />
      <div className="flex-1">
        <div className="flex items-center justify-between">
          <div>
            <span className="font-semibold text-sm text-gray-900 dark:text-white">{comment.commenter.full_name}</span>
            <span className="text-xs text-gray-500 dark:text-gray-400 ml-2">
              {formatDistanceToNow(new Date(comment.created_at), { addSuffix: true })}
            </span>
          </div>
          {user?.id === comment.user_id && (
            <div className="flex items-center space-x-2">
              <button onClick={() => deleteComment(comment.id)} className="text-gray-400 hover:text-red-500">
                <TrashIcon className="h-4 w-4" />
              </button>
            </div>
          )}
        </div>
        <p className="text-sm text-gray-800 dark:text-gray-300 mt-1">{comment.content}</p>
        <div className="flex items-center space-x-4 mt-2 text-xs">
          <button 
            onClick={() => likeComment(comment.id)} 
            disabled={isLiking}
            className={`flex items-center space-x-1 font-semibold ${userHasLikedComment ? 'text-red-500' : 'text-gray-500 hover:text-red-500'}`}
          >
            <HeartIcon className="h-4 w-4" />
            <span>{comment.comment_likes?.length || 0}</span>
          </button>
          <button onClick={() => setIsReplying(!isReplying)} className="flex items-center space-x-1 text-gray-500 font-semibold hover:text-blue-500">
            <ArrowUturnLeftIcon className="h-4 w-4" />
            <span>Reply</span>
          </button>
        </div>
        {isReplying && (
          <form onSubmit={handleReplySubmit} className="mt-2">
            <input 
              type="text"
              value={replyContent}
              onChange={e => setReplyContent(e.target.value)}
              placeholder="Write a reply..."
              className="w-full bg-gray-100 dark:bg-gray-700 rounded-full px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </form>
        )}
      </div>
    </div>
  );
}
