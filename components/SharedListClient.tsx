'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { FaFolder, FaFileAlt, FaEye, FaEdit, FaDownload, FaSearch, FaTimes, FaTrash } from 'react-icons/fa';
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

interface SharedListClientProps {
    items: SharedItem[];
    currentUserId?: number;
}

export default function SharedListClient({ items: initialItems, currentUserId }: SharedListClientProps) {
    const router = useRouter();
    const { t } = useLanguage();
    const [items, setItems] = useState<SharedItem[]>(initialItems);
    const [searchQuery, setSearchQuery] = useState('');
    const [filteredItems, setFilteredItems] = useState<SharedItem[]>(initialItems);
    const [previewItem, setPreviewItem] = useState<SharedItem | null>(null);
    const [isPreviewOpen, setIsPreviewOpen] = useState(false);
    const [renameItem, setRenameItem] = useState<SharedItem | null>(null);
    const [isRenameOpen, setIsRenameOpen] = useState(false);

    useEffect(() => {
        setItems(initialItems);
        setFilteredItems(initialItems);
    }, [initialItems]);

    useEffect(() => {
        if (searchQuery.trim() === '') {
            setFilteredItems(items);
        } else {
            const filtered = items.filter(item =>
                item.name.toLowerCase().includes(searchQuery.toLowerCase())
            );
            setFilteredItems(filtered);
        }
    }, [searchQuery, items]);

    const handleDoubleClick = (item: SharedItem) => {
        if (item.type === 'folder') {
            // Navigate to folder (akan dibuat nanti untuk nested shared folders)
            router.push(`/shared?_p=${item.slug}`);
        } else {
            // Open preview for files
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
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    slug: renameItem.slug,
                    name: newName,
                }),
            });

            if (!response.ok) {
                throw new Error('Failed to rename');
            }

            // Close modal first
            setIsRenameOpen(false);
            setRenameItem(null);

            await Swal.fire({
                title: 'Berhasil!',
                text: 'Item berhasil diganti nama',
                icon: 'success',
                timer: 1500,
                showConfirmButton: false,
            });

            // Refresh data
            router.refresh();
        } catch (error) {
            await Swal.fire({
                title: 'Gagal!',
                text: 'Gagal mengganti nama item',
                icon: 'error',
                confirmButtonText: 'OK',
            });
        }
    };

    const handleRename = (item: SharedItem) => {
        setRenameItem(item);
        setIsRenameOpen(true);
    };

    const handleDownload = (item: SharedItem) => {
        if (item.sv_in === 1) {
            // Google Drive download
            const downloadUrl = `https://drive.google.com/uc?export=download&id=${item.path}`;
            window.open(downloadUrl, '_blank');
        } else if (item.sv_in === 2) {
            // Direct download from server
            window.open(item.path, '_blank');
        }
    };

    const handleDelete = async (item: SharedItem) => {
        // Confirm delete
        const result = await Swal.fire({
            title: 'Hapus Item?',
            text: `Apakah Anda yakin ingin menghapus "${item.name}"?`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'Ya, Hapus!',
            cancelButtonText: 'Batal',
        });

        if (!result.isConfirmed) return;

        try {
            const response = await fetch('/api/delete', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    ids: [item.slug],
                }),
            });

            if (!response.ok) {
                throw new Error('Failed to delete');
            }

            await Swal.fire({
                title: 'Berhasil!',
                text: 'Item berhasil dihapus',
                icon: 'success',
                timer: 1500,
                showConfirmButton: false,
            });

            // Refresh data
            router.refresh();
        } catch (error) {
            await Swal.fire({
                title: 'Gagal!',
                text: 'Gagal menghapus item',
                icon: 'error',
                confirmButtonText: 'OK',
            });
        }
    };

    const getFileIcon = (item: SharedItem) => {
        if (item.type === 'folder') {
            return <FaFolder className="w-8 h-8 text-[#ebbd18]" />;
        }

        const ext = item.extension?.toLowerCase();
        const iconClass = "w-8 h-8";

        // Icon colors based on file type
        if (['pdf'].includes(ext || '')) return <FaFileAlt className={`${iconClass} text-red-500`} />;
        if (['doc', 'docx'].includes(ext || '')) return <FaFileAlt className={`${iconClass} text-blue-500`} />;
        if (['xls', 'xlsx'].includes(ext || '')) return <FaFileAlt className={`${iconClass} text-green-600`} />;
        if (['ppt', 'pptx'].includes(ext || '')) return <FaFileAlt className={`${iconClass} text-orange-500`} />;
        if (['jpg', 'jpeg', 'png', 'gif', 'svg', 'webp'].includes(ext || '')) return <FaFileAlt className={`${iconClass} text-purple-500`} />;
        if (['mp4', 'avi', 'mov', 'wmv'].includes(ext || '')) return <FaFileAlt className={`${iconClass} text-pink-500`} />;
        if (['mp3', 'wav', 'ogg'].includes(ext || '')) return <FaFileAlt className={`${iconClass} text-indigo-500`} />;
        if (['zip', 'rar', '7z', 'tar', 'gz'].includes(ext || '')) return <FaFileAlt className={`${iconClass} text-yellow-600`} />;
        if (['txt', 'md'].includes(ext || '')) return <FaFileAlt className={`${iconClass} text-gray-500`} />;

        return <FaFileAlt className={`${iconClass} text-gray-400`} />;
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('id-ID', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
        });
    };

    return (
        <>
            <div className="space-y-4">
                {/* Items List */}
                {filteredItems.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-16 text-gray-400">
                        <HiOutlineFolder className="w-24 h-24 mb-4 opacity-50" />
                        <p className="text-lg font-medium">
                            {searchQuery ? t.files.noSearchResults : t.shared.noShared}
                        </p>
                        {searchQuery && (
                            <button
                                onClick={() => setSearchQuery('')}
                                className="mt-4 px-4 py-2 bg-[#003a69] hover:bg-[#002347] text-white rounded-lg transition-colors"
                            >
                                {t.files.cancel}
                            </button>
                        )}
                    </div>
                ) : (
                    <div className="space-y-2">
                        {filteredItems.map((item) => (
                            <div
                                key={item.id}
                                onDoubleClick={() => handleDoubleClick(item)}
                                className="group flex items-center gap-4 p-4 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-xl border-2 border-[#ebbd18] bg-[#ebbd18]/10 dark:bg-[#ebbd18]/20 h-[80px] hover:shadow-lg hover:shadow-[#003a69]/10 transition-all duration-300 cursor-pointer relative"
                            >
                                {/* Icon */}
                                <div className="shrink-0">
                                    {getFileIcon(item)}
                                </div>

                                {/* Info */}
                                <div className="flex-1 min-w-0">
                                    <h3 className="font-medium text-gray-900 dark:text-white truncate">
                                        {item.name}
                                    </h3>
                                    <div className="flex items-center gap-3 text-sm text-gray-500 dark:text-gray-400 mt-1">
                                        <span>{formatDate(item.created_at)}</span>
                                        {item.type === 'folder' && item.childs !== undefined && (
                                            <>
                                                <span>•</span>
                                                <span>{item.childs} item</span>
                                            </>
                                        )}
                                        {item.type === 'file' && item.size && (
                                            <>
                                                <span>•</span>
                                                <span>{item.size}</span>
                                            </>
                                        )}
                                    </div>
                                </div>

                                {/* Actions */}
                                <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                    {/* author photo */}
                                    <Tippy content={item.author.fullname} placement="top" arrow={true} delay={100}>
                                        <div className="inline-block">
                                            <button
                                                className="p-2 hover:bg-[#003a69]/10 rounded-lg transition-colors cursor-pointer"
                                                title="Lihat"
                                            >
                                                <img
                                                    src={item.author.photo}
                                                    onError={(e) => {
                                                        e.currentTarget.src = '/logo-oi.webp';
                                                    }}
                                                    alt={item.author.fullname}
                                                    className="w-4 h-4 rounded-full object-cover"
                                                />
                                            </button>
                                        </div>
                                    </Tippy>


                                    {item.type === 'file' && (
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handlePreview(item);
                                            }}
                                            className="p-2 hover:bg-[#003a69]/10 rounded-lg transition-colors cursor-pointer"
                                            title="Lihat"
                                        >
                                            <FaEye className="w-4 h-4 text-[#003a69] dark:text-[#ebbd18]" />
                                        </button>
                                    )}

                                    {item.publicity.editable && (
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleRename(item);
                                            }}
                                            className="p-2 hover:bg-[#003a69]/10 rounded-lg transition-colors cursor-pointer"
                                            title="Edit Nama"
                                        >
                                            <FaEdit className="w-4 h-4 text-[#003a69] dark:text-[#ebbd18]" />
                                        </button>
                                    )}

                                    {item.type === 'file' && (
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleDownload(item);
                                            }}
                                            className="p-2 hover:bg-[#003a69]/10 rounded-lg transition-colors cursor-pointer"
                                            title="Unduh"
                                        >
                                            <FaDownload className="w-4 h-4 text-[#003a69] dark:text-[#ebbd18]" />
                                        </button>
                                    )}

                                    {currentUserId && item.author.id === currentUserId && (
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleDelete(item);
                                            }}
                                            className="p-2 hover:bg-red-500/10 rounded-lg transition-colors cursor-pointer"
                                            title="Hapus"
                                        >
                                            <FaTrash className="w-4 h-4 text-red-500 dark:text-red-400" />
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))}
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
                    onClose={() => {
                        setIsRenameOpen(false);
                    }}
                    item={renameItem}
                    onRename={handleRenameSuccess}
                />
            )}
        </>
    );
}
