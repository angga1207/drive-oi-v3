'use client';

import { useLanguage } from '@/contexts/LanguageContext';
import Breadcrumb from '@/components/Breadcrumb';
import DragDropZone from '@/components/DragDropZone';
import UploadProgressCard from '@/components/UploadProgressCard';
import { useUpload } from '@/contexts/UploadContext';
import { FaFolderOpen } from 'react-icons/fa';
import Swal from 'sweetalert2';

interface FilesPageWrapperProps {
    pathData: {
        paths: any[];
        current: any;
    };
    currentPath?: string;
    children: React.ReactNode;
}

export default function FilesPageWrapper({ pathData, currentPath, children }: FilesPageWrapperProps) {
    const { t } = useLanguage();
    const { addFilesAndUpload, uploadFiles, removeFile, clearAll } = useUpload();

    const handleFilesDropped = async (files: File[]) => {
        const blockedExtensions = ['.php', '.js', '.exe', '.bat', '.sh', '.cmd', '.com', '.pif', '.scr', '.vbs', '.jar'];
        const invalidFiles = files.filter(file => {
            const fileName = file.name.toLowerCase();
            return blockedExtensions.some(ext => fileName.endsWith(ext));
        });

        if (invalidFiles.length > 0) {
            await Swal.fire({
                title: 'File Tidak Diizinkan!',
                text: `File dengan ekstensi ${invalidFiles.map(f => f.name).join(', ')} tidak diperbolehkan`,
                icon: 'error',
                customClass: { popup: 'rounded-xl' },
            });
            return;
        }

        const slug = currentPath || 0;
        await addFilesAndUpload(files, slug);
    };

    const handleCancelUpload = (fileId: string) => removeFile(fileId);
    const handleCloseUploadCard = () => clearAll();

    return (
        <div className="space-y-6 select-none pb-15">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold text-primary dark:text-accent mb-2 flex items-center gap-2">
                    <FaFolderOpen className="text-primary dark:text-accent" />
                    {t.files.myDrive}
                </h1>
            </div>

            {/* Breadcrumb */}
            <Breadcrumb
                paths={pathData.paths || []}
                current={pathData.current?.name || ''}
            />

            {/* Items area inside DragDropZone */}
            <DragDropZone onFilesDropped={handleFilesDropped}>
                <div className="space-y-6">
                    {children}
                    <UploadProgressCard
                        files={uploadFiles}
                        onClose={handleCloseUploadCard}
                        onCancel={handleCancelUpload}
                    />
                </div>
            </DragDropZone>
        </div>
    );
}
