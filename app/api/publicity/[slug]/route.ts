import { NextRequest, NextResponse } from 'next/server';
import { API_CONFIG } from '@/lib/config';
import { getSession } from '@/lib/session';

export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ slug: string }> }
) {
    try {
        const { slug } = await params;
        const body = await request.json();
        const { status, forever, expired_at, editable } = body;

        if (!status) {
            return NextResponse.json(
                { message: 'Status publicity tidak boleh kosong' },
                { status: 400 }
            );
        }

        // Get session with token
        const session = await getSession();

        if (!session) {
            return NextResponse.json(
                { message: 'Unauthorized - Session not found' },
                { status: 401 }
            );
        }

        // Prepare request body with nested structure
        const requestBody = {
            slug: slug,
            data: {
                publicity: {
                    status: status,
                    forever: forever ? 1 : 0,
                    expired_at: expired_at || null,
                    editable: editable ? 1 : 0,
                },
            },
        };

        // Call Laravel API
        const response = await fetch(`${API_CONFIG.BASE_URL}/publicity/${slug}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'Authorization': `Bearer ${session.token}`,
            },
            body: JSON.stringify(requestBody),
        });

        const data = await response.json();

        if (!response.ok) {
            return NextResponse.json(
                { message: data.message || 'Gagal membagikan item' },
                { status: response.status }
            );
        }

        return NextResponse.json({
            //   message: 'Berhasil membagikan item',
            message: data.message || 'Berhasil membagikan item',
            data: data.data,
        });
    } catch (error: any) {
        return NextResponse.json(
            { message: 'Terjadi kesalahan server' },
            { status: 500 }
        );
    }
}
