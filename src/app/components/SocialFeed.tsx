'use client';

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../supabase';
import PostItem from './PostItem';
import CreatePost from './CreatePost';
import { Post } from '../types';

export default function SocialFeed() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchPosts = useCallback(async () => {
    const { data, error } = await supabase
      .from('posts')
      .select(`
        id, content, created_at, user_id,
        profiles!user_id ( id, full_name, avatar_url ),
        likes ( user_id ),
        comments ( id, content, created_at, user_id, parent_id, profiles!user_id ( id, full_name, avatar_url ), comment_likes(user_id) )
      `)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching posts:', error.message);
      setPosts([]);
    } else {
      setPosts(data || []);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    // Initial fetch
    fetchPosts();

    // Set up real-time subscription
    const channel = supabase
      .channel('public:posts')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'posts' }, 
        (payload) => {
          if (payload.eventType === 'DELETE') {
            // Remove deleted post from UI instantly
            setPosts(currentPosts => currentPosts.filter(post => post.id !== payload.old.id));
          } else {
            // For new or updated posts, re-fetch the whole list to get complete data
            fetchPosts();
          }
        }
      )
      .subscribe();

    // Cleanup subscription on component unmount
    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchPosts]);

  const handlePostCreated = (newPost: Post) => {
    setPosts(currentPosts => [newPost, ...currentPosts]);
  };

  return (
    <div className="space-y-4">
      <CreatePost onPostCreated={handlePostCreated} />
      {loading && posts.length === 0 ? (
        <p>Loading posts...</p>
      ) : (
        posts.map(post => (
          <PostItem key={post.id} post={post} />
        ))
      )}
    </div>
  );
}
