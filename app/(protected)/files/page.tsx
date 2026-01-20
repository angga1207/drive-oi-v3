import { getPathService, getItemsService } from '@/lib/services/auth.service';
import Breadcrumb from '@/components/Breadcrumb';
import { FaFolderOpen } from 'react-icons/fa';
import { HiOutlineFolder } from 'react-icons/hi';
import FilesPageClient from '@/components/FilesPageClient';
import { Metadata } from 'next';
import { redirect } from 'next/navigation';

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

    // Fetch items (files and folders)
    const itemsResponse = await getItemsService(slug);
    
    // Check if token is invalid/expired (Unauthenticated error)
    if ((itemsResponse as any).isUnauthenticated) {
        console.error('🔐 Token invalid/expired - Redirecting to auto-logout');
        redirect('/api/auto-logout?error=session_expired&redirect=/files');
    }
    
    const items = itemsResponse.success ? itemsResponse.data : [];

    return (
        <div className="space-y-6 select-none">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold text-[#003a69] dark:text-[#ebbd18] mb-2 flex items-center gap-2">
                    <FaFolderOpen className="text-[#003a69] dark:text-[#ebbd18]" />
                    Drive Saya
                </h1>
            </div>
            {/* Breadcrumb */}
            <Breadcrumb
                paths={pathData.paths || []}
                current={pathData.current?.name || ''}
            />

            {/* Items Grid - Always render FilesPageClient with DragDropZone */}
            <FilesPageClient items={items} currentPath={slug} />
        </div>
    );
}
