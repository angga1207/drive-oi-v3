'use client';

import { useRouter } from 'next/navigation';
import FilesListClient from './FilesListClient';
import DragDropZone from './DragDropZone';
import UploadProgressCard from './UploadProgressCard';
import { useUpload } from '@/contexts/UploadContext';
import { useLanguage } from '@/contexts/LanguageContext';
import Swal from 'sweetalert2';

interface FilesPageClientProps {
  items: any[];
  currentPath?: string;
}

export default function FilesPageClient({ items, currentPath }: FilesPageClientProps) {
  const router = useRouter();
  const { addFilesAndUpload, uploadFiles, removeFile, clearAll } = useUpload();
  const { t } = useLanguage();

  const handleFilesDropped = async (files: File[]) => {
    // Validate file types
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
        customClass: {
          popup: 'rounded-xl',
        },
      });
      return;
    }

    // Upload files
    const slug = currentPath || 0;
    await addFilesAndUpload(files, slug);
  };

  const handleCancelUpload = (fileId: string) => {
    removeFile(fileId);
  };

  const handleCloseUploadCard = () => {
    clearAll();
  };

  return (
    <DragDropZone onFilesDropped={handleFilesDropped}>
      <div className="space-y-6">
        {/* Files List */}
        <FilesListClient items={items} />

        {/* Upload Progress Card */}
        <UploadProgressCard
          files={uploadFiles}
          onClose={handleCloseUploadCard}
          onCancel={handleCancelUpload}
        />
      </div>
    </DragDropZone>
  );
}
