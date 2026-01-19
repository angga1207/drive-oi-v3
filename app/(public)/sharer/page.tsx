import SharerListClient from '@/components/SharerListClient';
import ParentChecker from '@/components/ParentChecker';
import Breadcrumb from '@/components/Breadcrumb';
import { FaShareAlt, FaLock, FaGlobe } from 'react-icons/fa';
import { Metadata } from 'next';

interface SharerPageProps {
    searchParams: Promise<{ _id?: string }>;
}

export async function generateMetadata({ searchParams }: SharerPageProps): Promise<Metadata> {
    const params = await searchParams;
    const slug = params._id;

    if (!slug) {
        return {
            title: 'File Dibagikan - Drive Ogan Ilir',
            description: 'Akses file dan folder yang dibagikan melalui Drive Ogan Ilir',
        };
    }

    // Fetch shared items to get folder info
    const { items, parentInfo } = await getSharedItems(slug);
    const folderName = parentInfo?.name || 'File Dibagikan';
    const isPublic = parentInfo?.publicity?.status === 'public';
    const itemCount = items.length;

    const description = isPublic
        ? `${folderName} - Akses publik dengan ${itemCount} item`
        : `${folderName} - File dan folder yang dibagikan dengan Anda melalui Drive Ogan Ilir`;

    return {
        title: `${folderName} - Drive Ogan Ilir`,
        description: description,
        openGraph: {
            title: `${folderName} - Drive Ogan Ilir`,
            description: description,
            siteName: 'Drive Ogan Ilir',
            type: 'website',
            locale: 'id_ID',
        },
        twitter: {
            card: 'summary_large_image',
            title: `${folderName} - Drive Ogan Ilir`,
            description: description,
        },
        icons: {
            icon: '/favicon.png',
        },
    };
}

async function getSharedPath(slug?: string) {
    if (!slug) {
        return { paths: [], current: null };
    }

    try {
        const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
        const response = await fetch(`${baseUrl}/api/path?slug=${slug}`, {
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

async function getSharedItems(slug?: string) {
    if (!slug) return { items: [], parentInfo: null };

    try {
        const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
        const response = await fetch(`${baseUrl}/api/sharer/${slug}`, {
            cache: 'no-store',
        });

        if (!response.ok) {
            console.error('Failed to fetch shared items:', response.status);
            return { items: [], parentInfo: null };
        }

        const data = await response.json();

        // Get parent info from first item if available
        const parentInfo = data.data && data.data.length > 0 ? {
            name: data.data[0].parent_name || 'Shared Folder',
            publicity: data.data[0].publicity,
        } : null;

        return { items: data.data || [], parentInfo };
    } catch (error) {
        console.error('Error fetching shared items:', error);
        return { items: [], parentInfo: null };
    }
}

export default async function SharerPage({ searchParams }: SharerPageProps) {
    const params = await searchParams;
    const slug = params._id;

    // Fetch shared items
    const { items, parentInfo } = await getSharedItems(slug);

    // Fetch path data for breadcrumb
    const pathData = await getSharedPath(slug);

    // If no slug provided, show empty state
    if (!slug) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 py-8 px-4">
                <div className="max-w-6xl mx-auto">
                    <div className="flex items-center justify-center min-h-[500px] bg-white/80 dark:bg-gray-800/80 rounded-xl border-2 border-dashed border-gray-300 dark:border-gray-700 backdrop-blur-sm">
                        <div className="text-center">
                            <FaLock className="text-6xl mb-4 text-gray-400 mx-auto" />
                            <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-2">
                                Link Tidak Valid
                            </h3>
                            <p className="text-gray-500 dark:text-gray-400">
                                Silakan gunakan link yang valid untuk mengakses file atau folder yang dibagikan
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 py-8 px-4">
            {/* Parent Checker Component - handles access logic */}
            <ParentChecker slug={slug} />

            <div className="max-w-6xl mx-auto space-y-6">

                {/* Header */}
                <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="w-12 h-12 bg-gradient-to-br from-[#003a69] to-[#005a9c] rounded-xl flex items-center justify-center">
                            <FaShareAlt className="text-2xl text-white" />
                        </div>
                        <div className="flex-1">
                            <h1 className="text-3xl font-bold text-[#003a69] dark:text-[#ebbd18]">
                                {parentInfo?.name || 'File Dibagikan'}
                            </h1>
                            {parentInfo?.publicity && (
                                <div className="flex items-center gap-2 mt-1">
                                    {parentInfo.publicity.status === 'public' ? (
                                        <>
                                            <FaGlobe className="text-green-600 w-4 h-4" />
                                            <span className="text-sm text-green-600 font-medium">
                                                Publik • Siapa saja dapat melihat
                                            </span>
                                        </>
                                    ) : (
                                        <>
                                            <FaLock className="text-orange-600 w-4 h-4" />
                                            <span className="text-sm text-orange-600 font-medium">
                                                Terbatas • Hanya yang memiliki link
                                            </span>
                                        </>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                    <p className="text-gray-600 dark:text-gray-400">
                        {items.length > 0
                            ? `${items.length} item tersedia untuk dilihat dan diunduh`
                            : 'Tidak ada item yang tersedia'
                        }
                    </p>
                </div>

                {/* Items List */}
                <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">

                    {/* Breadcrumb */}
                    {slug && (
                        <Breadcrumb
                            paths={pathData.paths || []}
                            current={pathData.current?.name || parentInfo?.name || ''}
                            basePath="/sharer"
                            homeLabel="Beranda"
                            paramLabel='id'
                        />
                    )}
                    <SharerListClient items={items} parentInfo={parentInfo} />
                </div>

                {/* Footer Info */}
                <div className="text-center text-sm text-gray-500 dark:text-gray-400">
                    <p>Dibagikan melalui Drive Ogan Ilir • Pemerintah Kabupaten Ogan Ilir</p>
                </div>
            </div>
        </div>
    );
}
