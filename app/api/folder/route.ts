import { NextRequest, NextResponse } from 'next/server';
import { API_CONFIG } from '@/lib/config';
import { getSession } from '@/lib/session';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, parent_slug } = body;

    if (!name || !name.trim()) {
      return NextResponse.json(
        { message: 'Nama folder tidak boleh kosong' },
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

    // Call Laravel API
    const response = await fetch(`${API_CONFIG.BASE_URL}/folder`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Authorization': `Bearer ${session.token}`,
      },
      body: JSON.stringify({
        name: name.trim(),
        parent_slug: parent_slug || 0,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        { message: data.message || 'Gagal membuat folder' },
        { status: response.status }
      );
    }

    return NextResponse.json({
      message: 'Berhasil membuat folder',
      data: data.data,
    });
  } catch (error: any) {
    console.error('Create folder error:', error);
    return NextResponse.json(
      { message: 'Terjadi kesalahan server' },
      { status: 500 }
    );
  }
}
