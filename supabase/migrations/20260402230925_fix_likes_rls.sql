--
-- @db start: policies
--

--
-- Drop existing policies (if they exist) to ensure a clean slate.
--
DROP POLICY IF EXISTS "Allow authenticated users to insert a new like." ON likes;
DROP POLICY IF EXISTS "Allow users to view all likes." ON likes;
DROP POLICY IF EXISTS "Allow users to delete their own like." ON likes;

--
-- Policies for the 'likes' table.
--

--
-- Allow authenticated users to insert a new like.
--
CREATE POLICY "Allow authenticated users to insert a new like." ON likes
FOR INSERT TO authenticated
WITH CHECK (TRUE);

--
-- Allow users to view all likes.
--
CREATE POLICY "Allow users to view all likes." ON likes
FOR SELECT
USING (TRUE);

--
-- Allow users to delete their own like.
--
CREATE POLICY "Allow users to delete their own like." ON likes
FOR DELETE
USING (auth.uid() = user_id);

--
-- @db end: policies
--
