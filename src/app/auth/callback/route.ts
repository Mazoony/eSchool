import { createClient } from '@/utils/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  
  // if `code` is present, exchange it for a session in Supabase.
  if (code) {
    const supabase = await createClient()
    const { error, data } = await supabase.auth.exchangeCodeForSession(code)
    
    if (!error && data?.user) {
      // Wait a moment to ensure session is persisted before redirecting
      await new Promise(resolve => setTimeout(resolve, 100));
      return NextResponse.redirect(`${origin}/profile`);
    }
    
    if (error) {
      console.error('OAuth exchange error:', error.message);
    }
  }

  // return the user to an error page with instructions
  return NextResponse.redirect(`${origin}/auth/auth-code-error`)
}
