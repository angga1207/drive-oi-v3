'use client';

import { useLanguage } from '@/contexts/LanguageContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { HiDocumentText, HiFolder, HiLink } from 'react-icons/hi2';
import { BiSolidData } from 'react-icons/bi';
import { BsFileEarmarkImage, BsFileEarmarkPdf, BsFileEarmarkWord, BsFileEarmarkExcel, BsFileEarmarkPpt, BsFileEarmark } from 'react-icons/bs';
import ProgressBar from '@/components/ProgressBar';
import { LatestFile } from '@/lib/types';
import Link from 'next/link';
import { IoDesktopSharp } from 'react-icons/io5';

interface DashboardClientProps {
    user: {
        name: {
            fullname: string;
            firstname: string;
        };
    };
    profileData: any;
    latestFiles: LatestFile[];
}

// Helper function to get file icon based on mime type
function getFileIcon(mime: string, extension: string) {
    if (mime === 'image') {
        return <BsFileEarmarkImage className="w-6 h-6 text-white" />;
    }

    switch (extension.toLowerCase()) {
        case 'pdf':
            return <BsFileEarmarkPdf className="w-6 h-6 text-white" />;
        case 'doc':
        case 'docx':
            return <BsFileEarmarkWord className="w-6 h-6 text-white" />;
        case 'xls':
        case 'xlsx':
            return <BsFileEarmarkExcel className="w-6 h-6 text-white" />;
        case 'ppt':
        case 'pptx':
            return <BsFileEarmarkPpt className="w-6 h-6 text-white" />;
        default:
            return <BsFileEarmark className="w-6 h-6 text-white" />;
    }
}

// Helper function to format date to relative time
function formatRelativeTime(dateString: string, language: 'id' | 'en' | 'plm') {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    const translations = {
        id: {
            justNow: 'baru saja',
            minutesAgo: (n: number) => `${n} menit yang lalu`,
            hoursAgo: (n: number) => `${n} jam yang lalu`,
            daysAgo: (n: number) => `${n} hari yang lalu`,
            monthsAgo: (n: number) => `${n} bulan yang lalu`,
        },
        en: {
            justNow: 'just now',
            minutesAgo: (n: number) => `${n} minute${n > 1 ? 's' : ''} ago`,
            hoursAgo: (n: number) => `${n} hour${n > 1 ? 's' : ''} ago`,
            daysAgo: (n: number) => `${n} day${n > 1 ? 's' : ''} ago`,
            monthsAgo: (n: number) => `${n} month${n > 1 ? 's' : ''} ago`,
        },
        plm: {
            justNow: 'baru bae',
            minutesAgo: (n: number) => `${n} menit yang lewat`,
            hoursAgo: (n: number) => `${n} jam yang lewat`,
            daysAgo: (n: number) => `${n} hari yang lewat`,
            monthsAgo: (n: number) => `${n} bulan yang lewat`,
        },
    };

    const t = translations[language];

    if (diffInSeconds < 60) {
        return t.justNow;
    }

    const diffInMinutes = Math.floor(diffInSeconds / 60);
    if (diffInMinutes < 60) {
        return t.minutesAgo(diffInMinutes);
    }

    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) {
        return t.hoursAgo(diffInHours);
    }

    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 30) {
        return t.daysAgo(diffInDays);
    }

    const diffInMonths = Math.floor(diffInDays / 30);
    return t.monthsAgo(diffInMonths);
}

export default function DashboardClient({ user, profileData, latestFiles }: DashboardClientProps) {
    const { t, language } = useLanguage();

    const storagePercentage = profileData.data
        ? Math.round((profileData.data.storage.percent))
        : 0;

    return (
        <>
            {/* Welcome Section */}
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                    {t.dashboard.welcome}, {user.name.firstname}!
                    <IoDesktopSharp className="inline-block ml-2 w-12 h-12 text-[#003a69] dark:text-[#ebbd18]" />
                </h1>
                <p className="text-gray-600 dark:text-gray-400">
                    {t.dashboard.greeting}
                </p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                {/* Storage Card */}
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">{t.dashboard.totalStorage}</CardTitle>
                        <BiSolidData className="h-8 w-8 text-[#003a69] dark:text-[#ebbd18]" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-[#003a69] dark:text-[#ebbd18]">
                            {profileData.data?.storage.used || '0 B'} / {profileData.data?.storage.total || '0 B'}
                        </div>
                        <div className="mt-2 space-y-1">
                            <ProgressBar
                                percentage={storagePercentage}
                                color="from-[#003a69] to-[#ebbd18]"
                            />
                            <p className="text-xs text-muted-foreground">
                                {storagePercentage}% {t.dashboard.used}
                            </p>
                        </div>
                    </CardContent>
                </Card>

                {/* Files Card */}
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">{t.dashboard.files}</CardTitle>
                        <HiDocumentText className="h-8 w-8 text-[#003a69] dark:text-[#ebbd18]" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-4xl font-bold text-[#003a69] dark:text-[#ebbd18]">
                            {profileData.data?.datas?.files || 0}
                        </div>
                        <p className="text-xs text-muted-foreground">
                            {t.dashboard.totalFiles}
                        </p>
                    </CardContent>
                </Card>

                {/* Folders Card */}
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">{t.dashboard.folders}</CardTitle>
                        <HiFolder className="h-8 w-8 text-[#003a69] dark:text-[#ebbd18]" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-4xl font-bold text-[#003a69] dark:text-[#ebbd18]">
                            {profileData.data?.datas?.folders || 0}
                        </div>
                        <p className="text-xs text-muted-foreground">
                            {t.dashboard.totalFolders}
                        </p>
                    </CardContent>
                </Card>

                {/* Shared Card */}
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">{t.dashboard.shared}</CardTitle>
                        <HiLink className="h-8 w-8 text-[#003a69] dark:text-[#ebbd18]" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-4xl font-bold text-[#003a69] dark:text-[#ebbd18]">
                            {profileData.data?.datas?.shared || 0}
                        </div>
                        <p className="text-xs text-muted-foreground">
                            {t.dashboard.sharedItems}
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Recent Files Section */}
            <Card>
                <CardHeader>
                    <CardTitle>{t.dashboard.recentFiles}</CardTitle>
                    <CardDescription>
                        {t.dashboard.recentFilesDesc}
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {latestFiles.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-12 text-center">
                            <HiDocumentText className="w-16 h-16 text-gray-300 dark:text-gray-600 mb-4" />
                            <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-2">
                                {t.dashboard.noRecentFiles}
                            </h3>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {latestFiles.slice(0, 5).map((file) => (
                                <Link
                                    key={file.id}
                                    href={`/files?_p=${file.parent_slug}`}
                                    className="flex items-center gap-4 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-all duration-200 group"
                                >
                                    {/* File Icon with Gradient Background */}
                                    <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-gradient-to-br from-[#003a69] to-[#005a9c] flex items-center justify-center">
                                        {getFileIcon(file.mime, file.extension)}
                                    </div>

                                    {/* File Info */}
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium text-gray-900 dark:text-white truncate group-hover:text-[#003a69] dark:group-hover:text-[#ebbd18] transition-colors">
                                            {file.name}.{file.extension}
                                        </p>
                                        <p className="text-xs text-gray-500 dark:text-gray-400">
                                            {file.size} • {formatRelativeTime(file.created_at, language)}
                                        </p>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>
        </>
    );
}
