'use client';

import { useEffect, useState, useCallback } from 'react';
import { supabase } from '../supabase';
import PostItem from './PostItem';
import { Post } from '../types';
import CreatePost from './CreatePost';

export default function SocialFeed() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchPost = async (postId: string) => {
    const { data, error } = await supabase()
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
      .eq('id', postId)
      .single();

    if (error) {
      console.error('Error fetching post:', error.message);
      return null;
    }
    return data;
  };

  const fetchPosts = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase()
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

  const handleNewPost = useCallback(async (payload: any) => {
    const newPost = await fetchPost(payload.new.id);
    if (newPost) {
      setPosts(prevPosts => [newPost, ...prevPosts]);
    }
  }, []);

  const handleDelete = (postId: string) => {
    setPosts(posts.filter((p) => p.id !== postId));
  };

  useEffect(() => {
    fetchPosts();

    const channel = supabase()
      .channel('social-feed')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'posts' }, handleNewPost)
      .subscribe();

    return () => {
      supabase().removeChannel(channel);
    };
  }, [fetchPosts, handleNewPost]);

  if (loading) {
    return <div className="text-center p-8">Loading posts...</div>;
  }

  return (
    <div className="space-y-6 max-w-2xl mx-auto py-8">
      <CreatePost onPostCreated={() => {}} />
      {posts.map(post => (
        <PostItem key={post.id} post={post} onDelete={handleDelete} />
      ))}
    </div>
  );
}
