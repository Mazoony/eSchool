'use client';

import { createContext, useContext, useState, ReactNode, useCallback, useEffect } from 'react';
import { supabase } from '../supabase';
import { useAuth } from '../AuthContext';
import { Post as PostType, Comment as CommentType, Like } from '../types';

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
}

const PostContext = createContext<PostContextType | undefined>(undefined);

export const PostProvider = ({ post: initialPost, children, onDelete }: { post: PostType; children: ReactNode; onDelete: (postId: string) => void; }) => {
  const { user } = useAuth();
  const [post, setPost] = useState<PostType>(initialPost);
  const [comments, setComments] = useState<CommentType[]>(initialPost.comments || []);
  const [likesCount, setLikesCount] = useState<number>(initialPost.likes?.length || 0);
  const [userHasLiked, setUserHasLiked] = useState<boolean>(false);

  const createNotification = async (recipient_user_id: string, type: string, post_id: string, comment_id?: string) => {
    if (user?.id === recipient_user_id) return;

    await supabase.from('notifications').insert({
      recipient_user_id,
      sender_user_id: user!.id,
      type,
      post_id,
      comment_id,
    });
  };

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

    const { data: insertedComment, error } = await supabase
      .from<CommentType>('comments')
      .insert({ post_id: post.id, user_id: user.id, content })
      .select('*, commenter:profiles!inner(*), comment_likes(user_id)')
      .single();

    if (error) {
      console.error("Error adding comment:", error.message);
    } else if (insertedComment) {
      setComments(prevComments => [...prevComments, insertedComment]);
      await createNotification(post.user_id, 'comment', post.id, insertedComment.id);
    }
  }, [post.id, post.user_id, user]);

  const toggleLike = useCallback(async () => {
    if (!user) return;

    const originallyLiked = userHasLiked;
    setUserHasLiked(!originallyLiked);
    setLikesCount(prev => originallyLiked ? prev - 1 : prev + 1);

    if (originallyLiked) {
      const { error } = await supabase.from('likes').delete().match({ post_id: post.id, user_id: user.id });
      if (error) {
        console.error("Error unliking post:", error.message);
        setUserHasLiked(originallyLiked);
        setLikesCount(prev => prev + 1);
      }
    } else {
      const { data, error } = await supabase.from('likes').insert({ post_id: post.id, user_id: user.id }).select().single();
      if (error) {
        console.error("Error liking post:", error.message);
        setUserHasLiked(originallyLiked);
        setLikesCount(prev => prev - 1);
      } else {
        await createNotification(post.user_id, 'like', post.id);
      }
    }
  }, [post.id, post.user_id, user, userHasLiked]);

  const deletePost = useCallback(async () => {
    if (!user || user.id !== post.user_id) {
        console.error("Permission denied to delete post");
        return;
    }

    onDelete(post.id);

    const { error } = await supabase.from('posts').delete().match({ id: post.id });
    if (error) {
        console.error("Error deleting post:", error.message);
    }
  }, [post.id, post.user_id, user, onDelete]);

  const deleteComment = useCallback(async (commentId: string) => {
    if (!user) return;

    const commentToDelete = comments.find(c => c.id === commentId);
    if (!commentToDelete || commentToDelete.user_id !== user.id) {
      console.error("Permission denied to delete comment");
      return;
    }

    const originalComments = [...comments];
    setComments(prevComments => prevComments.filter(c => c.id !== commentId));

    const { error } = await supabase.from('comments').delete().match({ id: commentId, user_id: user.id });

    if (error) {
      console.error("Error deleting comment:", error.message);
      setComments(originalComments);
    }
  }, [user, comments]);

  const likeComment = useCallback(async (commentId: string) => {
    if (!user) return;

    const originalComments = [...comments];
    const comment = comments.find(c => c.id === commentId);
    if (!comment) return;

    const userHasLikedComment = (comment.comment_likes || []).some(like => like.user_id === user.id);

    setComments(prevComments => prevComments.map(c => {
      if (c.id === commentId) {
        const newLikes = userHasLikedComment
          ? (c.comment_likes || []).filter(like => like.user_id !== user.id)
          : [...(c.comment_likes || []), { user_id: user.id, comment_id: c.id } as Like];
        return { ...c, comment_likes: newLikes };
      }
      return c;
    }));

    if (userHasLikedComment) {
      const { error } = await supabase.from('comment_likes').delete().match({ comment_id: commentId, user_id: user.id });
      if (error) {
        console.error("Error unliking comment:", error.message);
        setComments(originalComments);
      }
    } else {
      const { data, error } = await supabase.from('comment_likes').insert({ comment_id: commentId, user_id: user.id }).select().single();
      if (error) {
        console.error('Error liking comment:', error.message);
        setComments(originalComments);
      } else {
        await createNotification(comment.user_id, 'like_comment', post.id, comment.id);
      }
    }
  }, [user, comments, post.id]);

  const replyToComment = useCallback(async (commentId: string, content: string) => {
    if (!user?.profile) {
      console.error("User profile not available for replying.");
      return;
    }

    const { data: insertedComment, error } = await supabase
      .from<CommentType>('comments')
      .insert({ post_id: post.id, user_id: user.id, content, parent_id: commentId })
      .select('*, commenter:profiles!inner(*), comment_likes(user_id)')
      .single();

    if (error) {
      console.error("Error replying to comment:", error.message);
    } else if (insertedComment) {
      setComments(prevComments => [...prevComments, insertedComment]);
      const parentComment = comments.find(c => c.id === commentId);
      if(parentComment) {
        await createNotification(parentComment.user_id, 'reply', post.id, insertedComment.id);
      }
    }
  }, [post.id, user, comments]);

  return (
    <PostContext.Provider value={{ post, comments, likesCount, userHasLiked, addComment, toggleLike, deletePost, deleteComment, likeComment, replyToComment }}>
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
