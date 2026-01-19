'use client';

import { useState, useEffect } from 'react';
import { HiX, HiFolder, HiChevronRight, HiHome } from 'react-icons/hi';
import { FaSpinner } from 'react-icons/fa';
import Swal from 'sweetalert2';

interface Folder {
    slug: string;
    name: string;
    childs?: number;
}

interface MoveFolderModalProps {
    isOpen: boolean;
    selectedCount: number;
    excludeIds: string[];
    onClose: () => void;
    onMove: (targetId: string | number) => void;
}

export default function MoveFolderModal({
    isOpen,
    selectedCount,
    excludeIds,
    onClose,
    onMove,
}: MoveFolderModalProps) {
    const [folders, setFolders] = useState<Folder[]>([]);
    const [currentPath, setCurrentPath] = useState<{ slug: string; name: string }[]>([]);
    const [selectedFolder, setSelectedFolder] = useState<string | number>(0);
    const [isLoading, setIsLoading] = useState(false);
    const [isMoving, setIsMoving] = useState(false);

    useEffect(() => {
        if (isOpen) {
            loadFolders('0');
        }
    }, [isOpen]);

    const loadFolders = async (slug: string) => {
        setIsLoading(true);
        try {
            const params = new URLSearchParams();
            params.set('slug', slug);
            excludeIds.forEach(id => params.append('excludeIds[]', id));

            const response = await fetch(`/api/getFolders?${params.toString()}`, {
                method: 'GET',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            // Check if response is JSON
            const contentType = response.headers.get('content-type');
            if (!contentType || !contentType.includes('application/json')) {
                throw new Error('Server mengembalikan response yang tidak valid');
            }

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Gagal memuat folder');
            }

            setFolders(data.data || []);
        } catch (error: any) {
            console.error('Load folders error:', error);
            await Swal.fire({
                title: 'Gagal!',
                text: error.message || 'Terjadi kesalahan saat memuat folder',
                icon: 'error',
                confirmButtonText: 'OK',
                confirmButtonColor: '#003a69',
                customClass: {
                    popup: 'rounded-xl',
                },
            });
            setFolders([]);
        } finally {
            setIsLoading(false);
        }
    };

    const navigateToFolder = (folder: Folder) => {
        setCurrentPath([...currentPath, { slug: folder.slug, name: folder.name }]);
        setSelectedFolder(folder.slug);
        loadFolders(folder.slug);
    };

    const navigateToPath = (index: number) => {
        if (index === -1) {
            // Navigate to root
            setCurrentPath([]);
            setSelectedFolder(0);
            loadFolders('0');
        } else {
            const newPath = currentPath.slice(0, index + 1);
            const targetFolder = currentPath[index];
            setCurrentPath(newPath);
            setSelectedFolder(targetFolder.slug);
            loadFolders(targetFolder.slug);
        }
    };

    const handleMove = async () => {
        setIsMoving(true);
        try {
            await onMove(selectedFolder);
            onClose();
        } catch (error) {
            // Error handled in parent
        } finally {
            setIsMoving(false);
        }
    };

    const handleClose = () => {
        setCurrentPath([]);
        setSelectedFolder(0);
        setFolders([]);
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div 
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
            onClick={onClose}
        >
            <div 
                className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-2xl border-2 border-[#ebbd18]/20 max-h-[80vh] flex flex-col"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-[#ebbd18]/10 rounded-lg">
                            <HiFolder className="w-5 h-5 text-[#ebbd18]" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-[#003a69] dark:text-white">
                                Pindahkan Item
                            </h2>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                {selectedCount} item akan dipindahkan
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={handleClose}
                        className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                        disabled={isMoving}
                    >
                        <HiX className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                    </button>
                </div>

                {/* Breadcrumb */}
                <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
                    <div className="flex items-center gap-2 text-sm overflow-x-auto">
                        <button
                            onClick={() => navigateToPath(-1)}
                            className={`flex items-center gap-1 px-3 py-1.5 rounded-lg transition-colors ${
                                currentPath.length === 0
                                    ? 'bg-[#003a69] text-white'
                                    : 'hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-400'
                            }`}
                        >
                            <HiHome className="w-4 h-4" />
                            <span className="font-medium">Root</span>
                        </button>
                        {currentPath.map((path, index) => (
                            <div key={path.slug} className="flex items-center gap-2">
                                <HiChevronRight className="w-4 h-4 text-gray-400" />
                                <button
                                    onClick={() => navigateToPath(index)}
                                    className={`px-3 py-1.5 rounded-lg transition-colors ${
                                        index === currentPath.length - 1
                                            ? 'bg-[#003a69] text-white'
                                            : 'hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-400'
                                    }`}
                                >
                                    <span className="font-medium">{path.name}</span>
                                </button>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Folders List */}
                <div className="flex-1 overflow-y-auto p-6">
                    {isLoading ? (
                        <div className="flex items-center justify-center py-12">
                            <FaSpinner className="w-8 h-8 text-[#003a69] animate-spin" />
                        </div>
                    ) : folders.length === 0 ? (
                        <div className="text-center py-12">
                            <HiFolder className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                            <p className="text-gray-500 dark:text-gray-400">
                                Tidak ada folder di sini
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-2">
                            {folders.map((folder) => (
                                <button
                                    key={folder.slug}
                                    onClick={() => navigateToFolder(folder)}
                                    className="w-full flex items-center gap-3 p-3 rounded-lg border-2 border-gray-200 dark:border-gray-700 hover:border-[#ebbd18]/60 hover:bg-[#ebbd18]/5 transition-all group"
                                >
                                    <div className="w-10 h-10 flex items-center justify-center bg-linear-to-br from-[#003a69] to-[#005a9c] rounded-lg shadow-md">
                                        <HiFolder className="w-5 h-5 text-white" />
                                    </div>
                                    <div className="flex-1 text-left">
                                        <p className="font-semibold text-gray-900 dark:text-white group-hover:text-[#003a69] dark:group-hover:text-[#ebbd18] transition-colors">
                                            {folder.name}
                                        </p>
                                        {folder.childs !== undefined && folder.childs > 0 && (
                                            <p className="text-xs text-gray-500 dark:text-gray-400">
                                                {folder.childs} item{folder.childs > 1 ? 's' : ''}
                                            </p>
                                        )}
                                    </div>
                                    <HiChevronRight className="w-5 h-5 text-gray-400 group-hover:text-[#003a69] dark:group-hover:text-[#ebbd18] transition-colors" />
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="flex gap-3 p-6 border-t border-gray-200 dark:border-gray-700">
                    <button
                        type="button"
                        onClick={handleClose}
                        disabled={isMoving}
                        className="flex-1 px-6 py-3 rounded-lg border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 font-semibold hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        Batal
                    </button>
                    <button
                        type="button"
                        onClick={handleMove}
                        disabled={isMoving}
                        className="flex-1 px-6 py-3 rounded-lg bg-gradient-to-r from-[#003a69] to-[#005a9c] text-white font-semibold hover:from-[#002347] hover:to-[#003a69] transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                        {isMoving ? (
                            <>
                                <FaSpinner className="w-5 h-5 animate-spin" />
                                <span>Memindahkan...</span>
                            </>
                        ) : (
                            <span>Pindahkan ke Sini</span>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}
