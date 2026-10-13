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
    lessons.task_grading_rubric,
    lessons.task_max_score
  FROM claimed
  JOIN public.lessons AS lessons ON lessons.id = claimed.lesson_id
  WHERE lessons.task_prompt IS NOT NULL;
END;
$$;

REVOKE ALL ON FUNCTION public.claim_ai_lesson_submission(UUID, UUID) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.claim_ai_lesson_submission(UUID, UUID) TO service_role;
