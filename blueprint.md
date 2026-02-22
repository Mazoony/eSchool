# eSchool Project Blueprint

## Overview

eSchool is a modern e-learning platform designed to provide a seamless and engaging experience for students. It allows administrators to upload video lessons, which are then displayed to users in a clean and intuitive interface. The application is built with Next.js and utilizes Supabase for its backend, including storage and database services.

## Implemented Features & Design

### Core Functionality
- **Video Lesson Viewing:** A dedicated "Lessons" page (`/lessons`) that fetches and displays all available video lessons.
- **Video Upload:** A secure admin page (`/admin/upload`) for uploading new video content, including a title and description.
- **Backend with Supabase:**
    - **Authentication:** (Future implementation)
    - **Storage:** Video files are stored in a Supabase Storage bucket named "videos".
    - **Database:** Lesson metadata (title, description, video URL) is stored in a Supabase PostgreSQL table named "lessons".

### User Interface & Design
- **Framework:** Built with Next.js and styled using Tailwind CSS.
- **Layout:** A consistent and professional layout with a main header for navigation.
- **Navigation:** A clear navigation bar providing links to Home, Lessons, Social, and Profile pages.
- **Responsiveness:** The layout is designed to be responsive and accessible on various screen sizes.
- **Lesson Display:** Lessons on the `/lessons` page are presented in a visually appealing grid, with each lesson having its own card showing the video, title, and description.
- **Upload Form:** The `/admin/upload` page features a user-friendly form for submitting new lessons.

## Current Plan

The immediate goal was to migrate the application's backend from Firebase to Supabase. This involved:

1.  **DONE:** Setting up a new Supabase project.
2.  **DONE:** Installing and configuring the Supabase client in the Next.js application.
3.  **DONE:** Rewriting the video upload functionality to use Supabase Storage and a PostgreSQL database.
4.  **DONE:** Updating the lessons page to fetch and display data from Supabase.
5.  **DONE:** Using environment variables to securely manage Supabase credentials.
6.  **IN PROGRESS:** Committing the final changes and ensuring the project is fully documented in this blueprint.
