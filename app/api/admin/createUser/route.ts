import { NextRequest, NextResponse } from 'next/server';
import { getToken } from '@/lib/session';
import { API_CONFIG } from '@/lib/config';

/**
 * Create User (Admin Only)
 * POST /api/admin/createUser
 * Body: { firstname, lastname, email, username, capacity, password, password_confirmation }
 */
export async function POST(request: NextRequest) {
  try {
    const token = await getToken();
    
    if (!token) {
      return NextResponse.json(
        { status: 'error', message: 'Not authenticated' },
        { status: 401 }
      );
    }

    const body = await request.json();

    const response = await fetch(`${API_CONFIG.BASE_URL}/createUser`, {
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
    console.error('❌ Create user error:', error);
    return NextResponse.json(
      { status: 'error', message: error.message || 'Failed to create user' },
      { status: 500 }
    );
  }
}
