''''use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/utils/supabase/client';

interface VideoFile {
  name: string;
  publicURL: string;
}

export default function VideoPlayer() {
  const [videos, setVideos] = useState<VideoFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const supabase = createClient();

  useEffect(() => {
    async function fetchVideos() {
      try {
        setLoading(true);
        setError(null);

        const { data: fileList, error: listError } = await supabase.storage
          .from('videos')
          .list();

        if (listError) {
          throw listError;
        }

        if (!fileList || fileList.length === 0) {
          setVideos([]);
          return;
        }

        const videoFiles = await Promise.all(
          fileList.map(async (file) => {
            const { data } = supabase.storage
              .from('videos')
              .getPublicUrl(file.name);

            return {
              name: file.name,
              publicURL: data.publicUrl,
            };
          })
        );

        setVideos(videoFiles);
      } catch (error: any) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    }

    fetchVideos();
  }, [supabase.storage]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="loader ease-linear rounded-full border-8 border-t-8 border-gray-200 h-32 w-32"></div>
        <p className="ml-4 text-xl">Loading Videos...</p>
      </div>
    );
  }

  if (error) {
    return (
        <div className="flex flex-col items-center justify-center h-screen bg-red-100 p-4">
            <div className="bg-white p-8 rounded-lg shadow-lg text-center">
                <h2 className="text-2xl font-bold text-red-600 mb-4">An Error Occurred</h2>
                <p className="text-gray-700">{error}</p>
                <button
                    onClick={() => window.location.reload()}
                    className="mt-6 bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded transition duration-300"
                >
                    Try Again
                </button>
            </div>
        </div>
    );
}


  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-8 text-center">eSchool Videos</h1>
      {videos.length === 0 ? (
        <p className="text-center text-gray-500">No videos found.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {videos.map((video) => (
            <div key={video.name} className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="p-4">
                 <h2 className="text-lg font-semibold truncate">{video.name}</h2>
              </div>
              <video controls className="w-full h-auto">
                <source src={video.publicURL} type="video/mp4" />
                Your browser does not support the video tag.
              </video>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
'''