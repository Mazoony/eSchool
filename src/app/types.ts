import { User as SupabaseUser } from '@supabase/supabase-js';

// Define a type for the user profile
interface Profile {
  id: string;
  full_name: string;
  avatar_url: string;
}

// Extend the Supabase User type to include the profile
export interface User extends SupabaseUser {
  profile?: Profile;
}

export interface Post {
  id: string;
  content: string;
  user_id: string;
  profiles: { id: string; full_name: string; avatar_url: string; };
  created_at: string;
  comments: Comment[];
  likes: Like[];
}

export interface Comment {
  id: string;
  content: string;
  user_id: string;
  profiles: { id: string; full_name: string; avatar_url: string; };
  created_at: string;
  parent_id?: string;
  comment_likes: Like[];
}

export interface Like {
  user_id: string;
}
