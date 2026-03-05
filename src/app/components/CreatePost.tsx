'use client';

import { useState } from 'react';
import Image from 'next/image';
import { supabase } from '../supabase';
import { useAuth } from '../AuthContext';
import { Post } from '../types';

interface CreatePostProps {
  onPostCreated: (post: Post) => void;
}

export default function CreatePost({ onPostCreated }: CreatePostProps) {
  const { user } = useAuth();
  const [content, setContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleCreatePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || content.trim() === '') return;

    setIsSubmitting(true);

    const { data, error } = await supabase
      .from('posts')
      .insert({ content, user_id: user.id })
      .select('*, profiles:profiles!user_id(id, full_name, avatar_url), likes(user_id), comments(*, profiles!user_id(id, full_name, avatar_url), comment_likes(user_id))')
      .single();

    setIsSubmitting(false);

    if (error) {
      console.error('Error creating post:', error.message);
      alert('Error creating post. Please try again.');
    } else if (data) {
      // @ts-expect-error: Supabase data has an implicit any type
      onPostCreated(data);
      setContent('');
    }
  };

  if (!user) return null;

  return (
    <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md mb-6">
      <div className="flex items-start space-x-4">
        <Image
          src={user.profile?.avatar_url || '/user.svg'}
          alt={user.profile?.full_name || 'user'}
          className="w-12 h-12 rounded-full"
          width={48}
          height={48}
        />
        <div className="w-full">
          <p className="font-semibold text-gray-900 dark:text-gray-100">{user.profile?.full_name}</p>
          <form onSubmit={handleCreatePost} className="mt-2">
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder={`What's on your mind?`}
              className="w-full p-2 bg-gray-100 dark:bg-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows={3}
              required
            />
            <div className="flex justify-end mt-2">
              <button 
                type="submit"
                disabled={isSubmitting}
                className="px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed">
                {isSubmitting ? 'Posting...' : 'Post'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
