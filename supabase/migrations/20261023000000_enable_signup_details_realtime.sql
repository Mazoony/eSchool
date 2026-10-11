DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime'
      AND schemaname = 'public'
      AND tablename = 'private_signup_details'
  ) THEN
    ALTER PUBLICATION supabase_realtime
      ADD TABLE public.private_signup_details;
  END IF;
END;
$$;
