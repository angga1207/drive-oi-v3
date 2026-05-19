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

const CHUNK_SIZE_BYTES = 50 * 1024 * 1024;

function getExtensionFromName(fileName: string): string | null {
  const idx = fileName.lastIndexOf('.');
  if (idx <= 0 || idx === fileName.length - 1) return null;
  return fileName.slice(idx + 1).toLowerCase();
}

function bytesForMissingChunk(chunkIndex: number, totalChunks: number, fileSize: number, chunkSizeBytes: number): number {
  if (chunkIndex < totalChunks - 1) return chunkSizeBytes;
  return fileSize - chunkSizeBytes * (totalChunks - 1);
}

function uuidFromBytes(bytes: Uint8Array): string {
  // bytes length should be 16
  const hex = Array.from(bytes).map((b) => b.toString(16).padStart(2, '0'));
  return `${hex.slice(0, 4).join('')}-${hex.slice(4, 6).join('')}-${hex.slice(6, 8).join('')}-${hex
    .slice(8, 10)
    .join('')}-${hex.slice(10, 16).join('')}`;
}

async function deterministicChunkId(params: {
  slug: string | number;
  file: File;
  chunkSizeBytes: number;
}): Promise<string> {
  // Deterministic UUIDv5-like using SHA-1 (browser crypto.subtle)
  const { slug, file, chunkSizeBytes } = params;

  // Fallback: random UUID if crypto isn't available
  if (!globalThis.crypto?.subtle) {
    if (globalThis.crypto && 'randomUUID' in globalThis.crypto) {
      return (globalThis.crypto as any).randomUUID();
    }
    return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
  }

  const seed = `${String(slug)}|${file.name}|${file.size}|${file.lastModified}|${chunkSizeBytes}`;
  const encoder = new TextEncoder();
  const data = encoder.encode(seed);

  const hashBuffer = await globalThis.crypto.subtle.digest('SHA-1', data); // 20 bytes
  const hashBytes = new Uint8Array(hashBuffer);

  const bytes = hashBytes.slice(0, 16);

  // Set version to 5 (0101) and variant to RFC4122 (10xx)
  bytes[6] = (bytes[6] & 0x0f) | 0x50;
  bytes[8] = (bytes[8] & 0x3f) | 0x80;

  return uuidFromBytes(bytes);
}

