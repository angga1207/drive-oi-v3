'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useState, useEffect, useRef } from 'react';
import { FaFolder, FaFilePdf, FaFileWord, FaFileExcel, FaFilePowerpoint, FaFileImage, FaFileVideo, FaFileAudio, FaFileArchive, FaFileCode, FaFile, FaUser, FaGlobe, FaCalendarAlt, FaTrash, FaCheckSquare, FaDownload, FaSearch, FaTimes } from 'react-icons/fa';
import { HiX, HiFolderOpen, HiOutlineFolder } from 'react-icons/hi';
import FileActionMenu from '@/components/FileActionMenu';
import ShareModal from '@/components/modals/ShareModal';
import RenameModal from '@/components/modals/RenameModal';
import FilePreviewModal from '@/components/modals/FilePreviewModal';
import MoveFolderModal from '@/components/modals/MoveFolderModal';
import Swal from 'sweetalert2';

interface FilesListClientProps {
    items: any[];
}

function getFileIcon(mime: string, extension: string) {
    if (mime === 'folder') return <FaFolder className="text-white" />;

    // Document types
    if (extension === 'pdf') return <FaFilePdf className="text-white" />;
    if (['doc', 'docx'].includes(extension)) return <FaFileWord className="text-white" />;
    if (['xls', 'xlsx'].includes(extension)) return <FaFileExcel className="text-white" />;
    if (['ppt', 'pptx'].includes(extension)) return <FaFilePowerpoint className="text-white" />;

    // Media types
    if (mime.startsWith('image')) return <FaFileImage className="text-white" />;
    if (mime.startsWith('video')) return <FaFileVideo className="text-white" />;
    if (mime.startsWith('audio')) return <FaFileAudio className="text-white" />;

    // Archive types
    if (['zip', 'rar', '7z', 'tar', 'gz'].includes(extension)) return <FaFileArchive className="text-white" />;

    // Code types
    if (['js', 'ts', 'jsx', 'tsx', 'py', 'java', 'cpp', 'c', 'php'].includes(extension)) return <FaFileCode className="text-white" />;

    return <FaFile className="text-white" />;
}

