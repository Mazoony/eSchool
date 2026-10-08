# eSchool

eSchool is a Next.js app using Firebase Authentication, Cloud Firestore, and Cloud Storage.

## Local development

1. Install Node.js 20.17 or newer.
2. Install dependencies with `npm ci`.
3. Create a Firebase project and register a Web app in the Firebase console.
4. Enable **Email/Password** and **Google** under Authentication → Sign-in method.
5. Create a Firestore database and enable Cloud Storage.
6. Copy `.env.example` to `.env.local` and fill in the Firebase Web app configuration values from Project settings.
7. Authenticate Firebase CLI, select the project, and deploy the security rules:

   ```bash
   npx firebase-tools login
   npx firebase-tools use --add
   npx firebase-tools deploy --only firestore:rules,storage
   ```

8. Start the development server with `npm run dev`, then open [http://localhost:3000](http://localhost:3000).

The Firebase Web app configuration is public client configuration, not an admin credential. Keep `.env.local` out of source control. Never put Firebase service-account keys in `NEXT_PUBLIC_*` variables.

The administrator email currently authorized by Firestore and Storage rules is `wadareaf@gmail.com`. Update both rules files together if the administrator account changes. The `/lessons/seed` tool replaces the current Firestore `lessons` collection with its sample lesson set.

## Learn more

- [Next.js documentation](https://nextjs.org/docs)
- [Firebase documentation](https://firebase.google.com/docs)
