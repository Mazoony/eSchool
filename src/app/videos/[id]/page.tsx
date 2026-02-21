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
    <div className="container mx-auto px-4 py-8">
      {loading ? (
        <p>Loading...</p>
      ) : video ? (
        <div>
          <h1 className="text-3xl font-bold mb-4">{video.title}</h1>
          <div className="aspect-w-16 aspect-h-9">
            <video src={video.videoUrl} controls className="w-full" />
          </div>
          <p className="mt-4">{video.description}</p>
        </div>
      ) : (
        <p>Video not found.</p>
      )}
    </div>
  );
}