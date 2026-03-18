'use client';

import { useState } from 'react';
import { supabase } from '../supabase';
import { useAuth } from '../AuthContext';
import { Post } from '../types';

interface CreatePostProps {
  onPostCreated: (post: Post) => void;
}

export default function CreatePost({ onPostCreated }: CreatePostProps) {
  const { user, profile } = useAuth(); // Assuming profile is available in AuthContext
  const [content, setContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() || !user || !profile) return;

    setIsSubmitting(true);
    
    // Optimistic update
    const newPost: Post = {
      id: `temp-${Date.now()}`,
      created_at: new Date().toISOString(),
      content,
      user_id: user.id,
      author: profile, // Use profile from AuthContext
      likes: [],
      comments: [],
    };
    onPostCreated(newPost);
    setContent('');

    const { error } = await supabase
      .from('posts')
      .insert({ content, user_id: user.id });

    if (error) {
      console.error('Error creating post:', error.message);
      // Revert optimistic update if there's an error
      // (Implementation of revert logic would depend on how you manage state)
    }
    setIsSubmitting(false);
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md mb-6">
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="What's on your mind?"
        className="w-full p-2 bg-gray-100 dark:bg-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        rows={3}
      />
      <div className="flex justify-end mt-2">
        <button 
          type="submit"
          className="px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 disabled:bg-blue-400"
          disabled={isSubmitting || !content.trim()}
        >
          {isSubmitting ? 'Posting...' : 'Post'}
        </button>
      </div>
    </form>
  );
}
