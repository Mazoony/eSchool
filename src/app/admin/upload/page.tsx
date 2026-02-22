'use client';

import { useState, useEffect } from 'react';
import { supabase } from '../../supabase'; // Import the Supabase client
import { useRouter } from 'next/navigation';

export default function UploadPage() {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const router = useRouter();

  // In a real app, you would have a proper user session from Supabase Auth
  // For now, we'll just keep the page accessible.

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

    setUploading(true);
    setError(null);
    setSuccessMessage(null);

    try {
      // 1. Upload the video to Supabase Storage
      const fileExt = videoFile.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `lessons/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('videos') // Make sure you have a 'videos' bucket in your Supabase project
        .upload(filePath, videoFile);

      if (uploadError) {
        console.error('Error uploading video:', uploadError);
        setError(`Failed to upload video: ${uploadError.message}`);
        setUploading(false);
        return;
      }

      // 2. Get the public URL of the uploaded video
      const { data: urlData } = supabase.storage
        .from('videos')
        .getPublicUrl(filePath);

      const publicUrl = urlData.publicUrl;

      // 3. Insert the video metadata into the Supabase database
      const { error: insertError } = await supabase
        .from('lessons') // Make sure you have a 'lessons' table in your Supabase project
        .insert([{ title, description, video_url: publicUrl }]);

      if (insertError) {
        console.error('Error inserting lesson:', insertError);
        setError(`Failed to save lesson: ${insertError.message}`);
        setUploading(false);
        return;
      }

      setSuccessMessage('Video uploaded successfully!');
      setTitle('');
      setDescription('');
      setVideoFile(null);
      setUploading(false);

    } catch (error: any) {
      console.error('Error during video upload process:', error);
      setError(error.message || 'An unexpected error occurred.');
      setUploading(false);
    }
  };

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
        <h1 className="text-2xl font-bold mb-6 text-center">Upload Video with Supabase</h1>
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
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-blue-500"
              required
              disabled={uploading}
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
              disabled={uploading}
            />
          </div>
          {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
          {successMessage && <p className="text-green-500 text-sm mb-4">{successMessage}</p>}
          <button
            type="submit"
            className="w-full bg-blue-500 text-white font-bold py-2 px-4 rounded-lg hover:bg-blue-600 transition duration-300 disabled:bg-gray-400"
            disabled={uploading}
          >
            {uploading ? 'Uploading...' : 'Upload'}
          </button>
        </form>
      </div>
    </div>
  );
}
