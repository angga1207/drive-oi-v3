import { NextRequest, NextResponse } from 'next/server';
import { getToken } from '@/lib/session';
import { API_CONFIG } from '@/lib/config';

/**
 * Get Users List (Admin Only)
 * GET /api/admin/getUsers?per_page=10&order_by=fullname&order_direction=asc&search=...
 */
export async function GET(request: NextRequest) {
  try {
    const token = await getToken();
    
    if (!token) {
      return NextResponse.json(
        { status: 'error', message: 'Not authenticated' },
        { status: 401 }
      );
    }

    // Get query params
    const searchParams = request.nextUrl.searchParams;
    const per_page = searchParams.get('per_page') || '10';
    const order_by = searchParams.get('order_by') || 'fullname';
    const order_direction = searchParams.get('order_direction') || 'asc';
    const search = searchParams.get('search') || '';
    const page = searchParams.get('page') || '1';

    // Build query string
    const queryParams = new URLSearchParams({
      per_page,
      order_by,
      order_direction,
      page,
      ...(search && { search }),
    });

    const response = await fetch(
      `${API_CONFIG.BASE_URL}/v2/getUsers?${queryParams.toString()}`,
      {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
      }
    );

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(data, { status: response.status });
    }

    return NextResponse.json(data);
  } catch (error: any) {
    console.error('❌ Get users error:', error);
    return NextResponse.json(
      { status: 'error', message: error.message || 'Failed to get users' },
      { status: 500 }
    );
  }
}
