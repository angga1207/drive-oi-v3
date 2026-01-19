import { NextRequest, NextResponse } from 'next/server';
import { getToken } from '@/lib/session';
import { API_CONFIG } from '@/lib/config';

/**
 * Sync Google Account
 * POST /api/syncGoogle
 * Body: { name, email, image }
 */
export async function POST(request: NextRequest) {
  try {
    console.log('\n🔗 ========== SYNC GOOGLE ACCOUNT START ==========');
    
    const token = await getToken();
    
    if (!token) {
      console.error('❌ No authentication token found');
      return NextResponse.json(
        { status: 'error', message: 'Not authenticated' },
        { status: 401 }
      );
    }

    // Get Google data from request body
    const body = await request.json();
    const { name, email, image } = body;

    console.log('📦 Request data:', { name, email, image: image ? 'Present' : 'Missing' });

    // Validate required fields
    if (!name || !email) {
      console.error('❌ Missing required fields');
      return NextResponse.json(
        { status: 'error', message: 'Name and email are required' },
        { status: 400 }
      );
    }

    // Send to Laravel backend
    console.log('📤 Sending to Laravel backend: /api/sync/google');
    const response = await fetch(`${API_CONFIG.BASE_URL}/sync/google`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json',
      },
      body: JSON.stringify({
        name,
        email,
        image: image || null,
      }),
    });

    const data = await response.json();
    console.log('📥 Backend response:', data);

    if (data.status === 'success') {
      console.log('✅ Google account synced successfully!');
      console.log('🔗 ========== SYNC GOOGLE ACCOUNT END (SUCCESS) ==========\n');
      return NextResponse.json(data);
    }

    console.error('❌ Backend sync failed:', data.message);
    console.log('🔗 ========== SYNC GOOGLE ACCOUNT END (FAILED) ==========\n');
    return NextResponse.json(data, { status: response.status });
  } catch (error: any) {
    console.error('❌ Sync Google error:', error);
    console.log('🔗 ========== SYNC GOOGLE ACCOUNT END (ERROR) ==========\n');
    return NextResponse.json(
      { status: 'error', message: error.message || 'Failed to sync Google account' },
      { status: 500 }
    );
  }
}
