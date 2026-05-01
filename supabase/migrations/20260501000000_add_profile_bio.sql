-- Add an optional bio column to user profiles.
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS bio TEXT;
