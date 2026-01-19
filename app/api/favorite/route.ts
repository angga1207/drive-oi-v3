import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/session';
import { API_CONFIG, API_ENDPOINTS } from '@/lib/config';

export async function GET(request: NextRequest) {
    try {
        // Get session
        const session = await getSession();

        if (!session) {
            return NextResponse.json(
                { status: 'error', message: 'Unauthorized' },
                { status: 401 }
            );
        }

        // Call Laravel backend
        const response = await fetch(
            `${API_CONFIG.BASE_URL}${API_ENDPOINTS.DRIVE.GET_FAVORITE_ITEMS}`,
            {
                method: 'GET',
                headers: {
                    ...API_CONFIG.HEADERS,
                    'Authorization': `Bearer ${session.token}`,
                },
            }
        );

        const data = await response.json();

        return NextResponse.json(data);
    } catch (error: any) {
        console.error('Favorite API error:', error);
        return NextResponse.json(
            { status: 'error', message: error.message || 'Internal server error' },
            { status: 500 }
        );
    }
}
