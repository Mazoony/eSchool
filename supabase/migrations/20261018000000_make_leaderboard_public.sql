DROP POLICY IF EXISTS "Authenticated users can view leaderboard" ON public.leaderboard;
DROP POLICY IF EXISTS "Anyone can view leaderboard aggregates" ON public.leaderboard;
CREATE POLICY "Anyone can view leaderboard aggregates"
  ON public.leaderboard
  FOR SELECT TO anon, authenticated
  USING (true);

GRANT SELECT ON TABLE public.leaderboard TO anon;

CREATE OR REPLACE FUNCTION public.get_public_leaderboard()
RETURNS TABLE (
  student_id UUID,
  full_name TEXT,
  username TEXT,
  avatar_url TEXT,
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
