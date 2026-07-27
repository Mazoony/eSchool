
# eSchool: Social Learning Platform

## Overview

eSchool is a modern social learning platform designed to connect students and educators in Sudan. It provides an interactive online environment where users can share ideas, collaborate, and build a vibrant learning community. The platform is built with Next.js and utilizes Supabase for its backend, database, and authentication needs.

## Design and Features

- **Modern UI/UX Design:** The application has a modern and consistent design with a focus on user experience. It includes a user-friendly dark mode that can be toggled by the user.
- **Responsive Header:** A new, responsive `Header` component provides consistent navigation across all pages. It includes navigation links, a dark mode toggle, and a user menu for authenticated users with links to their profile and a logout button. Unauthenticated users are shown login and register links.
- **Improved Landing Page:** The landing page has been redesigned with a compelling hero section, a section highlighting key features of the platform, a testimonials section to build trust, and an improved footer with links to the `About`, `Contact`, and `Privacy` pages.
- **`About`, `Contact`, and `Privacy` Pages:** New pages have been created to provide users with more information about the eSchool platform, how to contact the team, and how their data is used.
- **Public Landing Page:** The main entry point for new visitors, featuring a compelling hero section, a summary of key features, and clear calls-to-action to encourage user sign-ups and logins. Logged-in users are automatically redirected to the social feed.
- **Social Feed:** A private, authenticated route at `/social` that serves as the main hub for logged-in users. This is where the core application experience, including the social feed, takes place.
- **Protected Routes:** The social feed and user profiles are protected. If a logged-out user tries to access them, they are automatically redirected to the login page.
- **Post Creation & Interaction:** Authenticated users can create posts, leave comments, and engage with content from others.
- **Custom User Profiles:** Every user has a personal profile page where they can set their full name and upload a custom avatar.
- **Authentication:** A complete authentication system powered by Supabase, supporting email/password sign-up and login.
- **Correct Login Redirect:** Users are now correctly redirected to the `/social` page upon successful sign-in, ensuring a seamless user experience.
- **Refactored Layout:** The layout has been refactored to use a single `Header` component and unused layout components have been removed.
- **SEO and Structured Data:** The application now includes comprehensive SEO and structured data to improve its visibility in search results. This includes:
    - A `sitemap.xml` file to help search engines discover all the pages on the site.
    - A `robots.txt` file to control how search engines crawl the site.
    - JSON-LD structured data for `Organization`, `EducationalOrganization`, `WebSite`, `WebPage`, `BreadcrumbList`, `Course`, and `FAQPage` schemas.

## Current Plan and Steps

This session focused on improving the SEO and structured data of the application.

Here's a summary of the changes I've implemented:

1.  **SEO:**
    *   Added a `sitemap.ts` file to generate a `sitemap.xml` file.
    *   Added a `robots.txt` file to the `public` directory.
2.  **Structured Data:**
    *   Added `Organization`, `EducationalOrganization`, `WebSite`, and `WebPage` schemas to the `layout.tsx` file.
    *   Created a `Breadcrumbs` component that dynamically generates breadcrumb structured data for each page.
    *   Added the `Course` schema to the `lessons/[id]/page.tsx` file.
    *   Created a `/faq` page with the `FAQPage` schema.
3.  **Updated `blueprint.md`:**
    *   The `blueprint.md` file has been updated to reflect these changes.
