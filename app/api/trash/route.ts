import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/session';

export async function GET(request: NextRequest) {
    try {
        const session = await getSession();
        
        console.log('Trash API - Session check:', {
            hasSession: !!session,
            hasToken: !!session?.token,
            tokenPreview: session?.token ? session.token.substring(0, 20) + '...' : 'none'
        });

        if (!session || !session.token) {
            return NextResponse.json(
                { message: 'Unauthorized' },
                { status: 401 }
            );
        }

        // Call Laravel backend API
        const backendUrl = `${process.env.API_BASE_URL}/getItemsTrashed`;
        console.log('Fetching from backend:', backendUrl);
        
        const response = await fetch(backendUrl, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${session.token}`,
                'Accept': 'application/json',
            },
            cache: 'no-store',
        });

        const data = await response.json();

        if (!response.ok) {
            console.error('Backend response error:', response.status, data);
            return NextResponse.json(
                { message: data.message || 'Failed to fetch trash items' },
                { status: response.status }
            );
        }

        console.log('Trash items fetched successfully, count:', data.data?.length || 0);
        return NextResponse.json(data);
    } catch (error: any) {
        console.error('Trash fetch error:', error);
        return NextResponse.json(
            { message: error.message || 'Internal server error' },
            { status: 500 }
        );
    }
}
