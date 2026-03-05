'use client';

import DragDropZone from './DragDropZone';
import UploadProgressCard from './UploadProgressCard';
import { useUpload } from '@/contexts/UploadContext';
import Swal from 'sweetalert2';

interface SharedPageClientProps {
  currentPath?: string;
  children: React.ReactNode;
}

export default function SharedPageClient({ currentPath, children }: SharedPageClientProps) {
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

  return (
    <>
      <DragDropZone onFilesDropped={handleFilesDropped}>
        {children}
      </DragDropZone>

      {uploadFiles.length > 0 && (
        <div className="fixed bottom-8 right-8 z-50 w-96 max-w-[calc(100vw-4rem)]">
          <UploadProgressCard
            files={uploadFiles}
            onCancel={(fileId) => removeFile(fileId)}
            onClose={() => clearAll()}
          />
        </div>
      )}
    </>
  );
}
