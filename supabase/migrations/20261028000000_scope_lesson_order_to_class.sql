ALTER TABLE public.lessons
  ALTER COLUMN display_order DROP DEFAULT;

DROP SEQUENCE IF EXISTS public.lessons_display_order_seq;

WITH ordered_lessons AS (
  SELECT
    id,
    row_number() OVER (
      PARTITION BY grade, class_number
      ORDER BY display_order, created_at DESC, id
    ) AS position
  FROM public.lessons
)
UPDATE public.lessons AS lessons
SET display_order = ordered_lessons.position
FROM ordered_lessons
WHERE lessons.id = ordered_lessons.id;

CREATE INDEX IF NOT EXISTS lessons_grade_class_display_order_idx
  ON public.lessons (grade, class_number, display_order, created_at DESC);

CREATE OR REPLACE FUNCTION public.assign_lesson_display_order()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  IF NEW.display_order IS NULL THEN
    PERFORM pg_catalog.pg_advisory_xact_lock(
      pg_catalog.hashtextextended(
        COALESCE(NEW.grade, '') || ':' ||
        COALESCE(NEW.class_number::text, 'unassigned'),
        0
      )
    );

    SELECT COALESCE(max(lessons.display_order), 0) + 1
    INTO NEW.display_order
    FROM public.lessons AS lessons
    WHERE lessons.grade IS NOT DISTINCT FROM NEW.grade
      AND lessons.class_number IS NOT DISTINCT FROM NEW.class_number;
  END IF;

  RETURN NEW;
END;
$$;

REVOKE ALL ON FUNCTION public.assign_lesson_display_order() FROM PUBLIC, anon, authenticated;

CREATE TRIGGER assign_lesson_display_order
  BEFORE INSERT ON public.lessons
  FOR EACH ROW
  EXECUTE FUNCTION public.assign_lesson_display_order();
