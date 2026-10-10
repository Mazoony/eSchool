ALTER TABLE public.lessons
  ADD COLUMN task_prompt TEXT CHECK (task_prompt IS NULL OR length(task_prompt) <= 5000);

CREATE TABLE public.lesson_submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lesson_id UUID NOT NULL REFERENCES public.lessons(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  answer TEXT NOT NULL CHECK (length(btrim(answer)) > 0 AND length(answer) <= 10000),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT lesson_submissions_lesson_student_unique UNIQUE (lesson_id, student_id)
);

CREATE INDEX lesson_submissions_student_id_idx
  ON public.lesson_submissions (student_id);

ALTER TABLE public.lesson_submissions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Students and admin can read lesson submissions"
  ON public.lesson_submissions
  FOR SELECT TO authenticated
  USING (
    (SELECT auth.uid()) = student_id
    OR (SELECT auth.jwt() ->> 'email') = 'wadareaf@gmail.com'
  );

CREATE POLICY "Students can submit their own lesson answers"
  ON public.lesson_submissions
  FOR INSERT TO authenticated
  WITH CHECK (
    (SELECT auth.uid()) = student_id
    AND EXISTS (
      SELECT 1
      FROM public.lessons
      WHERE id = lesson_id AND task_prompt IS NOT NULL
    )
  );

CREATE POLICY "Students can revise their own lesson answers"
  ON public.lesson_submissions
  FOR UPDATE TO authenticated
  USING (
    (SELECT auth.uid()) = student_id
    AND EXISTS (
      SELECT 1
      FROM public.lessons
      WHERE id = lesson_id AND task_prompt IS NOT NULL
    )
  )
  WITH CHECK (
    (SELECT auth.uid()) = student_id
    AND EXISTS (
      SELECT 1
      FROM public.lessons
      WHERE id = lesson_id AND task_prompt IS NOT NULL
    )
  );
