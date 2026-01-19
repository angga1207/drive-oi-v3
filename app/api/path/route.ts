import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

const API_BASE_URL = process.env.API_BASE_URL || 'https://drive-backend.oganilirkab.go.id/api';

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const slug = searchParams.get('slug');

        if (!slug) {
            return NextResponse.json(
                { error: 'Slug parameter is required' },
                { status: 400 }
            );
        }

        // Get session cookie (optional for public items)
        const cookieStore = await cookies();
        const sessionCookie = cookieStore.get('drive_session');
        
        const headers: HeadersInit = {
            'Content-Type': 'application/json',
        };

        // Add auth header if session exists
        if (sessionCookie) {
            headers['Authorization'] = `Bearer ${sessionCookie.value}`;
        }

        const response = await fetch(`${API_BASE_URL}/path?slug=${slug}`, {
            method: 'GET',
            headers,
            cache: 'no-store',
        });

        if (!response.ok) {
            const errorData = await response.json();
            return NextResponse.json(errorData, { status: response.status });
        }

        const data = await response.json();
        return NextResponse.json(data);
    } catch (error) {
        console.error('Error fetching path:', error);
        return NextResponse.json(
            { error: 'Failed to fetch path data' },
            { status: 500 }
        );
    }
}
