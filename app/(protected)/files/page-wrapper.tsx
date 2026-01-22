'use client';

import { useLanguage } from '@/contexts/LanguageContext';
import Breadcrumb from '@/components/Breadcrumb';
import FilesPageClient from '@/components/FilesPageClient';
import { FaFolderOpen } from 'react-icons/fa';

interface FilesPageWrapperProps {
    pathData: {
        paths: any[];
        current: any;
    };
    items: any[];
    currentPath?: string;
}

export default function FilesPageWrapper({ pathData, items, currentPath }: FilesPageWrapperProps) {
    const { t } = useLanguage();

    return (
        <div className="space-y-6 select-none pb-15">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold text-[#003a69] dark:text-[#ebbd18] mb-2 flex items-center gap-2">
                    <FaFolderOpen className="text-[#003a69] dark:text-[#ebbd18]" />
                    {t.files.myDrive}
                </h1>
            </div>
            {/* Breadcrumb */}
            <Breadcrumb
                paths={pathData.paths || []}
                current={pathData.current?.name || ''}
            />

            {/* Items Grid - Always render FilesPageClient with DragDropZone */}
            <FilesPageClient
                items={items}
                currentPath={currentPath} />
        </div>
    );
}
