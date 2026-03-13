'use client';

import { useState } from 'react';
import Image from 'next/image';
import { supabase } from '../supabase';
import { useAuth } from '../AuthContext';

interface CreatePostProps {
  onPostCreated: (newPost: any) => void;
}

export default function CreatePost({ onPostCreated }: CreatePostProps) {
  const { user, userProfile } = useAuth();
  const [content, setContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleCreatePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || content.trim() === '') return;

    setIsSubmitting(true);

    const { data, error } = await supabase
      .from('posts')
      .insert({ content, user_id: user.id })
      .select('*, profile:profiles(*)')
      .single();

    setIsSubmitting(false);

    if (error) {
      console.error('Error creating post:', error.message);
      alert('Error creating post. Please try again.');
    } else {
      onPostCreated(data);
      setContent('');
    }
  };

  if (!user) return null;

  return (
    <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md mb-6">
      <div className="flex items-start space-x-4">
        <Image
          src={userProfile?.avatar_url || '/user.svg'}
          alt={userProfile?.full_name || 'User'}
          width={40}
          height={40}
          className="rounded-full"
        />
        <form onSubmit={handleCreatePost} className="flex-1">
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="What's on your mind?"
            className="w-full p-2 bg-gray-100 dark:bg-gamma-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            rows={3}
          ></textarea>
          <div className="flex justify-end mt-2">
            <button 
              type="submit" 
              className="px-6 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 disabled:bg-blue-400"
              disabled={isSubmitting || content.trim() === ''}
            >
              {isSubmitting ? 'Posting...' : 'Post'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
