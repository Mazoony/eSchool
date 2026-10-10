DROP TRIGGER IF EXISTS refresh_leaderboard_after_submission ON public.lesson_submissions;
CREATE TRIGGER refresh_leaderboard_after_submission
  AFTER INSERT OR UPDATE OF score, answer, student_id, lesson_id OR DELETE ON public.lesson_submissions
  FOR EACH ROW
  EXECUTE FUNCTION public.refresh_leaderboard_after_submission();

NOTIFY pgrst, 'reload schema';
