
# eSchool: Social Learning Platform

## Overview

eSchool is a modern social learning platform designed to connect students and educators. It provides an interactive online environment where users can share ideas, collaborate, and build a vibrant learning community. The platform is built with Next.js and utilizes Supabase for its backend, database, and authentication needs.

## Design and Features

- **Public Landing Page:** The main entry point for new visitors, featuring a compelling hero section, a summary of key features, and clear calls-to-action to encourage user sign-ups and logins. Logged-in users are automatically redirected to the social feed.
- **Social Feed:** A private, authenticated route at `/social` that serves as the main hub for logged-in users. This is where the core application experience, including the social feed, takes place.
- **Protected Routes:** The social feed and user profiles are protected. If a logged-out user tries to access them, they are automatically redirected to the login page.
- **Responsive User Header:** A dynamic header component that shows the current user's avatar and name, with quick links to their profile and a logout button.
- **Post Creation & Interaction:** Authenticated users can create posts, leave comments, and engage with content from others.
- **Custom User Profiles:** Every user has a personal profile page where they can set their full name and upload a custom avatar.
- **Authentication:** A complete authentication system powered by Supabase, supporting email/password sign-up and login.
- **Correct Login Redirect:** Users are now correctly redirected to the `/social` page upon successful sign-in, ensuring a seamless user experience.
- **Deprecated Dashboard:** The old `/dashboard` route is no longer in use and now simply redirects to `/social`.

## Current Plan and Steps

This session focused on making the social feed the central experience for logged-in users.

Here's a summary of the changes I've implemented:

1.  **Updated Social Page (`/social`):**
    *   The social page is now a protected route, ensuring only authenticated users can access it.
    *   It now includes the `UserHeader` component, providing user-specific navigation.

2.  **Updated Main Page (`/`):**
    *   The main landing page now checks if a user is authenticated. If so, it redirects them directly to the `/social` page.

3.  **Updated Login Page (`/login`):**
    *   The login page now redirects users to `/social` upon successful authentication.

4.  **Deprecated Dashboard Page (`/dashboard`):**
    *   The `/dashboard` page has been deprecated. Its content has been replaced with a redirect to the `/social` page.

5.  **Updated Blueprint:**
    *   The `blueprint.md` file has been updated to reflect these changes, establishing the social feed as the primary destination for logged-in users.
