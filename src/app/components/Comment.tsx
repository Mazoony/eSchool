'use client';

import { useState, useMemo } from 'react';
import { FiHeart, FiMessageCircle } from 'react-icons/fi';
import { usePost } from './PostContext';
import { useAuth } from '../AuthContext';
import { Comment as CommentType } from '../types';

interface CommentProps {
  comment: CommentType;
}

export default function Comment({ comment }: CommentProps) {
  const { user } = useAuth();
  const { likeComment, replyToComment } = usePost();
  const [showReplyForm, setShowReplyForm] = useState(false);
  const [replyContent, setReplyContent] = useState('');

  const likesCount = useMemo(() => comment.comment_likes?.length || 0, [comment.comment_likes]);
  const userHasLiked = useMemo(() => user && comment.comment_likes?.some(like => like.user_id === user.id), [user, comment.comment_likes]);

  const handleLike = async () => {
    await likeComment(comment.id);
  };

  const handleReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (replyContent.trim()) {
      await replyToComment(comment.id, replyContent);
      setReplyContent('');
      setShowReplyForm(false);
    }
  };

  return (
    <div className="flex items-start space-x-4 p-4 border-b border-gray-200 dark:border-gray-700">
      <FiMessageCircle className="text-gray-500 dark:text-gray-400 mt-1" />
      <div>
        <p className="font-semibold text-gray-900 dark:text-gray-50">{comment.profiles.full_name}</p>
        <p className="text-gray-700 dark:text-gray-300">{comment.content}</p>
        <div className="flex items-center space-x-4 mt-2">
          <button onClick={handleLike} className={`flex items-center space-x-1 ${userHasLiked ? 'text-red-500' : 'text-gray-500'} hover:text-red-500`}>
            <FiHeart />
            <span>{likesCount}</span>
          </button>
          <button onClick={() => setShowReplyForm(!showReplyForm)} className="flex items-center space-x-1 text-gray-500 hover:text-blue-500">
            <FiMessageCircle />
            <span>Reply</span>
          </button>
        </div>
        {showReplyForm && (
          <form onSubmit={handleReply} className="mt-4">
            <textarea
              value={replyContent}
              onChange={(e) => setReplyContent(e.target.value)}
              className="w-full p-2 border rounded-lg focus:outline-none focus:border-blue-500 dark:bg-gray-800 dark:text-gray-200"
              placeholder="Write a reply..."
            />
            <button type="submit" className="mt-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600">
              Submit Reply
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
