import { NextRequest, NextResponse } from 'next/server';
import { google } from 'googleapis';
import { googleLoginService } from '@/lib/services/auth.service';
import { setSession } from '@/lib/session';

/**
 * Google OAuth - Callback handler
 * GET /api/auth/google/callback?code=...
 */
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const code = searchParams.get('code');
  const error = searchParams.get('error');

  if (error) {
    console.error('❌ Google OAuth error:', error);
    return NextResponse.redirect(new URL('/login?error=access_denied', request.url));
  }

  if (!code) {
    console.error('❌ No authorization code received');
    return NextResponse.redirect(new URL('/login?error=no_code', request.url));
  }

  try {
    console.log('\n🔐 ========== GOOGLE OAUTH CALLBACK ==========');
    console.log('📥 Received authorization code');

    // Exchange code for tokens
    const oauth2Client = new google.auth.OAuth2(
      process.env.AUTH_GOOGLE_ID || process.env.GOOGLE_CLIENT_ID,
      process.env.AUTH_GOOGLE_SECRET || process.env.GOOGLE_CLIENT_SECRET,
      `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/auth/google/callback`
    );

    const { tokens } = await oauth2Client.getToken(code);
    oauth2Client.setCredentials(tokens);

    console.log('✅ Got tokens from Google');

    // Get user info
    const oauth2 = google.oauth2({ version: 'v2', auth: oauth2Client });
    const { data: userInfo } = await oauth2.userinfo.get();

    console.log('👤 Google User:', {
      name: userInfo.name,
      email: userInfo.email,
    });

    // Send to Laravel backend
    console.log('📤 Sending to Laravel backend...');
    const result = await googleLoginService({
      name: userInfo.name || '',
      email: userInfo.email || '',
      image: userInfo.picture || '',
    });

    if (result.success && result.data) {
      console.log('✅ Backend login successful!');
      console.log('👤 User:', result.data.user.username);
      console.log('🔑 Token:', result.data.token.substring(0, 20) + '...');

      // Save session
      await setSession(result.data.token, result.data.user);
      console.log('✅ Session saved!');
      console.log('🔐 ========== GOOGLE OAUTH CALLBACK END (SUCCESS) ==========\n');

      // Redirect to dashboard
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }

    console.error('❌ Backend login failed:', result.message);
    console.log('🔐 ========== GOOGLE OAUTH CALLBACK END (FAILED) ==========\n');
    return NextResponse.redirect(new URL('/login?error=backend_failed', request.url));
  } catch (error: any) {
    console.error('❌ Callback error:', error);
    console.log('🔐 ========== GOOGLE OAUTH CALLBACK END (ERROR) ==========\n');
    return NextResponse.redirect(new URL('/login?error=callback_error', request.url));
  }
}
