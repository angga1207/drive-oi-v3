'use client';

import { createContext, useContext, useState, ReactNode, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Swal from 'sweetalert2';

interface UploadFile {
  id: string;
  file: File;
  name: string;
  size: number;
  progress: number;
  status: 'pending' | 'uploading' | 'success' | 'error';
  error?: string;
}

interface UploadContextType {
  uploadFiles: UploadFile[];
  addFilesAndUpload: (files: File[], slug: string | number) => Promise<void>;
  addFolderAndUpload: (files: File[], folderName: string, parentSlug: string | number) => Promise<void>;
  removeFile: (id: string) => void;
  clearAll: () => void;
}

const UploadContext = createContext<UploadContextType | undefined>(undefined);

export function UploadProvider({ children }: { children: ReactNode }) {
  const [uploadFiles, setUploadFiles] = useState<UploadFile[]>([]);
  const router = useRouter();
  const uploadQueueRef = useRef<Map<string, XMLHttpRequest>>(new Map());

  const uploadSingleFile = useCallback(
    (uploadFile: UploadFile, slug: string | number): Promise<void> => {
      return new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        uploadQueueRef.current.set(uploadFile.id, xhr);

        // Create FormData
        const formData = new FormData();
        formData.append('files[]', uploadFile.file);

        // Track upload progress
        xhr.upload.addEventListener('progress', (e) => {
          if (e.lengthComputable) {
            const progress = Math.round((e.loaded / e.total) * 100);
            setUploadFiles((prev) =>
              prev.map((f) => (f.id === uploadFile.id ? { ...f, progress } : f))
            );
          }
        });

        // Handle completion
        xhr.addEventListener('load', () => {
          uploadQueueRef.current.delete(uploadFile.id);
          
          if (xhr.status >= 200 && xhr.status < 300) {
            setUploadFiles((prev) =>
              prev.map((f) => (f.id === uploadFile.id ? { ...f, status: 'success', progress: 100 } : f))
            );
            resolve();
          } else {
            try {
              const response = JSON.parse(xhr.responseText);
              setUploadFiles((prev) =>
                prev.map((f) =>
                  f.id === uploadFile.id
                    ? { ...f, status: 'error', error: response.message || 'Upload gagal' }
                    : f
                )
              );
            } catch {
              setUploadFiles((prev) =>
                prev.map((f) =>
                  f.id === uploadFile.id ? { ...f, status: 'error', error: 'Upload gagal' } : f
                )
              );
            }
            reject(new Error('Upload failed'));
          }
        });

        // Handle error
        xhr.addEventListener('error', () => {
          uploadQueueRef.current.delete(uploadFile.id);
          setUploadFiles((prev) =>
            prev.map((f) =>
              f.id === uploadFile.id ? { ...f, status: 'error', error: 'Network error' } : f
            )
          );
          reject(new Error('Network error'));
        });

        // Handle abort
        xhr.addEventListener('abort', () => {
          uploadQueueRef.current.delete(uploadFile.id);
          setUploadFiles((prev) =>
            prev.map((f) =>
              f.id === uploadFile.id ? { ...f, status: 'error', error: 'Upload dibatalkan' } : f
            )
          );
          reject(new Error('Upload cancelled'));
        });

        // Open and send request with credentials
        xhr.open('POST', `/api/upload/${slug}`);
        xhr.withCredentials = true;
        xhr.setRequestHeader('Accept', 'application/json');
        
        // Update status to uploading
        setUploadFiles((prev) =>
          prev.map((f) => (f.id === uploadFile.id ? { ...f, status: 'uploading' } : f))
        );
        
        xhr.send(formData);
      });
    },
    []
  );

  const addFilesAndUpload = useCallback(
    async (files: File[], slug: string | number) => {
      // Create upload file objects
      const newUploadFiles: UploadFile[] = files.map((file) => ({
        id: `${Date.now()}-${Math.random()}`,
        file,
        name: file.name,
        size: file.size,
        progress: 0,
        status: 'pending' as const,
      }));

      // Add to state
      setUploadFiles((prev) => [...prev, ...newUploadFiles]);

      // Start uploading files one by one
      let successCount = 0;
      let failCount = 0;

      for (const uploadFile of newUploadFiles) {
        try {
          await uploadSingleFile(uploadFile, slug);
          successCount++;
        } catch (error) {
          failCount++;
          console.error(`Failed to upload ${uploadFile.name}:`, error);
        }
      }

      // Show result notification
      if (successCount > 0 && failCount === 0) {
        await Swal.fire({
          title: 'Berhasil!',
          text: `${successCount} file berhasil diunggah`,
          icon: 'success',
          timer: 2000,
          showConfirmButton: false,
          customClass: {
            popup: 'rounded-xl',
          },
        });
      } else if (successCount > 0 && failCount > 0) {
        await Swal.fire({
          title: 'Sebagian Berhasil',
          text: `${successCount} berhasil, ${failCount} gagal`,
          icon: 'warning',
          customClass: {
            popup: 'rounded-xl',
          },
        });
      } else if (failCount > 0) {
        await Swal.fire({
          title: 'Upload Gagal',
          text: `${failCount} file gagal diunggah`,
          icon: 'error',
          customClass: {
            popup: 'rounded-xl',
          },
        });
      }

      // Refresh page to show new files
      router.refresh();
    },
    [uploadSingleFile, router]
  );

  const uploadSingleFolder = useCallback(
    (files: UploadFile[], folderName: string, parentSlug: string | number): Promise<void> => {
      return new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        const folderId = `folder-${Date.now()}-${Math.random()}`;
        uploadQueueRef.current.set(folderId, xhr);

        // Create FormData
        const formData = new FormData();
        formData.append('folderName', folderName);
        
        files.forEach((uploadFile) => {
          formData.append('files[]', uploadFile.file);
        });

        // Track upload progress
        xhr.upload.addEventListener('progress', (e) => {
          if (e.lengthComputable) {
            const progress = Math.round((e.loaded / e.total) * 100);
            // Update progress for all files in the folder
            setUploadFiles((prev) =>
              prev.map((f) => {
                const fileInFolder = files.find(ff => ff.id === f.id);
                return fileInFolder ? { ...f, progress } : f;
              })
            );
          }
        });

        // Handle completion
        xhr.addEventListener('load', () => {
          uploadQueueRef.current.delete(folderId);
          
          if (xhr.status >= 200 && xhr.status < 300) {
            // Mark all files as success
            setUploadFiles((prev) =>
              prev.map((f) => {
                const fileInFolder = files.find(ff => ff.id === f.id);
                return fileInFolder ? { ...f, status: 'success', progress: 100 } : f;
              })
            );
            resolve();
          } else {
            try {
              const response = JSON.parse(xhr.responseText);
              // Mark all files as error
              setUploadFiles((prev) =>
                prev.map((f) => {
                  const fileInFolder = files.find(ff => ff.id === f.id);
                  return fileInFolder ? { ...f, status: 'error', error: response.message || 'Upload folder gagal' } : f;
                })
              );
            } catch {
              setUploadFiles((prev) =>
                prev.map((f) => {
                  const fileInFolder = files.find(ff => ff.id === f.id);
                  return fileInFolder ? { ...f, status: 'error', error: 'Upload folder gagal' } : f;
                })
              );
            }
            reject(new Error('Folder upload failed'));
          }
        });

        // Handle error
        xhr.addEventListener('error', () => {
          uploadQueueRef.current.delete(folderId);
          setUploadFiles((prev) =>
            prev.map((f) => {
              const fileInFolder = files.find(ff => ff.id === f.id);
              return fileInFolder ? { ...f, status: 'error', error: 'Network error' } : f;
            })
          );
          reject(new Error('Network error'));
        });

        // Handle abort
        xhr.addEventListener('abort', () => {
          uploadQueueRef.current.delete(folderId);
          setUploadFiles((prev) =>
            prev.map((f) => {
              const fileInFolder = files.find(ff => ff.id === f.id);
              return fileInFolder ? { ...f, status: 'error', error: 'Upload dibatalkan' } : f;
            })
          );
          reject(new Error('Upload cancelled'));
        });

        // Open and send request with credentials
        xhr.open('POST', `/api/upload-in-folder/${parentSlug}`);
        xhr.withCredentials = true;
        xhr.setRequestHeader('Accept', 'application/json');
        
        // Update status to uploading for all files
        setUploadFiles((prev) =>
          prev.map((f) => {
            const fileInFolder = files.find(ff => ff.id === f.id);
            return fileInFolder ? { ...f, status: 'uploading' } : f;
          })
        );
        
        xhr.send(formData);
      });
    },
    []
  );

  const addFolderAndUpload = useCallback(
    async (files: File[], folderName: string, parentSlug: string | number) => {
      // Create upload file objects
      const newUploadFiles: UploadFile[] = files.map((file) => ({
        id: `${Date.now()}-${Math.random()}`,
        file,
        name: `${folderName}/${file.name}`,
        size: file.size,
        progress: 0,
        status: 'pending' as const,
      }));

      // Add to state
      setUploadFiles((prev) => [...prev, ...newUploadFiles]);

      // Upload folder
      try {
        await uploadSingleFolder(newUploadFiles, folderName, parentSlug);
        
        await Swal.fire({
          title: 'Berhasil!',
          text: `Folder "${folderName}" dengan ${files.length} file berhasil diunggah`,
          icon: 'success',
          timer: 2000,
          showConfirmButton: false,
          customClass: {
            popup: 'rounded-xl',
          },
        });
      } catch (error) {
        console.error(`Failed to upload folder ${folderName}:`, error);
        
        await Swal.fire({
          title: 'Upload Gagal',
          text: `Folder "${folderName}" gagal diunggah`,
          icon: 'error',
          customClass: {
            popup: 'rounded-xl',
          },
        });
      }

      // Refresh page to show new folder
      router.refresh();
    },
    [uploadSingleFolder, router]
  );

  const removeFile = useCallback((id: string) => {
    // Cancel upload if in progress
    const xhr = uploadQueueRef.current.get(id);
    if (xhr) {
      xhr.abort();
      uploadQueueRef.current.delete(id);
    }
    
    setUploadFiles((prev) => prev.filter((f) => f.id !== id));
  }, []);

  const clearAll = useCallback(() => {
    // Cancel all uploads
    uploadQueueRef.current.forEach((xhr) => xhr.abort());
    uploadQueueRef.current.clear();
    
    setUploadFiles([]);
  }, []);

  return (
    <UploadContext.Provider
      value={{
        uploadFiles,
        addFilesAndUpload,
        addFolderAndUpload,
        removeFile,
        clearAll,
      }}
    >
      {children}
    </UploadContext.Provider>
  );
}

export function useUpload() {
  const context = useContext(UploadContext);
  if (context === undefined) {
    throw new Error('useUpload must be used within an UploadProvider');
  }
  return context;
}
