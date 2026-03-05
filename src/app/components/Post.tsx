'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useAuth } from '../AuthContext';
import { usePost } from './PostContext';
import { HeartIcon, ChatBubbleOvalLeftIcon, TrashIcon } from '@heroicons/react/24/outline';
import { HeartIcon as HeartIconSolid } from '@heroicons/react/24/solid';
import CommentItem from './CommentItem'; // Changed import

const timeAgo = (dateString: string): string => {
  const date = new Date(dateString);
  const now = new Date();
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  let interval = seconds / 31536000;
  if (interval > 1) return Math.floor(interval) + " years ago";
  interval = seconds / 2592000;
  if (interval > 1) return Math.floor(interval) + " months ago";
  interval = seconds / 86400;
  if (interval > 1) return Math.floor(interval) + " days ago";
  interval = seconds / 3600;
  if (interval > 1) return Math.floor(interval) + " hours ago";
  interval = seconds / 60;
  if (interval > 1) return Math.floor(interval) + " minutes ago";
  return Math.floor(seconds) + " seconds ago";
};

export default function Post() {
  const { user } = useAuth();
  const { post, comments, likesCount, userHasLiked, addComment, toggleLike, deletePost, replyToComment } = usePost(); // Added replyToComment
  const [newComment, setNewComment] = useState('');
  const [replyingTo, setReplyingTo] = useState<string | null>(null);

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newComment.trim() === '') return;
    if (replyingTo) {
      await replyToComment(replyingTo, newComment);
      setReplyingTo(null);
    } else {
      await addComment(newComment);
    }
    setNewComment('');
  };

  const handleDeletePost = async () => {
    if (window.confirm("Are you sure you want to delete this post?")) {
      await deletePost();
    }
  };

  const placeholderAvatar = '/user.svg';

  return (
    <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md">
      <div className="flex items-center mb-4">
        <Link href={`/profile/${post.profiles.id}`}>
          <Image 
            src={post.profiles.avatar_url || placeholderAvatar}
            alt={`${post.profiles.full_name}'s avatar`}
            width={40}
            height={40}
            className="rounded-full mr-3 cursor-pointer"
          />
        </Link>
        <div className="flex-1">
          <Link href={`/profile/${post.profiles.id}`}>
            <p className="font-bold text-gray-900 dark:text-gray-100 cursor-pointer">{post.profiles.full_name}</p>
          </Link>
          <p className="text-xs text-gray-500 dark:text-gray-400">{timeAgo(post.created_at)}</p>
        </div>
        {user && user.id === post.user_id && (
            <button onClick={handleDeletePost} className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700">
                <TrashIcon className="h-5 w-5 text-gray-500 dark:text-gray-400" />
            </button>
        )}
      </div>

      <p className="text-gray-800 dark:text-gray-200 mb-4">{post.content}</p>

      <div className="flex items-center space-x-4">
        <button onClick={toggleLike} className="flex items-center space-x-1 text-gray-500 hover:text-red-500">
          {userHasLiked ? <HeartIconSolid className="h-6 w-6 text-red-500" /> : <HeartIcon className="h-6 w-6" />}
          <span>{likesCount}</span>
        </button>
        <div className="flex items-center space-x-1 text-gray-500">
          <ChatBubbleOvalLeftIcon className="h-6 w-6" />
          <span>{comments.length}</span>
        </div>
      </div>

      <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
        {user && (
          <form onSubmit={handleAddComment} className="flex space-x-4 mb-4">
            <input 
              type="text" 
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder={replyingTo ? "Write a reply..." : "Write a comment..."}
              className="w-full p-2 bg-gray-100 dark:bg-gamma-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button type="submit" className="px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700">
              {replyingTo ? 'Reply' : 'Comment'}
            </button>
          </form>
        )}
        <div className="space-y-4">
          {comments.map(comment => (
            <CommentItem key={comment.id} comment={comment} onReply={setReplyingTo}/>
          ))}
        </div>
      </div>
    </div>
  );
}
