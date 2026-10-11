ALTER TABLE public.profiles
  ADD COLUMN is_paid BOOLEAN NOT NULL DEFAULT false;

UPDATE public.profiles AS profiles
SET is_paid = (payment.status = 'paid')
FROM public.user_payment_status AS payment
WHERE payment.user_id = profiles.id;

CREATE OR REPLACE FUNCTION public.sync_paid_badge_to_profile()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  UPDATE public.profiles
  SET is_paid = (NEW.status = 'paid')
  WHERE id = NEW.user_id;
  RETURN NEW;
END;
$$;

REVOKE ALL ON FUNCTION public.sync_paid_badge_to_profile() FROM PUBLIC, anon, authenticated;

CREATE TRIGGER sync_paid_badge_to_profile
  AFTER INSERT OR UPDATE OF status ON public.user_payment_status
  FOR EACH ROW
  EXECUTE FUNCTION public.sync_paid_badge_to_profile();

CREATE OR REPLACE FUNCTION public.prevent_unauthorized_paid_badge_change()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = ''
AS $$
BEGIN
  IF NEW.is_paid IS DISTINCT FROM OLD.is_paid
    AND (SELECT auth.jwt() ->> 'email') IS DISTINCT FROM 'wadareaf@gmail.com' THEN
    RAISE EXCEPTION 'Only the site admin can change paid account badges.';
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER prevent_unauthorized_paid_badge_change
  BEFORE UPDATE OF is_paid ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.prevent_unauthorized_paid_badge_change();

DROP FUNCTION public.get_public_leaderboard();

CREATE FUNCTION public.get_public_leaderboard()
RETURNS TABLE (
  student_id UUID,
  full_name TEXT,
  username TEXT,
  avatar_url TEXT,
  is_paid BOOLEAN,
  average_percentage NUMERIC,
  graded_tasks INTEGER,
  rank BIGINT
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT
    leaderboard.student_id,
    profiles.full_name,
    profiles.username,
    profiles.avatar_url,
    profiles.is_paid,
    leaderboard.average_percentage,
    leaderboard.graded_tasks,
    dense_rank() OVER (
      ORDER BY leaderboard.average_percentage DESC
    ) AS rank
  FROM public.leaderboard AS leaderboard
  JOIN public.profiles AS profiles ON profiles.id = leaderboard.student_id
  ORDER BY leaderboard.average_percentage DESC, leaderboard.student_id ASC;
$$;

REVOKE ALL ON FUNCTION public.get_public_leaderboard() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_public_leaderboard() TO anon, authenticated;

NOTIFY pgrst, 'reload schema';
