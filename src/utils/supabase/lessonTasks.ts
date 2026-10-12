import { Profile } from '@/app/types';
import { createClient } from './client';

export interface LessonTask {
  id: string;
  title: string;
  grade: string | null;
  class_number: number | null;
  display_order: number;
  task_prompt: string | null;
  task_max_score: number;
}

export interface LessonSubmission {
  id: string;
  lesson_id: string;
  student_id: string;
  answer: string;
  score: number | null;
  created_at: string;
  updated_at: string;
  student: Pick<Profile, 'id' | 'full_name' | 'username' | 'is_paid'>;
}

export interface LeaderboardEntry {
  student_id: string;
  rank: number;
  average_percentage: number;
  graded_tasks: number;
  student: Pick<Profile, 'id' | 'full_name' | 'username' | 'avatar_url' | 'is_paid'>;
}

export interface TaskModerator {
  email: string;
  created_at: string;
}

interface PublicLeaderboardRow {
  student_id: string;
  full_name: string | null;
  username: string | null;
  avatar_url: string | null;
  is_paid: boolean;
  average_percentage: number;
  graded_tasks: number;
  rank: number;
}

function throwIfError(error: { message: string } | null): void {
  if (error) throw new Error(error.message);
}

export async function getLessonsWithTasks(): Promise<LessonTask[]> {
  const { data, error } = await createClient()
    .from('lessons')
    .select('id, title, grade, class_number, display_order, task_prompt, task_max_score')
    .order('grade', { ascending: true, nullsFirst: true })
    .order('class_number', { ascending: true, nullsFirst: true })
    .order('display_order', { ascending: true })
    .order('created_at', { ascending: false });
  throwIfError(error);
  return (data ?? []).map((row) => ({
    id: String(row.id),
    title: typeof row.title === 'string' ? row.title : 'Untitled lesson',
    grade: typeof row.grade === 'string' ? row.grade : null,
    class_number: typeof row.class_number === 'number' ? row.class_number : null,
    display_order: Number(row.display_order),
    task_prompt: typeof row.task_prompt === 'string' ? row.task_prompt : null,
    task_max_score: Number(row.task_max_score),
  }));
}

export async function saveLessonTaskSettings(
  lessonId: string,
  prompt: string,
  maxScore: number,
): Promise<void> {
  if (!Number.isFinite(maxScore) || maxScore <= 0 || maxScore > 10000) {
    throw new Error('The maximum mark must be greater than 0 and no more than 10,000.');
  }
  if (!Number.isInteger(maxScore * 100)) {
    throw new Error('The maximum mark can have up to two decimal places.');
  }

  const { error } = await createClient()
    .from('lessons')
    .update({ task_prompt: prompt.trim() || null, task_max_score: maxScore })
    .eq('id', lessonId);
  throwIfError(error);
}

export async function getStudentLessonSubmission(
  lessonId: string,
  studentId: string,
): Promise<Pick<LessonSubmission, 'answer' | 'score' | 'created_at' | 'updated_at'> | null> {
  const { data, error } = await createClient()
    .from('lesson_submissions')
    .select('answer, score, created_at, updated_at')
    .eq('lesson_id', lessonId)
    .eq('student_id', studentId)
    .maybeSingle();
  throwIfError(error);
  if (!data) return null;
  return {
    answer: String(data.answer),
    score: data.score === null ? null : Number(data.score),
    created_at: String(data.created_at),
    updated_at: String(data.updated_at),
  };
}

export async function getCompletedLessonIds(
  lessonIds: string[],
  studentId: string,
): Promise<string[]> {
  if (lessonIds.length === 0) return [];

  const { data, error } = await createClient()
    .from('lesson_submissions')
    .select('lesson_id')
    .eq('student_id', studentId)
    .in('lesson_id', lessonIds);
  throwIfError(error);
  return (data ?? []).map((row) => String(row.lesson_id));
}

export async function saveLessonSubmissionScore(
  submissionId: string,
  score: number | null,
): Promise<void> {
  if (score !== null && (!Number.isFinite(score) || score < 0 || !Number.isInteger(score * 100))) {
    throw new Error('The mark must be zero or higher and have up to two decimal places.');
  }

  const { error } = await createClient()
    .from('lesson_submissions')
    .update({ score })
    .eq('id', submissionId);
  throwIfError(error);
}

export async function canGradeLessonSubmissions(): Promise<boolean> {
  const { data, error } = await createClient().rpc('has_task_moderator_access');
  throwIfError(error);
  return data === true;
}

export async function getTaskModerators(): Promise<TaskModerator[]> {
  const { data, error } = await createClient()
    .from('task_moderators')
    .select('email, created_at')
    .order('email', { ascending: true });
  throwIfError(error);
  return (data ?? []).map((row) => ({
    email: String(row.email),
    created_at: String(row.created_at),
  }));
}

export async function addTaskModerator(email: string, adminUserId: string): Promise<void> {
  const normalizedEmail = email.trim().toLowerCase();
  if (
    normalizedEmail === 'wadareaf@gmail.com'
    || normalizedEmail.length > 254
    || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)
  ) {
    throw new Error('Enter a valid teacher email address.');
  }

  const { error } = await createClient()
    .from('task_moderators')
    .insert({ email: normalizedEmail, added_by: adminUserId });
  throwIfError(error);
}

export async function removeTaskModerator(email: string): Promise<void> {
  const { error } = await createClient()
    .from('task_moderators')
    .delete()
    .eq('email', email.trim().toLowerCase());
  throwIfError(error);
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
    .select('id, lesson_id, student_id, answer, score, created_at, updated_at')
    .eq('lesson_id', lessonId)
    .order('updated_at', { ascending: false });
  throwIfError(error);
  if (!data?.length) return [];

  const studentIds = [...new Set(data.map((row) => String(row.student_id)))];
  const { data: profiles, error: profilesError } = await client
    .from('profiles')
    .select('id, full_name, username, is_paid')
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
      score: row.score === null ? null : Number(row.score),
      created_at: String(row.created_at),
      updated_at: String(row.updated_at),
      student: {
        id: studentId,
        full_name: typeof profile?.full_name === 'string' ? profile.full_name : null,
        username: typeof profile?.username === 'string' ? profile.username : null,
        is_paid: profile?.is_paid === true,
      },
    };
  });
}

export async function getLeaderboard(): Promise<LeaderboardEntry[]> {
  const client = createClient();
  const { data, error } = await client.rpc('get_public_leaderboard');
  throwIfError(error);
  if (!data?.length) return [];

  return data.map((row: PublicLeaderboardRow) => {
    const studentId = String(row.student_id);

    return {
      student_id: studentId,
      rank: Number(row.rank),
      average_percentage: Number(row.average_percentage),
      graded_tasks: Number(row.graded_tasks),
      student: {
        id: studentId,
        full_name: typeof row.full_name === 'string' ? row.full_name : null,
        username: typeof row.username === 'string' ? row.username : null,
        avatar_url: typeof row.avatar_url === 'string' ? row.avatar_url : null,
        is_paid: row.is_paid === true,
      },
    };
  });
}
