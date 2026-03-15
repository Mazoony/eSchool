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
        author:profiles!user_id( id, full_name, avatar_url ),
        likes ( user_id ),
        comments ( id, content, created_at, user_id, parent_id, commenter:profiles!user_id( id, full_name, avatar_url ), comment_likes(user_id) )
      `)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching posts:', error.message);
    } else {
      const normalized = data.map((p: any) => ({
        ...p,
        author: Array.isArray(p.author) ? p.author[0] ?? null : p.author ?? null,
        comments: (p.comments ?? []).map((c: any) => ({
          ...c,
          commenter: Array.isArray(c.commenter) ? c.commenter[0] ?? null : c.commenter ?? null,
        })),
      }));
      setPosts(normalized as Post[]);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
      fetchPosts();
    }, [fetchPosts]);

    const handlePostCreated = (newPost: Post) => {
      setPosts(prevPosts => [newPost, ...prevPosts]);
    };

    const handleDeletePost = (postId: string) => {
      setPosts(prevPosts => prevPosts.filter(p => p.id !== postId));
    };

    return (
      <div className="w-full max-w-xl mx-auto">
         <CreatePost onPostCreated={handlePostCreated} />
        {loading ? (
          <p className="text-center text-gray-500">Loading feed...</p>
        ) : (
          <div className="space-y-4">
            {posts.map(post => (
              <PostItem key={post.id} post={post} onDelete={handleDeletePost}/>
            ))}
          </div>
        )}
      </div>
    );
}
