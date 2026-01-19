import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/session';

export async function GET(request: NextRequest) {
    try {
        // Get session for authentication
        const session = await getSession();
        if (!session?.token) {
            return NextResponse.json(
                { message: 'Unauthorized' },
                { status: 401 }
            );
        }

        // Get query parameters
        const searchParams = request.nextUrl.searchParams;
        const slug = searchParams.get('slug') || '0';
        const excludeIds = searchParams.getAll('excludeIds[]');

        // Call Laravel backend API
        const backendUrl = new URL(`${process.env.API_BASE_URL}/getFolders`);
        backendUrl.searchParams.set('slug', slug);
        
        // Backend needs at least one excludeIds, send empty array if none provided
        if (excludeIds.length === 0) {
            backendUrl.searchParams.append('excludeIds[]', '');
        } else {
            excludeIds.forEach(id => backendUrl.searchParams.append('excludeIds[]', id));
        }

        const response = await fetch(backendUrl.toString(), {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${session.token}`,
                'Content-Type': 'application/json',
            },
        });

        // Check if response is JSON
        const contentType = response.headers.get('content-type');
        if (!contentType || !contentType.includes('application/json')) {
            console.error('Backend returned non-JSON response');
            return NextResponse.json(
                { message: 'Backend returned invalid response format' },
                { status: 500 }
            );
        }

        const data = await response.json();

        if (!response.ok) {
            return NextResponse.json(
                { message: data.message || 'Failed to fetch folders' },
                { status: response.status }
            );
        }

        // Extract folders from nested data structure
        const folders = data.data?.folders || [];

        return NextResponse.json({
            message: 'Folders fetched successfully',
            data: folders,
        });
    } catch (error: any) {
        console.error('Get folders error:', error);
        return NextResponse.json(
            { message: error.message || 'Internal server error' },
            { status: 500 }
        );
    }
}
