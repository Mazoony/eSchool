# eSchool

eSchool is a Next.js app using Supabase Authentication, Postgres, Realtime, and Storage.

## Local development

1. Install Node.js 20.17 or newer.
2. Install dependencies with `npm ci`.
3. In the Supabase dashboard for the configured project, enable Email/Password and Google sign-in under Authentication → Providers.
4. Copy `.env.example` to `.env.local` and set `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` to the project's publishable key from Project Settings → API Keys.
5. Apply the database migrations:

   ```bash
   npx supabase login
   npx supabase link --project-ref sjziagprpoqlrtgzfdsy
   npx supabase db push
   ```

   These migrations create the social tables before dependent likes and policies. On a new project, let the CLI apply them in order rather than running individual SQL files manually.

6. In Authentication → URL Configuration, allow `http://localhost:3000/auth/callback` as a redirect URL.
7. Start the development server with `npm run dev`, then open [http://localhost:3000](http://localhost:3000).

The Supabase publishable key is intended for browser use; Row Level Security policies protect database and storage operations. Never put a secret or service-role key in a `NEXT_PUBLIC_*` variable. The administrator email authorized to upload lessons is `wadareaf@gmail.com`. Lesson videos are limited to 50 MB to fit the Supabase Free upload limit.

Admins can add or edit written lesson prompts at `/admin/tasks` and review student answers there. Students can submit one written answer per lesson and revise it later. Each submission is also shared as a post in the social feed, where other students can like and comment; revisions update the existing post. Row Level Security restricts students to their own submissions.

Authenticated users can read profiles needed for the social feed, while profile creation and updates are restricted to the owner by Row Level Security.

Firebase accounts, posts, profiles, and files are not automatically copied to Supabase. Users need accounts in the Supabase project; Firebase passwords cannot be transferred.

## Learn more

- [Next.js documentation](https://nextjs.org/docs)
- [Supabase documentation](https://supabase.com/docs)
