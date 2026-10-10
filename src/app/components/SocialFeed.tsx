'use client';

import { useEffect, useRef, useState } from 'react';
import { subscribePosts } from '@/utils/supabase/data';
import PostItem from './PostItem';
import { Post } from '../types';
import CreatePost from './CreatePost';

export default function SocialFeed() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const didScrollToNotification = useRef(false);

  const [error, setError] = useState<string | null>(null);

  const handleDelete = (postId: string) => {
    setPosts((previous) => previous.filter((post) => post.id !== postId));
  };

  useEffect(() => {
    return subscribePosts(
      (newPosts) => {
        setPosts(newPosts);
        setLoading(false);
        setError(null);
      },
      (loadError) => {
        console.error('Error loading social feed:', loadError);
        setError(loadError.message);
        setLoading(false);
      },
    );
  }, []);

  useEffect(() => {
    if (loading || didScrollToNotification.current || !window.location.hash) return;
    const target = document.getElementById(decodeURIComponent(window.location.hash.slice(1)));
    if (target) {
      target.scrollIntoView({ behavior: 'smooth', block: 'center' });
      didScrollToNotification.current = true;
    }
  }, [loading, posts]);

  if (loading) {
    return <div className="text-center p-8">Loading posts...</div>;
  }

  return (
    <div className="space-y-6 max-w-2xl mx-auto py-8">
      <CreatePost />
      {error && <p className="text-center text-red-600" role="alert">{error}</p>}
      {posts.map(post => (
        <PostItem key={post.id} post={post} onDelete={handleDelete} />
      ))}
    </div>
  );
}
