'use client';

import { useRouter } from 'next/navigation';
import { useState, useEffect, useRef } from 'react';
import { FaFolder, FaFilePdf, FaFileWord, FaFileExcel, FaFilePowerpoint, FaFileImage, FaFileVideo, FaFileAudio, FaFileArchive, FaFileCode, FaFile, FaStar, FaSpinner, FaCheckSquare, FaDownload, FaGlobe, FaCalendarAlt, FaTrash } from 'react-icons/fa';
import { HiX } from 'react-icons/hi';
import FileActionMenu from '@/components/FileActionMenu';
import ShareModal from '@/components/modals/ShareModal';
import RenameModal from '@/components/modals/RenameModal';
import FilePreviewModal from '@/components/modals/FilePreviewModal';
import Swal from 'sweetalert2';
import { useLanguage } from '@/contexts/LanguageContext';

function getFileIcon(mime: string, extension: string) {
    if (mime === 'folder') return <FaFolder className="text-white" />;

    // Document types
    if (extension === 'pdf') return <FaFilePdf className="text-white" />;
    if (['doc', 'docx'].includes(extension)) return <FaFileWord className="text-white" />;
    if (['xls', 'xlsx'].includes(extension)) return <FaFileExcel className="text-white" />;
    if (['ppt', 'pptx'].includes(extension)) return <FaFilePowerpoint className="text-white" />;

    // Media types
    if (mime?.startsWith('image')) return <FaFileImage className="text-white" />;
    if (mime?.startsWith('video')) return <FaFileVideo className="text-white" />;
    if (mime?.startsWith('audio')) return <FaFileAudio className="text-white" />;

    // Archive types
    if (['zip', 'rar', '7z', 'tar', 'gz'].includes(extension)) return <FaFileArchive className="text-white" />;

    // Code types
    if (['js', 'ts', 'jsx', 'tsx', 'py', 'java', 'cpp', 'c', 'php'].includes(extension)) return <FaFileCode className="text-white" />;

    return <FaFile className="text-white" />;
}

