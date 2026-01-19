import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/session';

export async function POST(request: NextRequest) {
    try {
        // Get session for authentication
        const session = await getSession();
        if (!session?.token) {
            return NextResponse.json(
                { message: 'Unauthorized' },
                { status: 401 }
            );
        }

        // Get request body
        const body = await request.json();
        const { ids } = body;

        // Validate input
        if (!ids || !Array.isArray(ids) || ids.length === 0) {
            return NextResponse.json(
                { message: 'No items selected to download' },
                { status: 400 }
            );
        }

        // Call Laravel backend API
        const backendUrl = `${process.env.API_BASE_URL}/download`;
        const response = await fetch(backendUrl, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${session.token}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ ids }),
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
                { message: data.message || 'Download failed' },
                { status: response.status }
            );
        }

        return NextResponse.json({
            message: data.message || 'Download URLs retrieved successfully',
            data: data.data,
        });
    } catch (error: any) {
        console.error('Download error:', error);
        return NextResponse.json(
            { message: error.message || 'Internal server error' },
            { status: 500 }
        );
    }
}
