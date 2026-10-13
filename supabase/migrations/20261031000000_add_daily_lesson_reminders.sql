CREATE TABLE IF NOT EXISTS public.lesson_reminder_settings (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  reminder_time TIME,
  timezone TEXT,
  enabled BOOLEAN NOT NULL DEFAULT FALSE,
  prompted_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT lesson_reminder_settings_valid CHECK (
    (
      enabled = FALSE
      AND reminder_time IS NULL
      AND timezone IS NULL
    )
    OR (
      enabled = TRUE
      AND reminder_time IS NOT NULL
      AND timezone IS NOT NULL
      AND length(timezone) BETWEEN 1 AND 100
    )
  )
);

CREATE INDEX IF NOT EXISTS lesson_reminder_settings_due_idx
  ON public.lesson_reminder_settings (reminder_time)
  WHERE enabled = TRUE;

ALTER TABLE public.lesson_reminder_settings ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON TABLE public.lesson_reminder_settings FROM PUBLIC, anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.lesson_reminder_settings TO authenticated;
GRANT ALL ON TABLE public.lesson_reminder_settings TO service_role;

CREATE POLICY "Users manage their own lesson reminder settings"
  ON public.lesson_reminder_settings
  FOR ALL TO authenticated
  USING ((SELECT auth.uid()) = user_id)
  WITH CHECK ((SELECT auth.uid()) = user_id);

CREATE TABLE IF NOT EXISTS public.lesson_push_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  endpoint TEXT NOT NULL UNIQUE,
  p256dh TEXT NOT NULL,
  auth TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT lesson_push_subscriptions_https_endpoint
    CHECK (endpoint LIKE 'https://%'),
  CONSTRAINT lesson_push_subscriptions_key_lengths
    CHECK (length(p256dh) BETWEEN 1 AND 512 AND length(auth) BETWEEN 1 AND 512)
);

CREATE INDEX IF NOT EXISTS lesson_push_subscriptions_user_id_idx
  ON public.lesson_push_subscriptions (user_id);

ALTER TABLE public.lesson_push_subscriptions ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON TABLE public.lesson_push_subscriptions FROM PUBLIC, anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.lesson_push_subscriptions TO authenticated;
GRANT ALL ON TABLE public.lesson_push_subscriptions TO service_role;

CREATE POLICY "Users manage their own lesson push subscriptions"
  ON public.lesson_push_subscriptions
  FOR ALL TO authenticated
  USING ((SELECT auth.uid()) = user_id)
  WITH CHECK ((SELECT auth.uid()) = user_id);

CREATE TABLE IF NOT EXISTS public.lesson_reminder_deliveries (
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  reminder_date DATE NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, reminder_date)
);

ALTER TABLE public.lesson_reminder_deliveries ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON TABLE public.lesson_reminder_deliveries FROM PUBLIC, anon, authenticated;
GRANT ALL ON TABLE public.lesson_reminder_deliveries TO service_role;

CREATE OR REPLACE FUNCTION public.claim_lesson_reminder(
  p_user_id UUID,
  p_reminder_date DATE
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  claimed_user_id UUID;
BEGIN
  INSERT INTO public.lesson_reminder_deliveries (user_id, reminder_date)
  VALUES (p_user_id, p_reminder_date)
  ON CONFLICT (user_id, reminder_date) DO NOTHING
  RETURNING user_id INTO claimed_user_id;

  RETURN claimed_user_id IS NOT NULL;
END;
$$;

REVOKE ALL ON FUNCTION public.claim_lesson_reminder(UUID, DATE) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.claim_lesson_reminder(UUID, DATE) TO service_role;

REVOKE ALL ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;
