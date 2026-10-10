DROP POLICY IF EXISTS "Allow authenticated users to insert a new like." ON public.likes;
DROP POLICY IF EXISTS "Authenticated users can create likes as themselves" ON public.likes;
CREATE POLICY "Authenticated users can create likes as themselves"
  ON public.likes
  FOR INSERT TO authenticated
  WITH CHECK ((SELECT auth.uid()) = user_id);

DROP POLICY IF EXISTS "Allow authenticated users to insert a new comment like." ON public.comment_likes;
DROP POLICY IF EXISTS "Authenticated users can create comment likes as themselves" ON public.comment_likes;
CREATE POLICY "Authenticated users can create comment likes as themselves"
  ON public.comment_likes
  FOR INSERT TO authenticated
  WITH CHECK ((SELECT auth.uid()) = user_id);

DROP POLICY IF EXISTS "Allow authenticated users to insert a new comment." ON public.comments;
DROP POLICY IF EXISTS "Authenticated users can create comments as themselves" ON public.comments;
CREATE POLICY "Authenticated users can create comments as themselves"
  ON public.comments
  FOR INSERT TO authenticated
  WITH CHECK ((SELECT auth.uid()) = user_id);

DROP POLICY IF EXISTS "Allow system to create notifications" ON public.notifications;

CREATE INDEX IF NOT EXISTS notifications_user_created_at_idx
  ON public.notifications (user_id, created_at DESC);

CREATE OR REPLACE FUNCTION public.notify_post_like()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  recipient_id UUID;
BEGIN
  SELECT user_id
  INTO recipient_id
  FROM public.posts
  WHERE id = NEW.post_id;

  IF recipient_id IS NOT NULL AND recipient_id <> NEW.user_id THEN
    INSERT INTO public.notifications (user_id, triggered_by_user_id, type, post_id)
    VALUES (recipient_id, NEW.user_id, 'like', NEW.post_id);
  END IF;

  RETURN NEW;
END;
$$;
REVOKE ALL ON FUNCTION public.notify_post_like() FROM PUBLIC, anon, authenticated;

CREATE OR REPLACE FUNCTION public.notify_post_comment()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  recipient_id UUID;
  notification_type TEXT;
BEGIN
  IF NEW.parent_id IS NULL THEN
    SELECT user_id
    INTO recipient_id
    FROM public.posts
    WHERE id = NEW.post_id;
    notification_type := 'comment';
  ELSE
    SELECT user_id
    INTO recipient_id
    FROM public.comments
    WHERE id = NEW.parent_id;
    notification_type := 'reply';
  END IF;

  IF recipient_id IS NOT NULL AND recipient_id <> NEW.user_id THEN
    INSERT INTO public.notifications (
      user_id, triggered_by_user_id, type, post_id, comment_id, content
    )
    VALUES (
      recipient_id, NEW.user_id, notification_type, NEW.post_id, NEW.id,
      pg_catalog.left(NEW.content, 500)
    );
  END IF;

  RETURN NEW;
END;
$$;
REVOKE ALL ON FUNCTION public.notify_post_comment() FROM PUBLIC, anon, authenticated;

CREATE OR REPLACE FUNCTION public.notify_comment_like()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  comment_author_id UUID;
  post_id_value INTEGER;
BEGIN
  SELECT user_id, post_id
  INTO comment_author_id, post_id_value
  FROM public.comments
  WHERE id = NEW.comment_id;

  IF comment_author_id IS NOT NULL AND comment_author_id <> NEW.user_id THEN
    INSERT INTO public.notifications (
      user_id, triggered_by_user_id, type, post_id, comment_id
    )
    VALUES (
      comment_author_id, NEW.user_id, 'like_comment', post_id_value, NEW.comment_id
    );
  END IF;

  RETURN NEW;
END;
$$;
REVOKE ALL ON FUNCTION public.notify_comment_like() FROM PUBLIC, anon, authenticated;

DROP TRIGGER IF EXISTS notify_post_like ON public.likes;
CREATE TRIGGER notify_post_like
  AFTER INSERT ON public.likes
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_post_like();

DROP TRIGGER IF EXISTS notify_post_comment ON public.comments;
CREATE TRIGGER notify_post_comment
  AFTER INSERT ON public.comments
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_post_comment();

DROP TRIGGER IF EXISTS notify_comment_like ON public.comment_likes;
CREATE TRIGGER notify_comment_like
  AFTER INSERT ON public.comment_likes
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_comment_like();
