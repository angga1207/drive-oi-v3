import { NextResponse } from 'next/server';
import { getSession } from '@/lib/session';
import { API_CONFIG } from '@/lib/config';

const API_BASE_URL = API_CONFIG.BASE_URL;

export async function GET() {
    try {
        // Get session cookie (required for this endpoint)
        // Get session cookie (required for this endpoint)
        const session = await getSession();
        if (!session?.token) {
            return NextResponse.json(
                { message: 'Unauthorized' },
                { status: 401 }
            );
        }

        const response = await fetch(`${API_BASE_URL}/getSharedFolders`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${session.token}`,
            },
            cache: 'no-store',
        });

        if (!response.ok) {
            const errorData = await response.json();
            return NextResponse.json(errorData, { status: response.status });
        }

        const data = await response.json();
        return NextResponse.json(data);
    } catch (error) {
        console.error('Error fetching shared folders:', error);
        return NextResponse.json(
            { error: 'Failed to fetch shared folders' },
            { status: 500 }
        );
    }
}
