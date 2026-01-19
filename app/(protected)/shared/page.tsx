import { FaShareAlt } from 'react-icons/fa';
import SharedPageClient from '@/components/SharedPageClient';
import Breadcrumb from '@/components/Breadcrumb';
import { cookies } from 'next/headers';
import { getCurrentUser } from '@/lib/session';
import { Metadata } from 'next';

interface SharedPageProps {
    searchParams: Promise<{ _p?: string }>;
}

export async function generateMetadata({ searchParams }: SharedPageProps): Promise<Metadata> {
    const params = await searchParams;
    const slug = params._p;

    if (!slug) {
        return {
            title: 'Dibagikan Dengan Saya - Drive Ogan Ilir',
            description: 'Lihat file dan folder yang dibagikan dengan Anda',
        };
    }

    // Fetch path data to get folder name
    const pathData = await getSharedPath(slug);
    const folderName = pathData.current?.name || 'Folder';

    return {
        title: `${folderName} - Dibagikan - Drive Ogan Ilir`,
        description: `File dan folder dibagikan di ${folderName}`,
    };
}

async function getSharedPath(slug?: string) {
    if (!slug) {
        return { paths: [], current: null };
    }

    try {
        const cookieStore = await cookies();
        const sessionCookie = cookieStore.get('drive_session');

        if (!sessionCookie) {
            return { paths: [], current: null };
        }

        const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
        const response = await fetch(`${baseUrl}/api/path?slug=${slug}`, {
            headers: {
                Cookie: `drive_session=${sessionCookie.value}`,
            },
            cache: 'no-store',
        });

        if (!response.ok) {
            console.error('Failed to fetch path:', response.status);
            return { paths: [], current: null };
        }

        const data = await response.json();
        return {
            paths: data.data?.paths || [],
            current: data.data?.current || null,
        };
    } catch (error) {
        console.error('Error fetching path:', error);
        return { paths: [], current: null };
    }
}

async function getSharedFolders(slug?: string) {
    try {
        const cookieStore = await cookies();
        const sessionCookie = cookieStore.get('drive_session');

        if (!sessionCookie) {
            return { items: [] };
        }

        const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

        // If slug provided, get items from that specific shared folder
        // For now, just get root shared folders
        const endpoint = slug
            ? `/api/sharer/${slug}`
            : '/api/shared';

        const response = await fetch(`${baseUrl}${endpoint}`, {
            headers: {
                Cookie: `drive_session=${sessionCookie.value}`,
            },
            cache: 'no-store',
        });

        if (!response.ok) {
            console.error('Failed to fetch shared folders:', response.status);
            return { items: [] };
        }

        const data = await response.json();

        return { items: data.data || [] };
    } catch (error) {
        console.error('Error fetching shared folders:', error);
        return { items: [] };
    }
}

export default async function SharedPage({ searchParams }: SharedPageProps) {
    const params = await searchParams;
    const slug = params._p;

    // Get current user
    const currentUser = await getCurrentUser();

    // Fetch path data for breadcrumb
    const pathData = await getSharedPath(slug);

    // Fetch shared folders
    const { items } = await getSharedFolders(slug);

    return (
        <div className="space-y-6 select-none">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold text-[#003a69] dark:text-[#ebbd18] mb-2 flex items-center gap-2">
                    <FaShareAlt className="text-[#003a69] dark:text-[#ebbd18]" />
                    Dibagikan Kepada Saya
                </h1>
            </div>

            {/* Breadcrumb - only show when inside a folder */}
            {slug && (
                <Breadcrumb
                    paths={pathData.paths || []}
                    current={pathData.current?.name || ''}
                    basePath="/shared"
                    homeLabel="Beranda"
                />
            )}

            {/* Items List with Drag & Drop */}
            <SharedPageClient items={items} currentPath={slug} currentUserId={currentUser?.id} />
        </div>
    );
}
