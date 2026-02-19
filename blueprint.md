# Blueprint

## Overview

This document outlines the plan for a Next.js application with Firebase integration.

## Features

* **Firebase Firestore:** Used as the primary database.
* **Security Rules:** Configured to allow authenticated users to read and write data.
* **Google Sign-In:** Implemented using `signInWithRedirect` to avoid pop-up blocker issues.
* **Redirects:** Users are redirected to the `/profile` page after a successful login or registration.
* **User Profile Page:** Displays the user's information (avatar, name, and email) and provides a sign-out button.

## Current Plan

* **Step 1:** Update Firestore security rules to be more permissive for development.
* **Step 2:** Corrected Google Sign-In to use `signInWithRedirect` instead of `signInWithPopup` to prevent `auth/popup-blocked` errors.
* **Step 3:** Implemented redirect to `/profile` page after login/registration, including handling the redirect result from Google Sign-In.
* **Step 4:** Implemented the user profile page at `src/app/profile/page.tsx`, using `react-firebase-hooks` to manage authentication state and display user information.
