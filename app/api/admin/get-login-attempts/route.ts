import { NextRequest, NextResponse } from 'next/server';
import { getToken } from '@/lib/session';
import { API_CONFIG } from '@/lib/config';

export async function GET(request: NextRequest) {
  try {
    const token = await getToken();

    if (!token) {
      return NextResponse.json({ status: 'error', message: 'Not authenticated' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const ip_address = searchParams.get('ip_address');
    const user_id = searchParams.get('user_id');
    const limit = searchParams.get('limit');

    const queryParams = new URLSearchParams({
      ...(ip_address ? { ip_address } : {}),
      ...(user_id ? { user_id } : {}),
      ...(limit ? { limit } : {}),
    });

    const response = await fetch(
      `${API_CONFIG.BASE_URL}/v2/security/get-login-attempts?${queryParams.toString()}`,
      {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
        },
      }
    );

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(data, { status: response.status });
    }

    return NextResponse.json(data);
  } catch (error: any) {
    console.error('❌ Get login attempts error:', error);
    return NextResponse.json(
      { status: 'error', message: error.message || 'Failed to get login attempts' },
      { status: 500 }
    );
  }
}
