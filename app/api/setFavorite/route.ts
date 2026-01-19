import { NextRequest, NextResponse } from 'next/server';
import { API_CONFIG } from '@/lib/config';
import { getSession } from '@/lib/session';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { ids } = body;

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json(
        { message: 'IDs tidak boleh kosong' },
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
    const response = await fetch(`${API_CONFIG.BASE_URL}/setFavorite`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Authorization': `Bearer ${session.token}`,
      },
      body: JSON.stringify({ ids }),
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        { message: data.message || 'Gagal mengubah status favorit' },
        { status: response.status }
      );
    }

    return NextResponse.json({
      message: 'Berhasil mengubah status favorit',
      data: data.data,
    });
  } catch (error: any) {
    console.error('Set favorite error:', error);
    return NextResponse.json(
      { message: 'Terjadi kesalahan server' },
      { status: 500 }
    );
  }
}
