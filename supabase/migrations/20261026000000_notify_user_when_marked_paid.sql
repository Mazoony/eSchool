ALTER TABLE public.notifications
  DROP CONSTRAINT IF EXISTS notifications_type_check;

ALTER TABLE public.notifications
  ADD CONSTRAINT notifications_type_check
  CHECK (type IN ('like', 'comment', 'reply', 'follow', 'like_comment', 'payment'));

CREATE OR REPLACE FUNCTION public.notify_user_payment_confirmed()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  admin_user_id UUID := (SELECT auth.uid());
BEGIN
  IF NEW.status = 'paid' AND OLD.status IS DISTINCT FROM NEW.status THEN
    IF admin_user_id IS NULL THEN
      RAISE EXCEPTION 'Could not identify the administrator confirming this payment.';
    END IF;

    INSERT INTO public.notifications (
      user_id,
      triggered_by_user_id,
      type,
      content
    )
    VALUES (
      NEW.user_id,
      admin_user_id,
      'payment',
      'Your payment has been confirmed, and your account is now marked as paid.'
    );
  END IF;

  RETURN NEW;
END;
$$;

REVOKE ALL ON FUNCTION public.notify_user_payment_confirmed() FROM PUBLIC, anon, authenticated;

CREATE TRIGGER notify_user_payment_confirmed
  AFTER UPDATE OF status ON public.user_payment_status
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_user_payment_confirmed();

NOTIFY pgrst, 'reload schema';
