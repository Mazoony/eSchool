# eSchool: Social Learning Platform

## Overview

eSchool is a modern social learning platform designed to connect students and educators. It provides an interactive online environment where users can share ideas, collaborate, and build a vibrant learning community. The platform is built with Next.js and utilizes Supabase for its backend, database, and authentication needs.

## Design and Features

- **Public Landing Page:** The main entry point for new visitors, featuring a compelling hero section, a summary of key features, and clear calls-to-action to encourage user sign-ups and logins.
- **User Dashboard:** A private, authenticated route at `/dashboard` that serves as the main hub for logged-in users. This is where the core application experience, including the social feed, takes place.
- **Protected Routes:** The dashboard and user profiles are protected. If a logged-out user tries to access them, they are automatically redirected to the login page.
- **Responsive User Header:** A dynamic header component that shows the current user's avatar and name, with quick links to their profile and a logout button.
- **Social Feed:** A central, real-time feed on the dashboard where users can view posts and announcements.
- **Post Creation & Interaction:** Authenticated users can create posts, leave comments, and engage with content from others.
- **Custom User Profiles:** Every user has a personal profile page where they can set their full name and upload a custom avatar.
- **Authentication:** A complete authentication system powered by Supabase, supporting email/password sign-up and login. Google Sign-In is also available but temporarily disabled.
- **Correct Login Redirect:** Users are now correctly redirected to the `/dashboard` page upon successful sign-in, ensuring a seamless user experience.

## Current Plan and Steps

This session focused on fixing a bug in the login flow. Previously, users were not being redirected to the correct page after logging in. This has now been resolved.

Here's a summary of the changes I've implemented:

1.  **Updated Authentication Context:**
    *   Modified the `AuthContext.tsx` file to redirect users to the `/dashboard` page upon successful sign-in.
    *   This ensures that users are taken directly to the social feed after logging in, which is the intended behavior.

2.  **Updated Blueprint:**
    *   The `blueprint.md` file has been updated to reflect the correction in the login redirect.
