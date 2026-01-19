'use client';

import { useRouter } from 'next/navigation';
import { useState, useRef } from 'react';
import { FaFolder, FaFilePdf, FaFileWord, FaFileExcel, FaFilePowerpoint, FaFileImage, FaFileVideo, FaFileAudio, FaFileArchive, FaFileCode, FaFile, FaCalendarAlt, FaCheckSquare, FaSearch, FaTimes, FaTrashRestore, FaTrashAlt, FaEye } from 'react-icons/fa';
import { HiX, HiOutlineFolder } from 'react-icons/hi';
import FilePreviewModal from '@/components/modals/FilePreviewModal';
import Swal from 'sweetalert2';

interface TrashListClientProps {
    items: any[];
}

function getFileIcon(mime: string, extension: string) {
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

export default function TrashListClient({ items }: TrashListClientProps) {
    const router = useRouter();
    const [previewModal, setPreviewModal] = useState<{ isOpen: boolean; item: any }>({ isOpen: false, item: null });
    const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
    const [isSelectionMode, setIsSelectionMode] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const prevSelectedSize = useRef(0);

    // Filter items based on search
    const filteredItems = items.filter(item => 
        item.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    // Handle selection toggle
    const toggleSelection = (slug: string) => {
        setSelectedItems(prev => {
            const newSet = new Set(prev);
            if (newSet.has(slug)) {
                newSet.delete(slug);
            } else {
                newSet.add(slug);
            }
            return newSet;
        });
    };

    // Select all items
    const toggleSelectAll = () => {
        if (selectedItems.size === filteredItems.length) {
            setSelectedItems(new Set());
            setIsSelectionMode(false);
        } else {
            setSelectedItems(new Set(filteredItems.map(item => item.slug)));
            setIsSelectionMode(true);
        }
    };

    // Cancel selection
    const cancelSelection = () => {
        setSelectedItems(new Set());
        setIsSelectionMode(false);
    };

    // Auto-exit selection mode when all items deselected
    if (prevSelectedSize.current > 0 && selectedItems.size === 0 && isSelectionMode) {
        setIsSelectionMode(false);
    }
    prevSelectedSize.current = selectedItems.size;

    // Handle restore
    const handleRestore = async (slugs: string[]) => {
        try {
            const result = await Swal.fire({
                title: 'Pulihkan Item?',
                text: `Yakin ingin memulihkan ${slugs.length} item?`,
                icon: 'question',
                showCancelButton: true,
                confirmButtonText: 'Ya, Pulihkan',
                cancelButtonText: 'Batal',
                confirmButtonColor: '#16a34a',
                cancelButtonColor: '#6b7280',
                customClass: {
                    popup: 'rounded-xl',
                    confirmButton: 'rounded-lg px-6 py-2.5 font-semibold',
                    cancelButton: 'rounded-lg px-6 py-2.5 font-semibold',
                },
            });

            if (!result.isConfirmed) return;

            const response = await fetch('/api/restore', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ids: slugs }),
            });

            const data = await response.json();

            if (response.ok) {
                await Swal.fire({
                    title: 'Berhasil!',
                    text: data.message || 'Item berhasil dipulihkan',
                    icon: 'success',
                    timer: 2000,
                    showConfirmButton: false,
                    customClass: { popup: 'rounded-xl' },
                });
                setSelectedItems(new Set());
                setIsSelectionMode(false);
                router.refresh();
            } else {
                throw new Error(data.message);
            }
        } catch (error: any) {
            await Swal.fire({
                title: 'Gagal!',
                text: error.message || 'Gagal memulihkan item',
                icon: 'error',
                confirmButtonText: 'OK',
                confirmButtonColor: '#003a69',
                customClass: { popup: 'rounded-xl' },
            });
        }
    };

    // Handle permanent delete
    const handleForceDelete = async (slugs: string[]) => {
        try {
            const result = await Swal.fire({
                title: 'Hapus Permanen?',
                html: `<p class="text-gray-600">Item yang dihapus permanen <strong>tidak dapat dipulihkan</strong>.</p><p class="mt-2">Yakin ingin menghapus <strong>${slugs.length}</strong> item secara permanen?</p>`,
                icon: 'warning',
                showCancelButton: true,
                confirmButtonText: 'Ya, Hapus Permanen',
                cancelButtonText: 'Batal',
                confirmButtonColor: '#dc2626',
                cancelButtonColor: '#6b7280',
                customClass: {
                    popup: 'rounded-xl',
                    confirmButton: 'rounded-lg px-6 py-2.5 font-semibold',
                    cancelButton: 'rounded-lg px-6 py-2.5 font-semibold',
                },
            });

            if (!result.isConfirmed) return;

            const response = await fetch('/api/forceDelete', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ids: slugs }),
            });

            const data = await response.json();

            if (response.ok) {
                await Swal.fire({
                    title: 'Terhapus!',
                    text: data.message || 'Item berhasil dihapus permanen',
                    icon: 'success',
                    timer: 2000,
                    showConfirmButton: false,
                    customClass: { popup: 'rounded-xl' },
                });
                setSelectedItems(new Set());
                setIsSelectionMode(false);
                router.refresh();
            } else {
                throw new Error(data.message);
            }
        } catch (error: any) {
            await Swal.fire({
                title: 'Gagal!',
                text: error.message || 'Gagal menghapus item',
                icon: 'error',
                confirmButtonText: 'OK',
                confirmButtonColor: '#003a69',
                customClass: { popup: 'rounded-xl' },
            });
        }
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
                                {selectedItems.size === filteredItems.length ? 'Batal Pilih Semua' : 'Pilih Semua'}
                            </button>
                            <button
                                onClick={() => handleRestore(Array.from(selectedItems))}
                                className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 rounded-lg font-semibold transition-colors shadow-lg"
                            >
                                <FaTrashRestore className="w-4 h-4" />
                                <span>Pulihkan</span>
                            </button>
                            <button
                                onClick={() => handleForceDelete(Array.from(selectedItems))}
                                className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg font-semibold transition-colors shadow-lg"
                            >
                                <FaTrashAlt className="w-4 h-4" />
                                <span>Hapus Permanen</span>
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Search and Select Controls */}
            {!isSelectionMode && filteredItems.length > 0 && (
                <div className="sticky top-0 z-10 mb-4 flex flex-col sm:flex-row gap-3 sm:justify-between backdrop-blur-sm py-2 -mx-2 px-2">
                    {/* Search Input */}
                    <div className="flex-1 max-w-md relative">
                        <div className="relative">
                            <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Cari di kotak sampah..."
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
            {filteredItems.length === 0 ? (
                <div className="flex items-center justify-center min-h-[400px] bg-white/80 dark:bg-gray-800/80 rounded-xl border-2 border-dashed border-[#ebbd18]/30 dark:border-[#ebbd18]/30 backdrop-blur-sm">
                    <div className="text-center">
                        <HiOutlineFolder className="text-6xl mb-4 text-[#003a69]/30 mx-auto" />
                        <h3 className="text-xl font-semibold text-[#003a69] dark:text-white mb-2">
                            {searchQuery ? 'Tidak Ada Hasil' : 'Kotak Sampah Kosong'}
                        </h3>
                        <p className="text-gray-600 dark:text-gray-400 mb-4">
                            {searchQuery ? 'Tidak ada item yang cocok dengan pencarian Anda' : 'Item yang dihapus akan muncul di sini'}
                        </p>
                        {!searchQuery && (
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                Item akan dihapus permanen setelah 30 hari
                            </p>
                        )}
                    </div>
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-3">
                    {filteredItems.map((item: any, index: number) => {
                        const isSelected = selectedItems.has(item.slug);
                        
                        return (
                            <div
                                key={item.id}
                                onClick={(e) => {
                                    if (isSelectionMode) {
                                        toggleSelection(item.slug);
                                    }
                                }}
                                className={`group flex items-center gap-4 p-4 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-xl border-2 ${
                                    isSelected
                                        ? 'border-[#003a69] bg-[#003a69]/5 dark:bg-[#003a69]/10'
                                        : 'border-[#ebbd18]/20 hover:border-[#ebbd18]/60'
                                } hover:shadow-lg hover:shadow-[#003a69]/10 transition-all duration-300 cursor-pointer`}
                            >
                                {/* Checkbox (in selection mode) */}
                                {isSelectionMode && (
                                    <div className="flex items-center">
                                        <input
                                            type="checkbox"
                                            checked={isSelected}
                                            onChange={() => {}}
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                toggleSelection(item.slug);
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
                                        {item.deleted_at && (
                                            <span className='flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400'>
                                                <FaCalendarAlt className="w-2.5 h-2.5" />
                                                Dihapus: {new Date(item.deleted_at).toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' })}, {new Date(item.deleted_at).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })} WIB
                                            </span>
                                        )}
                                    </div>
                                </div>

                                {/* Action Buttons - Hide in selection mode */}
                                {!isSelectionMode && (
                                    <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                        {item.type === 'file' && (
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setPreviewModal({ isOpen: true, item });
                                                }}
                                                className="p-2.5 bg-blue-600/10 hover:bg-blue-600/20 dark:bg-blue-500/10 dark:hover:bg-blue-500/20 rounded-lg transition-colors group/btn"
                                                title="Preview"
                                            >
                                                <FaEye className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                                            </button>
                                        )}
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleRestore([item.slug]);
                                            }}
                                            className="p-2.5 bg-green-600/10 hover:bg-green-600/20 dark:bg-green-500/10 dark:hover:bg-green-500/20 rounded-lg transition-colors group/btn"
                                            title="Pulihkan"
                                        >
                                            <FaTrashRestore className="w-4 h-4 text-green-600 dark:text-green-400" />
                                        </button>
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleForceDelete([item.slug]);
                                            }}
                                            className="p-2.5 bg-red-600/10 hover:bg-red-600/20 dark:bg-red-500/10 dark:hover:bg-red-500/20 rounded-lg transition-colors group/btn"
                                            title="Hapus Permanen"
                                        >
                                            <FaTrashAlt className="w-4 h-4 text-red-600 dark:text-red-400" />
                                        </button>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Preview Modal */}
            {previewModal.isOpen && (
                <FilePreviewModal
                    isOpen={previewModal.isOpen}
                    onClose={() => setPreviewModal({ isOpen: false, item: null })}
                    item={previewModal.item}
                    onDownload={() => {
                        // Download not available for trashed items
                    }}
                />
            )}
        </>
    );
}
