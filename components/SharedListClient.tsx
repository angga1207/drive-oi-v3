'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
    FaFolder,
    FaFilePdf, FaFileWord, FaFileExcel, FaFilePowerpoint,
    FaFileImage, FaFileVideo, FaFileAudio, FaFileArchive,
    FaFileCode, FaFile,
    FaEye, FaEdit, FaDownload, FaSearch, FaTimes, FaTrash,
} from 'react-icons/fa';
import { HiOutlineFolder } from 'react-icons/hi';
import FilePreviewModal from './modals/FilePreviewModal';
import RenameModal from './modals/RenameModal';
import Swal from 'sweetalert2';
import Tippy from '@tippyjs/react';
import { useLanguage } from '@/contexts/LanguageContext';

interface SharedItem {
    id: number;
    name: string;
    type: 'folder' | 'file';
    extension?: string;
    mime?: string;
    size?: string;
    slug: string;
    path: string;
    sv_in: number;
    publicity: {
        status: string;
        editable: boolean;
    };
    author: {
        id: number;
        fullname: string;
        photo: string;
    };
    created_at: string;
    childs?: number;
}

interface PaginationInfo {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
}

interface SharedListClientProps {
    initialItems: SharedItem[];
    slug?: string;
    pagination?: PaginationInfo | null;
    currentUserId?: number;
}

function getFileIcon(mime: string = '', extension: string = '') {
    if (mime === 'folder') return <FaFolder className="text-white" />;
    if (extension === 'pdf') return <FaFilePdf className="text-white" />;
    if (['doc', 'docx'].includes(extension)) return <FaFileWord className="text-white" />;
    if (['xls', 'xlsx'].includes(extension)) return <FaFileExcel className="text-white" />;
    if (['ppt', 'pptx'].includes(extension)) return <FaFilePowerpoint className="text-white" />;
    if (mime.startsWith('image')) return <FaFileImage className="text-white" />;
    if (mime.startsWith('video')) return <FaFileVideo className="text-white" />;
    if (mime.startsWith('audio')) return <FaFileAudio className="text-white" />;
    if (['zip', 'rar', '7z', 'tar', 'gz'].includes(extension)) return <FaFileArchive className="text-white" />;
    if (['js', 'ts', 'jsx', 'tsx', 'py', 'java', 'cpp', 'c', 'php'].includes(extension)) return <FaFileCode className="text-white" />;
    return <FaFile className="text-white" />;
}

