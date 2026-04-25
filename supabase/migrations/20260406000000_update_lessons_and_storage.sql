
-- Add video_url and user_id columns to the lessons table
ALTER TABLE public.lessons ADD COLUMN IF NOT EXISTS video_url TEXT;
ALTER TABLE public.lessons ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id);

-- Create the 'videos' storage bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('videos', 'videos', true, 52428800, ARRAY['video/mp4', 'video/webm', 'video/quicktime'])
ON CONFLICT (id) DO NOTHING;

-- Create or update policies for the 'videos' bucket

-- Drop existing policies if they exist to avoid conflicts
DROP POLICY IF EXISTS "Allow public read access" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated insert" ON storage.objects;
DROP POLICY IF EXISTS "Allow individual update" ON storage.objects;
DROP POLICY IF EXISTS "Allow individual delete" ON storage.objects;

-- Create policies
CREATE POLICY "Allow public read access"
ON storage.objects
FOR SELECT
USING (bucket_id = 'videos');

CREATE POLICY "Allow authenticated insert"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'videos');

CREATE POLICY "Allow individual update"
ON storage.objects
FOR UPDATE
TO authenticated
USING (auth.uid() = owner);

CREATE POLICY "Allow individual delete"
ON storage.objects
FOR DELETE
TO authenticated
USING (auth.uid() = owner);
