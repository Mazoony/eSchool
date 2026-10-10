
# eSchool: Social Learning Platform

## Overview

eSchool is a modern social learning platform designed to connect students and educators in Sudan. It provides an interactive online environment where users can share ideas, collaborate, and build a vibrant learning community. The platform is built with Next.js and uses Supabase Authentication, Postgres, Realtime, and Storage.

## Design and Features

- **Modern UI/UX Design:** The application has a modern and consistent design with a focus on user experience. It includes a user-friendly dark mode that can be toggled by the user.
- **Responsive Header:** A new, responsive `Header` component provides consistent navigation across all pages. It includes navigation links, a dark mode toggle, and a user menu for authenticated users with links to their profile and a logout button. Unauthenticated users are shown login and register links.
- **Improved Landing Page:** The landing page has been redesigned with a compelling hero section, a section highlighting key features of the platform, a testimonials section to build trust, and an improved footer with links to the `About`, `Contact`, `Privacy`, and `Terms` pages.
- **`About`, `Contact`, `Privacy`, and `Terms` Pages:** New pages have been created to provide users with more information about the eSchool platform, how to contact the team, how their data is used, and the terms of service.
- **Public Landing Page:** The main entry point for signed-out visitors, featuring a compelling hero section, a summary of key features, and clear calls-to-action. Authenticated users are redirected to the social feed after their session loads.
- **Instructor Hero Portrait:** The home page features `public/teacher.jpg` alongside the welcome message and learning calls-to-action, with a responsive layout and descriptive alt text.
- **Social Share Previews:** Open Graph and Twitter metadata use `public/teacher.jpg` as the default social sharing image, including the homepage.
- **WhatsApp Contact:** The home-page footer displays a clickable WhatsApp link with the WhatsApp icon for +249 127 127 993.
- **Post Interaction Notifications:** Authors receive realtime notifications when someone likes or comments on their posts; comment authors are notified of replies and comment likes. Each notice identifies the person, includes comment text when relevant, and links to the related post or comment.
- **Social Student Profiles:** Profiles use an uploaded cover photo and avatar header, show post and join information, and provide Posts and About tabs. Students can edit their own bio and profile, upload cover and profile photos, and publish from their profile; their posts and task-answer posts appear in a realtime timeline. Email is visible only on the owner’s About tab, and account IDs are not shown.
- **Supabase Avatar Images:** Next.js image optimization allows profile and post avatars from the active Supabase Storage host.
- **Social Feed:** A private, authenticated route at `/social` that serves as the main hub for logged-in users. This is where the core application experience, including the social feed, takes place.
- **Protected Routes:** The social feed and user profiles are protected. If a logged-out user tries to access them, they are automatically redirected to the login page.
- **Post Creation & Interaction:** Authenticated users can create posts, leave comments, and engage with content from others.
- **Custom User Profiles:** Every user has a personal profile page where they can set their full name and upload a custom avatar.
- **Authentication:** Supabase email/password sign-up and login are available. Google sign-in is temporarily hidden from login and registration until its provider configuration is working.
- **Correct Login Redirect:** Users are now correctly redirected to the `/social` page upon successful sign-in, ensuring a seamless user experience.
- **Refactored Layout:** The layout has been refactored to use a single `Header` component and unused layout components have been removed.
- **SEO and Structured Data:** The application now includes comprehensive SEO and structured data to improve its visibility in search results. This includes:
    - A `sitemap.xml` file to help search engines discover all the pages on the site.
    - A `robots.txt` file to control how search engines crawl the site.
    - JSON-LD structured data for `Organization`, `EducationalOrganization`, `WebSite`, `WebPage`, `BreadcrumbList`, `Course`, and `FAQPage` schemas.
    - Dynamically generated canonical URLs for all pages.
- **Enhanced Accessibility (A11Y):** Conducted a comprehensive accessibility audit and implemented fixes across the application to ensure compliance with WCAG standards. This includes adding ARIA labels, focus indicators, proper semantic HTML (`<main>`), improving color contrast, and ensuring interactive elements are fully accessible via keyboard and screen readers.
- **Automated Accessibility Testing:** Integrated `axe-core` and `react-axe` to perform automated accessibility checks during development, helping to identify and resolve issues early in the development process.

## Earlier Change: Temporarily Hide Google Sign-In

- Hide Google sign-in buttons on login and registration while retaining working email/password authentication.
- The app is configured for Supabase project `sjziagprpoqlrtgzfdsy`.
- Google OAuth remains unavailable until its provider configuration is resolved.
- Use Supabase Auth, Postgres, Realtime, and Storage for the application.
- Order the fresh-project migrations so posts and comments exist before migrations create likes and their policies.
- Replace Firebase client integrations across authentication, profiles, social content, notifications, lesson records, and file uploads.
- Keep the grade/class selection flow and store its assignment as columns on each lesson.
- Restrict lessons and videos to signed-in users, and lesson writes/uploads to the configured admin email.
- Cap video uploads to the Supabase Free tier's 50 MB per-file limit.
- Render lesson details synchronously so the component can be used inside the client-side authenticated lesson page.
- Let admins attach or edit a written task prompt for each lesson and review student answers; signed-in students can submit and revise their own written response.
- Publish each task submission as a social post so classmates can like and comment; revisions update the linked post rather than creating duplicates.
- Protect submissions with row-level security so students see and change only their own answers while the admin can review all answers.
- Show a “No task assigned yet” placeholder on lessons without a task prompt.
- Enable authenticated users to read profiles and restrict profile creation/updates to the profile owner.
- Feature the teacher portrait from `public/teacher.jpg` in the responsive home-page hero.
- Display +249 127 127 993 with the WhatsApp icon in a clickable WhatsApp link in the home-page footer.
- Firebase users, content, and files are intentionally not migrated in this switch; users must register again or reset passwords with Supabase.

## Earlier Change: Notify Users About Post Interactions

- Generate notifications transactionally in Supabase for post likes, post comments, comment replies, and comment likes, without duplicate client-side notification writes.
- Ensure notification actors match the authenticated user and prevent clients from directly inserting arbitrary notifications.
- Display the actor, interaction type, and comment text where applicable, with an unread count and mark-as-read behavior.
- Link notifications to the matching post/comment in the social feed and scroll the target into view.

## Earlier Change: Redirect Authenticated Users From the Homepage

- Keep the landing page and its metadata available to signed-out visitors.
- Wait for Supabase session loading before deciding whether to show the landing page or redirect the authenticated user to `/social`.
- Show a brief status message while the session is checked or the redirect is underway.

## Current Change: Social-Style Student Profiles

- Present a cover-photo header with the student's avatar, name, username, bio, join date, and post count.
- Add Posts and About tabs; show the student's posts and shared task answers using the existing post interaction components.
- Let profile owners create posts, update their bio and profile details, and upload profile and cover photos.
- Keep account email owner-only and remove the public account ID.
- Subscribe the profile timeline to post and interaction changes in realtime.
