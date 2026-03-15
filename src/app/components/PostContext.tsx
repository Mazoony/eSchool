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
  deletePost: () => Promise<void>;
  deleteComment: (commentId: string) => Promise<void>;
  likeComment: (commentId: string) => Promise<void>;
  replyToComment: (commentId: string, content: string) => Promise<void>;
  likingCommentId: string | null;
}

const PostContext = createContext<PostContextType | undefined>(undefined);

export const PostProvider = ({ post: initialPost, children, onDelete }: { post: PostType; children: ReactNode; onDelete: (postId: string) => void; }) => {
  const { user } = useAuth();
  const [post, setPost] = useState<PostType>(initialPost);
  const [comments, setComments] = useState<CommentType[]>(initialPost.comments || []);
  const [likesCount, setLikesCount] = useState<number>(initialPost.likes?.length || 0);
  const [userHasLiked, setUserHasLiked] = useState<boolean>(false);
  const [likingCommentId, setLikingCommentId] = useState<string | null>(null);

  const fetchPostData = useCallback(async () => {
    const { data, error } = await supabase
      .from('posts')
      .select(`
        *,
        author:profiles!inner(*),
        likes(user_id),
        comments!post_id(
          *,
          commenter:profiles!inner(*),
          comment_likes(user_id)
        )
      `)
      .eq('id', initialPost.id)
      .single();

    if (error) {
      console.error("Error fetching post data:", error);
    } else if (data) {
      const postData = data as any;
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
    if (!user?.profile) {
      console.error("User profile not available for commenting.");
      return;
    }

    const newComment: CommentType = {
      id: `temp-${Date.now()}`,
      content,
      user_id: user.id,
      created_at: new Date().toISOString(),
      commenter: {
        id: user.profile.id,
        full_name: user.profile.full_name,
        avatar_url: user.profile.avatar_url,
      },
      comment_likes: [],
    };

    setComments(prevComments => [...prevComments, newComment]);

    const { data: insertedComment, error } = await supabase
      .from('comments')
      .insert({ post_id: post.id, user_id: user.id, content })
      .select('*, commenter:profiles!inner(*), comment_likes(user_id)')
      .single();

    if (error) {
      console.error("Error adding comment:", error.message);
      setComments(prevComments => prevComments.filter(c => c.id !== newComment.id));
    } else if (insertedComment) {
      setComments(prevComments =>
        prevComments.map(c => (c.id === newComment.id ? (insertedComment as CommentType) : c))
      );
    }
  }, [post.id, user]);

  const toggleLike = useCallback(async () => {
    if (!user) return;

    const originallyLiked = userHasLiked;
    const originalLikesCount = likesCount;

    setUserHasLiked(!originallyLiked);
    setLikesCount(originallyLiked ? likesCount - 1 : likesCount + 1);

    if (originallyLiked) {
      const { error } = await supabase.from('likes').delete().match({ post_id: post.id, user_id: user.id });
      if (error) {
        console.error("Error unliking post:", error.message);
        setUserHasLiked(originallyLiked);
        setLikesCount(originalLikesCount);
      }
    } else {
      const { error } = await supabase.from('likes').insert({ post_id: post.id, user_id: user.id });
      if (error) {
        console.error("Error liking post:", error.message);
        setUserHasLiked(originallyLiked);
        setLikesCount(originalLikesCount);
      }
    }
  }, [post.id, user, userHasLiked, likesCount]);

  const deletePost = useCallback(async () => {
    if (!user || user.id !== post.user_id) {
        console.error("Permission denied to delete post");
        return;
    }

    onDelete(post.id);

    const { error } = await supabase.from('posts').delete().match({ id: post.id });
    if (error) {
        console.error("Error deleting post:", error.message);
        // If the delete fails, we should ideally put the post back in the list.
        // This requires a more complex state management strategy.
    }
  }, [post.id, post.user_id, user, onDelete]);

  const deleteComment = useCallback(async (commentId: string) => {
    if (!user) return;

    const originalComments = [...comments];
    const commentToDelete = comments.find(c => c.id === commentId);
    if (!commentToDelete || commentToDelete.user_id !== user.id) {
      console.error("Permission denied to delete comment");
      return;
    }

    setComments(prevComments => prevComments.filter(c => c.id !== commentId));

    const { error } = await supabase.from('comments').delete().match({ id: commentId, user_id: user.id });

    if (error) {
      console.error("Error deleting comment:", error.message);
      setComments(originalComments);
    }
  }, [user, comments]);

  const likeComment = useCallback(async (commentId: string) => {
    if (!user || likingCommentId) return;

    const originalComments = comments.map(c => ({...c, comment_likes: [...(c.comment_likes || [])]}));
    const commentIndex = comments.findIndex(c => c.id === commentId);
    if (commentIndex === -1) return;

    const comment = comments[commentIndex];
    const userHasLikedComment = (comment.comment_likes || []).some(like => like.user_id === user.id);
    
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
          setComments(originalComments);
        }
      } else {
        const { error } = await supabase.from('comment_likes').insert({ comment_id: commentId, user_id: user.id });
        if (error) {
          console.error('Error liking comment:', error.message);
          setComments(originalComments);
        }
      }
    } finally {
      setLikingCommentId(null);
    }
  }, [user, comments, likingCommentId]);

  const replyToComment = useCallback(async (commentId: string, content: string) => {
    if (!user?.profile) {
      console.error("User profile not available for replying.");
      return;
    }

    const newReply: CommentType = {
      id: `temp-${Date.now()}`,
      content,
      user_id: user.id,
      created_at: new Date().toISOString(),
      parent_id: commentId,
      commenter: {
        id: user.profile.id,
        full_name: user.profile.full_name,
        avatar_url: user.profile.avatar_url,
      },
      comment_likes: [],
    };

    setComments(prevComments => [...prevComments, newReply]);

    const { data: insertedComment, error } = await supabase
      .from('comments')
      .insert({ post_id: post.id, user_id: user.id, content, parent_id: commentId })
      .select('*, commenter:profiles!inner(*), comment_likes(user_id)')
      .single();

    if (error) {
      console.error("Error replying to comment:", error.message);
      setComments(prevComments => prevComments.filter(c => c.id !== newReply.id));
    } else if (insertedComment) {
      setComments(prevComments =>
        prevComments.map(c => (c.id === newReply.id ? (insertedComment as CommentType) : c))
      );
    }
  }, [post.id, user]);

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
