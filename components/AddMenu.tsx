'use client';

import { useState, useRef } from 'react';
import { HiPlus, HiFolder, HiUpload, HiX, HiRefresh } from 'react-icons/hi';
import { FaFolderOpen } from 'react-icons/fa';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import Swal from 'sweetalert2';
import { useUpload } from '@/contexts/UploadContext';
import { useLanguage } from '@/contexts/LanguageContext';

interface AddMenuProps {
    currentPath?: string;
    isMobile?: boolean;
}

export default function AddMenu({ currentPath, isMobile = false }: AddMenuProps) {
    const t = useLanguage().t;
    const router = useRouter();
    const searchParams = useSearchParams();
    const pathname = usePathname();
    const { addFilesAndUpload, addFolderAndUpload } = useUpload();

    // Get current folder slug from URL
    const getCurrentSlug = () => {
        // Only get slug if we're in /files page
        if (pathname.startsWith('/files')) {
            return searchParams.get('_p') || 0;
        }
        // For /shared page, only allow if there's a _p parameter (inside a folder)
        if (pathname.startsWith('/shared')) {
            return searchParams.get('_p') || null;
        }
        // If we have currentPath prop, use it
        return currentPath || 0;
    };

    // Check if add menu should be disabled
    const isAddMenuDisabled = () => {
        // Only enable in /files and /shared paths
        const isFilesPath = pathname.startsWith('/files');
        const isSharedPath = pathname.startsWith('/shared');

        // Disable if not in /files or /shared
        if (!isFilesPath && !isSharedPath) {
            return true;
        }

        // Disable in /shared root (no _p parameter)
        if (isSharedPath && !searchParams.get('_p')) {
            return true;
        }

        return false;
    };

    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isCreateFolderModalOpen, setIsCreateFolderModalOpen] = useState(false);
    const [folderName, setFolderName] = useState('');
    const [isCreating, setIsCreating] = useState(false);
    const [error, setError] = useState('');
    const fileInputRef = useRef<HTMLInputElement>(null);
    const folderInputRef = useRef<HTMLInputElement>(null);

    const handleCreateFolder = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!folderName.trim()) {
            setError('Nama folder tidak boleh kosong');
            return;
        }

        setIsCreating(true);
        setError('');

        try {
            const parentSlug = getCurrentSlug();

            const response = await fetch('/api/folder', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify({
                    name: folderName.trim(),
                    parent_slug: parentSlug,
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Gagal membuat folder');
            }

            await Swal.fire({
                title: 'Berhasil!',
                text: 'Folder berhasil dibuat',
                icon: 'success',
                timer: 1500,
                showConfirmButton: false,
                customClass: {
                    popup: 'rounded-xl',
                },
            });

            setFolderName('');
            setIsCreateFolderModalOpen(false);
            router.refresh();
        } catch (error: any) {
            setError(error.message || 'Terjadi kesalahan saat membuat folder');
        } finally {
            setIsCreating(false);
        }
    };

    const handleUploadFiles = () => {
        fileInputRef.current?.click();
        setIsMenuOpen(false);
    };

    const handleUploadFolder = () => {
        folderInputRef.current?.click();
        setIsMenuOpen(false);
    };

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (files && files.length > 0) {
            const filesArray = Array.from(files);

            // Validate file types
            const blockedExtensions = ['.php', '.js', '.exe', '.bat', '.sh', '.cmd', '.com', '.pif', '.scr', '.vbs', '.jar'];
            const invalidFiles = filesArray.filter(file => {
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
                // Reset input
                e.target.value = '';
                return;
            }

            // Get current slug and upload
            const slug = getCurrentSlug();
            if (slug === null) {
                await Swal.fire({
                    title: 'Tidak Diizinkan!',
                    text: 'Tidak bisa upload di halaman root /shared. Silakan masuk ke folder terlebih dahulu.',
                    icon: 'warning',
                    customClass: {
                        popup: 'rounded-xl',
                    },
                });
                e.target.value = '';
                return;
            }
            await addFilesAndUpload(filesArray, slug);
        }

        // Reset input
        if (e.target) {
            e.target.value = '';
        }
    };

    const handleFolderChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (files && files.length > 0) {
            const filesArray = Array.from(files);

            // Get folder name from first file's path
            // webkitRelativePath format: "folderName/file.txt"
            const firstFile = filesArray[0];
            const folderPath = (firstFile as any).webkitRelativePath || '';
            const folderName = folderPath.split('/')[0] || 'Untitled Folder';

            // Validate file types
            const blockedExtensions = ['.php', '.js', '.exe', '.bat', '.sh', '.cmd', '.com', '.pif', '.scr', '.vbs', '.jar'];
            const invalidFiles = filesArray.filter(file => {
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
                // Reset input
                e.target.value = '';
                return;
            }

            // Get current parent slug and upload folder
            const parentSlug = getCurrentSlug();
            if (parentSlug === null) {
                await Swal.fire({
                    title: 'Tidak Diizinkan!',
                    text: 'Tidak bisa upload folder di halaman root /shared. Silakan masuk ke folder terlebih dahulu.',
                    icon: 'warning',
                    customClass: {
                        popup: 'rounded-xl',
                    },
                });
                e.target.value = '';
                return;
            }
            await addFolderAndUpload(filesArray, folderName, parentSlug);
        }

        // Reset input
        if (e.target) {
            e.target.value = '';
        }
    };

    return (
        <>
            {/* Add Button with Dropdown */}
            <div className="relative">
                <button
                    onClick={() => !isAddMenuDisabled() && setIsMenuOpen(!isMenuOpen)}
                    disabled={isAddMenuDisabled()}
                    className={`flex items-center justify-center gap-2 font-semibold rounded-xl shadow-lg transition-all duration-300 ${isMobile
                        ? 'w-14 h-14 !rounded-full'
                        : 'w-full px-6 py-3'
                        } ${isAddMenuDisabled()
                            ? 'bg-gray-300 dark:bg-gray-600 text-gray-500 dark:text-gray-400 cursor-not-allowed'
                            : 'bg-gradient-to-r from-[#003a69] to-[#005a9c] hover:from-[#002347] hover:to-[#003a69] text-white transform hover:scale-110 active:scale-95'
                        }`}
                    title={isAddMenuDisabled() ? 'Tidak bisa menambah file di halaman root. Silakan masuk ke dalam folder terlebih dahulu.' : 'Tambah file atau folder'}
                >
                    <HiPlus className={`${isMobile ? 'w-6 h-6' : 'w-5 h-5'}`} />
                    {!isMobile && <span>{t.common.add}</span>}
                </button>

                {/* Dropdown Menu */}
                {isMenuOpen && (
                    <>
                        <div
                            className="fixed inset-0 z-40"
                            onClick={() => setIsMenuOpen(false)}
                        />
                        <div className={`absolute ${isMobile ? 'bottom-16 right-0' : 'left-0 mt-2'} ${isMobile ? 'w-64' : 'w-full'} bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 z-50 overflow-hidden`}>
                            <button
                                onClick={() => {
                                    setIsCreateFolderModalOpen(true);
                                    setIsMenuOpen(false);
                                }}
                                className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-left"
                            >
                                <HiFolder className="w-5 h-5 text-[#ebbd18]" />
                                <div>
                                    <p className="font-semibold text-gray-900 dark:text-white">{t.common.newFolder}</p>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">{t.common.newFolderDesc}</p>
                                </div>
                            </button>

                            <div className="border-t border-gray-200 dark:border-gray-700" />

                            <button
                                onClick={handleUploadFiles}
                                className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-left"
                            >
                                <HiUpload className="w-5 h-5 text-[#003a69] dark:text-[#ebbd18]" />
                                <div>
                                    <p className="font-semibold text-gray-900 dark:text-white">{t.common.uploadFile}</p>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">{t.common.uploadFileDesc}</p>
                                </div>
                            </button>

                            <button
                                onClick={handleUploadFolder}
                                className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-left"
                            >
                                <FaFolderOpen className="w-5 h-5 text-[#003a69] dark:text-[#ebbd18]" />
                                <div>
                                    <p className="font-semibold text-gray-900 dark:text-white">{t.common.uploadFolder}</p>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">{t.common.uploadFolderDesc}</p>
                                </div>
                            </button>
                        </div>
                    </>
                )}
            </div>

            {/* Hidden File Inputs */}
            <input
                ref={fileInputRef}
                type="file"
                multiple
                onChange={handleFileChange}
                className="hidden"
            />
            <input
                ref={folderInputRef}
                type="file"
                // @ts-ignore - webkitdirectory is not in types but works
                webkitdirectory="true"
                directory="true"
                onChange={handleFolderChange}
                className="hidden"
            />

            {/* Create Folder Modal */}
            {isCreateFolderModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-md border-2 border-[#ebbd18]/20">
                        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-[#ebbd18]/10 rounded-lg">
                                    <HiFolder className="w-5 h-5 text-[#ebbd18]" />
                                </div>
                                <h2 className="text-xl font-bold text-[#003a69] dark:text-white">
                                    Folder Baru
                                </h2>
                            </div>
                            <button
                                onClick={() => setIsCreateFolderModalOpen(false)}
                                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                            >
                                <HiX className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                            </button>
                        </div>

                        <form onSubmit={handleCreateFolder} className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                                    Nama Folder
                                </label>
                                <input
                                    type="text"
                                    value={folderName}
                                    onChange={(e) => {
                                        setFolderName(e.target.value);
                                        setError('');
                                    }}
                                    placeholder="Masukkan nama folder"
                                    className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-[#ebbd18] focus:border-[#ebbd18] bg-white dark:bg-gray-900 text-gray-900 dark:text-white font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                                    autoFocus
                                    required
                                    disabled={isCreating}
                                />
                                {error && (
                                    <p className="text-xs text-red-600 dark:text-red-400 mt-2 flex items-center gap-1">
                                        <span>⚠️</span>
                                        {error}
                                    </p>
                                )}
                            </div>

                            <div className="flex gap-3 pt-4">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setIsCreateFolderModalOpen(false);
                                        setFolderName('');
                                        setError('');
                                    }}
                                    disabled={isCreating}
                                    className="flex-1 px-6 py-2.5 rounded-lg border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 font-semibold hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    Batal
                                </button>
                                <button
                                    type="submit"
                                    disabled={isCreating}
                                    className="flex-1 px-6 py-2.5 rounded-lg bg-gradient-to-r from-[#003a69] to-[#005a9c] text-white font-semibold hover:from-[#002347] hover:to-[#003a69] transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                >
                                    {isCreating ? (
                                        <>
                                            <HiRefresh className="w-5 h-5 animate-spin" />
                                            <span>Membuat...</span>
                                        </>
                                    ) : (
                                        <span>Buat</span>
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </>
    );
}
