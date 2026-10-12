ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS preferred_grade TEXT;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conrelid = 'public.profiles'::regclass
      AND conname = 'profiles_preferred_grade_valid'
  ) THEN
    ALTER TABLE public.profiles
      ADD CONSTRAINT profiles_preferred_grade_valid
      CHECK (
        preferred_grade IS NULL
        OR preferred_grade IN (
          'english-foundation',
          'elementary-school',
          'high-school',
          'secondary-school'
        )
      );
  END IF;
END;
$$;

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  preferred_grade TEXT := NEW.raw_user_meta_data->>'preferred_grade';
BEGIN
  INSERT INTO public.profiles (id, full_name, avatar_url, preferred_grade)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name'),
    COALESCE(NEW.raw_user_meta_data->>'avatar_url', NEW.raw_user_meta_data->>'picture'),
    CASE
      WHEN preferred_grade IN (
        'english-foundation',
        'elementary-school',
        'high-school',
        'secondary-school'
      ) THEN preferred_grade
      ELSE NULL
    END
  );
  RETURN NEW;
END;
$$;
