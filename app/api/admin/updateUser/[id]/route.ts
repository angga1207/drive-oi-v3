import { NextRequest, NextResponse } from 'next/server';
import { getToken } from '@/lib/session';
import { API_CONFIG } from '@/lib/config';

/**
 * Update User (Admin Only)
 * POST /api/admin/updateUser/[id]
 * Body: { id, firstname, lastname, email, capacity }
 */
export async function POST(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const token = await getToken();

        if (!token) {
            return NextResponse.json(
                { status: 'error', message: 'Not authenticated' },
                { status: 401 }
            );
        }

        const body = await request.json();
        const userId = params.id;

        const response = await fetch(`${API_CONFIG.BASE_URL}/updateUser/${userId ?? body.id}`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Accept': 'application/json',
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(body),
        });

        const data = await response.json();

        if (!response.ok) {
            return NextResponse.json(data, { status: response.status });
        }

        return NextResponse.json(data);
    } catch (error: any) {
        console.error('❌ Update user error:', error);
        return NextResponse.json(
            { status: 'error', message: error.message || 'Failed to update user' },
            { status: 500 }
        );
    }
}
