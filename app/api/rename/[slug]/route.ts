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
    const { name } = body;

    if (!name || !name.trim()) {
      return NextResponse.json(
        { message: 'Nama tidak boleh kosong' },
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
    const response = await fetch(`${API_CONFIG.BASE_URL}/rename/${slug}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Authorization': `Bearer ${session.token}`,
      },
      body: JSON.stringify({ name: name.trim() }),
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        { message: data.message || 'Gagal mengubah nama' },
        { status: response.status }
      );
    }

    return NextResponse.json({
      message: 'Berhasil mengubah nama',
      data: data.data,
    });
  } catch (error: any) {
    console.error('Rename error:', error);
    return NextResponse.json(
      { message: 'Terjadi kesalahan server' },
      { status: 500 }
    );
  }
}
