import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();

        if (!body.username) {
            return NextResponse.json(
                { message: 'Username is required', status: 'error' },
                { status: 400 }
            );
        }

        // Hit Laravel backend auto-login endpoint
        const response = await fetch(`${process.env.API_BASE_URL}/auto-login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
            },
            body: JSON.stringify({ username: body.username, key: body.key }),
        });

        const data = await response.json();

        // Jika login berhasil, simpan token ke cookies
        if (response.ok && data.status === 'success' && data.token) {
            // Create response with success data
            const successResponse = NextResponse.json({
                status: 'success',
                message: 'Auto login successful',
                data: data.data || data.user,
            });

            // Set token cookie in response
            successResponse.cookies.set('token', data.token, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'lax',
                maxAge: 60 * 60 * 24 * 30, // 30 days
                path: '/',
            });

            return successResponse;
        }

        // Jika gagal, kembalikan response error dari backend
        return NextResponse.json(
            {
                status: 'error',
                message: data.message || 'Auto login failed',
            },
            { status: response.status || 401 }
        );
    } catch (error) {
        console.error('Auto login error:', error);
        return NextResponse.json(
            {
                status: 'error',
                message: 'Internal server error',
            },
            { status: 500 }
        );
    }
}
