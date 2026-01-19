'use client';

import { useRouter } from 'next/navigation';
import SharedListClient from './SharedListClient';
import DragDropZone from './DragDropZone';
import UploadProgressCard from './UploadProgressCard';
import { useUpload } from '@/contexts/UploadContext';
import Swal from 'sweetalert2';

interface SharedPageClientProps {
  items: any[];
  currentPath?: string;
  currentUserId?: number;
}

export default function SharedPageClient({ items, currentPath, currentUserId }: SharedPageClientProps) {
  const router = useRouter();
  const { addFilesAndUpload, uploadFiles, removeFile, clearAll } = useUpload();

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

    // Upload files to shared folder
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
    <>
      <DragDropZone onFilesDropped={handleFilesDropped}>
        <SharedListClient items={items} currentUserId={currentUserId} />
      </DragDropZone>

      {/* Upload Progress Card - Fixed position */}
      {uploadFiles.length > 0 && (
        <div className="fixed bottom-8 right-8 z-50 w-96 max-w-[calc(100vw-4rem)]">
          <UploadProgressCard
            files={uploadFiles}
            onCancel={handleCancelUpload}
            onClose={handleCloseUploadCard}
          />
        </div>
      )}
    </>
  );
}
