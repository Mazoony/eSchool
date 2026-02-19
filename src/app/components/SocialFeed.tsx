'use client';

import { useState, useEffect } from 'react';
import { collection, addDoc, onSnapshot, doc, updateDoc, getDoc } from 'firebase/firestore';
import { firestore } from '../firebase';
import Comment from './Comment';
import { FiHeart } from 'react-icons/fi';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from '../firebase';

interface SocialFeedProps {
  lessonId: string;
}

interface CommentData {
  id: string;
  text: string;
  author: string;
}

export default function SocialFeed({ lessonId }: SocialFeedProps) {
  const [user] = useAuthState(auth);
  const [comments, setComments] = useState<CommentData[]>([]);
  const [newComment, setNewComment] = useState('');
  const [likes, setLikes] = useState(0);

  useEffect(() => {
    const commentsCollection = collection(firestore, 'lessons', lessonId, 'comments');
    const unsubscribeComments = onSnapshot(commentsCollection, snapshot => {
      const commentsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as CommentData[];
      setComments(commentsData);
    });

    const lessonRef = doc(firestore, 'lessons', lessonId);
    const unsubscribeLikes = onSnapshot(lessonRef, doc => {
      if (doc.exists()) {
        setLikes(doc.data().likes || 0);
      }
    });

    return () => {
      unsubscribeComments();
      unsubscribeLikes();
    };
  }, [lessonId]);

  const handleAddComment = async () => {
    if (newComment.trim() === '' || !user) return;

    const commentsCollection = collection(firestore, 'lessons', lessonId, 'comments');
    await addDoc(commentsCollection, {
      text: newComment,
      author: user.displayName || 'Anonymous',
    });
    setNewComment('');
  };

  const handleLike = async () => {
    const lessonRef = doc(firestore, 'lessons', lessonId);
    const lessonSnap = await getDoc(lessonRef);

    if (lessonSnap.exists()) {
      const currentLikes = lessonSnap.data().likes || 0;
      await updateDoc(lessonRef, { likes: currentLikes + 1 });
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto mt-8">
      <div className="flex items-center justify-between mb-4">
        <button onClick={handleLike} className="flex items-center space-x-2 text-gray-500 hover:text-red-500">
          <FiHeart />
          <span>{likes}</span>
        </button>
      </div>
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-50 mb-4">Comments</h3>
        <div className="space-y-4">
          {comments.map(comment => (
            <Comment key={comment.id} comment={comment} />
          ))}
        </div>
      </div>
      {user && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <textarea
            value={newComment}
            onChange={e => setNewComment(e.target.value)}
            className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-50"
            placeholder="Add a comment..."
          />
          <button onClick={handleAddComment} className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
            Post Comment
          </button>
        </div>
      )}
    </div>
  );
}
