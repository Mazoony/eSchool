import { Profile } from '@/app/types';
import { createClient } from './client';

export interface LessonTask {
  id: string;
  title: string;
  task_prompt: string | null;
}

export interface LessonSubmission {
  id: string;
  lesson_id: string;
  student_id: string;
  answer: string;
  created_at: string;
  updated_at: string;
  student: Pick<Profile, 'id' | 'full_name' | 'username'>;
}

function throwIfError(error: { message: string } | null): void {
  if (error) throw new Error(error.message);
}

export async function getLessonsWithTasks(): Promise<LessonTask[]> {
  const { data, error } = await createClient()
    .from('lessons')
    .select('id, title, task_prompt')
    .order('created_at', { ascending: false });
  throwIfError(error);
  return (data ?? []).map((row) => ({
    id: String(row.id),
    title: typeof row.title === 'string' ? row.title : 'Untitled lesson',
    task_prompt: typeof row.task_prompt === 'string' ? row.task_prompt : null,
  }));
}

export async function saveLessonTaskPrompt(lessonId: string, prompt: string): Promise<void> {
  const { error } = await createClient()
    .from('lessons')
    .update({ task_prompt: prompt.trim() || null })
    .eq('id', lessonId);
  throwIfError(error);
}

export async function getStudentLessonSubmission(
  lessonId: string,
  studentId: string,
): Promise<Pick<LessonSubmission, 'answer' | 'created_at' | 'updated_at'> | null> {
  const { data, error } = await createClient()
    .from('lesson_submissions')
    .select('answer, created_at, updated_at')
    .eq('lesson_id', lessonId)
    .eq('student_id', studentId)
    .maybeSingle();
  throwIfError(error);
  if (!data) return null;
  return {
    answer: String(data.answer),
    created_at: String(data.created_at),
    updated_at: String(data.updated_at),
  };
}

export async function saveStudentLessonSubmission(
  lessonId: string,
  studentId: string,
  answer: string,
): Promise<void> {
  const trimmedAnswer = answer.trim();
  if (!trimmedAnswer) throw new Error('Write an answer before submitting.');
  if (trimmedAnswer.length > 10000) throw new Error('Your answer must be 10,000 characters or fewer.');

  const { error } = await createClient()
    .from('lesson_submissions')
    .upsert(
      {
        lesson_id: lessonId,
        student_id: studentId,
        answer: trimmedAnswer,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'lesson_id,student_id' },
    );
  throwIfError(error);
}

export async function getLessonSubmissions(lessonId: string): Promise<LessonSubmission[]> {
  const client = createClient();
  const { data, error } = await client
    .from('lesson_submissions')
    .select('id, lesson_id, student_id, answer, created_at, updated_at')
    .eq('lesson_id', lessonId)
    .order('updated_at', { ascending: false });
  throwIfError(error);
  if (!data?.length) return [];

  const studentIds = [...new Set(data.map((row) => String(row.student_id)))];
  const { data: profiles, error: profilesError } = await client
    .from('profiles')
    .select('id, full_name, username')
    .in('id', studentIds);
  throwIfError(profilesError);

  const profilesById = new Map(
    (profiles ?? []).map((profile) => [String(profile.id), profile]),
  );

  return data.map((row) => {
    const studentId = String(row.student_id);
    const profile = profilesById.get(studentId);
    return {
      id: String(row.id),
      lesson_id: String(row.lesson_id),
      student_id: studentId,
      answer: String(row.answer),
      created_at: String(row.created_at),
      updated_at: String(row.updated_at),
      student: {
        id: studentId,
        full_name: typeof profile?.full_name === 'string' ? profile.full_name : null,
        username: typeof profile?.username === 'string' ? profile.username : null,
      },
    };
  });
}
