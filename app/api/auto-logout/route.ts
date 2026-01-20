import { NextResponse } from 'next/server';
import { clearSession } from '@/lib/session';

/**
 * Auto-Logout API Route
 * GET /api/auto-logout?error=session_expired&redirect=/files
 * 
 * This route handles auto-logout when token is invalid/expired
 * It clears the session and redirects to login page with error message
 */
export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const error = searchParams.get('error') || 'session_expired';
    const redirectPath = searchParams.get('redirect') || '';

    console.log('🔐 Auto-logout triggered:', error);

    try {
        // Clear session
        await clearSession();
        console.log('✅ Session cleared successfully');
    } catch (err) {
        console.error('❌ Failed to clear session:', err);
    }

    // Build login URL with error and redirect params
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('error', error);
    
    if (redirectPath) {
        loginUrl.searchParams.set('redirect', redirectPath);
    }

    // Redirect to login
    return NextResponse.redirect(loginUrl);
}
