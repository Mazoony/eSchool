'use client';

import { useState, useEffect } from 'react';
import { collection, addDoc, onSnapshot, query, orderBy, serverTimestamp } from 'firebase/firestore';
import { firestore } from '../firebase';
import Post from './Post';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from '../firebase';

interface PostData {
  id: string;
  content: string;
  author: string;
  likes: number;
  createdAt: any;
}

export default function SocialFeed() {
  const [user] = useAuthState(auth);
  const [posts, setPosts] = useState<PostData[]>([]);
  const [newPost, setNewPost] = useState('');

  useEffect(() => {
    const q = query(collection(firestore, 'posts'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const postsData: PostData[] = [];
      querySnapshot.forEach((doc) => {
        postsData.push({ id: doc.id, ...doc.data() } as PostData);
      });
      setPosts(postsData);
    });

    return () => unsubscribe();
  }, []);

  const handleCreatePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPost.trim() === '' || !user) return;

    await addDoc(collection(firestore, 'posts'), {
      content: newPost,
      author: user.displayName || user.email,
      likes: 0,
      createdAt: serverTimestamp(),
    });

    setNewPost('');
  };

  return (
    <div>
      {user && (
        <form onSubmit={handleCreatePost} className="mb-8">
          <textarea
            value={newPost}
            onChange={(e) => setNewPost(e.target.value)}
            placeholder="What's on your mind?"
            className="w-full p-4 bg-white dark:bg-gray-800 rounded-lg shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            rows={4}
          />
          <button type="submit" className="mt-4 px-6 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors">
            Post
          </button>
        </form>
      )}
      <div>
        {posts.map(post => (
          <Post key={post.id} id={post.id} content={post.content} author={post.author} initialLikes={post.likes} />
        ))}
      </div>
    </div>
  );
}
