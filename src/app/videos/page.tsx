"use client";

import { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { firestore } from "../firebase";
import Link from "next/link";
import Image from 'next/image';

interface Video {
  id: string;
  title: string;
  description: string;
  videoUrl: string;
  thumbnailUrl: string;
}

export default function VideosPage() {
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchVideos = async () => {
      try {
        const videosCollection = collection(firestore, "videos");
        const videoSnapshot = await getDocs(videosCollection);
        const videosData = videoSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Video[];
        setVideos(videosData);
      } catch (error) {
        console.error("Error fetching videos:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchVideos();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">Videos</h1>
          {loading ? (
            <p>Loading videos...</p>
          ) : videos.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {videos.map((video) => (
                <div
                  key={video.id}
                  className="bg-white rounded-lg shadow-md overflow-hidden"
                >
                  <Link href={`/videos/${video.id}`}>
                    <div className="relative">
                      <Image
                        src={video.thumbnailUrl || "/placeholder.svg"}
                        alt={video.title}
                        width={400}
                        height={270}
                        className="w-full h-48 object-cover"
                      />
                    </div>
                    <div className="p-6">
                      <h2 className="text-xl font-semibold text-gray-800 mb-2">
                        {video.title}
                      </h2>
                      <p className="text-gray-600 line-clamp-2">
                        {video.description}
                      </p>
                    </div>
                  </Link>
                </div>
              ))}
            </div>
          ) : (
            <p>No videos found.</p>
          )}
        </div>
      </main>
    </div>
  );
}
