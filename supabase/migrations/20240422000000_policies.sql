--
-- @db start: tables
--
-- Create the 'likes' table.
--
CREATE TABLE IF NOT EXISTS likes (
    id SERIAL PRIMARY KEY,
    post_id INT NOT NULL REFERENCES posts(id),
    user_id UUID NOT NULL REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now()),
    UNIQUE(post_id, user_id)
);

--
-- Create the 'comment_likes' table.
--
CREATE TABLE IF NOT EXISTS comment_likes (
    id SERIAL PRIMARY KEY,
    comment_id INT NOT NULL REFERENCES comments(id),
    user_id UUID NOT NULL REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now()),
    UNIQUE(comment_id, user_id)
);

--
-- @db end: tables
--

--
-- @db start: policies
--

--
-- Enable Row Level Security for the 'likes' table.
--
ALTER TABLE likes ENABLE ROW LEVEL SECURITY;

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
-- Enable Row Level Security for the 'comment_likes' table.
--
ALTER TABLE comment_likes ENABLE ROW LEVEL SECURITY;

--
-- Policies for the 'comment_likes' table.
--

--
-- Allow authenticated users to insert a new comment like.
--
CREATE POLICY "Allow authenticated users to insert a new comment like." ON comment_likes
FOR INSERT TO authenticated
WITH CHECK (TRUE);

--
-- Allow users to view all comment likes.
--
CREATE POLICY "Allow users to view all comment likes." ON comment_likes
FOR SELECT
USING (TRUE);

--
-- Allow users to delete their own comment like.
--
CREATE POLICY "Allow users to delete their own comment like." ON comment_likes
FOR DELETE
USING (auth.uid() = user_id);

--
-- Enable Row Level Security for the 'comments' table.
--
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;

--
-- Policies for the 'comments' table.
--

--
-- Allow authenticated users to insert a new comment.
--
CREATE POLICY "Allow authenticated users to insert a new comment." ON comments
FOR INSERT TO authenticated
WITH CHECK (TRUE);

--
-- Allow users to view all comments.
--
CREATE POLICY "Allow users to view all comments." ON comments
FOR SELECT
USING (TRUE);

--
-- Allow users to delete their own comment.
--
CREATE POLICY "Allow users to delete their own comment." ON comments
FOR DELETE
USING (auth.uid() = user_id);

--
-- @db end: policies
--
