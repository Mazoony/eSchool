'use client';

import { PostProvider } from './PostContext';
import Post from './Post';
import { Post as PostType } from '../types';

interface PostItemProps {
  post: PostType;
}

export default function PostItem({ post }: PostItemProps) {
  return (
    <PostProvider post={post}>
      <Post />
    </PostProvider>
  );
}
