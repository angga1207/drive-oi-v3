import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/session';

export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ parentSlug: string }> }
) {
    try {
        const { parentSlug } = await params;
        
        const session = await getSession();
        if (!session || !session.token) {
            return NextResponse.json(
                { message: 'Unauthorized' },
                { status: 401 }
            );
        }

        // Get form data
        const formData = await request.formData();
        const folderName = formData.get('folderName');
        const files = formData.getAll('files[]');

        // Validate folder name
        if (!folderName || typeof folderName !== 'string' || !folderName.trim()) {
            return NextResponse.json(
                { message: 'Folder name is required' },
                { status: 400 }
            );
        }

        // Validate files
        if (!files || files.length === 0) {
            return NextResponse.json(
                { message: 'No files provided in folder' },
                { status: 400 }
            );
        }

        // Validate file types - block dangerous files
        const blockedExtensions = ['.php', '.js', '.exe', '.bat', '.sh', '.cmd', '.com', '.pif', '.scr', '.vbs', '.jar'];
        
        for (const file of files) {
            if (file instanceof File) {
                const fileName = file.name.toLowerCase();
                const hasBlockedExt = blockedExtensions.some(ext => fileName.endsWith(ext));
                
                if (hasBlockedExt) {
                    return NextResponse.json(
                        { message: `File type not allowed: ${file.name}` },
                        { status: 400 }
                    );
                }
            }
        }

        // Prepare form data for backend
        const backendFormData = new FormData();
        
        // Add folder name
        backendFormData.append('folderName', folderName.trim());
        
        // Add all files
        files.forEach((file) => {
            if (file instanceof File) {
                backendFormData.append('files[]', file);
            }
        });

        // Call Laravel backend API
        const backendUrl = `${process.env.API_BASE_URL}/upload-in-folder/${parentSlug}`;
        const response = await fetch(backendUrl, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${session.token}`,
                // Don't set Content-Type, let fetch set it with boundary for multipart/form-data
            },
            body: backendFormData,
        });

        const data = await response.json();

        if (!response.ok) {
            return NextResponse.json(
                { message: data.message || 'Folder upload failed' },
                { status: response.status }
            );
        }

        return NextResponse.json({
            message: 'Folder uploaded successfully',
            data: data.data,
        });
    } catch (error: any) {
        console.error('Folder upload error:', error);
        return NextResponse.json(
            { message: error.message || 'Internal server error' },
            { status: 500 }
        );
    }
}
