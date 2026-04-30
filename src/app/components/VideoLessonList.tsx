'use client';

import { useRef, useState } from 'react';
import Link from 'next/link';

export interface LessonVideoProps {
  id: string;
  slug?: string;
  title: string;
  description: string;
  video_url: string | null;
}

function LessonVideoCard({ lesson }: { lesson: LessonVideoProps }) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);

  const togglePlayPause = () => {
    const video = videoRef.current;
    if (!video) return;

    if (video.paused) {
      video.play();
      setIsPlaying(true);
    } else {
      video.pause();
      setIsPlaying(false);
    }
  };

  const toggleMute = () => {
    const video = videoRef.current;
    if (!video) return;

    video.muted = !video.muted;
    setIsMuted(video.muted);
  };

  const handleVideoEnded = () => {
    setIsPlaying(false);
  };

  return (
    <div className="rounded-3xl bg-white dark:bg-gray-800 shadow-lg overflow-hidden">
      <div className="p-6">
        <div className="mb-4 text-sm font-semibold uppercase tracking-wide text-blue-600 dark:text-blue-400">Video Lesson</div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">{lesson.title}</h2>
        <p className="text-gray-600 dark:text-gray-300 mb-5 line-clamp-3">{lesson.description}</p>
      </div>
      {lesson.video_url ? (
        <div className="bg-black/5 dark:bg-white/5 relative">
          {lesson.video_url.includes('youtube.com') || lesson.video_url.includes('youtu.be') ? (
            <div className="aspect-w-16 aspect-h-9">
              <iframe
                src={lesson.video_url}
                title={lesson.title}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="w-full h-full"
              />
            </div>
          ) : (
            <div className="relative">
              <video
                ref={videoRef}
                controls
                muted={isMuted}
                onEnded={handleVideoEnded}
                className="w-full h-auto bg-black"
              >
                <source src={lesson.video_url} type="video/mp4" />
                Your browser does not support HTML5 video.
              </video>
              <div className="absolute bottom-4 left-4 flex gap-2 bg-black/60 p-3 rounded-full">
                <button
                  type="button"
                  onClick={togglePlayPause}
                  className="rounded-full bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 transition"
                >
                  {isPlaying ? 'Pause' : 'Play'}
                </button>
                <button
                  type="button"
                  onClick={toggleMute}
                  className="rounded-full bg-white/10 px-4 py-2 text-sm font-semibold text-white hover:bg-white/20 transition"
                >
                  {isMuted ? 'Unmute' : 'Mute'}
                </button>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="p-6 text-center text-gray-500 dark:text-gray-400">
          No video URL available for this lesson.
        </div>
      )}
      <div className="p-6 border-t border-gray-200 dark:border-gray-700">
        <Link
          href={`/lessons/${lesson.id || lesson.slug}`}
          className="inline-flex items-center justify-center rounded-full bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-700"
        >
          View Lesson Details
        </Link>
      </div>
    </div>
  );
}

export default function VideoLessonList({ lessons }: { lessons: LessonVideoProps[] }) {
  if (lessons.length === 0) {
    return (
      <div className="rounded-xl bg-white dark:bg-gray-800 shadow-md p-8 text-center">
        <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-50">No video lessons available</h2>
        <p className="mt-2 text-gray-600 dark:text-gray-400">Check back later for new lessons.</p>
      </div>
    );
  }

  return (
    <div className="grid gap-8 lg:grid-cols-2">
      {lessons.map((lesson) => (
        <LessonVideoCard key={lesson.id} lesson={lesson} />
      ))}
    </div>
  );
}
