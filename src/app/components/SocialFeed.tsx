'use client';

import { useEffect, useState, useCallback } from 'react';
import { supabase } from '../supabase';
import PostItem from './PostItem';
import CreatePost from './CreatePost';
import { Post } from '../types';

export default function SocialFeed() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchPosts = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('posts')
      .select(`
        *,
        author:profiles!user_id(*),
        likes(user_id),
        comments!post_id(
          *,
          commenter:profiles!user_id(*),
          comment_likes(user_id)
        )
      `)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching posts:', error.message);
    } else {
      setPosts(data as Post[]);
    }
    setLoading(false);
  }, []);

  const handleNewPost = (post: Post) => {
    setPosts(prevPosts => [post, ...prevPosts]);
  };

  useEffect(() => {
    fetchPosts();

    const channel = supabase
      .channel('social-feed')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'posts' }, (payload) => {
        // Instead of refetching, prepend the new post to the list
        handleNewPost(payload.new as Post);
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  if (loading) {
    return <div className="text-center p-8">Loading posts...</div>;
  }

  return (
    <div className="space-y-6 max-w-2xl mx-auto py-8">
      <CreatePost onPostCreated={handleNewPost} />
      {posts.map(post => (
        <PostItem key={post.id} post={post} />
      ))}
    </div>
  );
}
