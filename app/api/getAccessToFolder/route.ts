import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { getSession } from '@/lib/session';

const API_BASE_URL = process.env.API_BASE_URL || 'https://drive-backend.oganilirkab.go.id/api';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { slug } = body;

        if (!slug) {
            return NextResponse.json(
                { error: 'Slug is required' },
                { status: 400 }
            );
        }

        // Get session cookie (required for this endpoint)
        const session = await getSession();
        if (!session?.token) {
            return NextResponse.json(
                { message: 'Unauthorized' },
                { status: 401 }
            );
        }

        const response = await fetch(`${API_BASE_URL}/getAccessToFolder`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${session.token}`,
            },
            body: JSON.stringify({ slug }),
        });

        if (!response.ok) {
            const errorData = await response.json();
            return NextResponse.json(errorData, { status: response.status });
        }

        const data = await response.json();
        return NextResponse.json(data);
    } catch (error) {
        console.error('Error getting access to folder:', error);
        return NextResponse.json(
            { error: 'Failed to get access to folder' },
            { status: 500 }
        );
    }
}
