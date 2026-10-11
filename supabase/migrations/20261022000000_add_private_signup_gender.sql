ALTER TABLE public.private_signup_details
  ADD COLUMN gender TEXT
  CHECK (gender IS NULL OR gender IN ('female', 'male'));

CREATE OR REPLACE FUNCTION public.save_required_signup_details()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  submitted_phone TEXT;
  submitted_birth_date TEXT;
  submitted_gender TEXT;
BEGIN
  IF NEW.raw_app_meta_data ->> 'provider' <> 'email' THEN
    RETURN NEW;
  END IF;

  submitted_phone := NULLIF(btrim(NEW.raw_user_meta_data ->> 'phone_number'), '');
  submitted_birth_date := NULLIF(btrim(NEW.raw_user_meta_data ->> 'birth_date'), '');
  submitted_gender := NULLIF(btrim(NEW.raw_user_meta_data ->> 'gender'), '');

  IF submitted_phone IS NULL THEN
    RAISE EXCEPTION 'Phone number is required to create an account.';
  END IF;
  IF submitted_birth_date IS NULL THEN
    RAISE EXCEPTION 'Birthdate is required to create an account.';
  END IF;
  IF submitted_birth_date !~ '^[0-9]{4}-[0-9]{2}-[0-9]{2}$' THEN
    RAISE EXCEPTION 'Enter a valid birthdate in YYYY-MM-DD format.';
  END IF;
  IF submitted_gender IS NULL OR submitted_gender NOT IN ('female', 'male') THEN
    RAISE EXCEPTION 'Select female or male.';
  END IF;

  INSERT INTO public.private_signup_details (user_id, phone_number, birth_date, gender)
  VALUES (NEW.id, submitted_phone, submitted_birth_date::DATE, submitted_gender);

  RETURN NEW;
END;
$$;

NOTIFY pgrst, 'reload schema';
