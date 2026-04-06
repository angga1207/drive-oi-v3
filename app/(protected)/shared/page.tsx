import { Suspense } from 'react';
import { FaShareAlt } from 'react-icons/fa';
import SharedPageClient from '@/components/SharedPageClient';
import SharedListClient from '@/components/SharedListClient';
import SharedItemsSkeleton from '@/components/SharedItemsSkeleton';
import Breadcrumb from '@/components/Breadcrumb';
import { getCurrentUser } from '@/lib/session';
import { getSharedFoldersServiceV2, getPublicPathService } from '@/lib/services/auth.service';
import { Metadata } from 'next';
import { redirect } from 'next/navigation';

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
        const pathResponse = await getPublicPathService(slug);

        if ((pathResponse as any).isUnauthenticated) {
            return { paths: [], current: null, isUnauthenticated: true };
        }

        if (pathResponse.success && pathResponse.data) {
            return {
                paths: pathResponse.data.paths || [],
                current: pathResponse.data.current || null,
            };
        }

        return { paths: [], current: null };
    } catch (error) {
        console.error('Error fetching path:', error);
        return { paths: [], current: null };
    }
}

async function SharedItemsFetcher({ slug }: { slug?: string }) {
    const [foldersData, currentUser] = await Promise.all([
        getSharedFoldersServiceV2(slug),
        getCurrentUser(),
    ]);

    if ((foldersData as any).isUnauthenticated) {
        console.error('🔐 Token invalid/expired - Redirecting to auto-logout');
        redirect('/api/auto-logout?error=session_expired&redirect=/shared');
    }

    const data = foldersData.success
        ? foldersData.data
        : { items: [], pagination: null };

    return (
        <SharedListClient
            initialItems={data.items}
            slug={slug}
            pagination={data.pagination}
            currentUserId={currentUser?.id}
        />
    );
}

export default async function SharedPage({ searchParams }: SharedPageProps) {
    const params = await searchParams;
    const slug = params._p;

    // Get path data for breadcrumb (blocking — needed before render)
    const pathData = await getSharedPath(slug);

    if ((pathData as any).isUnauthenticated) {
        console.error('🔐 Token invalid/expired - Redirecting to auto-logout');
        redirect('/api/auto-logout?error=session_expired&redirect=/shared');
    }

    return (
        <div className="space-y-6 select-none">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold text-[#003a69] dark:text-[#ebbd18] mb-2 flex items-center gap-2">
                    <FaShareAlt className="text-[#003a69] dark:text-[#ebbd18]" />
                    Dibagikan Kepada Saya
                </h1>
            </div>

            {/* Breadcrumb — only inside a folder */}
            {slug && (
                <Breadcrumb
                    paths={pathData.paths || []}
                    current={pathData.current?.name || ''}
                    basePath="/shared"
                    homeLabel="Beranda"
                />
            )}

            {/* Items with DragDrop + skeleton */}
            <SharedPageClient currentPath={slug}>
                <Suspense key={slug ?? 'root'} fallback={<SharedItemsSkeleton />}>
                    <SharedItemsFetcher slug={slug} />
                </Suspense>
            </SharedPageClient>
        </div>
    );
}
