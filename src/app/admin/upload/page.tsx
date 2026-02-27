
'use client';

import { useState, useEffect } from 'react';
import { supabase } from '../../supabase';
import { useRouter } from 'next/navigation';
import { useUser } from '../../UserContext';

export default function UploadPage() {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const router = useRouter();
  const { user } = useUser();

  const isAdmin = user && user.email === 'wadareaf@gmail.com';

  useEffect(() => {
    if (!user) {
      router.push('/login');
    }
  }, [user, router]);

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
    setProgress(0);
    setError(null);
    setSuccessMessage(null);

    try {
      const fileExt = videoFile.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `lessons/${fileName}`;

      setProgress(10); // Start the progress

      const { error: uploadError } = await supabase.storage
        .from('videos')
        .upload(filePath, videoFile);

      if (uploadError) {
        console.error('Error uploading video:', uploadError);
        setError(`Failed to upload video: ${uploadError.message}`);
        setUploading(false);
        setProgress(0);
        return;
      }

      setProgress(50); // Video uploaded, getting URL

      const { data: urlData } = supabase.storage
        .from('videos')
        .getPublicUrl(filePath);

      const publicUrl = urlData.publicUrl;

      setProgress(75); // URL retrieved, saving to DB

      const { error: insertError } = await supabase
        .from('lessons')
        .insert([{ title, description, video_url: publicUrl, user_id: user?.id }]);

      if (insertError) {
        console.error('Error inserting lesson:', insertError);
        setError(`Failed to save lesson: ${insertError.message}`);
        setUploading(false);
        setProgress(0);
        return;
      }

      setProgress(100); // All done!
      setSuccessMessage('Video uploaded successfully!');
      setTitle('');
      setDescription('');
      setVideoFile(null);
      setUploading(false);

      // Reset progress bar after 2 seconds
      setTimeout(() => {
        setProgress(0);
        setSuccessMessage(null);
      }, 2000);

    } catch (error: any) {
      console.error('Error during video upload process:', error);
      setError(error.message || 'An unexpected error occurred.');
      setUploading(false);
      setProgress(0);
    }
  };

  if (!user) {
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
