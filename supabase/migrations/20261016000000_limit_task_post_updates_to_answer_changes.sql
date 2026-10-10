DROP TRIGGER IF EXISTS publish_lesson_submission_as_post ON public.lesson_submissions;
CREATE TRIGGER publish_lesson_submission_as_post
  AFTER INSERT OR UPDATE OF answer ON public.lesson_submissions
  FOR EACH ROW
  EXECUTE FUNCTION public.publish_lesson_submission_as_post();
