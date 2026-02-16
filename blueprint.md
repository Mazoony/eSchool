# eSchool: A Blueprint for English Language Learning

## Overview

eSchool is a web application designed to help users learn English through a variety of interactive tools and resources. The platform provides engaging video lessons, interactive quizzes, and a supportive social network to create a comprehensive and effective language-learning experience.

## Design and Styling

The application follows a modern and clean design aesthetic, with a focus on user-friendliness and visual appeal. The color palette is based on shades of blue and gray, creating a professional and trustworthy feel. The typography is clean and legible, with a clear hierarchy to guide the user's attention.

## Key Features

*   **User Authentication:** Users can create an account and log in using their email and password or with their Google account.
*   **Engaging Lessons:** The platform offers a library of video lessons covering grammar, vocabulary, and real-world conversations.
*   **Interactive Quizzes:** Users can test their knowledge with interactive quizzes and track their progress.
*   **Supportive Community:** A social feed allows users to connect with other learners, practice their skills, and get feedback from native speakers.
*   **User Profile:** Users have a dedicated profile page where they can view and manage their information.
*   **Admin Panel:** A dedicated section for administrators to manage the platform.
    *   **Admin Registration:** A secure registration page for creating new admin accounts.
    *   **Admin Login:** Secure login for administrators.
    *   **Video Upload:** A tool for admins to upload and manage video lessons.

## Project Structure

The project is a Next.js application using the App Router. The main directories are:

*   `/app`: Contains the core application, with file-based routing.
    *   `page.tsx`: The main landing page.
    *   `/lessons`: The page for video lessons.
    *   `/social`: The social feed for community interaction.
    *   `/profile`: The user profile page.
    *   `/login`: The login page.
    *   `/register`: The user registration page.
    *   `/admin`: The admin section.
        *   `page.tsx`: The admin login page.
        *   `/register`: The admin registration page.
        *   `/upload`: The video upload page for admins.
*   `/public`: Contains static assets like images and icons.
*   `/src`: Contains the source code of the application.

## Completed Task: Implement Admin Panel

*   **Overview:** Created an admin panel with registration, login, and video upload functionality.
*   **Steps Completed:**
    *   Created a dedicated admin registration page at `/admin/register`.
    *   Created a dedicated admin login page at `/admin`.
    *   Created a video upload page for admins at `/admin/upload`.
    *   Secured the admin section to ensure only authenticated admins can access it.
    *   Updated the `blueprint.md` file to reflect the changes.
