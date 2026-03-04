'use client';

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../supabase';
import Post from './Post';
import { useAuth } from '../AuthContext';

// Step 1: Simplified the data structure
interface PostData {
  id: string;
  content: string;
  authorName: string;
}

export default function SocialFeed() {
  const { user } = useAuth();
  const [posts, setPosts] = useState<PostData[]>([]);
  const [newPost, setNewPost] = useState('');
  const [loading, setLoading] = useState(true);

  // Step 2: Simplified the data fetching
  const fetchPosts = useCallback(async () => {
    setLoading(true);
    
    const { data, error } = await supabase
      .from('posts')
      .select(`
        id,
        content,
        author:profiles ( full_name )
      `)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching posts:', error);
      setPosts([]);
      setLoading(false);
      return;
    }

    const postsData: PostData[] = data ? data.map(post => ({
      id: post.id,
      content: post.content,
      authorName: post.author?.full_name || 'Anonymous',
    })) : [];

    setPosts(postsData);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchPosts();

    // Step 3: Simplified realtime subscription (removed 'likes')
    const channel = supabase
      .channel('realtime-posts')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'posts' },
        () => fetchPosts()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchPosts]);

  const handleCreatePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPost.trim() === '' || !user) return;

    const { error } = await supabase.from('posts').insert([
      { content: newPost, user_id: user.id },
    ]);

    if (error) {
      console.error('Error creating post:', error);
    } else {
      setNewPost('');
    }
  };

  return (
    <div>
      {user && (
        <form onSubmit={handleCreatePost} className="mb-8">
          <textarea
            value={newPost}
            onChange={(e) => setNewPost(e.target.value)}
            placeholder="What's on your mind?"
            className="w-full p-4 bg-white dark:bg-gray-800 rounded-lg shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-300"
            rows={4}
          />
          <button type="submit" className="mt-4 px-6 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors">
            Post
          </button>
        </form>
      )}
      {loading ? (
        <div className="text-center text-gray-500">Loading posts...</div>
      ) : posts.length === 0 ? (
        <div className="text-center text-gray-500 py-16 bg-white dark:bg-gray-800 rounded-lg shadow-md">
          <h2 className="text-2xl font-semibold mb-2 text-gray-800 dark:text-white">No posts yet</h2>
          <p className="text-gray-600 dark:text-gray-400">Be the first one to share something!</p>
        </div>
      ) : (
        <div>
          {/* Step 4: Simplified the Post component call */}
          {posts.map(post => (
            <Post 
              key={post.id} 
              id={post.id} 
              content={post.content} 
              authorName={post.authorName}
            />
          ))}
        </div>
      )}
    </div>
  );
}
