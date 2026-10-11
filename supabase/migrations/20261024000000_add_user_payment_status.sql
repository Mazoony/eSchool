CREATE TABLE public.user_payment_status (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'not-paid' CHECK (status IN ('not-paid', 'paid')),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.user_payment_status ENABLE ROW LEVEL SECURITY;

REVOKE ALL ON TABLE public.user_payment_status FROM PUBLIC, anon, authenticated;
GRANT SELECT ON TABLE public.user_payment_status TO authenticated;

CREATE POLICY "Only the site admin can view payment statuses"
  ON public.user_payment_status
  FOR SELECT TO authenticated
  USING ((SELECT auth.jwt() ->> 'email') = 'wadareaf@gmail.com');

INSERT INTO public.user_payment_status (user_id)
SELECT id
FROM auth.users
ON CONFLICT (user_id) DO NOTHING;

CREATE OR REPLACE FUNCTION public.initialize_user_payment_status()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  INSERT INTO public.user_payment_status (user_id)
  VALUES (NEW.id)
  ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
END;
$$;

REVOKE ALL ON FUNCTION public.initialize_user_payment_status() FROM PUBLIC, anon, authenticated;

CREATE TRIGGER initialize_user_payment_status
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.initialize_user_payment_status();

CREATE OR REPLACE FUNCTION public.get_admin_user_payment_statuses()
RETURNS TABLE (
  user_id UUID,
  email TEXT,
  full_name TEXT,
  payment_status TEXT,
  created_at TIMESTAMPTZ
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  IF (SELECT auth.jwt() ->> 'email') IS DISTINCT FROM 'wadareaf@gmail.com' THEN
    RAISE EXCEPTION 'Only the site admin can view user payment statuses.';
  END IF;

  RETURN QUERY
  SELECT
    users.id,
    users.email::TEXT,
    COALESCE(profiles.full_name, users.raw_user_meta_data ->> 'full_name'),
    payment.status,
    users.created_at
  FROM auth.users AS users
  JOIN public.user_payment_status AS payment ON payment.user_id = users.id
  LEFT JOIN public.profiles AS profiles ON profiles.id = users.id
  ORDER BY users.created_at DESC;
END;
$$;

CREATE OR REPLACE FUNCTION public.set_admin_user_payment_status(target_user_id UUID, new_status TEXT)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  IF (SELECT auth.jwt() ->> 'email') IS DISTINCT FROM 'wadareaf@gmail.com' THEN
    RAISE EXCEPTION 'Only the site admin can update user payment statuses.';
  END IF;
  IF new_status IS NULL OR new_status NOT IN ('not-paid', 'paid') THEN
    RAISE EXCEPTION 'Payment status must be not-paid or paid.';
  END IF;

  UPDATE public.user_payment_status
  SET status = new_status, updated_at = pg_catalog.now()
  WHERE user_id = target_user_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'User payment status was not found.';
  END IF;
END;
$$;

REVOKE ALL ON FUNCTION public.get_admin_user_payment_statuses() FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.set_admin_user_payment_status(UUID, TEXT) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.get_admin_user_payment_statuses() TO authenticated;
GRANT EXECUTE ON FUNCTION public.set_admin_user_payment_status(UUID, TEXT) TO authenticated;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime'
      AND schemaname = 'public'
      AND tablename = 'user_payment_status'
  ) THEN
    ALTER PUBLICATION supabase_realtime
      ADD TABLE public.user_payment_status;
  END IF;
END;
$$;

NOTIFY pgrst, 'reload schema';
