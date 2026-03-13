'use client';

import { createContext, useContext, useState, ReactNode, useCallback, useEffect } from 'react';
import { supabase } from '../supabase';
import { useAuth } from '../AuthContext';
import { Post as PostType, Comment as CommentType, Like } from '../types';
import { PostgrestError } from '@supabase/supabase-js';

interface PostContextType {
  post: PostType;
  comments: CommentType[];
  likesCount: number;
  userHasLiked: boolean;
  addComment: (content: string) => Promise<void>;
  toggleLike: () => Promise<void>;
  deletePost: () => Promise<{ error: PostgrestError | null }>;
  deleteComment: (commentId: string) => Promise<void>;
  likeComment: (commentId: string) => Promise<void>;
  replyToComment: (commentId: string, content: string) => Promise<void>;
  likingCommentId: string | null;
}

const PostContext = createContext<PostContextType | undefined>(undefined);

export const PostProvider = ({ post: initialPost, children }: { post: PostType; children: ReactNode }) => {
  const { user } = useAuth();
  const [post, setPost] = useState<PostType>(initialPost);
  const [comments, setComments] = useState<CommentType[]>(initialPost.comments || []);
  const [likesCount, setLikesCount] = useState<number>(initialPost.likes?.length || 0);
  const [userHasLiked, setUserHasLiked] = useState<boolean>(false);
  const [likingCommentId, setLikingCommentId] = useState<string | null>(null);

  const fetchPostData = useCallback(async () => {
    const { data, error } = await supabase
      .from('posts')
      .select(`*, profiles!inner(*), likes(user_id), comments!post_id(*, profiles!inner(*), comment_likes(user_id))`)
      .eq('id', initialPost.id)
      .single();

    if (error) {
      console.error("Error fetching post data:", error);
    } else if (data) {
      const postData = data as PostType;
      setPost(postData);
      setComments(postData.comments || []);
      setLikesCount(postData.likes?.length || 0);
      if (user) {
        setUserHasLiked((postData.likes || []).some((like: Like) => like.user_id === user.id));
      }
    }
  }, [initialPost.id, user]);

  useEffect(() => {
    setPost(initialPost);
    setComments(initialPost.comments || []);
    setLikesCount(initialPost.likes?.length || 0);
    if (user) {
      setUserHasLiked((initialPost.likes || []).some((like: Like) => like.user_id === user.id));
    }
  }, [initialPost, user]);

  useEffect(() => {
    const channel = supabase
      .channel(`post-${post.id}`)
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'likes', filter: `post_id=eq.${post.id}` }, 
        () => fetchPostData()
      )
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'comments', filter: `post_id=eq.${post.id}` }, 
        () => fetchPostData()
      )
       .on('postgres_changes',
        { event: '*', schema: 'public', table: 'comment_likes'},
        () => fetchPostData()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [post.id, fetchPostData]);

  const addComment = useCallback(async (content: string) => {
    if (!user) return;

    const { error } = await supabase.from('comments').insert({ post_id: post.id, user_id: user.id, content });

    if (error) {
      console.error("Error adding comment:", error.message);
    } else {
        fetchPostData();
    }
  }, [post.id, user, fetchPostData]);

  const toggleLike = useCallback(async () => {
    if (!user) return;

    const originallyLiked = userHasLiked;
    const originalLikesCount = likesCount;

    // Optimistically update the UI
    setUserHasLiked(!originallyLiked);
    setLikesCount(originallyLiked ? likesCount - 1 : likesCount + 1);

    if (originallyLiked) {
      const { error } = await supabase.from('likes').delete().match({ post_id: post.id, user_id: user.id });
      if (error) {
        console.error("Error unliking post:", error.message);
        // If there's an error, revert the UI state
        setUserHasLiked(originallyLiked);
        setLikesCount(originalLikesCount);
      }
    } else {
      const { error } = await supabase.from('likes').insert({ post_id: post.id, user_id: user.id });
      if (error) {
        console.error("Error liking post:", error.message);
        // If there's an error, revert the UI state
        setUserHasLiked(originallyLiked);
        setLikesCount(originalLikesCount);
      }
    }
  }, [post.id, user, userHasLiked, likesCount]);

  const deletePost = useCallback(async () => {
    if (!user || user.id !== post.user_id) {
        return { error: { message: "Permission denied" } as PostgrestError };
    }
    return await supabase.from('posts').delete().match({ id: post.id });
  }, [post.id, post.user_id, user]);

  const deleteComment = useCallback(async (commentId: string) => {
    if (!user) return;

    const commentToDelete = comments.find(c => c.id === commentId);
    if (!commentToDelete || commentToDelete.user_id !== user.id) {
      console.error("Permission denied to delete comment");
      return;
    }

    const { error } = await supabase.from('comments').delete().match({ id: commentId, user_id: user.id });

    if (error) {
      console.error("Error deleting comment:", error.message);
    } else {
        fetchPostData();
    }
  }, [user, comments, fetchPostData]);

  const likeComment = useCallback(async (commentId: string) => {
    if (!user || likingCommentId) return;

    const originalComments = comments.map(c => ({...c, comment_likes: [...(c.comment_likes || [])]}));
    const commentIndex = comments.findIndex(c => c.id === commentId);
    if (commentIndex === -1) return;

    const comment = comments[commentIndex];
    const userHasLikedComment = (comment.comment_likes || []).some(like => like.user_id === user.id);
    
    // Optimistically update the UI
    const updatedComments = [...comments];
    const updatedComment = {
      ...updatedComments[commentIndex],
      comment_likes: userHasLikedComment
        ? (updatedComments[commentIndex].comment_likes || []).filter(like => like.user_id !== user.id)
        : [...(updatedComments[commentIndex].comment_likes || []), { user_id: user.id } as Like]
    };
    updatedComments[commentIndex] = updatedComment;
    setComments(updatedComments);
    setLikingCommentId(commentId);

    try {
      if (userHasLikedComment) {
        const { error } = await supabase.from('comment_likes').delete().match({ comment_id: commentId, user_id: user.id });
        if (error) {
          console.error("Error unliking comment:", error.message);
          setComments(originalComments); // Revert on error
        }
      } else {
        const { error } = await supabase.from('comment_likes').insert({ comment_id: commentId, user_id: user.id });
        if (error) {
          console.error("Error liking comment:", error.message);
          setComments(originalComments); // Revert on error
        }
      }
    } finally {
      setLikingCommentId(null);
    }
  }, [user, comments, likingCommentId]);

  const replyToComment = useCallback(async (commentId: string, content: string) => {
    if (!user) return;
    const { error } = await supabase.from('comments').insert({ post_id: post.id, user_id: user.id, content, parent_id: commentId });
    if (error) {
      console.error("Error replying to comment:", error.message);
    } else {
      fetchPostData();
    }
  }, [post.id, user, fetchPostData]);

  return (
    <PostContext.Provider value={{ post, comments, likesCount, userHasLiked, addComment, toggleLike, deletePost, deleteComment, likeComment, replyToComment, likingCommentId }}>
      {children}
    </PostContext.Provider>
  );
};

export const usePost = () => {
  const context = useContext(PostContext);
  if (context === undefined) {
    throw new Error('usePost must be used within a PostProvider');
  }
  return context;
};
