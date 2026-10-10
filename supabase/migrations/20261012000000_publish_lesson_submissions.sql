ALTER TABLE public.posts
  ADD COLUMN lesson_submission_id UUID UNIQUE
  REFERENCES public.lesson_submissions(id) ON DELETE CASCADE;

DROP POLICY IF EXISTS "Allow authenticated users to create posts" ON public.posts;
CREATE POLICY "Allow authenticated users to create posts"
  ON public.posts
  FOR INSERT TO authenticated
  WITH CHECK (
    (SELECT auth.uid()) = user_id
    AND (
      lesson_submission_id IS NULL
      OR EXISTS (
        SELECT 1
        FROM public.lesson_submissions
        WHERE id = lesson_submission_id
          AND student_id = (SELECT auth.uid())
      )
    )
  );

DROP POLICY IF EXISTS "Allow users to update their own posts" ON public.posts;
CREATE POLICY "Allow users to update their own posts"
  ON public.posts
  FOR UPDATE TO authenticated
  USING (
    (SELECT auth.uid()) = user_id
    AND lesson_submission_id IS NULL
  )
  WITH CHECK (
    (SELECT auth.uid()) = user_id
    AND lesson_submission_id IS NULL
  );

DROP POLICY IF EXISTS "Allow users to delete their own posts" ON public.posts;
CREATE POLICY "Allow users to delete their own posts"
  ON public.posts
  FOR DELETE TO authenticated
  USING (
    (SELECT auth.uid()) = user_id
    AND lesson_submission_id IS NULL
  );

CREATE OR REPLACE FUNCTION public.publish_lesson_submission_as_post()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  lesson_title TEXT;
BEGIN
  SELECT title
  INTO lesson_title
  FROM public.lessons
  WHERE id = NEW.lesson_id;

  INSERT INTO public.posts (content, user_id, lesson_submission_id)
  VALUES (
    pg_catalog.format('Task answer for "%s":%s%s', lesson_title, E'\n\n', NEW.answer),
    NEW.student_id,
    NEW.id
  )
  ON CONFLICT (lesson_submission_id)
  DO UPDATE SET
    content = EXCLUDED.content,
    updated_at = pg_catalog.now();

  RETURN NEW;
END;
$$;

CREATE TRIGGER publish_lesson_submission_as_post
  AFTER INSERT OR UPDATE ON public.lesson_submissions
  FOR EACH ROW
  EXECUTE FUNCTION public.publish_lesson_submission_as_post();

INSERT INTO public.posts (content, user_id, lesson_submission_id)
SELECT
  pg_catalog.format('Task answer for "%s":%s%s', lessons.title, E'\n\n', submissions.answer),
  submissions.student_id,
  submissions.id
FROM public.lesson_submissions AS submissions
JOIN public.lessons AS lessons ON lessons.id = submissions.lesson_id
ON CONFLICT (lesson_submission_id) DO NOTHING;
