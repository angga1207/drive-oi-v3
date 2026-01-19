import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/session';

export async function POST(request: NextRequest) {
    try {
        const session = await getSession();
        if (!session || !session.token) {
            return NextResponse.json(
                { message: 'Unauthorized' },
                { status: 401 }
            );
        }

        // Get request body
        const body = await request.json();
        const ids = body.ids;

        // Validate ids
        if (!ids || !Array.isArray(ids) || ids.length === 0) {
            return NextResponse.json(
                { message: 'No items selected to delete' },
                { status: 400 }
            );
        }

        // Call Laravel backend API
        const backendUrl = `${process.env.API_BASE_URL}/forceDelete`;
        const response = await fetch(backendUrl, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${session.token}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ ids }),
        });

        const data = await response.json();

        if (!response.ok) {
            return NextResponse.json(
                { message: data.message || 'Delete failed' },
                { status: response.status }
            );
        }

        return NextResponse.json({
            message: data.message || 'Items permanently deleted',
            data: data.data,
        });
    } catch (error: any) {
        console.error('Force delete error:', error);
        return NextResponse.json(
            { message: error.message || 'Internal server error' },
            { status: 500 }
        );
    }
}
