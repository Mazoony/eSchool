'use client';

import { useState, useEffect } from 'react';
import { storage, firestore, auth } from '../../firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { collection, addDoc } from 'firebase/firestore';
import { onAuthStateChanged, signOut, User } from 'firebase/auth';
import { useRouter } from 'next/navigation';

export default function UploadPage() {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUser(user);
      } else {
        router.push('/admin');
      }
    });

    return () => unsubscribe();
  }, [router]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setVideoFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!videoFile) {
      alert('Please select a video file.');
      return;
    }

    try {
      // Upload video to Firebase Storage
      const storageRef = ref(storage, `videos/${videoFile.name}`);
      await uploadBytes(storageRef, videoFile);
      const downloadURL = await getDownloadURL(storageRef);

      // Add video metadata to Firestore
      await addDoc(collection(firestore, 'videos'), {
        title,
        description,
        videoUrl: downloadURL,
      });

      alert('Video uploaded successfully!');
      setTitle('');
      setDescription('');
      setVideoFile(null);
    } catch (error) {
      console.error('Error uploading video:', error);
      alert('Failed to upload video.');
    }
  };

  const handleSignOut = async () => {
    await signOut(auth);
    router.push('/admin');
  };

  if (!user) {
    return null; // Or a loading spinner
  }

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center">
       <div className="absolute top-4 right-4 flex items-center space-x-4">
        <button
          onClick={() => router.push('/')}
          className="bg-gray-200 text-gray-800 font-bold py-2 px-4 rounded-lg hover:bg-gray-300 transition duration-300"
        >
          Go to Dashboard
        </button>
        <button
          onClick={handleSignOut}
          className="bg-red-500 text-white font-bold py-2 px-4 rounded-lg hover:bg-red-600 transition duration-300"
        >
          Sign Out
        </button>
      </div>
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        <h1 className="text-2xl font-bold mb-6 text-center">Upload Video</h1>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="title" className="block text-gray-700 font-bold mb-2">
              Title
            </label>
            <input
              type="text"
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-blue-500"
              required
            />
          </div>
          <div className="mb-4">
            <label htmlFor="description" className="block text-gray-700 font-bold mb-2">
              Description
            </label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-blue-500"
              required
            />
          </div>
          <div className="mb-6">
            <label htmlFor="video" className="block text-gray-700 font-bold mb-2">
              Video File
            </label>
            <input
              type="file"
              id="video"
              onChange={handleFileChange}
              className="w-full"
              accept="video/*"
              required
            />
          </div>
          <button
            type="submit"
            className="w-full bg-blue-500 text-white font-bold py-2 px-4 rounded-lg hover:bg-blue-600 transition duration-300"
          >
            Upload
          </button>
        </form>
      </div>
    </div>
  );
}
