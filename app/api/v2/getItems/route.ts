import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/session';
import { API_CONFIG } from '@/lib/config';

export async function GET(request: NextRequest) {
    try {
        const session = await getSession();
        if (!session?.token) {
            return NextResponse.json(
                { status: 'error', message: 'Unauthorized' },
                { status: 401 }
            );
        }

        const { searchParams } = new URL(request.url);
        const page = searchParams.get('page') || '1';
        const per_page = searchParams.get('per_page') || '15';
        const slug = searchParams.get('slug');

        const params = new URLSearchParams({ page, per_page });
        if (slug) params.set('slug', slug);

        const response = await fetch(
            `${API_CONFIG.BASE_URL}/v2/getItems?${params}`,
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
        console.error('v2 getItems error:', error);
        return NextResponse.json(
            { status: 'error', message: error.message || 'Internal server error' },
            { status: 500 }
        );
    }
}
