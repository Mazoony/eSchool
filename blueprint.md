# eSchool Social Feed: Application Blueprint

## 1. Overview

eSchool is a modern social feed application designed for educational communities. It provides a platform for students and educators to connect, share updates, and engage in discussions. The application is built with a focus on real-time interaction, a responsive user experience, and a clean, accessible design.

## 2. Core Technologies

- **Framework**: Next.js (App Router)
- **Authentication**: Supabase Auth
- **Database**: Supabase (PostgreSQL)
- **Storage**: Supabase Storage (for user avatars)
- **Styling**: Tailwind CSS
- **Deployment**: Netlify

## 3. Features & Design

### 3.1. User Authentication

- Users can sign up and log in using email and password.
- The application uses Supabase for secure authentication and user management.
- User profiles are automatically created upon registration.

### 3.2. Social Feed

- A central feed displays posts from all users in chronological order.
- Users can create new posts, which are instantly added to the feed.
- The feed supports real-time updates for new posts, comments, and likes.

### 3.3. Posts, Comments, and Likes

- **Posts**: Users can write and publish their own posts.
- **Comments**: Users can comment on posts, fostering discussion.
- **Likes**: Users can "like" posts to show appreciation.
- **Optimistic UI**: To enhance user experience, all interactions (liking, commenting, and deleting) are handled with optimistic UI updates. The UI responds instantly, and database operations are performed in the background.

### 3.4. User Profiles

- Each user has a dedicated profile page.
- Profiles display the user's name, email, and a customizable avatar.
- Users can upload and update their own profile avatars.

### 3.5. Notifications

- Users receive notifications when their posts or comments are liked or replied to.
- A notification icon in the header displays the number of unread notifications.
- A dropdown list displays the notifications, with links to the relevant post or comment.

### 3.6. Design & UI/UX

- The application features a modern and visually appealing design.
- The layout is responsive and optimized for both desktop and mobile devices.
- UI components are designed for clarity and ease of use, with a focus on accessibility.

## 4. Deployment

### 4.1. Netlify

- The application is configured for deployment on Netlify.
- A `netlify.toml` file is included to define the build settings and the Next.js plugin.
- Environment variables for Supabase are required for a successful deployment.

## 5. Recent Changes & Implementations

### 5.1. Notification System

- **Implemented**: A complete notification system.
- **Files**:
    - `src/app/components/PostContext.tsx`
    - `src/app/components/Notifications.tsx`
    - `src/app/components/Header.tsx`
    - `src/app/types.ts`
- **Description**: Added a `notifications` table to the database. The `PostContext.tsx` file was updated to create notifications for likes and comments. A new `Notifications.tsx` component was created to display notifications, and it was added to the `Header.tsx`.

### 5.2. Comment Liking Bug Fix

- **Fixed**: A bug where the like count for comments and replies was not updating in real-time.
- **Files**:
    - `src/app/components/PostContext.tsx`
    - `src/app/components/CommentItem.tsx`
- **Description**: The `likeComment` function in `PostContext.tsx` was rewritten to use immutable state updates, ensuring that React re-renders the UI correctly. The `likingCommentId` state was removed to allow for a more responsive user experience.

### 5.3. Optimistic UI Updates

- **Implemented**: Optimistic UI for liking posts, adding comments, and deleting comments.
- **File**: `src/app/components/PostContext.tsx`
- **Description**: The `toggleLike`, `addComment`, and `deleteComment` functions were updated to provide immediate UI feedback. The application no longer waits for a database response, making the user experience feel faster and more responsive.

### 5.4. Avatar Upload Security Fix

- **Fixed**: Resolved a "row-level security policy" error that occurred during avatar uploads.
- **File**: `src/app/profile/[id]/page.tsx`
- **Description**: The `handleUpload` function was modified to ensure that avatar uploads comply with Supabase storage policies. The file path is now correctly constructed to include the user's ID, ensuring that users can only upload to their own designated storage folders.
- **Migration**: A new SQL migration was created and applied to define the necessary storage policies for the `avatars` bucket.
  - `supabase/migrations/2024071600000_add_avatar_storage_policies.sql`
