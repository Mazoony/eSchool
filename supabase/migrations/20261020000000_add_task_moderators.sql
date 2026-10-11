CREATE TABLE public.task_moderators (
  email TEXT PRIMARY KEY
    CHECK (
      email = lower(btrim(email))
      AND email ~ '^[^[:space:]@]+@[^[:space:]@]+\.[^[:space:]@]+$'
      AND email <> 'wadareaf@gmail.com'
    ),
  added_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.task_moderators ENABLE ROW LEVEL SECURITY;

REVOKE ALL ON TABLE public.task_moderators FROM PUBLIC, anon, authenticated;
GRANT SELECT, INSERT, DELETE ON TABLE public.task_moderators TO authenticated;

CREATE POLICY "Admin can view task moderators"
  ON public.task_moderators
  FOR SELECT TO authenticated
  USING ((SELECT auth.jwt() ->> 'email') = 'wadareaf@gmail.com');

CREATE POLICY "Admin can add task moderators"
  ON public.task_moderators
  FOR INSERT TO authenticated
  WITH CHECK (
    (SELECT auth.jwt() ->> 'email') = 'wadareaf@gmail.com'
    AND email <> 'wadareaf@gmail.com'
    AND added_by = (SELECT auth.uid())
  );

CREATE POLICY "Admin can remove task moderators"
  ON public.task_moderators
  FOR DELETE TO authenticated
  USING ((SELECT auth.jwt() ->> 'email') = 'wadareaf@gmail.com');

CREATE OR REPLACE FUNCTION public.has_task_moderator_access()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT
    COALESCE((SELECT auth.jwt() ->> 'email') = 'wadareaf@gmail.com', false)
    OR EXISTS (
      SELECT 1
      FROM public.task_moderators AS moderators
      WHERE moderators.email = lower((SELECT auth.jwt() ->> 'email'))
    );
$$;

REVOKE ALL ON FUNCTION public.has_task_moderator_access() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.has_task_moderator_access() TO authenticated;

DROP POLICY IF EXISTS "Students and admin can read lesson submissions" ON public.lesson_submissions;
CREATE POLICY "Students and moderators can read lesson submissions"
  ON public.lesson_submissions
  FOR SELECT TO authenticated
  USING (
    (SELECT auth.uid()) = student_id
    OR (SELECT public.has_task_moderator_access())
  );

DROP POLICY IF EXISTS "Admin can grade lesson submissions" ON public.lesson_submissions;
CREATE POLICY "Task moderators can grade lesson submissions"
  ON public.lesson_submissions
  FOR UPDATE TO authenticated
  USING ((SELECT public.has_task_moderator_access()))
  WITH CHECK ((SELECT public.has_task_moderator_access()));

CREATE OR REPLACE FUNCTION public.protect_lesson_submission_score()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = ''
AS $$
DECLARE
  max_score NUMERIC(7, 2);
  has_moderator_access BOOLEAN := (SELECT public.has_task_moderator_access());
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
    ELSIF has_moderator_access THEN
      IF NEW.id IS DISTINCT FROM OLD.id
        OR NEW.lesson_id IS DISTINCT FROM OLD.lesson_id
        OR NEW.student_id IS DISTINCT FROM OLD.student_id
        OR NEW.created_at IS DISTINCT FROM OLD.created_at THEN
        RAISE EXCEPTION 'Task moderators may change marks only.';
      END IF;

      IF NEW.answer IS DISTINCT FROM OLD.answer THEN
        IF OLD.student_id IS DISTINCT FROM (SELECT auth.uid()) THEN
          RAISE EXCEPTION 'Task moderators may not change another student’s answer.';
        END IF;
        NEW.score := NULL;
      ELSIF NEW.updated_at IS DISTINCT FROM OLD.updated_at THEN
        RAISE EXCEPTION 'Task moderators may change marks only.';
      END IF;
    ELSE
      IF TG_OP = 'UPDATE' THEN
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
  END IF;

  RETURN NEW;
END;
$$;

NOTIFY pgrst, 'reload schema';
