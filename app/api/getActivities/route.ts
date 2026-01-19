import { NextRequest, NextResponse } from 'next/server';
import { getToken } from '@/lib/session';
import { API_CONFIG } from '@/lib/config';

export async function GET(request: NextRequest) {
  try {
    // Get token from session
    const token = await getToken();
    
    if (!token) {
      return NextResponse.json(
        { status: 'error', message: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get page from query params
    const searchParams = request.nextUrl.searchParams;
    const page = searchParams.get('page') || '1';

    // Call Laravel backend API
    const response = await fetch(`${API_CONFIG.BASE_URL}/getActivities?page=${page}`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        { status: 'error', message: data.message || 'Failed to fetch activities' },
        { status: response.status }
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching activities:', error);
    return NextResponse.json(
      { status: 'error', message: 'Internal server error' },
      { status: 500 }
    );
  }
}