export default function SharedListClient({ initialItems, slug, pagination: initialPagination, currentUserId }: SharedListClientProps) {
    const router = useRouter();
    const { t } = useLanguage();
    const [items, setItems] = useState<SharedItem[]>(initialItems);
    const [searchQuery, setSearchQuery] = useState('');
    const [filteredItems, setFilteredItems] = useState<SharedItem[]>(initialItems);
    const [previewItem, setPreviewItem] = useState<SharedItem | null>(null);
    const [isPreviewOpen, setIsPreviewOpen] = useState(false);
    const [renameItem, setRenameItem] = useState<SharedItem | null>(null);
    const [isRenameOpen, setIsRenameOpen] = useState(false);

    // Infinite scroll state
    const [currentPage, setCurrentPage] = useState(initialPagination?.current_page ?? 1);
    const [lastPage, setLastPage] = useState(initialPagination?.last_page ?? 1);
    const [totalItems, setTotalItems] = useState(initialPagination?.total ?? initialItems.length);
    const [isLoadingMore, setIsLoadingMore] = useState(false);
    const sentinelRef = useRef<HTMLDivElement>(null);
    const isLoadingMoreRef = useRef(false);

    // Reset when server data changes
    useEffect(() => {
        setItems(initialItems);
        setFilteredItems(initialItems);
        setSearchQuery('');
        setCurrentPage(initialPagination?.current_page ?? 1);
        setLastPage(initialPagination?.last_page ?? 1);
        setTotalItems(initialPagination?.total ?? initialItems.length);
        setIsLoadingMore(false);
        isLoadingMoreRef.current = false;
    }, [initialItems, initialPagination]);

    useEffect(() => {
        if (searchQuery.trim() === '') {
            setFilteredItems(items);
        } else {
            const q = searchQuery.toLowerCase();
            setFilteredItems(items.filter(item => item.name.toLowerCase().includes(q)));
        }
    }, [searchQuery, items]);

    // Load more function
    const loadMore = useCallback(async () => {
        if (isLoadingMoreRef.current || currentPage >= lastPage) return;
        isLoadingMoreRef.current = true;
        setIsLoadingMore(true);

        await new Promise(resolve => setTimeout(resolve, 1500));

        try {
            const nextPage = currentPage + 1;
            const params = new URLSearchParams({
                page: String(nextPage),
                per_page: String(initialPagination?.per_page ?? 25),
            });

            const endpoint = slug
                ? `/api/v2/sharer/${slug}?${params}`
                : `/api/v2/shared?${params}`;

            const response = await fetch(endpoint);
            const data = await response.json();

            if (data.status === 'success' && data.data?.data) {
                setItems(prev => [...prev, ...data.data.data]);
                setCurrentPage(data.data.current_page);
                setLastPage(data.data.last_page);
                setTotalItems(data.data.total);
            }
        } catch (error) {
            console.error('Error loading more shared items:', error);
        } finally {
            isLoadingMoreRef.current = false;
            setIsLoadingMore(false);
        }
    }, [currentPage, lastPage, slug, initialPagination?.per_page]);

    // Intersection Observer for infinite scroll
    useEffect(() => {
        if (currentPage >= lastPage) return;

        const observer = new IntersectionObserver(
            (entries) => {
                if (entries[0].isIntersecting && !isLoadingMoreRef.current) {
                    loadMore();
                }
            },
            { rootMargin: '200px' }
        );

        const sentinel = sentinelRef.current;
        if (sentinel) observer.observe(sentinel);

        return () => observer.disconnect();
    }, [currentPage, lastPage, loadMore]);

    const handleDoubleClick = (item: SharedItem) => {
        if (item.type === 'folder') {
            router.push(`/shared?_p=${item.slug}`);
        } else {
            setPreviewItem(item);
            setIsPreviewOpen(true);
        }
    };

    const handlePreview = (item: SharedItem) => {
        setPreviewItem(item);
        setIsPreviewOpen(true);
    };

    const handleRenameSuccess = async (newName: string) => {
        if (!renameItem) return;
        try {
            const response = await fetch(`/api/rename/${renameItem.slug}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ slug: renameItem.slug, name: newName }),
            });
            if (!response.ok) throw new Error('Failed to rename');
            setIsRenameOpen(false);
            setRenameItem(null);
            await Swal.fire({
                title: 'Berhasil!',
                text: 'Item berhasil diganti nama',
                icon: 'success',
                timer: 1500,
                showConfirmButton: false,
                customClass: { popup: 'rounded-xl' },
            });
            router.refresh();
        } catch {
            await Swal.fire({
                title: 'Gagal!',
                text: 'Gagal mengganti nama item',
                icon: 'error',
                confirmButtonText: 'OK',
                customClass: { popup: 'rounded-xl' },
            });
        }
    };

    const handleRename = (item: SharedItem) => {
        setRenameItem(item);
        setIsRenameOpen(true);
    };

    const handleDownload = (item: SharedItem) => {
        if (item.sv_in === 1) {
            window.open(`https://drive.google.com/uc?export=download&id=${item.path}`, '_blank');
        } else if (item.sv_in === 2) {
            window.open(item.path, '_blank');
        }
    };

    const handleDelete = async (item: SharedItem) => {
        const result = await Swal.fire({
            title: 'Hapus Item?',
            text: `Apakah Anda yakin ingin menghapus "${item.name}"?`,
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
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ids: [item.slug] }),
            });
            if (!response.ok) throw new Error('Failed to delete');
            await Swal.fire({
                title: 'Berhasil!',
                text: 'Item berhasil dihapus',
                icon: 'success',
                timer: 1500,
                showConfirmButton: false,
                customClass: { popup: 'rounded-xl' },
            });
            router.refresh();
        } catch {
            await Swal.fire({
                title: 'Gagal!',
                text: 'Gagal menghapus item',
                icon: 'error',
                confirmButtonText: 'OK',
                customClass: { popup: 'rounded-xl' },
            });
        }
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('id-ID', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
        });
    };

    return (
        <>
            <div className="space-y-4 relative">
                {/* Search bar */}
                {items.length > 0 && (
                    <div className="relative lg:sticky lg:top-5 lg:z-1 flex items-center gap-3 mb-2">
                        <div className="flex-1 max-w-md relative">
                            <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder={t.files.searchPlaceholder}
                                className="w-full pl-10 pr-10 py-2 bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 hover:border-[#003a69]/30 focus:border-[#003a69] dark:focus:border-[#ebbd18] rounded-lg text-gray-900 dark:text-white text-sm outline-none placeholder-gray-400 transition-all"
                            />
                            {searchQuery && (
                                <button
                                    type="button"
                                    onClick={() => setSearchQuery('')}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                                >
                                    <FaTimes />
                                </button>
                            )}
                        </div>
                    </div>
                )}

                {/* Items list */}
                {filteredItems.length === 0 ? (
                    <div className="flex items-center justify-center min-h-[400px] bg-white/80 dark:bg-gray-800/80 rounded-xl border-2 border-dashed border-[#ebbd18]/30 backdrop-blur-sm">
                        <div className="text-center">
                            <HiOutlineFolder className="text-6xl mb-4 text-[#003a69]/30 mx-auto" />
                            <h3 className="text-xl font-semibold text-[#003a69] dark:text-white mb-2">
                                {searchQuery ? t.files.noSearchResults : t.shared.noShared}
                            </h3>
                            {searchQuery && (
                                <button
                                    onClick={() => setSearchQuery('')}
                                    className="mt-4 px-4 py-2 bg-[#003a69] hover:bg-[#002347] text-white rounded-lg transition-colors text-sm font-medium"
                                >
                                    {t.files.cancel}
                                </button>
                            )}
                        </div>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 gap-3">
                        {filteredItems.map((item) => (
                            <div
                                key={item.id}
                                onDoubleClick={() => handleDoubleClick(item)}
                                className="group flex items-center gap-4 p-4 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-xl border-2 h-20 border-[#ebbd18]/20 hover:border-[#ebbd18]/60 hover:shadow-lg hover:shadow-[#003a69]/10 transition-all duration-300 cursor-pointer relative"
                            >
                                {/* Icon box — matches /files style */}
                                <div
                                    className={`w-12 h-12 flex items-center justify-center text-2xl rounded-xl shrink-0 ${item.type === 'folder'
                                        ? 'bg-linear-to-br from-[#003a69] to-[#005a9c]'
                                        : 'bg-linear-to-br from-[#ebbd18] to-[#c79a00]'
                                        } shadow-md group-hover:scale-110 transition-transform`}
                                >
                                    {getFileIcon(item.mime ?? (item.type === 'folder' ? 'folder' : ''), item.extension ?? '')}
                                </div>

                                {/* Info */}
                                <div className="flex-1 min-w-0">
                                    <h3 className="font-semibold text-gray-900 dark:text-white group-hover:text-[#003a69] dark:group-hover:text-[#ebbd18] transition-colors truncate">
                                        {item.name}{item.type === 'file' && item.extension ? `.${item.extension}` : ''}
                                    </h3>
                                    <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 mt-1 whitespace-nowrap">
                                        <span className="text-xs">{formatDate(item.created_at)}</span>
                                        {item.type === 'folder' && item.childs !== undefined && (
                                            <>
                                                <span>•</span>
                                                <span className="text-xs">{item.childs} item</span>
                                            </>
                                        )}
                                        {item.type === 'file' && item.size && (
                                            <>
                                                <span>•</span>
                                                <span className="text-xs">{item.size}</span>
                                            </>
                                        )}
                                    </div>
                                </div>

                                {/* Actions — always-visible author avatar + hover actions */}
                                <div className="flex items-center gap-1 shrink-0">

                                    {/* Hover-reveal action buttons */}
                                    <div className="flex items-center gap-1 opacity-0s group-hover:opacity-100s transition-opacity">
                                        <Tippy content={item.author.fullname} placement="top" arrow delay={100}>
                                            <button className="p-1.5 rounded-lg hover:bg-[#003a69]/10 transition-colors cursor-pointer">
                                                <img
                                                    src={item.author.photo}
                                                    onError={(e) => { e.currentTarget.src = '/favicon.png'; }}
                                                    alt={item.author.fullname}
                                                    className="w-5 h-5 rounded-full object-cover"
                                                />
                                            </button>
                                        </Tippy>
                                        {item.type === 'file' && (
                                            <Tippy content="Lihat" placement="top" arrow delay={100}>
                                                <button
                                                    onClick={(e) => { e.stopPropagation(); handlePreview(item); }}
                                                    className="p-2 hover:bg-[#003a69]/10 rounded-lg transition-colors cursor-pointer"
                                                >
                                                    <FaEye className="w-4 h-4 text-[#003a69] dark:text-[#ebbd18]" />
                                                </button>
                                            </Tippy>
                                        )}

                                        {item.publicity.editable && (
                                            <Tippy content="Ganti Nama" placement="top" arrow delay={100}>
                                                <button
                                                    onClick={(e) => { e.stopPropagation(); handleRename(item); }}
                                                    className="p-2 hover:bg-[#003a69]/10 rounded-lg transition-colors cursor-pointer"
                                                >
                                                    <FaEdit className="w-4 h-4 text-[#003a69] dark:text-[#ebbd18]" />
                                                </button>
                                            </Tippy>
                                        )}

                                        {item.type === 'file' && (
                                            <Tippy content="Unduh" placement="top" arrow delay={100}>
                                                <button
                                                    onClick={(e) => { e.stopPropagation(); handleDownload(item); }}
                                                    className="p-2 hover:bg-[#003a69]/10 rounded-lg transition-colors cursor-pointer"
                                                >
                                                    <FaDownload className="w-4 h-4 text-[#003a69] dark:text-[#ebbd18]" />
                                                </button>
                                            </Tippy>
                                        )}

                                        {currentUserId && item.author.id === currentUserId && (
                                            <Tippy content="Hapus" placement="top" arrow delay={100}>
                                                <button
                                                    onClick={(e) => { e.stopPropagation(); handleDelete(item); }}
                                                    className="p-2 hover:bg-red-500/10 rounded-lg transition-colors cursor-pointer"
                                                >
                                                    <FaTrash className="w-4 h-4 text-red-500 dark:text-red-400" />
                                                </button>
                                            </Tippy>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Infinite Scroll Sentinel */}
                {items.length > 0 && currentPage < lastPage && (
                    <div ref={sentinelRef} className="flex flex-col items-center py-8">
                        {isLoadingMore && (
                            <div className="flex flex-col items-center gap-3">
                                <div className="flex gap-1.5">
                                    <div className="w-2.5 h-2.5 rounded-full bg-[#003a69] dark:bg-[#ebbd18] animate-bounce [animation-delay:0ms]"></div>
                                    <div className="w-2.5 h-2.5 rounded-full bg-[#003a69] dark:bg-[#ebbd18] animate-bounce [animation-delay:150ms]"></div>
                                    <div className="w-2.5 h-2.5 rounded-full bg-[#003a69] dark:bg-[#ebbd18] animate-bounce [animation-delay:300ms]"></div>
                                </div>
                                <p className="text-sm text-gray-500 dark:text-gray-400">Memuat lebih banyak...</p>
                            </div>
                        )}
                    </div>
                )}

                {/* Items count info */}
                {items.length > 0 && currentPage >= lastPage && totalItems > 0 && (
                    <div className="text-center py-4">
                        <p className="text-xs text-gray-400 dark:text-gray-500">
                            Menampilkan {items.length} dari {totalItems} item
                        </p>
                    </div>
                )}
            </div>

            {/* Modals */}
            {isPreviewOpen && previewItem && (
                <FilePreviewModal
                    isOpen={isPreviewOpen}
                    onClose={() => setIsPreviewOpen(false)}
                    item={previewItem}
                    onDownload={() => handleDownload(previewItem)}
                />
            )}

            {isRenameOpen && renameItem && (
                <RenameModal
                    isOpen={isRenameOpen}
                    onClose={() => { setIsRenameOpen(false); }}
                    item={renameItem}
                    onRename={handleRenameSuccess}
                />
            )}
        </>
    );
}
