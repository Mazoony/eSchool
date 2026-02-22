'use client';

import { useState, useEffect } from 'react';
import { doc, updateDoc, getDoc } from 'firebase/firestore';
import { firestore } from '../firebase';
import { FiHeart } from 'react-icons/fi';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from '../firebase';

interface PostProps {
  id: string;
  content: string;
  author: string;
  initialLikes: number;
}

export default function Post({ id, content, author, initialLikes }: PostProps) {
  const [user] = useAuthState(auth);
  const [likes, setLikes] = useState(initialLikes);

  const handleLike = async () => {
    if (user) {
      const postRef = doc(firestore, 'posts', id);
      const postSnap = await getDoc(postRef);
      if (postSnap.exists()) {
        const postData = postSnap.data();
        const newLikes = (postData.likes || 0) + 1;
        await updateDoc(postRef, { likes: newLikes });
        setLikes(newLikes);
      }
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6">
      <p className="text-gray-800 dark:text-gray-200">{content}</p>
      <div className="flex items-center justify-between mt-4">
        <span className="text-gray-600 dark:text-gray-400 text-sm">{author}</span>
        <div className="flex items-center">
          <button onClick={handleLike} className="flex items-center text-gray-600 dark:text-gray-400 hover:text-red-500 dark:hover:text-red-400">
            <FiHeart className="mr-2" />
            <span>{likes}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
