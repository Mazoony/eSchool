# Project Blueprint

## Overview

This document outlines the plan for creating a comprehensive English language learning platform. The platform will provide a variety of features to help users improve their English skills, including video lessons, interactive quizzes, personalized learning paths, and a social feed for practicing with other learners.

## Implemented Features

### Core Features

*   **User Authentication:** Secure user login and registration system.
*   **Video Lesson Integration:** A gallery of video lessons with thumbnails, titles, and descriptions.
*   **Interactive Quizzes and Exercises:** Multiple-choice quizzes to test grammar and vocabulary knowledge.
*   **Personalized Learning Paths:** A feature that generates a customized learning plan based on the user's goals.
*   **Real-time Progress Tracking:** Visual representation of the user's progress with charts and statistics.

### Design and Styling

*   **Modern Design:** A clean and modern design with a dark theme.
*   **Responsive Layout:** The application is fully responsive and works on all screen sizes.
*   **Custom Components:** Reusable components for the header, buttons, and other UI elements.
*   **Navigation:** A clear and intuitive navigation bar to guide users through the application.

## Current Plan

### Add Google Sign-In

*   **Enable Google Sign-in in Firebase:** Use the `firebase_init` tool to enable Google Sign-In for the Firebase project.
*   **Modify `src/app/login/page.tsx`:** Add a "Sign in with Google" button.
*   **Modify `src/app/register/page.tsx`:** Add a "Sign up with Google" button.
*   **Create a new file `src/app/auth.ts`:** This file will contain the logic for handling Google authentication.
*   **Modify `src/app/AuthContext.tsx`:** Update the `AuthContext` to include the new Google Sign-In functionality.
