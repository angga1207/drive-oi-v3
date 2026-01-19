import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/session';

export async function GET(request: NextRequest) {
    try {
        const session = await getSession();

        if (!session?.token) {
            return NextResponse.json(
                { message: 'Unauthorized' },
                { status: 401 }
            );
        }

        // Get search query from URL params
        const searchParams = request.nextUrl.searchParams;
        const search = searchParams.get('search');

        if (!search || search.trim() === '') {
            return NextResponse.json(
                { message: 'Search query is required' },
                { status: 400 }
            );
        }

        // Call Laravel backend
        const response = await fetch(
            `${process.env.API_BASE_URL}/search?search=${encodeURIComponent(search)}`,
            {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${session.token}`,
                    'Accept': 'application/json',
                },
            }
        );

        // Check if response is JSON
        const contentType = response.headers.get('content-type');
        if (!contentType || !contentType.includes('application/json')) {
            console.error('Non-JSON response from backend');
            return NextResponse.json(
                { message: 'Invalid response from server' },
                { status: 500 }
            );
        }

        const data = await response.json();

        if (!response.ok) {
            return NextResponse.json(
                { message: data.message || 'Failed to search' },
                { status: response.status }
            );
        }

        return NextResponse.json(data);
    } catch (error: any) {
        console.error('Search API error:', error);
        return NextResponse.json(
            { message: error.message || 'Internal server error' },
            { status: 500 }
        );
    }
}
