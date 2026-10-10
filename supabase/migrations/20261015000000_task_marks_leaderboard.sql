ALTER TABLE public.lessons
  ADD COLUMN IF NOT EXISTS task_max_score NUMERIC(7, 2) NOT NULL DEFAULT 100
  CHECK (task_max_score > 0 AND task_max_score <= 10000);

ALTER TABLE public.lesson_submissions
  ADD COLUMN IF NOT EXISTS score NUMERIC(7, 2)
  CHECK (score IS NULL OR score >= 0);

CREATE INDEX IF NOT EXISTS lesson_submissions_graded_student_idx
  ON public.lesson_submissions (student_id, lesson_id)
  WHERE score IS NOT NULL;

CREATE TABLE IF NOT EXISTS public.leaderboard (
  student_id UUID PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
  average_percentage NUMERIC(5, 2) NOT NULL CHECK (average_percentage BETWEEN 0 AND 100),
  graded_tasks INTEGER NOT NULL CHECK (graded_tasks > 0),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.leaderboard ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Authenticated users can view leaderboard" ON public.leaderboard;
CREATE POLICY "Authenticated users can view leaderboard"
  ON public.leaderboard
  FOR SELECT TO authenticated
  USING (true);

REVOKE ALL ON TABLE public.leaderboard FROM anon, authenticated;
GRANT SELECT ON TABLE public.leaderboard TO authenticated;

DROP POLICY IF EXISTS "Admin can grade lesson submissions" ON public.lesson_submissions;
CREATE POLICY "Admin can grade lesson submissions"
  ON public.lesson_submissions
  FOR UPDATE TO authenticated
  USING ((SELECT auth.jwt() ->> 'email') = 'wadareaf@gmail.com')
  WITH CHECK ((SELECT auth.jwt() ->> 'email') = 'wadareaf@gmail.com');

CREATE OR REPLACE FUNCTION public.refresh_student_leaderboard(target_student_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  graded_count INTEGER;
  average_score NUMERIC(5, 2);
BEGIN
  SELECT
    count(*)::INTEGER,
    round(avg((submissions.score / lessons.task_max_score) * 100), 2)
  INTO graded_count, average_score
  FROM public.lesson_submissions AS submissions
  JOIN public.lessons AS lessons ON lessons.id = submissions.lesson_id
  WHERE submissions.student_id = target_student_id
    AND submissions.score IS NOT NULL;

  IF graded_count > 0 THEN
    INSERT INTO public.leaderboard (student_id, average_percentage, graded_tasks, updated_at)
    VALUES (target_student_id, average_score, graded_count, now())
    ON CONFLICT (student_id)
    DO UPDATE SET
      average_percentage = EXCLUDED.average_percentage,
      graded_tasks = EXCLUDED.graded_tasks,
      updated_at = EXCLUDED.updated_at;
  ELSE
    DELETE FROM public.leaderboard WHERE student_id = target_student_id;
  END IF;
END;
$$;

REVOKE ALL ON FUNCTION public.refresh_student_leaderboard(UUID) FROM PUBLIC, anon, authenticated;

CREATE OR REPLACE FUNCTION public.protect_lesson_submission_score()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = ''
AS $$
DECLARE
  max_score NUMERIC(7, 2);
  is_admin BOOLEAN := COALESCE(
    (SELECT auth.jwt() ->> 'email') = 'wadareaf@gmail.com',
    false
  );
BEGIN
  SELECT task_max_score
  INTO max_score
  FROM public.lessons
  WHERE id = NEW.lesson_id;

  IF max_score IS NULL THEN
    RAISE EXCEPTION 'The lesson has no maximum task score.';
  END IF;

  IF NEW.score IS NOT NULL AND NEW.score > max_score THEN
    RAISE EXCEPTION 'The mark cannot exceed the task maximum of %.', max_score;
  END IF;

  IF NOT is_admin THEN
    IF TG_OP = 'INSERT' THEN
      NEW.score := NULL;
    ELSE
      IF NEW.student_id IS DISTINCT FROM OLD.student_id
        OR NEW.lesson_id IS DISTINCT FROM OLD.lesson_id THEN
        RAISE EXCEPTION 'A submission cannot be moved to a different student or lesson.';
      END IF;

      NEW.score := OLD.score;
      IF NEW.answer IS DISTINCT FROM OLD.answer THEN
        NEW.score := NULL;
      END IF;
    END IF;
  END IF;

  RETURN NEW;
END;
$$;

REVOKE ALL ON FUNCTION public.protect_lesson_submission_score() FROM PUBLIC, anon, authenticated;

CREATE OR REPLACE FUNCTION public.refresh_leaderboard_after_submission()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  IF TG_OP = 'DELETE' THEN
    PERFORM public.refresh_student_leaderboard(OLD.student_id);
    RETURN OLD;
  END IF;

  PERFORM public.refresh_student_leaderboard(NEW.student_id);
  IF TG_OP = 'UPDATE' AND NEW.student_id IS DISTINCT FROM OLD.student_id THEN
    PERFORM public.refresh_student_leaderboard(OLD.student_id);
  END IF;
  RETURN NEW;
END;
$$;

REVOKE ALL ON FUNCTION public.refresh_leaderboard_after_submission() FROM PUBLIC, anon, authenticated;

CREATE OR REPLACE FUNCTION public.refresh_leaderboard_after_task_max_change()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  affected_student RECORD;
BEGIN
  FOR affected_student IN
    SELECT DISTINCT student_id
    FROM public.lesson_submissions
    WHERE lesson_id = NEW.id
      AND score IS NOT NULL
  LOOP
    PERFORM public.refresh_student_leaderboard(affected_student.student_id);
  END LOOP;
  RETURN NEW;
END;
$$;

REVOKE ALL ON FUNCTION public.refresh_leaderboard_after_task_max_change() FROM PUBLIC, anon, authenticated;

CREATE OR REPLACE FUNCTION public.reject_task_max_below_existing_marks()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = ''
AS $$
BEGIN
  IF NEW.task_max_score IS DISTINCT FROM OLD.task_max_score
    AND EXISTS (
      SELECT 1
      FROM public.lesson_submissions
      WHERE lesson_id = NEW.id
        AND score > NEW.task_max_score
    ) THEN
    RAISE EXCEPTION 'The maximum mark cannot be lower than a mark already awarded.';
  END IF;
  RETURN NEW;
END;
$$;

REVOKE ALL ON FUNCTION public.reject_task_max_below_existing_marks() FROM PUBLIC, anon, authenticated;

DROP TRIGGER IF EXISTS protect_lesson_submission_score ON public.lesson_submissions;
CREATE TRIGGER protect_lesson_submission_score
  BEFORE INSERT OR UPDATE ON public.lesson_submissions
  FOR EACH ROW
  EXECUTE FUNCTION public.protect_lesson_submission_score();

DROP TRIGGER IF EXISTS refresh_leaderboard_after_submission ON public.lesson_submissions;
CREATE TRIGGER refresh_leaderboard_after_submission
  AFTER INSERT OR UPDATE OR DELETE ON public.lesson_submissions
  FOR EACH ROW
  EXECUTE FUNCTION public.refresh_leaderboard_after_submission();

DROP TRIGGER IF EXISTS refresh_leaderboard_after_task_max_change ON public.lessons;
CREATE TRIGGER refresh_leaderboard_after_task_max_change
  AFTER UPDATE OF task_max_score ON public.lessons
  FOR EACH ROW
  WHEN (OLD.task_max_score IS DISTINCT FROM NEW.task_max_score)
  EXECUTE FUNCTION public.refresh_leaderboard_after_task_max_change();

DROP TRIGGER IF EXISTS reject_task_max_below_existing_marks ON public.lessons;
CREATE TRIGGER reject_task_max_below_existing_marks
  BEFORE UPDATE OF task_max_score ON public.lessons
  FOR EACH ROW
  EXECUTE FUNCTION public.reject_task_max_below_existing_marks();

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime'
      AND schemaname = 'public'
      AND tablename = 'leaderboard'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.leaderboard;
  END IF;
END;
$$;