export default function FavoriteListClient() {
    const router = useRouter();
    const { t } = useLanguage();
    
    const [items, setItems] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [shareModal, setShareModal] = useState<{ isOpen: boolean; item: any }>({ isOpen: false, item: null });
    const [renameModal, setRenameModal] = useState<{ isOpen: boolean; item: any }>({ isOpen: false, item: null });
    const [previewModal, setPreviewModal] = useState<{ isOpen: boolean; item: any }>({ isOpen: false, item: null });
    const [activeMenuId, setActiveMenuId] = useState<number | null>(null);
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
    const [isSelectionMode, setIsSelectionMode] = useState(false);
    const [lastSelectedIndex, setLastSelectedIndex] = useState<number | null>(null);
    const [anchorIndex, setAnchorIndex] = useState<number | null>(null);

    // Fetch favorite items
    useEffect(() => {
        fetchFavoriteItems();
    }, []);

    // Track previous selected items size to detect deselection
    const prevSelectedSizeRef = useRef(0);

    // Auto-exit selection mode when user deselects all items
    useEffect(() => {
        // Only auto-exit if:
        // 1. We're in selection mode
        // 2. Current selection is empty
        // 3. Previous selection was NOT empty (user just deselected the last item)
        if (isSelectionMode && selectedItems.size === 0 && prevSelectedSizeRef.current > 0) {
            setIsSelectionMode(false);
        }
        
        // Update the previous size for next comparison
        prevSelectedSizeRef.current = selectedItems.size;
    }, [isSelectionMode, selectedItems]);

    const fetchFavoriteItems = async () => {
        setIsLoading(true);
        try {
            const response = await fetch('/api/favorite');
            const data = await response.json();
            
            if (data.status === 'success') {
                setItems(data.data || []);
            } else {
                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: data.message || 'Gagal memuat item favorit',
                });
            }
        } catch (error) {
            console.error('Error fetching favorite items:', error);
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'Gagal memuat item favorit',
            });
        } finally {
            setIsLoading(false);
        }
    };

    const handleDoubleClick = (item: any) => {
        if (isSelectionMode) return;

        if (item.type === 'folder') {
            router.push(`/files?_p=${item.slug}`);
        } else {
            setPreviewModal({ isOpen: true, item });
        }
    };

    const toggleSelection = (slug: string, index: number, isShiftKey: boolean) => {
        const newSelected = new Set(selectedItems);

        if (isShiftKey && anchorIndex !== null) {
            const start = Math.min(anchorIndex, index);
            const end = Math.max(anchorIndex, index);
            
            for (let i = start; i <= end; i++) {
                newSelected.add(items[i].slug);
            }
            
            setSelectedItems(newSelected);
            setLastSelectedIndex(index);
        } else {
            if (newSelected.has(slug)) {
                newSelected.delete(slug);
            } else {
                newSelected.add(slug);
            }
            
            setSelectedItems(newSelected);
            setLastSelectedIndex(index);
            setAnchorIndex(index);
        }
    };

    const toggleSelectionMode = () => {
        if (isSelectionMode) {
            setSelectedItems(new Set());
            setLastSelectedIndex(null);
            setAnchorIndex(null);
        }
        setIsSelectionMode(!isSelectionMode);
    };

    const handleBatchDownload = async () => {
        if (selectedItems.size === 0) return;

        try {
            const selectedIds = items
                .filter(item => selectedItems.has(item.slug))
                .map(item => item.slug);

            const response = await fetch('/api/download', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ids: selectedIds }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Gagal mengunduh file');
            }

            // Download each file
            if (data.data && Array.isArray(data.data)) {
                Swal.fire({
                    title: 'Mengunduh...',
                    text: `Mengunduh ${data.data.length} file`,
                    icon: 'info',
                    showConfirmButton: false,
                    allowOutsideClick: false,
                    didOpen: () => {
                        Swal.showLoading();
                    },
                });

                for (const file of data.data) {
                    const link = document.createElement('a');
                    link.href = file.url;
                    link.setAttribute('download', file.name || 'download.zip');
                    link.setAttribute('rel', 'noopener noreferrer');
                    link.setAttribute('target', '_blank');
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);

                    // Small delay between downloads to prevent browser blocking
                    await new Promise(resolve => setTimeout(resolve, 200));
                }

                Swal.fire({
                    icon: 'success',
                    title: 'Berhasil',
                    text: 'File berhasil diunduh',
                    timer: 2000,
                    showConfirmButton: false,
                });
            }

            setIsSelectionMode(false);
            setSelectedItems(new Set());
        } catch (error) {
            console.error('Download error:', error);
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'Gagal mengunduh file',
            });
        }
    };

    const handleBatchDelete = async () => {
        if (selectedItems.size === 0) return;

        const result = await Swal.fire({
            title: 'Hapus Item?',
            text: `Apakah Anda yakin ingin menghapus ${selectedItems.size} item? Tindakan ini tidak dapat dibatalkan.`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'Ya, Hapus',
            cancelButtonText: 'Batal',
        });

        if (!result.isConfirmed) return;

        try {
            const selectedIds = items
                .filter(item => selectedItems.has(item.slug))
                .map(item => item.slug);

            const response = await fetch('/api/delete', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ids: selectedIds }),
            });

            const data = await response.json();

            if (data.status === 'success') {
                Swal.fire({
                    icon: 'success',
                    title: 'Terhapus',
                    text: 'Item berhasil dihapus',
                    timer: 2000,
                    showConfirmButton: false,
                });

                fetchFavoriteItems();
                setIsSelectionMode(false);
                setSelectedItems(new Set());
            } else {
                throw new Error(data.message || 'Delete failed');
            }
        } catch (error: any) {
            console.error('Delete error:', error);
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: error.message || 'Gagal menghapus item',
            });
        }
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="text-center">
                    <FaSpinner className="animate-spin text-4xl text-[#003a69] dark:text-[#ebbd18] mb-4 mx-auto" />
                    <p className="text-gray-600 dark:text-gray-400">{t.common.loading}...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6 select-none">
            {/* Header with title and count */}
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#003a69] to-[#0055a5] dark:from-[#ebbd18] dark:to-[#d4a617] flex items-center justify-center shadow-md">
                        <FaStar className="text-white text-xl" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                            {t.favorite.title}
                        </h1>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                            {items.length} item
                        </p>
                    </div>
                </div>
            </div>

            {/* Batch Action Toolbar */}
            {isSelectionMode && (
                <div className="mb-4 bg-[#003a69] dark:bg-[#ebbd18] text-white dark:text-[#0a1929] rounded-xl p-4 flex items-center justify-between sticky top-4 z-20 shadow-lg border-2 border-[#ebbd18]/20">
                    <div className="flex items-center gap-3">
                        <FaCheckSquare className="text-xl" />
                        <span className="font-semibold">
                            {selectedItems.size > 0 ? `${selectedItems.size} item dipilih` : 'Mode Pemilihan'}
                        </span>
                    </div>
                    <div className="flex items-center gap-2">
                        {selectedItems.size > 0 && (
                            <>
                                <button
                                    onClick={handleBatchDownload}
                                    className="px-4 py-2 bg-white dark:bg-[#0a1929] text-[#003a69] dark:text-[#ebbd18] rounded-lg hover:bg-gray-100 dark:hover:bg-gray-900 transition-all font-medium flex items-center gap-2 shadow-sm"
                                >
                                    <FaDownload className="w-4 h-4" />
                                    <span>Unduh</span>
                                </button>
                                <button
                                    onClick={handleBatchDelete}
                                    className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-all font-medium flex items-center gap-2 shadow-sm"
                                >
                                    <FaTrash className="w-4 h-4" />
                                    <span>Hapus</span>
                                </button>
                            </>
                        )}
                        <button
                            onClick={toggleSelectionMode}
                            className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-all font-medium flex items-center gap-2 shadow-sm"
                        >
                            <span>Batal</span>
                        </button>
                    </div>
                </div>
            )}

            {/* Selection Mode Toggle */}
            {!isSelectionMode && items.length > 0 && (
                <div className="mb-4 flex items-center justify-end">
                    <button
                        onClick={toggleSelectionMode}
                        className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-800 border-2 border-[#ebbd18]/30 hover:border-[#ebbd18]/60 rounded-lg font-medium text-gray-700 dark:text-gray-300 hover:bg-[#ebbd18]/5 transition-all shadow-sm"
                    >
                        <FaCheckSquare className="w-4 h-4" />
                        <span>{t.files.selectAll}</span>
                    </button>
                </div>
            )}

            {/* Empty State atau List */}
            {items.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 px-4">
                    <div className="w-24 h-24 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center mb-6">
                        <FaStar className="text-4xl text-gray-400 dark:text-gray-600" />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                        {t.favorite.noFavorites}
                    </h3>
                    <p className="text-gray-500 dark:text-gray-400 text-center mb-6">
                        {t.favorite.noFavoritesDesc}
                    </p>
                    <button
                        onClick={() => router.push('/files')}
                        className="px-6 py-3 bg-[#003a69] dark:bg-[#ebbd18] text-white dark:text-[#0a1929] rounded-lg hover:bg-[#004d8a] dark:hover:bg-[#d4a617] transition-colors font-medium"
                    >
                        {t.files.myDrive}
                    </button>
                </div>
            ) : (
                /* Files List - Same as Drive Saya */
                <div className="grid grid-cols-1 gap-3">
                    {items.map((item: any, index: number) => (
                        <div
                            key={item.id}
                            onDoubleClick={() => handleDoubleClick(item)}
                            onClick={(e) => {
                                if (isSelectionMode) {
                                    toggleSelection(item.slug, index, e.shiftKey);
                                }
                            }}
                            className={`group flex items-center gap-4 p-4 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-xl border-2 ${
                                selectedItems.has(item.slug)
                                    ? 'border-[#003a69] bg-[#003a69]/5 dark:bg-[#003a69]/10'
                                    : 'border-[#ebbd18]/20 hover:border-[#ebbd18]/60'
                            } hover:shadow-lg hover:shadow-[#003a69]/10 transition-all duration-300 cursor-pointer relative ${isMenuOpen && item.id === activeMenuId ? 'z-10' : ''}`}
                        >
                            {/* Checkbox (in selection mode) */}
                            {isSelectionMode && (
                                <div className="flex items-center">
                                    <input
                                        type="checkbox"
                                        checked={selectedItems.has(item.slug)}
                                        onChange={() => { }}
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            toggleSelection(item.slug, index, e.shiftKey);
                                        }}
                                        className="w-5 h-5 text-[#003a69] border-2 border-gray-300 rounded focus:ring-2 focus:ring-[#ebbd18] cursor-pointer"
                                    />
                                </div>
                            )}

                            {/* Icon */}
                            <div
                                className={`w-12 h-12 flex items-center justify-center text-3xl rounded-xl ${
                                    item.type === 'folder'
                                        ? 'bg-linear-to-br from-[#003a69] to-[#005a9c]'
                                        : 'bg-linear-to-br from-[#ebbd18] to-[#c79a00]'
                                } shadow-md group-hover:scale-110 transition-transform`}
                            >
                                {getFileIcon(item.mime || item.type, item.extension || '')}
                            </div>

                            {/* Info */}
                            <div className="flex-1 min-w-0">
                                <h3 className="font-semibold text-gray-900 dark:text-white group-hover:text-[#003a69] dark:group-hover:text-[#ebbd18] transition-colors truncate">
                                    {item.name}{item.type === 'file' && item.extension ? `.${item.extension}` : ''}
                                </h3>
                                <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 mt-1">
                                    {item.type === 'file' && item.size && (
                                        <>
                                            <span className='text-xs text-gray-500 dark:text-gray-400'>{item.size}</span>
                                            <span>•</span>
                                        </>
                                    )}
                                    {item.type === 'folder' && item.childs > 0 && (
                                        <>
                                            <span className='text-xs text-gray-500 dark:text-gray-400'>
                                                {item.childs} item
                                            </span>
                                            <span>•</span>
                                        </>
                                    )}
                                    {item.created_at && (
                                        <>
                                            <span className='flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400'>
                                                <FaCalendarAlt className="w-2.5 h-2.5" />
                                                {new Date(item.created_at).toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' })}, {new Date(item.created_at).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })} WIB
                                            </span>
                                        </>
                                    )}
                                    {item.publicity?.status === 'public' && (
                                        <>
                                            <span>•</span>
                                            <span className="flex items-center gap-1 text-[#ebbd18] text-xs">
                                                <FaGlobe className="w-2.5 h-2.5" /> Publik
                                            </span>
                                        </>
                                    )}
                                </div>
                            </div>

                            {/* Action Menu - Hide in selection mode */}
                            {!isSelectionMode && (
                                <FileActionMenu
                                    item={item}
                                    onShare={() => setShareModal({ isOpen: true, item })}
                                    onRename={() => setRenameModal({ isOpen: true, item })}
                                    onDelete={async () => {
                                        const result = await Swal.fire({
                                            title: 'Hapus Item?',
                                            text: `Apakah Anda yakin ingin menghapus "${item.name}"?`,
                                            icon: 'warning',
                                            showCancelButton: true,
                                            confirmButtonColor: '#d33',
                                            cancelButtonColor: '#3085d6',
                                            confirmButtonText: 'Ya, Hapus',
                                            cancelButtonText: 'Batal',
                                        });

                                        if (result.isConfirmed) {
                                            try {
                                                const response = await fetch('/api/delete', {
                                                    method: 'POST',
                                                    headers: { 'Content-Type': 'application/json' },
                                                    body: JSON.stringify({ ids: [item.slug] }),
                                                });

                                                const data = await response.json();

                                                if (data.status === 'success') {
                                                    Swal.fire({
                                                        icon: 'success',
                                                        title: 'Terhapus',
                                                        text: 'Item berhasil dihapus',
                                                        timer: 2000,
                                                        showConfirmButton: false,
                                                    });
                                                    fetchFavoriteItems();
                                                }
                                            } catch (error) {
                                                Swal.fire({
                                                    icon: 'error',
                                                    title: 'Error',
                                                    text: 'Gagal menghapus item',
                                                });
                                            }
                                        }
                                    }}
                                    onDownload={async () => {
                                        try {
                                            const response = await fetch('/api/download', {
                                                method: 'POST',
                                                headers: { 'Content-Type': 'application/json' },
                                                body: JSON.stringify({ ids: [item.slug] }),
                                            });

                                            const data = await response.json();

                                            if (!response.ok) {
                                                throw new Error(data.message || 'Gagal mengunduh file');
                                            }

                                            // Download each file
                                            if (data.data && Array.isArray(data.data)) {
                                                for (const file of data.data) {
                                                    const link = document.createElement('a');
                                                    link.href = file.url;
                                                    link.setAttribute('download', file.name || 'download.zip');
                                                    link.setAttribute('rel', 'noopener noreferrer');
                                                    link.setAttribute('target', '_blank');
                                                    document.body.appendChild(link);
                                                    link.click();
                                                    document.body.removeChild(link);

                                                    await new Promise(resolve => setTimeout(resolve, 100));
                                                }

                                                Swal.fire({
                                                    icon: 'success',
                                                    title: 'Berhasil',
                                                    text: 'File berhasil diunduh',
                                                    timer: 2000,
                                                    showConfirmButton: false,
                                                });
                                            }
                                        } catch (error) {
                                            Swal.fire({
                                                icon: 'error',
                                                title: 'Error',
                                                text: 'Gagal mengunduh file',
                                            });
                                        }
                                    }}
                                    onRefresh={fetchFavoriteItems}
                                    isFavorite={true}
                                    onFavorite={async (slug: string) => {
                                        try {
                                            const response = await fetch('/api/setFavorite', {
                                                method: 'POST',
                                                headers: { 'Content-Type': 'application/json' },
                                                body: JSON.stringify({ ids: [item.slug] }),
                                            });

                                            const data = await response.json();

                                            if (response.ok && data.status === 'success') {
                                                Swal.fire({
                                                    icon: 'success',
                                                    title: 'Berhasil',
                                                    text: 'Item berhasil dihapus dari favorit',
                                                    timer: 2000,
                                                    showConfirmButton: false,
                                                });
                                                fetchFavoriteItems();
                                            } else {
                                                Swal.fire({
                                                    icon: 'error',
                                                    title: 'Error',
                                                    text: data.message || 'Gagal menghapus dari favorit',
                                                });
                                            }
                                        } catch (error) {
                                            Swal.fire({
                                                icon: 'error',
                                                title: 'Error',
                                                text: 'Gagal menghapus dari favorit',
                                            });
                                        }
                                    }}
                                    hideMove={true}
                                    onMenuToggle={(isOpen) => {
                                        if (isOpen && item.id !== activeMenuId) {
                                            setIsMenuOpen(true);
                                            setActiveMenuId(item.id);
                                        }
                                    }}
                                />
                            )}
                        </div>
                    ))}
                </div>
            )}

            {/* Modals */}
            {shareModal.isOpen && shareModal.item && (
                <ShareModal
                    isOpen={shareModal.isOpen}
                    onClose={() => {
                        setShareModal({ isOpen: false, item: null });
                    }}
                    item={shareModal.item}
                    onShare={async (data: any) => {
                        try {
                            const response = await fetch(`/api/publicity/${shareModal.item.slug}`, {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify(data),
                            });

                            if (!response.ok) throw new Error('Failed to share');

                            // Close modal first
                            setShareModal({ isOpen: false, item: null });

                            await fetchFavoriteItems();
                        } catch (error) {
                            throw error;
                        }
                    }}
                />
            )}

            {renameModal.isOpen && renameModal.item && (
                <RenameModal
                    isOpen={renameModal.isOpen}
                    onClose={() => {
                        setRenameModal({ isOpen: false, item: null });
                    }}
                    item={renameModal.item}
                    onRename={async (newName: string) => {
                        try {
                            const response = await fetch(`/api/rename/${renameModal.item.slug}`, {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({ name: newName }),
                            });

                            if (!response.ok) throw new Error('Failed to rename');

                            // Close modal first
                            setRenameModal({ isOpen: false, item: null });

                            await fetchFavoriteItems();
                        } catch (error) {
                            throw error;
                        }
                    }}
                />
            )}

            {previewModal.isOpen && previewModal.item && (
                <FilePreviewModal
                    isOpen={previewModal.isOpen}
                    onClose={() => setPreviewModal({ isOpen: false, item: null })}
                    item={previewModal.item}
                    onDownload={async () => {
                        try {
                            const response = await fetch('/api/download', {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({ ids: [previewModal.item.slug] }),
                            });

                            const data = await response.json();

                            if (!response.ok) {
                                throw new Error(data.message || 'Gagal mengunduh file');
                            }

                            // Download each file
                            if (data.data && Array.isArray(data.data)) {
                                for (const file of data.data) {
                                    const link = document.createElement('a');
                                    link.href = file.url;
                                    link.setAttribute('download', file.name || 'download.zip');
                                    link.setAttribute('rel', 'noopener noreferrer');
                                    link.setAttribute('target', '_blank');
                                    document.body.appendChild(link);
                                    link.click();
                                    document.body.removeChild(link);

                                    await new Promise(resolve => setTimeout(resolve, 100));
                                }

                                Swal.fire({
                                    icon: 'success',
                                    title: 'Berhasil',
                                    text: 'File berhasil diunduh',
                                    timer: 2000,
                                    showConfirmButton: false,
                                });
                            }
                        } catch (error) {
                            Swal.fire({
                                icon: 'error',
                                title: 'Error',
                                text: 'Gagal mengunduh file',
                            });
                        }
                    }}
                />
            )}
        </div>
    );
}
