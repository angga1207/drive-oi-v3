import { NextResponse } from 'next/server';
import { getSession, getCurrentUser, clearSession } from '@/lib/session';

export async function GET() {
    try {
        const session = await getSession();
        const user = await getCurrentUser();

        if (!session || !user) {
            return NextResponse.json({
                authenticated: false,
                user: null,
                token: null,
            });
        }

        return NextResponse.json({
            authenticated: true,
            user: {
                id: user.id,
                fullname: user.name.fullname,
                firstname: user.name.firstname,
                lastname: user.name.lastname,
                email: user.email,
                photo: user.photo,
            },
            token: session.token,
        });
    } catch (error) {
        console.error('Error getting session:', error);
        return NextResponse.json({
            authenticated: false,
            user: null,
            token: null,
        });
    }
}

/**
 * DELETE - Clear session (logout)
 * This endpoint is used by client-side auto-logout
 */
export async function DELETE() {
    try {
        await clearSession();
        return NextResponse.json({
            success: true,
            message: 'Session cleared',
        });
    } catch (error) {
        console.error('Error clearing session:', error);
        return NextResponse.json({
            success: false,
            message: 'Failed to clear session',
        }, { status: 500 });
    }
}
