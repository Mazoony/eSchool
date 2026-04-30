import { getLessons } from '../lessons/actions';
import VideoLessonList, { LessonVideoProps } from '../components/VideoLessonList';

export default async function VideosPage() {
  const lessons = await getLessons();

  const lessonVideos: LessonVideoProps[] = lessons.map((lesson: any) => ({
    id: lesson.id ?? lesson.slug,
    slug: lesson.slug,
    title: lesson.title,
    description: lesson.description,
    video_url: lesson.video_url,
  }));

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 py-10">
      <div className="container mx-auto px-4">
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-extrabold text-gray-900 dark:text-white">Video Lessons</h1>
          <p className="mt-3 text-lg text-gray-600 dark:text-gray-300">
            Watch lessons pulled directly from the database.
          </p>
        </div>

        <VideoLessonList lessons={lessonVideos} />
      </div>
    </div>
  );
}