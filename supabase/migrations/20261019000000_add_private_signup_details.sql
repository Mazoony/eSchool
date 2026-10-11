CREATE TABLE public.private_signup_details (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  phone_number TEXT NOT NULL
    CHECK (
      phone_number ~ '^\+?[0-9 ().-]{7,25}$'
      AND length(regexp_replace(phone_number, '[^0-9]', '', 'g')) BETWEEN 7 AND 15
    ),
  birth_date DATE NOT NULL CHECK (birth_date <= CURRENT_DATE),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.private_signup_details ENABLE ROW LEVEL SECURITY;

REVOKE ALL ON TABLE public.private_signup_details FROM PUBLIC, anon, authenticated;
GRANT SELECT ON TABLE public.private_signup_details TO authenticated;

CREATE POLICY "Users and admin can read private signup details"
  ON public.private_signup_details
  FOR SELECT TO authenticated
  USING (
    user_id = (SELECT auth.uid())
    OR (SELECT auth.jwt() ->> 'email') = 'wadareaf@gmail.com'
  );

CREATE OR REPLACE FUNCTION public.save_required_signup_details()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  submitted_phone TEXT;
  submitted_birth_date TEXT;
BEGIN
  IF NEW.raw_app_meta_data ->> 'provider' <> 'email' THEN
    RETURN NEW;
  END IF;

  submitted_phone := NULLIF(btrim(NEW.raw_user_meta_data ->> 'phone_number'), '');
  submitted_birth_date := NULLIF(btrim(NEW.raw_user_meta_data ->> 'birth_date'), '');

  IF submitted_phone IS NULL THEN
    RAISE EXCEPTION 'Phone number is required to create an account.';
  END IF;
  IF submitted_birth_date IS NULL THEN
    RAISE EXCEPTION 'Birthdate is required to create an account.';
  END IF;
  IF submitted_birth_date !~ '^[0-9]{4}-[0-9]{2}-[0-9]{2}$' THEN
    RAISE EXCEPTION 'Enter a valid birthdate in YYYY-MM-DD format.';
  END IF;

  INSERT INTO public.private_signup_details (user_id, phone_number, birth_date)
  VALUES (NEW.id, submitted_phone, submitted_birth_date::DATE);

  RETURN NEW;
END;
$$;

REVOKE ALL ON FUNCTION public.save_required_signup_details() FROM PUBLIC, anon, authenticated;

DROP TRIGGER IF EXISTS save_required_signup_details ON auth.users;
CREATE TRIGGER save_required_signup_details
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.save_required_signup_details();
