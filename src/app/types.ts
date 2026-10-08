export interface Profile {
  id: string;
  username?: string | null;
  full_name?: string | null;
  avatar_url?: string | null;
  bio?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
}

export interface User {
  id: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  profile?: Profile;
}

export interface Post {
  id: string;
  content: string;
  user_id: string;
  author: Profile;
  created_at: string;
  comments: Comment[];
  likes: Like[];
}

export interface Comment {
  id: string;
  content: string;
  user_id: string;
  commenter: Profile;
  created_at: string;
  parent_id?: string;
  comment_likes: Like[];
  replies?: Reply[];
}

export interface Reply {
  id: string;
  content: string;
  user_id: string;
  commenter: Profile;
  created_at: string;
  parent_id: string;
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
  sender: Profile;
}

export interface Lesson {
  id: string;
  title: string;
  description: string;
  video_url: string;
  created_at: string;
  slug: string;
}
