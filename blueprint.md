# Blueprint

## Overview

This document outlines the plan for a Next.js application with Firebase integration.

## Features

* **Firebase Firestore:** Used as the primary database.
* **Security Rules:** Configured to allow authenticated users to read and write data.
* **Google Sign-In:** Implemented using `signInWithRedirect` to avoid pop-up blocker issues.
* **Redirects:** Users are redirected to the `/profile` page after a successful login or registration.
* **User Profile Page:** Displays the user's information (avatar, name, and email) and provides a sign-out button.
* **Loading Indicators:** Implemented on login and registration pages for a smoother user experience.
* **Unified Authentication Flow:** A consistent sign-in experience for both email and Google authentication, with immediate redirection to the profile page.
* **Video Lessons:** Admins can upload video lessons, which are then displayed on a dedicated "Lessons" page for all users to see.
* **Social Feed:** A comment and like system is integrated into each lesson page, allowing for user engagement.
* **Admin-only Uploads:** Video uploads are restricted to a specific admin user.
* **Firebase App Hosting:** The application is deployed and hosted using Firebase App Hosting.

## Current Plan

* **Step 1:** Update Firestore security rules to be more permissive for development.
* **Step 2:** Corrected Google Sign-In to use `signInWithRedirect` instead of `signInWithPopup` to prevent `auth/popup-blocked` errors.
* **Step 3:** Implemented redirect to `/profile` page after login/registration, including handling the redirect result from Google Sign-In.
* **Step 4:** Implemented the user profile page at `src/app/profile/page.tsx`, using `react-firebase-hooks` to manage authentication state and display user information.
* **Step 5:** Fixed a React error by moving the redirect logic in the profile page into a `useEffect` hook.
* **Step 6:** Updated the Google sign-in and sign-up functions in `src/app/login/page.tsx` and `src/app/register/page.tsx` to explicitly request the `profile` and `email` scopes, ensuring the user's name and profile picture are displayed correctly.
* **Step 7:** Improved the user experience by adding loading indicators to the login and registration pages, providing immediate feedback during the authentication process.
* **Step 8:** Refactored the authentication flow by using the `useAuthState` hook to automatically redirect users to their profile page upon successful sign-in, creating a seamless experience.
* **Step 9:** Reinstated `getRedirectResult` in the login and registration pages to specifically handle and display any errors that occur during the Google sign-in redirect. This ensures that the user experience is consistent and that users are properly notified of any issues, correcting a flaw in the previous implementation.
* **Step 10:** Implemented the video lessons feature by:
    *   Renaming the Firestore collection to `lessons` in the video upload page for better clarity and organization.
    *   Creating a new `lessons` page at `src/app/lessons/page.tsx` to fetch and display the video lessons from Firestore.
    *   Adding a navigation link to the "Lessons" page in the main dashboard, making it easily accessible to users.
* **Step 11:** Resolved a "Missing or insufficient permissions" error by:
    *   Creating `firestore.rules` and `storage.rules` files with policies that allow any authenticated user to read and write data.
    *   Updating `firebase.json` to apply these new security rules.
* **Step 12:** Implemented a social feed on the lesson pages by:
    *   Creating a `Comment` component to display individual comments.
    *   Creating a `SocialFeed` component to manage comments and likes.
    *   Integrating the `SocialFeed` component into the `lessons` page, allowing users to comment on and like lessons.
* **Step 13:** Restricted video uploads to a specific admin user by updating the `storage.rules` file to only allow write access to the user with the email 'wadareaf@gmail.com'.
* **Step 14:** Set up Firebase App Hosting by creating a `.idx/mcp.json` file to enable the Firebase MCP server.
