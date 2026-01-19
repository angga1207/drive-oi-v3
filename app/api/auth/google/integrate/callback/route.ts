import { NextRequest, NextResponse } from 'next/server';
import { google } from 'googleapis';
import { getToken } from '@/lib/session';
import { API_CONFIG } from '@/lib/config';

/**
 * Google Integration - Callback handler
 * GET /api/auth/google/integrate/callback?code=...
 */
export async function GET(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams;
    const code = searchParams.get('code');
    const error = searchParams.get('error');
    const state = searchParams.get('state');

    if (error) {
        console.error('❌ Google OAuth error:', error);
        return NextResponse.redirect(new URL('/profile?error=access_denied', request.url));
    }

    if (!code) {
        console.error('❌ No authorization code received');
        return NextResponse.redirect(new URL('/profile?error=no_code', request.url));
    }

    // Verify this is integration, not login
    if (state !== 'integration') {
        console.error('❌ Invalid state parameter');
        return NextResponse.redirect(new URL('/profile?error=invalid_state', request.url));
    }

    try {
        console.log('\n🔗 ========== GOOGLE INTEGRATION CALLBACK ==========');
        console.log('📥 Received authorization code');
        console.log('🌐 NEXT_PUBLIC_APP_URL:', process.env.NEXT_PUBLIC_APP_URL);

        // Verify user is authenticated
        const token = await getToken();

        if (!token) {
            console.error('❌ User not authenticated');
            return NextResponse.redirect(new URL('/login', request.url));
        }

        // Exchange code for tokens
        const redirectUri = `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/google/integrate/callback`;
        console.log('🔗 Integration Callback Redirect URI:', redirectUri);
        
        const oauth2Client = new google.auth.OAuth2(
            process.env.AUTH_GOOGLE_ID || process.env.GOOGLE_CLIENT_ID,
            process.env.AUTH_GOOGLE_SECRET || process.env.GOOGLE_CLIENT_SECRET,
            redirectUri
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

        // Send to Laravel backend for syncing
        console.log('📤 Sending to Laravel backend: /api/sync/google');
        const response = await fetch(`${API_CONFIG.BASE_URL}/sync/google`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
                'Accept': 'application/json',
            },
            body: JSON.stringify({
                name: userInfo.name || '',
                email: userInfo.email || '',
                image: userInfo.picture || null,
            }),
        });

        const data = await response.json();
        console.log('📥 Backend response:', data);

        if (data.status === 'success') {
            console.log('✅ Google account synced successfully!');
            console.log('🔗 ========== GOOGLE INTEGRATION CALLBACK END (SUCCESS) ==========\n');

            // Redirect to profile with success message
            return NextResponse.redirect(new URL('/profile?success=google_synced', request.url));
        }

        console.error('❌ Backend sync failed:', data.message);
        console.log('🔗 ========== GOOGLE INTEGRATION CALLBACK END (FAILED) ==========\n');
        return NextResponse.redirect(new URL('/profile?error=sync_failed', request.url));
    } catch (error: any) {
        console.error('❌ Callback error:', error);
        console.log('🔗 ========== GOOGLE INTEGRATION CALLBACK END (ERROR) ==========\n');
        return NextResponse.redirect(new URL('/profile?error=callback_error', request.url));
    }
}
