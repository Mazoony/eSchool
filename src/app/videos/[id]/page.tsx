"use client";

import { useEffect, useState } from "react";
import { doc, getDoc } from "firebase/firestore";
import { firestore } from "../../firebase";
import { useParams } from "next/navigation";

interface Video {
  id: string;
  title: string;
  description: string;
  videoUrl: string;
}

export default function VideoPage() {
  const [video, setVideo] = useState<Video | null>(null);
  const [loading, setLoading] = useState(true);
  const { id } = useParams();

  useEffect(() => {
    const fetchVideo = async () => {
      if (id) {
        try {
          const videoDoc = doc(firestore, "videos", id as string);
          const videoSnapshot = await getDoc(videoDoc);
          if (videoSnapshot.exists()) {
            setVideo({ id: videoSnapshot.id, ...videoSnapshot.data() } as Video);
          } else {
            console.error("No such document!");
          }
        } catch (error) {
          console.error("Error fetching video:", error);
        } finally {
          setLoading(false);
        }
      }
    };

    fetchVideo();
  }, [id]);

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {loading ? (
            <p>Loading video...</p>
          ) : video ? (
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-4">{video.title}</h1>
              <div className="aspect-w-16 aspect-h-9 mb-6">
                <video src={video.videoUrl} controls className="w-full rounded-lg shadow-md" />
              </div>
              <p className="text-lg text-gray-700">{video.description}</p>
            </div>
          ) : (
            <p>Video not found.</p>
          )}
        </div>
      </main>
    </div>
  );
}
