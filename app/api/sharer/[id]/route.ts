import { NextRequest, NextResponse } from 'next/server';

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;

        if (!id) {
            return NextResponse.json(
                { message: 'Slug is required' },
                { status: 400 }
            );
        }

        // Call Laravel backend API
        const backendUrl = `${process.env.API_BASE_URL}/getItemsSharer?slug=${id}`;
        const response = await fetch(backendUrl, {
            method: 'GET',
            headers: {
                'Accept': 'application/json',
            },
            cache: 'no-store',
        });

        const data = await response.json();

        if (!response.ok) {
            return NextResponse.json(
                { message: data.message || 'Failed to fetch shared items' },
                { status: response.status }
            );
        }

        return NextResponse.json(data);
    } catch (error: any) {
        console.error('Sharer fetch error:', error);
        return NextResponse.json(
            { message: error.message || 'Internal server error' },
            { status: 500 }
        );
    }
}
