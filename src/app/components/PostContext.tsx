'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from 'react';
import {
  createComment,
  removeComment,
  removePost,
  subscribePost,
  toggleCommentLike,
  togglePostLike,
} from '@/utils/supabase/data';
import { useAuth } from '../AuthContext';
import { Comment as CommentType, Post as PostType } from '../types';

interface PostContextType {
  post: PostType;
  comments: CommentType[];
  likesCount: number;
  userHasLiked: boolean;
  error: string | null;
  addComment: (content: string) => Promise<void>;
  toggleLike: () => Promise<void>;
  deletePost: () => Promise<void>;
  deleteComment: (commentId: string) => Promise<void>;
  likeComment: (commentId: string) => Promise<void>;
  replyToComment: (commentId: string, content: string) => Promise<void>;
}

const PostContext = createContext<PostContextType | undefined>(undefined);

export const PostProvider = ({
  post: initialPost,
  children,
  onDelete,
}: {
  post: PostType;
  children: ReactNode;
  onDelete: (postId: string) => void;
}) => {
  const { user } = useAuth();
  const [post, setPost] = useState<PostType>(initialPost);
  const [error, setError] = useState<string | null>(null);
  const comments = post.comments ?? [];
  const likesCount = post.likes?.length ?? 0;
  const userHasLiked = Boolean(
    user && post.likes?.some((like) => like.user_id === user.id),
  );

  useEffect(() => {
    setPost(initialPost);
  }, [initialPost]);

  useEffect(() => subscribePost(
    post.id,
    (updatedPost) => {
      if (updatedPost) {
        setPost(updatedPost);
        setError(null);
      }
    },
    (loadError) => {
      console.error('Error updating post:', loadError);
      setError(loadError.message);
    },
  ), [post.id]);

  const addComment = useCallback(async (content: string) => {
    if (!user) {
      setError('Sign in to comment.');
      return;
    }
    try {
      setError(null);
      await createComment(post, user.id, content);
    } catch (actionError: unknown) {
      console.error('Error adding comment:', actionError);
      setError(actionError instanceof Error ? actionError.message : 'Could not add your comment.');
    }
  }, [post, user]);

  const toggleLike = useCallback(async () => {
    if (!user) {
      setError('Sign in to like posts.');
      return;
    }
    try {
      setError(null);
      await togglePostLike(post.id, user.id);
    } catch (actionError: unknown) {
      console.error('Error updating post like:', actionError);
      setError(actionError instanceof Error ? actionError.message : 'Could not update your like.');
    }
  }, [post.id, post.user_id, user, userHasLiked]);

  const deletePost = useCallback(async () => {
    if (!user || user.id !== post.user_id) {
      setError('You do not have permission to delete this post.');
      return;
    }
    try {
      setError(null);
      await removePost(post.id);
      onDelete(post.id);
    } catch (actionError: unknown) {
      console.error('Error deleting post:', actionError);
      setError(actionError instanceof Error ? actionError.message : 'Could not delete this post.');
    }
  }, [post.id, post.user_id, user, onDelete]);

  const deleteComment = useCallback(async (commentId: string) => {
    const comment = comments.find((item) => item.id === commentId);
    if (!user || !comment || comment.user_id !== user.id) {
      setError('You do not have permission to delete this comment.');
      return;
    }
    try {
      setError(null);
      await removeComment(post.id, commentId);
    } catch (actionError: unknown) {
      console.error('Error deleting comment:', actionError);
      setError(actionError instanceof Error ? actionError.message : 'Could not delete the comment.');
    }
  }, [comments, post.id, user]);

  const likeComment = useCallback(async (commentId: string) => {
    if (!user) {
      setError('Sign in to like comments.');
      return;
    }
    const comment = comments.find((item) => item.id === commentId);
    if (!comment) return;
    try {
      setError(null);
      await toggleCommentLike(commentId, user.id);
    } catch (actionError: unknown) {
      console.error('Error updating comment like:', actionError);
      setError(actionError instanceof Error ? actionError.message : 'Could not update your comment like.');
    }
  }, [comments, post.id, user]);

  const replyToComment = useCallback(async (commentId: string, content: string) => {
    if (!user) {
      setError('Sign in to reply.');
      return;
    }
    try {
      setError(null);
      await createComment(post, user.id, content, commentId);
    } catch (actionError: unknown) {
      console.error('Error replying to comment:', actionError);
      setError(actionError instanceof Error ? actionError.message : 'Could not add your reply.');
    }
  }, [post, user]);

  return (
    <PostContext.Provider
      value={{
        post,
        comments,
        likesCount,
        userHasLiked,
        error,
        addComment,
        toggleLike,
        deletePost,
        deleteComment,
        likeComment,
        replyToComment,
      }}
    >
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
