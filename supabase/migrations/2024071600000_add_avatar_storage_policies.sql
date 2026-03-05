CREATE POLICY "Allow authenticated users to upload avatars" 
ON storage.objects FOR INSERT TO authenticated 
WITH CHECK ( bucket_id = 'avatars' AND (storage.foldername(name))[1] = auth.uid()::text );

CREATE POLICY "Allow authenticated users to update their own avatars" 
ON storage.objects FOR UPDATE TO authenticated 
USING ( bucket_id = 'avatars' AND (storage.foldername(name))[1] = auth.uid()::text );

CREATE POLICY "Allow authenticated users to delete their own avatars" 
ON storage.objects FOR DELETE TO authenticated 
USING ( bucket_id = 'avatars' AND (storage.foldername(name))[1] = auth.uid()::text );

CREATE POLICY "Allow anyone to view public avatars" 
ON storage.objects FOR SELECT 
USING ( bucket_id = 'avatars' );