export default function FilesListClient({ items }: FilesListClientProps) {
    const router = useRouter();
    const searchParams = useSearchParams();
    const highlightSlug = searchParams.get('highlight');
    const highlightRef = useRef<HTMLDivElement>(null);

    const [shareModal, setShareModal] = useState<{ isOpen: boolean; item: any }>({ isOpen: false, item: null });
    const [renameModal, setRenameModal] = useState<{ isOpen: boolean; item: any }>({ isOpen: false, item: null });
    const [previewModal, setPreviewModal] = useState<{ isOpen: boolean; item: any }>({ isOpen: false, item: null });
    const [activeMenuId, setActiveMenuId] = useState<number | null>(null);
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
    const [isSelectionMode, setIsSelectionMode] = useState(false);
    const [isMoveModalOpen, setIsMoveModalOpen] = useState(false);
    const [lastSelectedIndex, setLastSelectedIndex] = useState<number | null>(null);
    const [anchorIndex, setAnchorIndex] = useState<number | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState<any[]>([]);
    const [isSearching, setIsSearching] = useState(false);
    const [showSearchResults, setShowSearchResults] = useState(false);
    const [highlightedSlug, setHighlightedSlug] = useState<string | null>(null);

    // Handle highlight from URL parameter
    useEffect(() => {
        if (highlightSlug) {
            setHighlightedSlug(highlightSlug);
            // Scroll to highlighted item after a short delay
            setTimeout(() => {
                if (highlightRef.current) {
                    highlightRef.current.scrollIntoView({
                        behavior: 'smooth',
                        block: 'center'
                    });
                }
            }, 100);

            // Remove highlight after 3 seconds
            const timer = setTimeout(() => {
                setHighlightedSlug(null);
                // Remove highlight param from URL
                const params = new URLSearchParams(searchParams.toString());
                params.delete('highlight');
                const newUrl = params.toString() ? `?${params.toString()}` : '/files';
                router.replace(newUrl);
            }, 3000);

            return () => clearTimeout(timer);
        }
    }, [highlightSlug, searchParams, router]);

    const handleDoubleClick = (item: any) => {
        // Don't open if in selection mode
        if (isSelectionMode) return;

        if (item.type === 'folder') {
            router.push(`/files?_p=${item.slug}`);
        } else {
            // Open file preview
            setPreviewModal({ isOpen: true, item });
        }
    };

    const handleFavorite = async (slug: string) => {
        try {
            const response = await fetch('/api/setFavorite', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify({ ids: [slug] }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Gagal mengubah status favorit');
            }

            await Swal.fire({
                title: 'Berhasil!',
                text: 'Status favorit berhasil diubah',
                icon: 'success',
                timer: 1500,
                showConfirmButton: false,
                customClass: {
                    popup: 'rounded-xl',
                },
            });

            // Refresh page to show updated favorite status
            router.refresh();
        } catch (error: any) {
            await Swal.fire({
                title: 'Gagal!',
                text: error.message || 'Terjadi kesalahan saat mengubah status favorit',
                icon: 'error',
                confirmButtonText: 'OK',
                confirmButtonColor: '#003a69',
                customClass: {
                    popup: 'rounded-xl',
                },
            });
        }
    };

    const handleShare = (item: any) => {
        setShareModal({ isOpen: true, item });
    };

    const handleShareSubmit = async (data: any) => {
        try {
            const response = await fetch(`/api/publicity/${shareModal.item.slug}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify({
                    status: data.status,
                    forever: data.forever,
                    expired_at: data.expired_at,
                    editable: data.editable,
                }),
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.message || 'Gagal membagikan item');
            }

            await Swal.fire({
                title: 'Berhasil!',
                text: `${shareModal.item?.type === 'folder' ? 'Folder' : 'File'} berhasil dibagikan`,
                icon: 'success',
                timer: 1500,
                showConfirmButton: false,
                customClass: {
                    popup: 'rounded-xl',
                },
            });

            // Close modal
            setShareModal({ isOpen: false, item: null });

            // Refresh page to show updated share status
            router.refresh();
        } catch (error: any) {
            await Swal.fire({
                title: 'Gagal!',
                text: error.message || 'Terjadi kesalahan saat membagikan item',
                icon: 'error',
                confirmButtonText: 'OK',
                confirmButtonColor: '#003a69',
                customClass: {
                    popup: 'rounded-xl',
                },
            });
        }
    };

    const handleRename = (item: any) => {
        setRenameModal({ isOpen: true, item });
    };

    const handleRenameSubmit = async (newName: string) => {
        try {
            const response = await fetch(`/api/rename/${renameModal.item.slug}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify({ name: newName }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Gagal mengubah nama');
            }

            await Swal.fire({
                title: 'Berhasil!',
                text: `${renameModal.item?.type === 'folder' ? 'Folder' : 'File'} berhasil diganti nama`,
                icon: 'success',
                timer: 1500,
                showConfirmButton: false,
                customClass: {
                    popup: 'rounded-xl',
                },
            });

            // Close modal
            setRenameModal({ isOpen: false, item: null });

            // Refresh page to show updated name
            router.refresh();
        } catch (error: any) {
            await Swal.fire({
                title: 'Gagal!',
                text: error.message || 'Terjadi kesalahan saat mengubah nama',
                icon: 'error',
                confirmButtonText: 'OK',
                confirmButtonColor: '#003a69',
                customClass: {
                    popup: 'rounded-xl',
                },
            });
            throw error;
        }
    };

    const handleDelete = async (item: any) => {
        try {
            const response = await fetch('/api/delete', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify({ ids: [item.slug] }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Gagal menghapus item');
            }

            await Swal.fire({
                title: 'Berhasil!',
                text: `${item.type === 'folder' ? 'Folder' : 'File'} berhasil dihapus`,
                icon: 'success',
                timer: 1500,
                showConfirmButton: false,
                customClass: {
                    popup: 'rounded-xl',
                },
            });

            // Refresh page to show updated list
            router.refresh();
        } catch (error: any) {
            await Swal.fire({
                title: 'Gagal!',
                text: error.message || 'Terjadi kesalahan saat menghapus item',
                icon: 'error',
                confirmButtonText: 'OK',
                confirmButtonColor: '#003a69',
                customClass: {
                    popup: 'rounded-xl',
                },
            });
        }
    };

    const toggleSelection = (slug: string, index: number, shiftKey: boolean = false) => {
        const newSelected = new Set<string>();

        // Shift+Click: Select range from anchor
        if (shiftKey && anchorIndex !== null) {
            // Always select from anchor to current clicked item
            const start = Math.min(anchorIndex, index);
            const end = Math.max(anchorIndex, index);

            for (let i = start; i <= end; i++) {
                newSelected.add(items[i].slug);
            }
        } else {
            // Normal click: Toggle single item
            // Copy existing selections
            selectedItems.forEach(item => newSelected.add(item));

            if (newSelected.has(slug)) {
                newSelected.delete(slug);
                // If unselecting, reset anchor
                if (newSelected.size === 0) {
                    setAnchorIndex(null);
                }
            } else {
                newSelected.add(slug);
                // Set anchor only on first selection or when not using shift
                if (anchorIndex === null) {
                    setAnchorIndex(index);
                }
            }
        }

        setSelectedItems(newSelected);
        setLastSelectedIndex(index);

        // Exit selection mode if no items selected
        if (newSelected.size === 0) {
            setIsSelectionMode(false);
            setLastSelectedIndex(null);
            setAnchorIndex(null);
        }
    };

    const toggleSelectAll = () => {
        if (selectedItems.size === items.length) {
            setSelectedItems(new Set());
            setIsSelectionMode(false);
            setAnchorIndex(null);
            setLastSelectedIndex(null);
        } else {
            setSelectedItems(new Set(items.map(item => item.slug)));
            setIsSelectionMode(true);
            setAnchorIndex(0); // Set anchor to first item when selecting all
        }
    };

    const handleDeleteSelected = async () => {
        if (selectedItems.size === 0) return;

        const result = await Swal.fire({
            title: 'Hapus Item Terpilih?',
            text: `Apakah Anda yakin ingin menghapus ${selectedItems.size} item? Item akan dipindahkan ke kotak sampah.`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#dc2626',
            cancelButtonColor: '#6b7280',
            confirmButtonText: 'Ya, Hapus!',
            cancelButtonText: 'Batal',
            customClass: {
                popup: 'rounded-xl',
                confirmButton: 'rounded-lg px-6 py-2.5 font-semibold',
                cancelButton: 'rounded-lg px-6 py-2.5 font-semibold',
            },
        });

        if (!result.isConfirmed) return;

        try {
            const response = await fetch('/api/delete', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify({ ids: Array.from(selectedItems) }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Gagal menghapus item');
            }

            await Swal.fire({
                title: 'Berhasil!',
                text: `${selectedItems.size} item berhasil dihapus`,
                icon: 'success',
                timer: 1500,
                showConfirmButton: false,
                customClass: {
                    popup: 'rounded-xl',
                },
            });

            // Clear selection and exit selection mode
            setSelectedItems(new Set());
            setIsSelectionMode(false);

            // Refresh page
            router.refresh();
        } catch (error: any) {
            await Swal.fire({
                title: 'Gagal!',
                text: error.message || 'Terjadi kesalahan saat menghapus item',
                icon: 'error',
                confirmButtonText: 'OK',
                confirmButtonColor: '#003a69',
                customClass: {
                    popup: 'rounded-xl',
                },
            });
        }
    };

    const cancelSelection = () => {
        setSelectedItems(new Set());
        setIsSelectionMode(false);
        setLastSelectedIndex(null);
        setAnchorIndex(null);
    };

    const handleDownloadSelected = async () => {
        if (selectedItems.size === 0) return;

        try {
            const response = await fetch('/api/download', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify({
                    ids: Array.from(selectedItems),
                }),
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
                    // target="_blank"
                    link.setAttribute('rel', 'noopener noreferrer');
                    link.setAttribute('target', '_blank');
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);

                    // Small delay between downloads to prevent browser blocking
                    await new Promise(resolve => setTimeout(resolve, 200));
                }

                await Swal.fire({
                    title: 'Berhasil!',
                    text: `${data.data.length} file berhasil diunduh`,
                    icon: 'success',
                    timer: 1500,
                    showConfirmButton: false,
                    customClass: {
                        popup: 'rounded-xl',
                    },
                });

                // Clear selection
                setSelectedItems(new Set());
                setIsSelectionMode(false);
                setAnchorIndex(null);
                setLastSelectedIndex(null);
            }
        } catch (error: any) {
            await Swal.fire({
                title: 'Gagal!',
                text: error.message || 'Terjadi kesalahan saat mengunduh file',
                icon: 'error',
                confirmButtonText: 'OK',
                confirmButtonColor: '#003a69',
                customClass: {
                    popup: 'rounded-xl',
                },
            });
        }
    };
    const handleSearch = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!searchQuery.trim()) {
            setShowSearchResults(false);
            return;
        }

        setIsSearching(true);
        setShowSearchResults(true);

        try {
            const response = await fetch(`/api/search?search=${encodeURIComponent(searchQuery.trim())}`);
            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Gagal melakukan pencarian');
            }

            setSearchResults(data.data || []);
        } catch (error: any) {
            console.error('Search error:', error);
            setSearchResults([]);
        } finally {
            setIsSearching(false);
        }
    };

    const handleSearchResultClick = (result: any) => {
        if (result.type === 'folder') {
            router.push(`/files?_p=${result.slug}`);
        } else {
            // For files, navigate to parent folder with highlight parameter
            if (result.parent_slug && result.parent_slug !== 0) {
                router.push(`/files?_p=${result.parent_slug}&highlight=${result.slug}`);
            } else {
                router.push(`/files?highlight=${result.slug}`);
            }
        }
        setShowSearchResults(false);
        setSearchQuery('');
    };

    const clearSearch = () => {
        setSearchQuery('');
        setShowSearchResults(false);
        setSearchResults([]);
    };
    const handleMove = async (targetId: string | number) => {
        try {
            const response = await fetch('/api/moveItem', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify({
                    targetId,
                    sourceIds: Array.from(selectedItems),
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Gagal memindahkan item');
            }

            await Swal.fire({
                title: 'Berhasil!',
                text: `${selectedItems.size} item berhasil dipindahkan`,
                icon: 'success',
                timer: 1500,
                showConfirmButton: false,
                customClass: {
                    popup: 'rounded-xl',
                },
            });

            // Clear selection and exit selection mode
            setSelectedItems(new Set());
            setIsSelectionMode(false);
            setIsMoveModalOpen(false);

            // Refresh page
            router.refresh();
        } catch (error: any) {
            await Swal.fire({
                title: 'Gagal!',
                text: error.message || 'Terjadi kesalahan saat memindahkan item',
                icon: 'error',
                confirmButtonText: 'OK',
                confirmButtonColor: '#003a69',
                customClass: {
                    popup: 'rounded-xl',
                },
            });
        }
    };

    const handleDownload = async (item: any) => {
        try {
            const response = await fetch('/api/download', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
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
                    // target="_blank"
                    link.setAttribute('rel', 'noopener noreferrer');
                    link.setAttribute('target', '_blank');
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);

                    // Small delay between downloads to prevent browser blocking
                    await new Promise(resolve => setTimeout(resolve, 100));
                }

                await Swal.fire({
                    title: 'Berhasil!',
                    text: 'File berhasil diunduh',
                    icon: 'success',
                    timer: 1500,
                    showConfirmButton: false,
                    customClass: {
                        popup: 'rounded-xl',
                    },
                });
            }
        } catch (error: any) {
            await Swal.fire({
                title: 'Gagal!',
                text: error.message || 'Terjadi kesalahan saat mengunduh file',
                icon: 'error',
                confirmButtonText: 'OK',
                confirmButtonColor: '#003a69',
                customClass: {
                    popup: 'rounded-xl',
                },
            });
        }
    };

    const handleOpenFile = (item: any) => {
        setPreviewModal({ isOpen: true, item });
    };

    return (
        <>
            {/* Selection Toolbar */}
            {isSelectionMode && (
                <div className="sticky top-0 z-20 mb-4 p-4 bg-gradient-to-r from-[#003a69] to-[#005a9c] text-white rounded-xl shadow-lg border-2 border-[#ebbd18]/20">
                    <div className="flex items-center justify-between flex-wrap gap-y-4">
                        <div className="flex items-center gap-4">
                            <button
                                onClick={cancelSelection}
                                className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                                title="Batalkan"
                            >
                                <HiX className="w-5 h-5" />
                            </button>
                            <div className="flex items-center gap-2">
                                <FaCheckSquare className="w-5 h-5 text-[#ebbd18]" />
                                <span className="font-semibold">
                                    {selectedItems.size} item dipilih
                                </span>
                            </div>
                        </div>
                        <div className="flex items-center gap-2 flex-wrap">
                            <button
                                onClick={toggleSelectAll}
                                className="px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg font-medium transition-colors"
                            >
                                {selectedItems.size === items.length ? 'Batal Pilih Semua' : 'Pilih Semua'}
                            </button>
                            <button
                                onClick={handleDownloadSelected}
                                className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 rounded-lg font-semibold transition-colors shadow-lg"
                            >
                                <FaDownload className="w-4 h-4" />
                                <span>Unduh</span>
                            </button>
                            <button
                                onClick={() => setIsMoveModalOpen(true)}
                                className="flex items-center gap-2 px-4 py-2 bg-[#ebbd18] hover:bg-[#d4a915] rounded-lg font-semibold transition-colors shadow-lg"
                            >
                                <HiFolderOpen className="w-4 h-4" />
                                <span>Pindahkan</span>
                            </button>
                            <button
                                onClick={handleDeleteSelected}
                                className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg font-semibold transition-colors shadow-lg"
                            >
                                <FaTrash className="w-4 h-4" />
                                <span>Hapus Terpilih</span>
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Select All Button (when not in selection mode) - Sticky */}
            {!isSelectionMode && items.length > 0 && (
                <div className="sticky top-0 z-10 mb-4 flex flex-col sm:flex-row gap-3 sm:justify-between backdrop-blur-sm py-2 -mx-2 px-2">
                    {/* Search Input */}
                    <div className="flex-1 max-w-md relative">
                        <form onSubmit={handleSearch}>
                            <div className="relative">
                                <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                <input
                                    type="text"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    placeholder="Cari file atau folder..."
                                    className="w-full pl-10 pr-10 py-2 bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 hover:border-[#003a69]/30 focus:border-[#003a69] dark:focus:border-[#ebbd18] rounded-lg text-gray-900 dark:text-white text-sm outline-none placeholder-gray-400 transition-all"
                                />
                                {searchQuery && (
                                    <button
                                        type="button"
                                        onClick={clearSearch}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                                    >
                                        <FaTimes />
                                    </button>
                                )}
                            </div>
                        </form>

                        {/* Search Results Dropdown */}
                        {showSearchResults && (
                            <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-gray-800 rounded-lg shadow-2xl border-2 border-gray-200 dark:border-gray-700 max-h-[400px] overflow-y-auto z-50">
                                {isSearching ? (
                                    <div className="p-8 text-center">
                                        <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-gray-300 border-t-[#003a69]"></div>
                                        <p className="text-gray-500 mt-2">Mencari...</p>
                                    </div>
                                ) : searchResults.length > 0 ? (
                                    <div className="divide-y divide-gray-200 dark:divide-gray-700">
                                        {searchResults.map((result) => (
                                            <button
                                                key={result.id}
                                                onClick={() => handleSearchResultClick(result)}
                                                className="w-full p-3 flex items-center gap-3 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-all text-left"
                                            >
                                                <div className="w-8 h-8 flex items-center justify-center bg-gray-100 dark:bg-gray-700 rounded-lg shrink-0">
                                                    {result.type === 'folder' ? (
                                                        <FaFolder className="text-[#ebbd18] text-lg" />
                                                    ) : (
                                                        <FaFile className="text-gray-500 text-sm" />
                                                    )}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <h4 className="font-semibold text-gray-900 dark:text-white truncate text-sm">
                                                        {result.name}
                                                    </h4>
                                                    <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                                                        <span className="px-1.5 py-0.5 bg-gray-100 dark:bg-gray-700 rounded text-[10px] font-medium">
                                                            {result.type === 'folder' ? 'Folder' : result.extension.toUpperCase()}
                                                        </span>
                                                        {result.parent_name && result.parent_name !== 'Root' && (
                                                            <>
                                                                <span>•</span>
                                                                <span className="truncate">{result.parent_name}</span>
                                                            </>
                                                        )}
                                                    </div>
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="p-8 text-center">
                                        <FaSearch className="text-gray-300 text-3xl mx-auto mb-2" />
                                        <p className="text-gray-500 text-sm">Tidak ada hasil</p>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Select Button */}
                    <div className="shrink-0">
                        <button
                            onClick={() => setIsSelectionMode(true)}
                            className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-800 border-2 border-[#ebbd18]/30 hover:border-[#ebbd18]/60 rounded-lg font-medium text-gray-700 dark:text-gray-300 hover:bg-[#ebbd18]/5 transition-all shadow-sm"
                        >
                            <FaCheckSquare className="w-4 h-4" />
                            <span>Pilih Item</span>
                        </button>
                    </div>
                </div>
            )}

            {/* Empty State */}
            {items.length === 0 ? (
                <div className="flex items-center justify-center min-h-[400px] bg-white/80 dark:bg-gray-800/80 rounded-xl border-2 border-dashed border-[#ebbd18]/30 dark:border-[#ebbd18]/30 backdrop-blur-sm">
                    <div className="text-center">
                        <HiOutlineFolder className="text-6xl mb-4 text-[#003a69]/30 mx-auto" />
                        <h3 className="text-xl font-semibold text-[#003a69] dark:text-white mb-2">
                            Folder Kosong
                        </h3>
                        <p className="text-gray-600 dark:text-gray-400 mb-4">
                            Belum ada file atau folder di sini
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                            Seret dan lepas file ke sini untuk mengunggah
                        </p>
                    </div>
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-3">
                    {items.map((item: any, index: number) => {
                        const isHighlighted = highlightedSlug === item.slug;
                        return (
                            <div
                                key={item.id}
                                ref={isHighlighted ? highlightRef : null}
                                onDoubleClick={() => handleDoubleClick(item)}
                                onClick={(e) => {
                                    if (isSelectionMode) {
                                        toggleSelection(item.slug, index, e.shiftKey);
                                    }
                                }}
                                className={`group flex items-center gap-4 p-4 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-xl border-2 h-[80px] ${isHighlighted
                                    ? 'border-[#ebbd18] bg-[#ebbd18]/10 dark:bg-[#ebbd18]/20 animate-pulse'
                                    : selectedItems.has(item.slug)
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
                                    className={`w-12 h-12 flex items-center justify-center text-3xl rounded-xl ${item.type === 'folder'
                                        ? 'bg-linear-to-br from-[#003a69] to-[#005a9c]'
                                        : 'bg-linear-to-br from-[#ebbd18] to-[#c79a00]'
                                        } shadow-md group-hover:scale-110 transition-transform`}
                                >
                                    {getFileIcon(item.mime, item.extension)}
                                </div>

                                {/* Info */}
                                <div className="flex-1 min-w-0">
                                    <h3 className="font-semibold text-gray-900 dark:text-white group-hover:text-[#003a69] dark:group-hover:text-[#ebbd18] transition-colors truncate">
                                        {item.name}{item.type === 'folder' ? '' : `.${item.extension}`}
                                    </h3>
                                    <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 mt-1">
                                        {item.type === 'file' && (
                                            <>
                                                <span className='text-xs text-gray-500 dark:text-gray-400'>{item.size}</span>
                                                <span>•</span>
                                            </>
                                        )}
                                        {item.type === 'folder' && item.childs > 0 && (
                                            <>
                                                <span className='text-xs text-gray-500 dark:text-gray-400'>
                                                    {item.childs} item{item.childs > 1 ? 's' : ''}
                                                </span>
                                                <span>•</span>
                                            </>
                                        )}
                                        {item.created_at && (
                                            <>
                                                <span className='flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400'>
                                                    <FaCalendarAlt className="w-2.5 h-2.5" />
                                                    {new Date(item.created_at).toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' })},  {new Date(item.created_at).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })} WIB
                                                </span>
                                            </>
                                        )}
                                        {item.publicity.status === 'public' && (
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
                                        onFavorite={handleFavorite}
                                        onShare={(item) => handleShare(item)}
                                        onRename={handleRename}
                                        onDelete={handleDelete}
                                        onDownload={handleDownload}
                                        onOpen={handleOpenFile}
                                        onMenuToggle={(isOpen) => {
                                            // setActiveMenuId(isOpen ? item.id : null);
                                            if (isOpen && item.id !== activeMenuId) {
                                                setIsMenuOpen(true);
                                                setActiveMenuId(item.id);
                                            } else {
                                                // setIsMenuOpen(false);
                                                // setActiveMenuId(null);
                                            }
                                        }}
                                    />
                                )}
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Modals */}
            <ShareModal
                isOpen={shareModal.isOpen}
                onClose={() => setShareModal({ isOpen: false, item: null })}
                item={shareModal.item}
                onShare={handleShareSubmit}
            />

            <RenameModal
                isOpen={renameModal.isOpen}
                onClose={() => setRenameModal({ isOpen: false, item: null })}
                item={renameModal.item}
                onRename={handleRenameSubmit}
            />

            <FilePreviewModal
                isOpen={previewModal.isOpen}
                onClose={() => setPreviewModal({ isOpen: false, item: null })}
                item={previewModal.item}
                onDownload={() => handleDownload(previewModal.item)}
            />

            <MoveFolderModal
                isOpen={isMoveModalOpen}
                selectedCount={selectedItems.size}
                excludeIds={Array.from(selectedItems)}
                onClose={() => setIsMoveModalOpen(false)}
                onMove={handleMove}
            />
        </>
    );
}
