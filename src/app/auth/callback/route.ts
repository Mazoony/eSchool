import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get('code');
  const providerError = url.searchParams.get('error');

  if (providerError) {
    console.error(
      'Supabase OAuth provider returned an error:',
      url.searchParams.get('error_description') ?? providerError,
    );
    return NextResponse.redirect(new URL('/login?authError=provider', url.origin));
  }

  if (!code) {
    console.error('Supabase OAuth callback did not include an authorization code.');
    return NextResponse.redirect(new URL('/login?authError=missing-code', url.origin));
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.exchangeCodeForSession(code);
  if (!error) return NextResponse.redirect(new URL('/lessons', url.origin));

  console.error('Supabase OAuth callback failed:', error);
  return NextResponse.redirect(new URL('/login?authError=exchange-failed', url.origin));
}
