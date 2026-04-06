import { NextRequest, NextResponse } from 'next/server';
import { API_CONFIG } from '@/lib/config';

/**
 * File Proxy API Route
 * Proxies file content from the Laravel backend to avoid cross-origin issues
 * when embedding files (especially PDFs) in iframes.
 */

const MIME_MAP: Record<string, string> = {
    pdf: 'application/pdf',
    jpg: 'image/jpeg',
    jpeg: 'image/jpeg',
    png: 'image/png',
    gif: 'image/gif',
    webp: 'image/webp',
    svg: 'image/svg+xml',
    mp4: 'video/mp4',
    webm: 'video/webm',
    mp3: 'audio/mpeg',
    wav: 'audio/wav',
    ogg: 'audio/ogg',
    doc: 'application/msword',
    docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    xls: 'application/vnd.ms-excel',
    xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    ppt: 'application/vnd.ms-powerpoint',
    pptx: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    txt: 'text/plain',
};

function getBackendBaseUrl(): string {
    // Strip '/api' from the API base URL to get the backend root
    const apiBase = API_CONFIG.BASE_URL;
    return apiBase.replace(/\/api\/?$/, '');
}

function isAllowedUrl(url: string): boolean {
    const backendBase = getBackendBaseUrl();
    // Only allow proxying files from the known backend storage path
    return url.startsWith(backendBase + '/storage/');
}

export async function GET(request: NextRequest) {
    const url = request.nextUrl.searchParams.get('url');

    if (!url) {
        return NextResponse.json({ error: 'Missing url parameter' }, { status: 400 });
    }

    // Build full URL if it's a relative path (e.g., /storage/temp/file.pdf)
    let fileUrl = url;
    if (url.startsWith('/storage/')) {
        fileUrl = getBackendBaseUrl() + url;
    }

    // Validate the URL points to our backend storage
    if (!isAllowedUrl(fileUrl)) {
        return NextResponse.json({ error: 'URL not allowed' }, { status: 403 });
    }

    try {
        const response = await fetch(fileUrl, {
            headers: API_CONFIG.BACKEND_HOST
                ? { Host: API_CONFIG.BACKEND_HOST }
                : {},
        });

        if (!response.ok) {
            return NextResponse.json(
                { error: 'File not found' },
                { status: response.status }
            );
        }

        const contentType = response.headers.get('content-type');
        const buffer = await response.arrayBuffer();

        // Determine content type from extension if server didn't provide a good one
        let finalContentType = contentType || 'application/octet-stream';
        const ext = url.split('.').pop()?.toLowerCase();
        if (ext && MIME_MAP[ext] && (!contentType || contentType.includes('octet-stream') || contentType.includes('text/plain'))) {
            finalContentType = MIME_MAP[ext];
        }

        return new NextResponse(buffer, {
            status: 200,
            headers: {
                'Content-Type': finalContentType,
                'Content-Disposition': 'inline',
                'Cache-Control': 'public, max-age=3600',
            },
        });
    } catch (error) {
        console.error('File proxy error:', error);
        return NextResponse.json(
            { error: 'Failed to fetch file' },
            { status: 500 }
        );
    }
}
