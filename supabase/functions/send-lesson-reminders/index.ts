import { createClient } from 'npm:@supabase/supabase-js@2';
import webpush from 'npm:web-push@3.6.7';

interface ReminderProfile {
  id: string;
  lesson_reminder_time: string;
  lesson_reminder_timezone: string;
}

interface PushSubscription {
  id: string;
  user_id: string;
  endpoint: string;
  p256dh: string;
  auth: string;
}

function localDateAndTime(timezone: string, now: Date): { date: string; time: string } {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: timezone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
  }).formatToParts(now);
  const values = Object.fromEntries(parts.map((part) => [part.type, part.value]));
  return {
    date: `${values.year}-${values.month}-${values.day}`,
    time: `${values.hour}:${values.minute}`,
  };
}

Deno.serve(async (request) => {
  const cronSecret = Deno.env.get('REMINDER_CRON_SECRET');
  if (!cronSecret || request.headers.get('x-cron-secret') !== cronSecret) {
    return new Response('Unauthorized', { status: 401 });
  }

  const supabaseUrl = Deno.env.get('SUPABASE_URL');
  const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
  const vapidPublicKey = Deno.env.get('VAPID_PUBLIC_KEY');
  const vapidPrivateKey = Deno.env.get('VAPID_PRIVATE_KEY');
  const vapidSubject = Deno.env.get('VAPID_SUBJECT');
  if (!supabaseUrl || !serviceRoleKey || !vapidPublicKey || !vapidPrivateKey || !vapidSubject) {
    console.error('Lesson reminder sender is missing required server configuration.');
    return new Response('Reminder sender is not configured.', { status: 500 });
  }

  webpush.setVapidDetails(vapidSubject, vapidPublicKey, vapidPrivateKey);
  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  try {
    const { data: profiles, error: profilesError } = await supabase
      .from('lesson_reminder_settings')
      .select('user_id, reminder_time, timezone')
      .eq('enabled', true)
      .not('reminder_time', 'is', null)
      .not('timezone', 'is', null);
    if (profilesError) throw profilesError;

    const now = new Date();
    const dueProfiles: Array<ReminderProfile & { localDate: string }> = [];
    for (const profile of profiles ?? []) {
      try {
        const local = localDateAndTime(profile.timezone, now);
        if (local.time === profile.reminder_time.slice(0, 5)) {
          dueProfiles.push({
            id: profile.user_id,
            lesson_reminder_time: profile.reminder_time,
            lesson_reminder_timezone: profile.timezone,
            localDate: local.date,
          });
        }
      } catch (timezoneError) {
        console.error(`Invalid reminder time zone for profile ${profile.user_id}:`, timezoneError);
      }
    }

    let sent = 0;
    for (const profile of dueProfiles) {
      const { data: subscriptions, error: subscriptionsError } = await supabase
        .from('lesson_push_subscriptions')
        .select('id, user_id, endpoint, p256dh, auth')
        .eq('user_id', profile.id);
      if (subscriptionsError) {
        console.error(`Could not load reminder devices for profile ${profile.id}:`, subscriptionsError);
        continue;
      }
      if (!subscriptions?.length) continue;

      const { data: claimed, error: claimError } = await supabase.rpc('claim_lesson_reminder', {
        p_user_id: profile.id,
        p_reminder_date: profile.localDate,
      });
      if (claimError) {
        console.error(`Could not claim reminder for profile ${profile.id}:`, claimError);
        continue;
      }
      if (claimed !== true) continue;

      let delivered = false;
      for (const subscription of subscriptions as PushSubscription[]) {
        try {
          await webpush.sendNotification({
            endpoint: subscription.endpoint,
            keys: { p256dh: subscription.p256dh, auth: subscription.auth },
          }, JSON.stringify({
            title: 'Time for your eSchool lesson',
            body: 'Your daily lesson reminder is here. Keep your learning going!',
            url: '/lessons',
          }), { TTL: 60 * 60 });
          delivered = true;
        } catch (pushError) {
          const statusCode = typeof pushError === 'object' && pushError !== null && 'statusCode' in pushError
            ? Number(pushError.statusCode)
            : null;
          if (statusCode === 404 || statusCode === 410) {
            const { error: removeError } = await supabase
              .from('lesson_push_subscriptions')
              .delete()
              .eq('id', subscription.id);
            if (removeError) console.error('Could not remove an expired push subscription:', removeError);
          } else {
            console.error(`Could not send lesson reminder to profile ${profile.id}:`, pushError);
          }
        }
      }

      if (delivered) {
        sent += 1;
      } else {
        const { error: releaseError } = await supabase
          .from('lesson_reminder_deliveries')
          .delete()
          .eq('user_id', profile.id)
          .eq('reminder_date', profile.localDate);
        if (releaseError) console.error('Could not release an undelivered reminder claim:', releaseError);
      }
    }

    return Response.json({ checked: profiles?.length ?? 0, due: dueProfiles.length, sent });
  } catch (error) {
    console.error('Lesson reminder dispatch failed:', error);
    return new Response('Lesson reminder dispatch failed.', { status: 500 });
  }
});
