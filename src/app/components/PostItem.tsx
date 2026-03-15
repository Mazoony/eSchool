'use client';

import { PostProvider } from './PostContext';
import Post from './Post';
import { Post as PostType } from '../types';

interface PostItemProps {
  post: PostType;
  onDelete: (postId: string) => void;
}

export default function PostItem({ post, onDelete }: PostItemProps) {
  return (
    <PostProvider post={post} onDelete={onDelete}>
      <Post />
    </PostProvider>
  );
}
