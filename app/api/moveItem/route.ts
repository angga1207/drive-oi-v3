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
        const { targetId, sourceIds } = body;

        // Validate input
        if (!targetId && targetId !== 0 && targetId !== '0') {
            return NextResponse.json(
                { message: 'Target folder is required' },
                { status: 400 }
            );
        }

        if (!sourceIds || !Array.isArray(sourceIds) || sourceIds.length === 0) {
            return NextResponse.json(
                { message: 'No items selected to move' },
                { status: 400 }
            );
        }

        // Call Laravel backend API
        const backendUrl = `${process.env.API_BASE_URL}/moveItem`;
        const response = await fetch(backendUrl, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${session.token}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                targetId,
                sourceIds,
            }),
        });

        const data = await response.json();

        if (!response.ok) {
            return NextResponse.json(
                { message: data.message || 'Move failed' },
                { status: response.status }
            );
        }

        return NextResponse.json({
            message: data.message || 'Items moved successfully',
            data: data.data,
        });
    } catch (error: any) {
        console.error('Move items error:', error);
        return NextResponse.json(
            { message: error.message || 'Internal server error' },
            { status: 500 }
        );
    }
}