export function UploadProvider({ children }: { children: ReactNode }) {
  const [uploadFiles, setUploadFiles] = useState<UploadFile[]>([]);
  const router = useRouter();

  // store current XHR for cancel
  const uploadQueueRef = useRef<Map<string, XMLHttpRequest>>(new Map());

  const uploadSingleFile = useCallback(
    (uploadFile: UploadFile, slug: string | number): Promise<void> => {
      return new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        uploadQueueRef.current.set(uploadFile.id, xhr);

        const formData = new FormData();
        formData.append('files[]', uploadFile.file);

        xhr.upload.addEventListener('progress', (e) => {
          if (e.lengthComputable) {
            const progress = Math.round((e.loaded / e.total) * 100);
            setUploadFiles((prev) => prev.map((f) => (f.id === uploadFile.id ? { ...f, progress } : f)));
          }
        });

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
                  f.id === uploadFile.id ? { ...f, status: 'error', error: response.message || 'Upload gagal' } : f
                )
              );
            } catch {
              setUploadFiles((prev) => prev.map((f) => (f.id === uploadFile.id ? { ...f, status: 'error', error: 'Upload gagal' } : f)));
            }
            reject(new Error('Upload failed'));
          }
        });

        xhr.addEventListener('error', () => {
          uploadQueueRef.current.delete(uploadFile.id);
          setUploadFiles((prev) => prev.map((f) => (f.id === uploadFile.id ? { ...f, status: 'error', error: 'Network error' } : f)));
          reject(new Error('Network error'));
        });

        xhr.addEventListener('abort', () => {
          uploadQueueRef.current.delete(uploadFile.id);
          setUploadFiles((prev) => prev.map((f) => (f.id === uploadFile.id ? { ...f, status: 'error', error: 'Upload dibatalkan' } : f)));
          reject(new Error('Upload cancelled'));
        });

        xhr.open('POST', `/api/upload/${slug}`);
        xhr.withCredentials = true;
        xhr.setRequestHeader('Accept', 'application/json');

        setUploadFiles((prev) => prev.map((f) => (f.id === uploadFile.id ? { ...f, status: 'uploading' } : f)));

        xhr.send(formData);
      });
    },
    []
  );

  const uploadSingleFileChunked = useCallback(
    async (uploadFile: UploadFile, slug: string | number): Promise<void> => {
      const file = uploadFile.file;

      const extension = getExtensionFromName(file.name);
      if (!extension) {
        setUploadFiles((prev) => prev.map((f) => (f.id === uploadFile.id ? { ...f, status: 'error', error: 'File extension tidak valid' } : f)));
        throw new Error('Missing file extension');
      }

      const totalChunks = Math.ceil(file.size / CHUNK_SIZE_BYTES);

      const chunkId = await deterministicChunkId({ slug, file, chunkSizeBytes: CHUNK_SIZE_BYTES });

      // init
      setUploadFiles((prev) => prev.map((f) => (f.id === uploadFile.id ? { ...f, status: 'uploading', progress: 0 } : f)));

      const initRes = await fetch(`/api/upload-chunk/init/${slug}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          chunk_id: chunkId,
          file_name: file.name,
          file_size: file.size,
          chunk_size: CHUNK_SIZE_BYTES,
          extension,
          mimes: file.type || 'application/octet-stream',
          total_chunks: totalChunks,
        }),
      });

      const initJson = await initRes.json().catch(() => ({}));

      if (!initRes.ok) {
        const message =
          initJson?.message || initJson?.data?.message || initJson?.data?.data?.message || 'Chunk init gagal';
        setUploadFiles((prev) => prev.map((f) => (f.id === uploadFile.id ? { ...f, status: 'error', error: message } : f)));
        throw new Error(message);
      }

      const initData = initJson?.data?.data ?? initJson?.data ?? initJson;
      const dataId: number | undefined = initData?.data_id;

      if (!dataId) {
        const message = initJson?.message || 'Chunk init: data_id tidak ditemukan';
        setUploadFiles((prev) => prev.map((f) => (f.id === uploadFile.id ? { ...f, status: 'error', error: message } : f)));
        throw new Error(message);
      }

      // preflight (complete) -> get missing_chunks & delete invalid partial on backend
      const preflightRes = await fetch(`/api/upload-chunk/complete`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          chunk_id: chunkId,
          data_id: dataId,
        }),
      });

      const preflightJson = await preflightRes.json().catch(() => ({}));
      const preflightPayload = preflightJson?.data?.data ?? preflightJson?.data ?? preflightJson;

      if (preflightPayload?.status === 'error') {
        const message = preflightPayload?.message || 'Chunk preflight failed';
        setUploadFiles((prev) =>
          prev.map((f) => (f.id === uploadFile.id ? { ...f, status: 'error', error: message } : f))
        );
        throw new Error(message);
      }

      const missingChunks: number[] = Array.isArray(preflightPayload?.missing_chunks)
        ? preflightPayload.missing_chunks
        : [];

      if (missingChunks.length === 0) {
        setUploadFiles((prev) =>
          prev.map((f) => (f.id === uploadFile.id ? { ...f, status: 'success', progress: 100 } : f))
        );
        return;
      }

      // Set initial progress based on already-valid bytes (missing-only will upload rest)
      const missingBytes = missingChunks.reduce((acc, idx) => acc + bytesForMissingChunk(idx, totalChunks, file.size, CHUNK_SIZE_BYTES), 0);
      const validBytes = Math.max(0, file.size - missingBytes);
      const initialProgress = Math.round((validBytes / file.size) * 100);

      setUploadFiles((prev) =>
        prev.map((f) => (f.id === uploadFile.id ? { ...f, progress: initialProgress } : f))
      );

      // upload only missing chunks (sorted to keep progress monotonic)
      const sortedMissing = [...missingChunks].sort((a, b) => a - b);

      for (const chunkIndex of sortedMissing) {
        const start = chunkIndex * CHUNK_SIZE_BYTES;
        const end = Math.min(file.size, start + CHUNK_SIZE_BYTES);
        const chunkBlob = file.slice(start, end);

        await new Promise<void>((resolve, reject) => {
          const xhr = new XMLHttpRequest();
          uploadQueueRef.current.set(uploadFile.id, xhr);

          const formData = new FormData();
          formData.append('chunk_id', chunkId);
          formData.append('data_id', String(dataId));
          formData.append('chunk_index', String(chunkIndex));
          formData.append('chunk', chunkBlob, `${file.name}.part${chunkIndex}`);

          xhr.upload.addEventListener('progress', (e) => {
            if (e.lengthComputable) {
              const uploadedBytes = start + e.loaded;
              const progress = Math.min(100, Math.max(0, Math.round((uploadedBytes / file.size) * 100)));
              setUploadFiles((prev) => prev.map((f) => (f.id === uploadFile.id ? { ...f, progress } : f)));
            }
          });

          xhr.addEventListener('load', () => {
            uploadQueueRef.current.delete(uploadFile.id);

            if (xhr.status >= 200 && xhr.status < 300) {
              resolve();
            } else {
              try {
                const response = JSON.parse(xhr.responseText);
                const message = response.message || 'Upload chunk failed';
                setUploadFiles((prev) => prev.map((f) => (f.id === uploadFile.id ? { ...f, status: 'error', error: message } : f)));
                reject(new Error(message));
              } catch {
                const message = 'Upload chunk failed';
                setUploadFiles((prev) => prev.map((f) => (f.id === uploadFile.id ? { ...f, status: 'error', error: message } : f)));
                reject(new Error(message));
              }
            }
          });

          xhr.addEventListener('error', () => {
            uploadQueueRef.current.delete(uploadFile.id);
            const message = 'Network error';
            setUploadFiles((prev) => prev.map((f) => (f.id === uploadFile.id ? { ...f, status: 'error', error: message } : f)));
            reject(new Error(message));
          });

          xhr.addEventListener('abort', () => {
            uploadQueueRef.current.delete(uploadFile.id);
            const message = 'Upload dibatalkan';
            setUploadFiles((prev) => prev.map((f) => (f.id === uploadFile.id ? { ...f, status: 'error', error: message } : f)));
            reject(new Error('Upload cancelled'));
          });

          xhr.open('POST', `/api/upload-chunk/part`);
          xhr.withCredentials = true;
          xhr.setRequestHeader('Accept', 'application/json');
          xhr.send(formData);
        });
      }

      // final assemble
      const finalRes = await fetch(`/api/upload-chunk/complete`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          chunk_id: chunkId,
          data_id: dataId,
        }),
      });

      const finalJson = await finalRes.json().catch(() => ({}));
      const finalPayload = finalJson?.data?.data ?? finalJson?.data ?? finalJson;

      const finalMissing: number[] = Array.isArray(finalPayload?.missing_chunks) ? finalPayload.missing_chunks : [];

      if (finalPayload?.status === 'error') {
        const message = finalPayload?.message || 'Chunk complete failed';
        setUploadFiles((prev) =>
          prev.map((f) => (f.id === uploadFile.id ? { ...f, status: 'error', error: message } : f))
        );
        throw new Error(message);
      }

      if (!finalRes.ok || finalMissing.length > 0) {
        const message =
          finalJson?.message ||
          finalPayload?.message ||
          (finalMissing.length > 0 ? 'Chunk masih missing, silahkan upload ulang yang missing' : 'Chunk complete gagal');
        setUploadFiles((prev) =>
          prev.map((f) => (f.id === uploadFile.id ? { ...f, status: 'error', error: message } : f))
        );
        throw new Error(message);
      }

      setUploadFiles((prev) =>
        prev.map((f) => (f.id === uploadFile.id ? { ...f, status: 'success', progress: 100 } : f))
      );
    },
    []
  );

  const addFilesAndUpload = useCallback(
    async (files: File[], slug: string | number) => {
      const newUploadFiles: UploadFile[] = files.map((file) => ({
        id: `${Date.now()}-${Math.random()}`,
        file,
        name: file.name,
        size: file.size,
        progress: 0,
        status: 'pending' as const,
      }));

      setUploadFiles((prev) => [...prev, ...newUploadFiles]);

      let successCount = 0;
      let failCount = 0;

      for (const uploadFile of newUploadFiles) {
        try {
          if (uploadFile.size > CHUNK_SIZE_BYTES) {
            await uploadSingleFileChunked(uploadFile, slug);
          } else {
            await uploadSingleFile(uploadFile, slug);
          }
          successCount++;
        } catch (error) {
          failCount++;
          console.error(`Failed to upload ${uploadFile.name}:`, error);
        }
      }

      if (successCount > 0 && failCount === 0) {
        await Swal.fire({
          title: 'Berhasil!',
          text: `${successCount} file berhasil diunggah`,
          icon: 'success',
          timer: 2000,
          showConfirmButton: false,
          customClass: { popup: 'rounded-xl' },
        });
      } else if (successCount > 0 && failCount > 0) {
        await Swal.fire({
          title: 'Sebagian Berhasil',
          text: `${successCount} berhasil, ${failCount} gagal`,
          icon: 'warning',
          customClass: { popup: 'rounded-xl' },
        });
      } else if (failCount > 0) {
        await Swal.fire({
          title: 'Upload Gagal',
          text: `${failCount} file gagal diunggah`,
          icon: 'error',
          customClass: { popup: 'rounded-xl' },
        });
      }

      router.refresh();
    },
    [uploadSingleFile, uploadSingleFileChunked, router]
  );

  const uploadSingleFolder = useCallback(
    (files: UploadFile[], folderName: string, parentSlug: string | number): Promise<void> => {
      return new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        const folderId = `folder-${Date.now()}-${Math.random()}`;
        uploadQueueRef.current.set(folderId, xhr);

        const formData = new FormData();
        formData.append('folderName', folderName);

        files.forEach((uploadFile) => {
          formData.append('files[]', uploadFile.file);
        });

        xhr.upload.addEventListener('progress', (e) => {
          if (e.lengthComputable) {
            const progress = Math.round((e.loaded / e.total) * 100);
            setUploadFiles((prev) =>
              prev.map((f) => {
                const fileInFolder = files.find((ff) => ff.id === f.id);
                return fileInFolder ? { ...f, progress } : f;
              })
            );
          }
        });

        xhr.addEventListener('load', () => {
          uploadQueueRef.current.delete(folderId);

          if (xhr.status >= 200 && xhr.status < 300) {
            setUploadFiles((prev) =>
              prev.map((f) => {
                const fileInFolder = files.find((ff) => ff.id === f.id);
                return fileInFolder ? { ...f, status: 'success', progress: 100 } : f;
              })
            );
            resolve();
          } else {
            try {
              const response = JSON.parse(xhr.responseText);
              setUploadFiles((prev) =>
                prev.map((f) => {
                  const fileInFolder = files.find((ff) => ff.id === f.id);
                  return fileInFolder ? { ...f, status: 'error', error: response.message || 'Upload folder gagal' } : f;
                })
              );
            } catch {
              setUploadFiles((prev) =>
                prev.map((f) => {
                  const fileInFolder = files.find((ff) => ff.id === f.id);
                  return fileInFolder ? { ...f, status: 'error', error: 'Upload folder gagal' } : f;
                })
              );
            }
            reject(new Error('Folder upload failed'));
          }
        });

        xhr.addEventListener('error', () => {
          uploadQueueRef.current.delete(folderId);
          setUploadFiles((prev) =>
            prev.map((f) => {
              const fileInFolder = files.find((ff) => ff.id === f.id);
              return fileInFolder ? { ...f, status: 'error', error: 'Network error' } : f;
            })
          );
          reject(new Error('Network error'));
        });

        xhr.addEventListener('abort', () => {
          uploadQueueRef.current.delete(folderId);
          setUploadFiles((prev) =>
            prev.map((f) => {
              const fileInFolder = files.find((ff) => ff.id === f.id);
              return fileInFolder ? { ...f, status: 'error', error: 'Upload dibatalkan' } : f;
            })
          );
          reject(new Error('Upload cancelled'));
        });

        xhr.open('POST', `/api/upload-in-folder/${parentSlug}`);
        xhr.withCredentials = true;
        xhr.setRequestHeader('Accept', 'application/json');

        setUploadFiles((prev) =>
          prev.map((f) => {
            const fileInFolder = files.find((ff) => ff.id === f.id);
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
      const hasLargeFiles = files.some((f) => f.size > CHUNK_SIZE_BYTES);

      const newUploadFiles: UploadFile[] = files.map((file) => ({
        id: `${Date.now()}-${Math.random()}`,
        file,
        name: `${folderName}/${file.name}`,
        size: file.size,
        progress: 0,
        status: 'pending' as const,
      }));

      setUploadFiles((prev) => [...prev, ...newUploadFiles]);

      if (!hasLargeFiles) {
        try {
          await uploadSingleFolder(newUploadFiles, folderName, parentSlug);

          await Swal.fire({
            title: 'Berhasil!',
            text: `Folder "${folderName}" dengan ${files.length} file berhasil diunggah`,
            icon: 'success',
            timer: 2000,
            showConfirmButton: false,
            customClass: { popup: 'rounded-xl' },
          });
        } catch (error) {
          console.error(`Failed to upload folder ${folderName}:`, error);

          await Swal.fire({
            title: 'Upload Gagal',
            text: `Folder "${folderName}" gagal diunggah`,
            icon: 'error',
            customClass: { popup: 'rounded-xl' },
          });
        } finally {
          router.refresh();
        }
        return;
      }

      // create folder first
      let createdFolderSlug: string | number | null = null;
      try {
        const folderRes = await fetch('/api/folder', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
          body: JSON.stringify({ name: folderName, parent_slug: parentSlug }),
        });

        const folderJson = await folderRes.json().catch(() => ({}));
        if (!folderRes.ok) throw new Error(folderJson?.message || 'Gagal membuat folder');

        const created = folderJson?.data;
        createdFolderSlug = created?.slug ?? created?.data?.slug ?? created?.data?.data?.slug ?? null;
        if (!createdFolderSlug) throw new Error('Folder slug tidak ditemukan dari response');
      } catch (error) {
        console.error(`Failed to create folder "${folderName}":`, error);

        await Swal.fire({
          title: 'Upload Gagal',
          text: `Folder "${folderName}" gagal dibuat`,
          icon: 'error',
          customClass: { popup: 'rounded-xl' },
        });

        router.refresh();
        return;
      }

      // upload each file sequentially (chunk-aware per file)
      let successCount = 0;
      let failCount = 0;

      for (const uploadFile of newUploadFiles) {
        try {
          if (uploadFile.size > CHUNK_SIZE_BYTES) {
            await uploadSingleFileChunked(uploadFile, createdFolderSlug);
          } else {
            await uploadSingleFile(uploadFile, createdFolderSlug);
          }
          successCount++;
        } catch (error) {
          failCount++;
          console.error(`Failed to upload ${uploadFile.name}:`, error);
        }
      }

      if (successCount > 0 && failCount === 0) {
        await Swal.fire({
          title: 'Berhasil!',
          text: `${successCount} file berhasil diunggah ke "${folderName}"`,
          icon: 'success',
          timer: 2000,
          showConfirmButton: false,
          customClass: { popup: 'rounded-xl' },
        });
      } else if (successCount > 0 && failCount > 0) {
        await Swal.fire({
          title: 'Sebagian Berhasil',
          text: `${successCount} berhasil, ${failCount} gagal`,
          icon: 'warning',
          customClass: { popup: 'rounded-xl' },
        });
      } else if (failCount > 0) {
        await Swal.fire({
          title: 'Upload Gagal',
          text: `${failCount} file gagal diunggah`,
          icon: 'error',
          customClass: { popup: 'rounded-xl' },
        });
      }

      router.refresh();
    },
    [uploadSingleFolder, uploadSingleFile, uploadSingleFileChunked, router]
  );

  const removeFile = useCallback((id: string) => {
    const xhr = uploadQueueRef.current.get(id);
    if (xhr) {
      xhr.abort();
      uploadQueueRef.current.delete(id);
    }
    setUploadFiles((prev) => prev.filter((f) => f.id !== id));
  }, []);

  const clearAll = useCallback(() => {
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
  if (context === undefined) throw new Error('useUpload must be used within an UploadProvider');
  return context;
}
