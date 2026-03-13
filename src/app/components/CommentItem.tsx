'use client';

import Image from 'next/image';
import { useAuth } from '../AuthContext';
import { usePost } from './PostContext';
import { FaHeart, FaRegHeart, FaReply, FaTrash } from 'react-icons/fa';
import { Comment } from '../types'; // Import the correct Comment type

interface CommentItemProps {
  comment: Comment;
  onReply: (commentId: string) => void;
}

export default function CommentItem({ comment, onReply }: CommentItemProps) {
  const { user } = useAuth();
  const { likeComment, deleteComment, likingCommentId } = usePost();

  const userHasLiked = user ? (comment.comment_likes || []).some(like => like.user_id === user.id) : false;
  const likesCount = comment.comment_likes?.length || 0;

  const isLiking = likingCommentId === comment.id;

  const handleDelete = () => {
    if (window.confirm("Are you sure you want to delete this comment?")) {
      deleteComment(comment.id);
    }
  };

  // Safely access profile information
  const commenter = comment.commenter;

  if (!commenter) {
    return <div>Loading comment...</div>
  }

  return (
    <div className="flex items-start space-x-3 py-3">
      <Image 
        src={commenter.avatar_url || '/user.svg'} 
        alt={commenter.full_name || 'user'} 
        className="w-10 h-10 rounded-full"
        width={40} 
        height={40} 
      />
      <div className="flex-1">
        <div className="bg-gray-100 dark:bg-gray-700 rounded-lg px-4 py-2">
          <p className="font-semibold text-sm text-gray-900 dark:text-gray-100">{commenter.full_name}</p>
          <p className="text-gray-700 dark:text-gray-300">{comment.content}</p>
        </div>
        <div className="flex items-center space-x-4 text-xs text-gray-500 dark:text-gray-400 mt-1">
          <button 
            onClick={() => likeComment(comment.id)}
            disabled={isLiking}
            className={`flex items-center space-x-1 hover:text-red-500 disabled:opacity-50`}>
            {userHasLiked ? <FaHeart className="text-red-500" /> : <FaRegHeart />}
            <span>{likesCount} {likesCount === 1 ? 'Like' : 'Likes'}</span>
          </button>
          <button onClick={() => onReply(comment.id)} className="hover:text-blue-500"><FaReply /> Reply</button>
          {user && user.id === comment.user_id && (
            <button onClick={handleDelete} className="hover:text-red-500"><FaTrash /> Delete</button>
          )}
          <span className="text-xs text-gray-400 dark:text-gray-500">
            {new Date(comment.created_at).toLocaleDateString()}
          </span>
        </div>
      </div>
    </div>
  );
}
