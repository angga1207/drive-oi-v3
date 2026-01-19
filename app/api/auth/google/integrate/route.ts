import { NextRequest, NextResponse } from 'next/server';
import { google } from 'googleapis';
import { getToken } from '@/lib/session';

/**
 * Google Integration - Start OAuth for syncing (not for login)
 * GET /api/auth/google/integrate
 */
export async function GET(request: NextRequest) {
    try {
        console.log('\n🔗 ========== GOOGLE INTEGRATION START ==========');

        // Verify user is authenticated
        const token = await getToken();

        if (!token) {
            console.error('❌ User not authenticated');
            return NextResponse.redirect(new URL('/login', request.url));
        }

        const oauth2Client = new google.auth.OAuth2(
            process.env.AUTH_GOOGLE_ID || process.env.GOOGLE_CLIENT_ID,
            process.env.AUTH_GOOGLE_SECRET || process.env.GOOGLE_CLIENT_SECRET,
            `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/google/integrate/callback`
        );

        const authUrl = oauth2Client.generateAuthUrl({
            access_type: 'offline',
            scope: [
                'https://www.googleapis.com/auth/userinfo.profile',
                'https://www.googleapis.com/auth/userinfo.email',
            ],
            prompt: 'select_account',
            state: 'integration', // To differentiate from login
        });

        console.log('🔐 Redirecting to Google OAuth for integration...');
        console.log('🔗 ========== GOOGLE INTEGRATION START END ==========\n');
        return NextResponse.redirect(authUrl);
    } catch (error: any) {
        console.error('❌ Google integration error:', error);
        return NextResponse.redirect(new URL('/profile?error=integration_failed', request.url));
    }
}
