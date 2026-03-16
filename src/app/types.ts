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
  author: { id: string; full_name: string; avatar_url: string; }; // Changed from profile
  created_at: string;
  comments: Comment[];
  likes: Like[];
}

export interface Comment {
  id: string;
  content: string;
  user_id: string;
  commenter: { id: string; full_name: string; avatar_url: string; }; // Changed from profile
  created_at: string;
  parent_id?: string;
  comment_likes: Like[];
}

export interface Like {
  user_id: string;
  comment_id?: string;
}

export interface Notification {
  id: string;
  created_at: string;
  recipient_user_id: string;
  sender_user_id: string;
  type: string;
  post_id: string;
  comment_id?: string;
  is_read: boolean;
  sender: { id: string; full_name: string; avatar_url: string; };
}
