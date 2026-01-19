import { NextResponse } from 'next/server';
import { getToken } from '@/lib/session';
import { API_CONFIG } from '@/lib/config';

export async function GET() {
  try {
    // Get token from session
    const token = await getToken();
    
    if (!token) {
      return NextResponse.json(
        { status: 'error', message: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Call Laravel backend API
    const response = await fetch(`${API_CONFIG.BASE_URL}/getProfile`, {
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
        { status: 'error', message: data.message || 'Failed to fetch profile' },
        { status: response.status }
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching profile:', error);
    return NextResponse.json(
      { status: 'error', message: 'Internal server error' },
      { status: 500 }
    );
  }
}
