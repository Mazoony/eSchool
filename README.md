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

## Daily lesson push reminders

Students are asked to choose a local reminder time nine seconds after their first authenticated visit. They can also manage the daily reminder at `/settings`. Device reminders require browser notification permission, HTTPS (localhost is allowed for development), a service worker, and the scheduled Supabase Edge Function.

1. Generate a VAPID key pair using `npx web-push generate-vapid-keys --json`. Set the public key as `NEXT_PUBLIC_VAPID_PUBLIC_KEY` in local `.env.local` and in the web app hosting provider's build environment. Never expose the private key to the browser.
2. Set the Edge Function secrets, replacing the placeholders with the generated values and a new random cron secret:

   ```bash
   npx supabase secrets set VAPID_PUBLIC_KEY="<public-key>" VAPID_PRIVATE_KEY="<private-key>" VAPID_SUBJECT="mailto:admin@example.com" REMINDER_CRON_SECRET="<random-secret>"
   npx supabase functions deploy send-lesson-reminders
   ```

3. In the Supabase SQL Editor, save the same cron secret in Vault and schedule the sender once per minute:

   ```sql
   create extension if not exists pg_cron with schema pg_catalog;
   create extension if not exists pg_net with schema extensions;

   select vault.create_secret('<same-random-secret>', 'lesson_reminder_cron_secret');

   select cron.schedule(
     'send-lesson-reminders-every-minute',
     '* * * * *',
     $$
     select net.http_post(
       url := 'https://sjziagprpoqlrtgzfdsy.supabase.co/functions/v1/send-lesson-reminders',
       headers := jsonb_build_object(
         'Content-Type', 'application/json',
         'x-cron-secret', (
           select decrypted_secret
           from vault.decrypted_secrets
           where name = 'lesson_reminder_cron_secret'
         )
       ),
       body := '{}'::jsonb
     );
     $$
   );
   ```

The SQL migration creates the private push-subscription table and daily delivery claims. The sender uses each student's saved time zone and sends at most one reminder per local day. iOS browsers may require the student to install the site to the home screen before enabling web push.

## Automatic task grading

Task submissions are graded by Google Gemini using the task prompt and the optional private grading guide entered by the admin at `/admin/tasks`. The guide can include expected answers and scoring criteria; it is visible only to task reviewers and the grading service. High-confidence results receive a score and feedback immediately; lower-confidence answers remain unscored until a teacher reviews them. Teachers can always override a mark. Changing an answer clears its previous mark and triggers grading again.

To enable grading, set a Gemini API key as a **Supabase Edge Function secret** and deploy the grading function:

```bash
npx supabase secrets set GEMINI_API_KEY="<your-gemini-api-key>"
npx supabase functions deploy grade-lesson-submission
```

The function uses `gemini-2.5-flash` by default. To choose another supported Gemini model, set the optional `GEMINI_MODEL` Edge Function secret before deployment. Never expose the Gemini key in a `NEXT_PUBLIC_*` variable or commit it to the repository. Student task prompts and answers are sent to Google Gemini for grading.

Admins can add or edit written lesson prompts at `/admin/tasks` and review student answers there. Students can submit one written answer per lesson and revise it later. Each submission is also shared as a post in the social feed, where other students can like and comment; revisions update the existing post. Row Level Security restricts students to their own submissions.

Authenticated users can read profiles needed for the social feed, while profile creation and updates are restricted to the owner by Row Level Security.

Firebase accounts, posts, profiles, and files are not automatically copied to Supabase. Users need accounts in the Supabase project; Firebase passwords cannot be transferred.

## Learn more

- [Next.js documentation](https://nextjs.org/docs)
- [Supabase documentation](https://supabase.com/docs)
