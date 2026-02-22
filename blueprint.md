
# eSchool Application Blueprint

## Overview

eSchool is a modern, interactive online learning platform designed to provide a seamless and engaging educational experience. This document outlines the application's architecture, features, and the plan for its continuous development.

## Implemented Features

### Core Functionality

*   **User Authentication**
    *   Secure user registration and login using Firebase Authentication.
    *   Admin-specific registration and login portals.
*   **Course Management (Admin)**
    *   Admins can upload and manage course materials.

### Styling and Design

*   **Modern UI/UX**
    *   The application boasts a clean and intuitive user interface, built with Tailwind CSS for a responsive and mobile-first design.
    *   Consistent and visually appealing design elements are used throughout the application to ensure a cohesive user experience.

### Error Corrections

*   **Linting and Type Errors**
    *   Resolved `no-explicit-any` errors in `src/app/admin/page.tsx` and `src/app/admin/register/page.tsx` by replacing the `any` type with `React.FormEvent`.
    *   Corrected an unescaped apostrophe in `src/app/admin/page.tsx` to prevent rendering issues.

### Security Updates

*   **Next.js Upgrade**
    *   Upgraded Next.js to the latest version to patch a critical security vulnerability that was blocking Netlify deployments.

### Content Updates

*   **Footer Year**
    *   Updated the copyright year in the footer from 2024 to 2026.

## Development Plan

### Current Task: Update Footer

*   **Objective:** Update the copyright year in the application's footer.
*   **Steps Taken:**
    1.  Located the footer component in `src/app/page.tsx`.
    2.  Changed the year in the copyright notice from "2024" to "2026".
*   **Status:** Completed.
