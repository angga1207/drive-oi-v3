import { NextRequest, NextResponse } from 'next/server';
import { google } from 'googleapis';

/**
 * Google OAuth - Start authentication
 * GET /api/auth/google
 */
export async function GET(request: NextRequest) {
  try {
    const oauth2Client = new google.auth.OAuth2(
      process.env.AUTH_GOOGLE_ID || process.env.GOOGLE_CLIENT_ID,
      process.env.AUTH_GOOGLE_SECRET || process.env.GOOGLE_CLIENT_SECRET,
      `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/auth/google/callback`
    );

    const authUrl = oauth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: [
        'https://www.googleapis.com/auth/userinfo.profile',
        'https://www.googleapis.com/auth/userinfo.email',
      ],
      prompt: 'select_account',
    });

    console.log('🔐 Google OAuth: Redirecting to Google...');
    return NextResponse.redirect(authUrl);
  } catch (error: any) {
    console.error('❌ Google OAuth error:', error);
    return NextResponse.redirect(new URL('/login?error=oauth_failed', request.url));
  }
}
