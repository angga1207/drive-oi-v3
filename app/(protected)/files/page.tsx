import { Suspense } from 'react';
import { getPathService, getItemsServiceV2 } from '@/lib/services/auth.service';
import { Metadata } from 'next';
import { redirect } from 'next/navigation';
import FilesPageWrapper from './page-wrapper';
import FilesListClient from '@/components/FilesListClient';
import FilesItemsSkeleton from '@/components/FilesItemsSkeleton';

interface FilesPageProps {
    searchParams: Promise<{ _p?: string }>;
}

export async function generateMetadata({ searchParams }: FilesPageProps): Promise<Metadata> {
    const params = await searchParams;
    const slug = params._p;

    if (!slug) {
        return {
            title: 'Drive Saya - Drive Ogan Ilir',
            description: 'Kelola file dan folder Anda di Drive Ogan Ilir',
        };
    }

    // Fetch path data to get folder name
    const pathResponse = await getPathService(slug);
    const folderName = pathResponse.success && pathResponse.data?.current?.name
        ? pathResponse.data.current.name
        : 'Folder';

    return {
        title: `${folderName} - Drive Saya - Drive Ogan Ilir`,
        description: `Kelola file dan folder di ${folderName}`,
    };
}

async function ItemsFetcher({ slug }: { slug?: string }) {
    const itemsResponse = await getItemsServiceV2(slug);

    if ((itemsResponse as any).isUnauthenticated) {
        console.error('🔐 Token invalid/expired - Redirecting to auto-logout');
        redirect('/api/auto-logout?error=session_expired&redirect=/files');
    }

    const data = itemsResponse.success
        ? itemsResponse.data
        : { items: [], pagination: null };

    return (
        <FilesListClient
            initialItems={data.items}
            slug={slug}
            pagination={data.pagination}
        />
    );
}

export default async function FilesPage({ searchParams }: FilesPageProps) {
    const params = await searchParams;
    const slug = params._p;

    // Fetch path data for breadcrumb
    const pathResponse = await getPathService(slug);

    // Check if token is invalid/expired (Unauthenticated error)
    if ((pathResponse as any).isUnauthenticated) {
        console.error('🔐 Token invalid/expired - Redirecting to auto-logout');
        redirect('/api/auto-logout?error=session_expired&redirect=/files');
    }

    const pathData = pathResponse.success ? pathResponse.data : { paths: [], current: '' };

    return (
        <FilesPageWrapper
            pathData={pathData}
            currentPath={slug}
        >
            <Suspense key={slug ?? 'root'} fallback={<FilesItemsSkeleton />}>
                <ItemsFetcher slug={slug} />
            </Suspense>
        </FilesPageWrapper>
    );
}
