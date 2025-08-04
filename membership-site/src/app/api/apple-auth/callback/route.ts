import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { code, state, id_token } = body;

    console.log('Apple auth callback received:', { code, state, hasIdToken: !!id_token });

    // For now, we'll redirect back to the login page
    // In a full implementation, you would:
    // 1. Exchange the code for tokens with Apple
    // 2. Verify the tokens
    // 3. Create a Firebase credential
    // 4. Sign in the user

    // Redirect back to login page with success/error status
    const redirectUrl = new URL('/login', request.url);
    redirectUrl.searchParams.set('apple_auth', 'success');
    
    return NextResponse.redirect(redirectUrl);
  } catch (error) {
    console.error('Apple auth callback error:', error);
    
    const redirectUrl = new URL('/login', request.url);
    redirectUrl.searchParams.set('apple_auth', 'error');
    redirectUrl.searchParams.set('error', 'apple_auth_failed');
    
    return NextResponse.redirect(redirectUrl);
  }
}

export async function GET(request: NextRequest) {
  // Handle GET requests (Apple might redirect with query params)
  const searchParams = request.nextUrl.searchParams;
  const code = searchParams.get('code');
  const state = searchParams.get('state');
  const error = searchParams.get('error');

  console.log('Apple auth callback GET:', { code, state, error });

  if (error) {
    const redirectUrl = new URL('/login', request.url);
    redirectUrl.searchParams.set('apple_auth', 'error');
    redirectUrl.searchParams.set('error', error);
    return NextResponse.redirect(redirectUrl);
  }

  if (code) {
    // Success case - redirect back to login
    const redirectUrl = new URL('/login', request.url);
    redirectUrl.searchParams.set('apple_auth', 'success');
    redirectUrl.searchParams.set('code', code);
    return NextResponse.redirect(redirectUrl);
  }

  // Fallback
  return NextResponse.redirect(new URL('/login', request.url));
} 