CREATE TABLE public.lesson_task_grading_guides (
  lesson_id UUID PRIMARY KEY REFERENCES public.lessons(id) ON DELETE CASCADE,
  grading_guide TEXT NOT NULL CHECK (length(grading_guide) BETWEEN 1 AND 5000),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

INSERT INTO public.lesson_task_grading_guides (lesson_id, grading_guide)
SELECT id, btrim(task_grading_rubric)
FROM public.lessons
WHERE task_grading_rubric IS NOT NULL
  AND length(btrim(task_grading_rubric)) > 0
ON CONFLICT (lesson_id) DO UPDATE
SET grading_guide = EXCLUDED.grading_guide,
    updated_at = now();

ALTER TABLE public.lesson_task_grading_guides ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON TABLE public.lesson_task_grading_guides FROM PUBLIC, anon, authenticated;
GRANT ALL ON TABLE public.lesson_task_grading_guides TO service_role;

ALTER TABLE public.lessons DROP COLUMN task_grading_rubric;

CREATE OR REPLACE FUNCTION public.get_lesson_task_grading_guides()
RETURNS TABLE (lesson_id UUID, grading_guide TEXT)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  IF NOT COALESCE(public.has_task_moderator_access(), false) THEN
    RAISE EXCEPTION 'Only task reviewers may read grading guides.';
  END IF;

  RETURN QUERY
  SELECT guides.lesson_id, guides.grading_guide
  FROM public.lesson_task_grading_guides AS guides;
END;
$$;

REVOKE ALL ON FUNCTION public.get_lesson_task_grading_guides() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.get_lesson_task_grading_guides() TO authenticated;

CREATE OR REPLACE FUNCTION public.save_lesson_task_settings(
  p_lesson_id UUID,
  p_task_prompt TEXT,
  p_task_max_score NUMERIC,
  p_grading_guide TEXT
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  normalized_guide TEXT := nullif(btrim(p_grading_guide), '');
BEGIN
  IF (SELECT auth.jwt() ->> 'email') IS DISTINCT FROM 'wadareaf@gmail.com' THEN
    RAISE EXCEPTION 'Only the site admin may change task settings.';
  END IF;

  IF p_task_max_score IS NULL OR p_task_max_score <= 0 OR p_task_max_score > 10000
    OR p_task_max_score * 100 <> trunc(p_task_max_score * 100) THEN
    RAISE EXCEPTION 'The maximum mark must be greater than 0, at most 10,000, and have up to two decimal places.';
  END IF;
  IF p_task_prompt IS NOT NULL AND length(btrim(p_task_prompt)) > 5000 THEN
    RAISE EXCEPTION 'The task prompt must be 5,000 characters or fewer.';
  END IF;
  IF normalized_guide IS NOT NULL AND length(normalized_guide) > 5000 THEN
    RAISE EXCEPTION 'The grading guide must be 5,000 characters or fewer.';
  END IF;

  UPDATE public.lessons
  SET task_prompt = nullif(btrim(p_task_prompt), ''),
      task_max_score = p_task_max_score
  WHERE id = p_lesson_id;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Lesson not found.';
  END IF;

  IF normalized_guide IS NULL THEN
    DELETE FROM public.lesson_task_grading_guides
    WHERE lesson_id = p_lesson_id;
  ELSE
    INSERT INTO public.lesson_task_grading_guides (lesson_id, grading_guide, updated_at)
    VALUES (p_lesson_id, normalized_guide, now())
    ON CONFLICT (lesson_id) DO UPDATE
    SET grading_guide = EXCLUDED.grading_guide,
        updated_at = now();
  END IF;
END;
$$;

REVOKE ALL ON FUNCTION public.save_lesson_task_settings(UUID, TEXT, NUMERIC, TEXT) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.save_lesson_task_settings(UUID, TEXT, NUMERIC, TEXT) TO authenticated;

CREATE OR REPLACE FUNCTION public.claim_ai_lesson_submission(p_submission_id UUID, p_student_id UUID)
RETURNS TABLE (
  lesson_id UUID,
  answer TEXT,
  submission_updated_at TIMESTAMPTZ,
  task_prompt TEXT,
  task_grading_rubric TEXT,
  task_max_score NUMERIC
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  IF (SELECT auth.role()) <> 'service_role' THEN
    RAISE EXCEPTION 'Only the grading service may claim submissions.';
  END IF;

  RETURN QUERY
  WITH claimed AS (
    UPDATE public.lesson_submissions AS submissions
    SET grading_status = 'grading',
        grading_feedback = NULL,
        grading_model = NULL,
        graded_at = NULL
    WHERE submissions.id = p_submission_id
      AND submissions.student_id = p_student_id
      AND submissions.grading_status IN ('pending', 'grading_failed')
      AND EXISTS (
        SELECT 1
        FROM public.lessons AS lesson_check
        WHERE lesson_check.id = submissions.lesson_id
          AND lesson_check.task_prompt IS NOT NULL
      )
    RETURNING submissions.lesson_id, submissions.answer, submissions.updated_at
  )
  SELECT
    claimed.lesson_id,
    claimed.answer,
    claimed.updated_at,
    lessons.task_prompt,
    guides.grading_guide,
    lessons.task_max_score
  FROM claimed
  JOIN public.lessons AS lessons ON lessons.id = claimed.lesson_id
  LEFT JOIN public.lesson_task_grading_guides AS guides ON guides.lesson_id = lessons.id
  WHERE lessons.task_prompt IS NOT NULL;
END;
$$;

REVOKE ALL ON FUNCTION public.claim_ai_lesson_submission(UUID, UUID) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.claim_ai_lesson_submission(UUID, UUID) TO service_role;

NOTIFY pgrst, 'reload schema';
