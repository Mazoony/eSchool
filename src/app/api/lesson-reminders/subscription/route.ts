import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

interface PushSubscriptionInput {
  endpoint?: unknown;
  keys?: {
    p256dh?: unknown;
    auth?: unknown;
  };
}

export async function POST(request: Request) {
  let payload: PushSubscriptionInput;
  try {
    payload = await request.json() as PushSubscriptionInput;
  } catch {
    return NextResponse.json({ error: 'Invalid subscription request.' }, { status: 400 });
  }

  const endpoint = payload.endpoint;
  const p256dh = payload.keys?.p256dh;
  const auth = payload.keys?.auth;
  if (
    typeof endpoint !== 'string'
    || typeof p256dh !== 'string'
    || typeof auth !== 'string'
    || p256dh.length > 512
    || auth.length > 512
  ) {
    return NextResponse.json({ error: 'Invalid push subscription.' }, { status: 400 });
  }

  try {
    const endpointUrl = new URL(endpoint);
    const supportedPushHost = endpointUrl.hostname === 'fcm.googleapis.com'
      || endpointUrl.hostname.endsWith('.push.services.mozilla.com')
      || endpointUrl.hostname.endsWith('.notify.windows.com')
      || endpointUrl.hostname.endsWith('.push.apple.com');
    if (endpointUrl.protocol !== 'https:' || !supportedPushHost) {
      return NextResponse.json({ error: 'This browser push provider is not supported.' }, { status: 400 });
    }

    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Sign in to enable lesson reminders.' }, { status: 401 });
    }

    const { error } = await supabase
      .from('lesson_push_subscriptions')
      .upsert({
        user_id: user.id,
        endpoint,
        p256dh,
        auth,
        updated_at: new Date().toISOString(),
      }, { onConflict: 'endpoint' });
    if (error) throw new Error(`Could not save this device for reminders: ${error.message}`);

    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    console.error('Could not save lesson reminder subscription:', error);
    return NextResponse.json({
      error: error instanceof Error ? error.message : 'Could not enable device reminders.',
    }, { status: 500 });
  }
}
