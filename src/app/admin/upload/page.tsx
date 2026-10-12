
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../AuthContext';
import { createClient } from '@/utils/supabase/client';
import { GradeId, grades, isGradeId } from '../../lessons/curriculum';

export default function UploadPage() {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [taskPrompt, setTaskPrompt] = useState('');
  const [grade, setGrade] = useState<GradeId | ''>('');
  const [classNumber, setClassNumber] = useState('');
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();

  const isAdmin = user && user.email === 'wadareaf@gmail.com';

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [authLoading, user, router]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setVideoFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!videoFile) {
      setError('Please select a video file.');
      return;
    }
    if (videoFile.size > 50 * 1024 * 1024) {
      setError('The video must be 50 MB or smaller to fit the Supabase Free upload limit.');
      return;
    }
    if (!grade || (grade !== 'english-foundation' && !classNumber)) {
      setError('Please select a learning path and class.');
      return;
    }

    setUploading(true);
    setProgress(0);
    setError(null);
    setSuccessMessage(null);

    try {
      const fileExt = videoFile.name.split('.').pop()?.toLowerCase();
      if (!fileExt || !['mp4', 'webm'].includes(fileExt)) {
        setError('Please upload an MP4 or WebM video file.');
        setUploading(false);
        return;
      }

      if (!user || !isAdmin) throw new Error('Administrator access is required to upload lessons.');

      const filePath = `lessons/${crypto.randomUUID()}.${fileExt}`;
      const client = createClient();
      setProgress(10);
      const { error: uploadError } = await client.storage
        .from('videos')
        .upload(filePath, videoFile, { contentType: videoFile.type, cacheControl: '3600' });
      if (uploadError) throw uploadError;
      setProgress(85);
      const { error: saveError } = await client.from('lessons').insert({
          title: title.trim(),
          description: description.trim(),
          task_prompt: taskPrompt.trim() || null,
          grade,
          class_number: grade === 'english-foundation' ? null : Number(classNumber),
          video_url: filePath,
          user_id: user.id,
        });
      if (saveError) {
        const { error: cleanupError } = await client.storage.from('videos').remove([filePath]);
        if (cleanupError) console.error('Failed to remove uploaded video after saving lesson failed:', cleanupError);
        throw saveError;
      }

      setProgress(100); // All done!
      setSuccessMessage('Video uploaded successfully!');
      setTitle('');
      setDescription('');
      setTaskPrompt('');
      setGrade('');
      setClassNumber('');
      setVideoFile(null);
      setUploading(false);

      // Reset progress bar after 2 seconds
      setTimeout(() => {
        setProgress(0);
        setSuccessMessage(null);
      }, 2000);

    } catch (error: unknown) {
      console.error('Error during video upload process:', error);
      setError(error instanceof Error ? error.message : 'An unexpected error occurred.');
      setUploading(false);
      setProgress(0);
    }
  };

  if (authLoading || !user) {
    return <p>Loading...</p>;
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md text-center">
          <h1 className="text-2xl font-bold mb-4">Unauthorized</h1>
          <p>You do not have permission to access this page.</p>
          <button
            onClick={() => router.push('/')}
            className="mt-6 bg-blue-500 text-white font-bold py-2 px-4 rounded-lg hover:bg-blue-600 transition duration-300"
          >
            Go to Dashboard
          </button>
        </div>
      </div>
    );
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
      </div>
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        <h1 className="text-2xl font-bold mb-6 text-center">Upload Lesson Video</h1>
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
              disabled={uploading}
            />
          </div>
          <div className="mb-4">
            <label htmlFor="description" className="block text-gray-700 font-bold mb-2">
              Description
            </label>
            <textarea
              id="description"
              lang="ar"
              dir="rtl"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg text-right focus:outline-none focus:border-blue-500"
              required
              disabled={uploading}
            />
          </div>
          <div className="mb-4">
            <label htmlFor="task-prompt" className="block text-gray-700 font-bold mb-2">
              Student task (optional)
            </label>
            <textarea
              id="task-prompt"
              lang="en"
              dir="ltr"
              translate="no"
              value={taskPrompt}
              onChange={(event) => setTaskPrompt(event.target.value)}
              maxLength={5000}
              rows={4}
              placeholder="Add a written task for students to complete after watching."
              className="w-full rounded-lg border px-3 py-2 text-left focus:border-blue-500 focus:outline-none"
              disabled={uploading}
            />
          </div>
          <div className="mb-6">
            <label htmlFor="grade" className="mb-2 block font-bold text-gray-700">
              Learning path
            </label>
            <select
              id="grade"
              value={grade}
              onChange={(e) => {
                setGrade(isGradeId(e.target.value) ? e.target.value : '');
                setClassNumber('');
              }}
              className="mb-4 w-full rounded-lg border px-3 py-2 focus:border-blue-500 focus:outline-none"
              required
              disabled={uploading}
            >
              <option value="">Select a learning path</option>
              {grades.map((item) => (
                <option key={item.id} value={item.id}>{item.title}</option>
              ))}
            </select>
            <label htmlFor="class-number" className="mb-2 block font-bold text-gray-700">
              Class
            </label>
            <select
              id="class-number"
              value={classNumber}
              onChange={(e) => setClassNumber(e.target.value)}
              className="mb-4 w-full rounded-lg border px-3 py-2 focus:border-blue-500 focus:outline-none"
              required={grade !== 'english-foundation'}
              disabled={uploading || !grade || grade === 'english-foundation'}
            >
              <option value="">{grade === 'english-foundation' ? 'No class needed' : 'Select a class'}</option>
              {grade && Array.from({ length: grades.find((item) => item.id === grade)?.classCount ?? 0 }, (_, index) => (
                <option key={index + 1} value={index + 1}>Class {index + 1}</option>
              ))}
            </select>
            <label htmlFor="video" className="block text-gray-700 font-bold mb-2">
              Video File
            </label>
            <input
              type="file"
              id="video"
              onChange={handleFileChange}
              className="w-full"
              accept="video/mp4,video/webm"
              required
              disabled={uploading}
            />
          </div>

          {uploading && (
            <div className="mb-4">
              <div className="w-full bg-gray-200 rounded-full h-2.5">
                <div
                  className="bg-blue-600 h-2.5 rounded-full transition-all duration-500"
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
              <p className="text-sm text-center mt-1">Uploading... {progress}%</p>
            </div>
          )}

          {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
          {successMessage && <p className="text-green-500 text-sm mb-4">{successMessage}</p>}

          <button
            type="submit"
            className="w-full bg-blue-500 text-white font-bold py-2 px-4 rounded-lg hover:bg-blue-600 transition duration-300 disabled:bg-gray-400"
            disabled={uploading}
          >
            {uploading ? 'Processing...' : 'Upload'}
          </button>
        </form>
      </div>
    </div>
  );
}
