ALTER TABLE public.lessons
  DROP CONSTRAINT IF EXISTS lessons_grade_class_valid;

ALTER TABLE public.lessons
  ADD CONSTRAINT lessons_grade_class_valid
  CHECK (
    (grade IS NULL AND class_number IS NULL)
    OR (
      grade = 'english-foundation'
      AND class_number IS NULL
    )
    OR (
      class_number IS NOT NULL
      AND (
        (grade = 'elementary-school' AND class_number BETWEEN 1 AND 6)
        OR (grade IN ('high-school', 'secondary-school') AND class_number BETWEEN 1 AND 3)
      )
    )
  );
