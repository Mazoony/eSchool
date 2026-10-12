CREATE SEQUENCE public.lessons_display_order_seq;

ALTER TABLE public.lessons
  ADD COLUMN display_order INTEGER;

WITH ordered_lessons AS (
  SELECT
    id,
    row_number() OVER (ORDER BY created_at DESC, id) AS position
  FROM public.lessons
)
UPDATE public.lessons AS lessons
SET display_order = ordered_lessons.position
FROM ordered_lessons
WHERE lessons.id = ordered_lessons.id;

SELECT setval(
  'public.lessons_display_order_seq',
  COALESCE((SELECT max(display_order) + 1 FROM public.lessons), 1),
  false
);

ALTER TABLE public.lessons
  ALTER COLUMN display_order SET DEFAULT nextval('public.lessons_display_order_seq'),
  ALTER COLUMN display_order SET NOT NULL,
  ADD CONSTRAINT lessons_display_order_positive CHECK (display_order > 0);

ALTER SEQUENCE public.lessons_display_order_seq
  OWNED BY public.lessons.display_order;

GRANT USAGE, SELECT ON SEQUENCE public.lessons_display_order_seq TO authenticated;
