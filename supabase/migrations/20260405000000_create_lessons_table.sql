-- Create the lessons table
CREATE TABLE public.lessons (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    title TEXT NOT NULL,
    description TEXT
);

-- Enable Row Level Security for the lessons table
ALTER TABLE public.lessons ENABLE ROW LEVEL SECURITY;

-- Create a policy to allow public read access to lessons
CREATE POLICY "Allow public read access to lessons"
ON public.lessons
FOR SELECT
USING (true);

-- Create a policy to allow insert access to lessons for all users
CREATE POLICY "Allow insert for all users"
ON public.lessons
FOR INSERT
WITH CHECK (true);
