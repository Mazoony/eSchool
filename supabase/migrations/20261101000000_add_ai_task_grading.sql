ALTER TABLE public.lessons
  ADD COLUMN task_grading_rubric TEXT
  CHECK (task_grading_rubric IS NULL OR length(task_grading_rubric) <= 5000);

ALTER TABLE public.lesson_submissions
  ADD COLUMN grading_status TEXT NOT NULL DEFAULT 'pending'
  CHECK (grading_status IN ('pending', 'grading', 'ai_graded', 'needs_review', 'grading_failed', 'teacher_reviewed')),
  ADD COLUMN grading_feedback TEXT
  CHECK (grading_feedback IS NULL OR length(grading_feedback) <= 2000),
  ADD COLUMN grading_model TEXT
  CHECK (grading_model IS NULL OR length(grading_model) <= 100),
  ADD COLUMN graded_at TIMESTAMPTZ;

CREATE OR REPLACE FUNCTION public.protect_lesson_submission_score()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = ''
AS $$
DECLARE
  max_score NUMERIC(7, 2);
  has_moderator_access BOOLEAN := (SELECT public.has_task_moderator_access());
  is_service_role BOOLEAN := (SELECT auth.role()) = 'service_role';
BEGIN
  SELECT task_max_score
  INTO max_score
  FROM public.lessons
  WHERE id = NEW.lesson_id;

  IF max_score IS NULL THEN
    RAISE EXCEPTION 'The lesson has no maximum task score.';
  END IF;

  IF NEW.score IS NOT NULL AND (NEW.score < 0 OR NEW.score > max_score) THEN
    RAISE EXCEPTION 'The mark must be between 0 and the task maximum of %.', max_score;
  END IF;

  IF is_service_role THEN
    RETURN NEW;
  END IF;

  IF TG_OP = 'INSERT' THEN
    NEW.score := NULL;
    NEW.grading_status := 'pending';
    NEW.grading_feedback := NULL;
    NEW.grading_model := NULL;
    NEW.graded_at := NULL;
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
      NEW.grading_status := 'pending';
      NEW.grading_feedback := NULL;
      NEW.grading_model := NULL;
      NEW.graded_at := NULL;
    ELSIF NEW.score IS DISTINCT FROM OLD.score
      OR NEW.updated_at IS DISTINCT FROM OLD.updated_at THEN
      NEW.grading_status := CASE
        WHEN NEW.score IS NULL THEN 'pending'
        ELSE 'teacher_reviewed'
      END;
      NEW.grading_model := NULL;
      NEW.updated_at := now();
      NEW.graded_at := CASE WHEN NEW.score IS NULL THEN NULL ELSE now() END;
    ELSIF NEW.grading_status IS DISTINCT FROM OLD.grading_status
      OR NEW.grading_feedback IS DISTINCT FROM OLD.grading_feedback
      OR NEW.grading_model IS DISTINCT FROM OLD.grading_model
      OR NEW.graded_at IS DISTINCT FROM OLD.graded_at THEN
      RAISE EXCEPTION 'Task moderators may change marks only.';
    END IF;
  ELSE
    IF NEW.student_id IS DISTINCT FROM OLD.student_id
      OR NEW.lesson_id IS DISTINCT FROM OLD.lesson_id THEN
      RAISE EXCEPTION 'A submission cannot be moved to a different student or lesson.';
    END IF;

    IF NEW.answer IS DISTINCT FROM OLD.answer THEN
      NEW.score := NULL;
      NEW.grading_status := 'pending';
      NEW.grading_feedback := NULL;
      NEW.grading_model := NULL;
      NEW.graded_at := NULL;
    ELSE
      NEW.score := OLD.score;
      NEW.grading_status := OLD.grading_status;
      NEW.grading_feedback := OLD.grading_feedback;
      NEW.grading_model := OLD.grading_model;
      NEW.graded_at := OLD.graded_at;
    END IF;
  END IF;

  RETURN NEW;
END;
$$;

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

CREATE OR REPLACE FUNCTION public.complete_ai_lesson_submission(
  p_submission_id UUID,
  p_answer TEXT,
  p_submission_updated_at TIMESTAMPTZ,
  p_score NUMERIC,
  p_feedback TEXT,
  p_confidence NUMERIC,
  p_model TEXT
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  max_score NUMERIC(7, 2);
  updated_count INTEGER;
BEGIN
  IF (SELECT auth.role()) <> 'service_role' THEN
    RAISE EXCEPTION 'Only the grading service may grade submissions.';
  END IF;

  IF p_score IS NULL OR p_score < 0
    OR p_confidence IS NULL OR p_confidence < 0 OR p_confidence > 1
    OR p_feedback IS NULL OR length(p_feedback) > 2000
    OR p_model IS NULL OR length(p_model) > 100 THEN
    RAISE EXCEPTION 'Invalid AI grading result.';
  END IF;

  SELECT lessons.task_max_score
  INTO max_score
  FROM public.lesson_submissions AS submissions
  JOIN public.lessons AS lessons ON lessons.id = submissions.lesson_id
  WHERE submissions.id = p_submission_id;

  IF max_score IS NULL OR p_score > max_score THEN
    RAISE EXCEPTION 'The AI mark exceeds the task maximum.';
  END IF;

  UPDATE public.lesson_submissions
  SET score = CASE WHEN p_confidence >= 0.75 THEN round(p_score, 2) ELSE NULL END,
      grading_status = CASE WHEN p_confidence >= 0.75 THEN 'ai_graded' ELSE 'needs_review' END,
      grading_feedback = p_feedback,
      grading_model = p_model,
      graded_at = now()
  WHERE id = p_submission_id
    AND answer = p_answer
    AND updated_at = p_submission_updated_at
    AND grading_status = 'grading';

  GET DIAGNOSTICS updated_count = ROW_COUNT;
  RETURN updated_count = 1;
END;
$$;

REVOKE ALL ON FUNCTION public.complete_ai_lesson_submission(UUID, TEXT, TIMESTAMPTZ, NUMERIC, TEXT, NUMERIC, TEXT)
  FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.complete_ai_lesson_submission(UUID, TEXT, TIMESTAMPTZ, NUMERIC, TEXT, NUMERIC, TEXT)
  TO service_role;

CREATE OR REPLACE FUNCTION public.fail_ai_lesson_submission(
  p_submission_id UUID,
  p_feedback TEXT
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  IF (SELECT auth.role()) <> 'service_role' THEN
    RAISE EXCEPTION 'Only the grading service may update grading state.';
  END IF;

  UPDATE public.lesson_submissions
  SET grading_status = 'grading_failed',
      grading_feedback = p_feedback,
      graded_at = NULL
  WHERE id = p_submission_id
    AND grading_status = 'grading';
END;
$$;

REVOKE ALL ON FUNCTION public.fail_ai_lesson_submission(UUID, TEXT) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.fail_ai_lesson_submission(UUID, TEXT) TO service_role;

NOTIFY pgrst, 'reload schema';
