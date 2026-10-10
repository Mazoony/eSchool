ALTER TABLE public.lessons
  ADD COLUMN IF NOT EXISTS grade TEXT,
  ADD COLUMN IF NOT EXISTS class_number INTEGER;

ALTER TABLE public.lessons ENABLE ROW LEVEL SECURITY;

DO $$
DECLARE
  existing_policy RECORD;
BEGIN
  FOR existing_policy IN
    SELECT policyname
    FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'lessons'
  LOOP
    EXECUTE format('DROP POLICY %I ON public.lessons', existing_policy.policyname);
  END LOOP;
END;
$$;

CREATE POLICY "Authenticated users can read lessons"
  ON public.lessons
  FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "Only the site admin can manage lessons"
  ON public.lessons
  FOR ALL TO authenticated
  USING ((auth.jwt() ->> 'email') = 'wadareaf@gmail.com')
  WITH CHECK ((auth.jwt() ->> 'email') = 'wadareaf@gmail.com');

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conrelid = 'public.lessons'::regclass
      AND conname = 'lessons_grade_class_valid'
  ) THEN
    ALTER TABLE public.lessons
      ADD CONSTRAINT lessons_grade_class_valid
      CHECK (
        (grade IS NULL AND class_number IS NULL)
        OR (
          class_number IS NOT NULL
          AND (
            (grade = 'elementary-school' AND class_number BETWEEN 1 AND 6)
            OR (grade IN ('high-school', 'secondary-school') AND class_number BETWEEN 1 AND 3)
          )
        )
      );
  END IF;
END;
$$;

CREATE INDEX IF NOT EXISTS lessons_grade_class_created_at_idx
  ON public.lessons (grade, class_number, created_at DESC);

ALTER TABLE public.likes DROP CONSTRAINT IF EXISTS likes_post_id_fkey;
ALTER TABLE public.likes
  ADD CONSTRAINT likes_post_id_fkey FOREIGN KEY (post_id) REFERENCES public.posts(id) ON DELETE CASCADE;

ALTER TABLE public.comment_likes DROP CONSTRAINT IF EXISTS comment_likes_comment_id_fkey;
ALTER TABLE public.comment_likes
  ADD CONSTRAINT comment_likes_comment_id_fkey FOREIGN KEY (comment_id) REFERENCES public.comments(id) ON DELETE CASCADE;

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('videos', 'videos', false, 52428800, ARRAY['video/mp4', 'video/webm'])
ON CONFLICT (id) DO UPDATE
SET public = false,
    file_size_limit = EXCLUDED.file_size_limit,
    allowed_mime_types = EXCLUDED.allowed_mime_types;

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('avatars', 'avatars', true, 5242880, ARRAY['image/png', 'image/jpeg', 'image/webp', 'image/gif'])
ON CONFLICT (id) DO UPDATE
SET public = true,
    file_size_limit = EXCLUDED.file_size_limit,
    allowed_mime_types = EXCLUDED.allowed_mime_types;

DROP POLICY IF EXISTS "Allow public read access" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated insert" ON storage.objects;
DROP POLICY IF EXISTS "Allow individual update" ON storage.objects;
DROP POLICY IF EXISTS "Allow individual delete" ON storage.objects;

CREATE POLICY "Authenticated users can read lesson videos"
  ON storage.objects
  FOR SELECT TO authenticated
  USING (bucket_id = 'videos');

CREATE POLICY "Only the site admin can manage lesson videos"
  ON storage.objects
  FOR ALL TO authenticated
  USING (bucket_id = 'videos' AND (auth.jwt() ->> 'email') = 'wadareaf@gmail.com')
  WITH CHECK (bucket_id = 'videos' AND (auth.jwt() ->> 'email') = 'wadareaf@gmail.com');

CREATE POLICY "Users can upload their own avatars"
  ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'avatars' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "Users can update their own avatars"
  ON storage.objects
  FOR UPDATE TO authenticated
  USING (bucket_id = 'avatars' AND (storage.foldername(name))[1] = auth.uid()::text)
  WITH CHECK (bucket_id = 'avatars' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "Users can delete their own avatars"
  ON storage.objects
  FOR DELETE TO authenticated
  USING (bucket_id = 'avatars' AND (storage.foldername(name))[1] = auth.uid()::text);

ALTER TABLE public.notifications
  DROP CONSTRAINT IF EXISTS notifications_type_check;

ALTER TABLE public.notifications
  ADD CONSTRAINT notifications_type_check
  CHECK (type IN ('like', 'comment', 'reply', 'follow', 'like_comment'));

DO $$
DECLARE
  realtime_table TEXT;
BEGIN
  FOREACH realtime_table IN ARRAY ARRAY['profiles', 'posts', 'comments', 'likes', 'comment_likes', 'notifications']
  LOOP
    IF NOT EXISTS (
      SELECT 1
      FROM pg_publication_tables
      WHERE pubname = 'supabase_realtime'
        AND schemaname = 'public'
        AND tablename = realtime_table
    ) THEN
      EXECUTE format('ALTER PUBLICATION supabase_realtime ADD TABLE public.%I', realtime_table);
    END IF;
  END LOOP;
END;
$$;
