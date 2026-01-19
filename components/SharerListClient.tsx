'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { FaFolder, FaFilePdf, FaFileWord, FaFileExcel, FaFilePowerpoint, FaFileImage, FaFileVideo, FaFileAudio, FaFileArchive, FaFileCode, FaFile, FaCalendarAlt, FaDownload, FaEye, FaUser } from 'react-icons/fa';
import { HiOutlineFolder } from 'react-icons/hi';
import FilePreviewModal from '@/components/modals/FilePreviewModal';
import Swal from 'sweetalert2';

interface SharerListClientProps {
    items: any[];
    parentInfo?: any;
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

export default function SharerListClient({ items, parentInfo }: SharerListClientProps) {
    const router = useRouter();
    const [previewModal, setPreviewModal] = useState<{ isOpen: boolean; item: any }>({ isOpen: false, item: null });

    const handleDoubleClick = (item: any) => {
        if (item.type === 'folder') {
            router.push(`/sharer?_id=${item.slug}`);
        } else {
            // Open file preview
            setPreviewModal({ isOpen: true, item });
        }
    };

    const handleDownload = async (item: any) => {
        try {
            // For Google Drive files (sv_in === 1), use Google Drive URL
            if (item.sv_in === 1) {
                const downloadUrl = `https://drive.google.com/uc?export=download&id=${item.path}`;
                window.open(downloadUrl, '_blank');
                return;
            }

            // For local files (sv_in === 2), use the direct path
            if (item.sv_in === 2) {
                window.open(item.path, '_blank');
                return;
            }

            await Swal.fire({
                title: 'Berhasil!',
                text: 'File sedang diunduh',
                icon: 'success',
                timer: 1500,
                showConfirmButton: false,
                customClass: {
                    popup: 'rounded-xl',
                },
            });
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

    return (
        <>
            {/* Empty State */}
            {items.length === 0 ? (
                <div className="flex items-center justify-center min-h-[400px] bg-white/80 dark:bg-gray-800/80 rounded-xl border-2 border-dashed border-[#ebbd18]/30 dark:border-[#ebbd18]/30 backdrop-blur-sm">
                    <div className="text-center">
                        <HiOutlineFolder className="text-6xl mb-4 text-[#003a69]/30 mx-auto" />
                        <h3 className="text-xl font-semibold text-[#003a69] dark:text-white mb-2">
                            Folder Kosong
                        </h3>
                        <p className="text-gray-600 dark:text-gray-400">
                            Belum ada file atau folder di sini
                        </p>
                    </div>
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-3">
                    {items.map((item: any) => (
                        <div
                            key={item.id}
                            onDoubleClick={() => handleDoubleClick(item)}
                            className="group flex items-center gap-4 p-4 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-xl border-2 border-[#ebbd18]/20 hover:border-[#ebbd18]/60 hover:shadow-lg hover:shadow-[#003a69]/10 transition-all duration-300 cursor-pointer"
                        >
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
                                    {item.author && (
                                        <>
                                            <span className='flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400'>
                                                <FaUser className="w-2.5 h-2.5" />
                                                {item.author.firstname} {item.author.lastname}
                                            </span>
                                            <span>•</span>
                                        </>
                                    )}
                                    {item.created_at && (
                                        <span className='flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400'>
                                            <FaCalendarAlt className="w-2.5 h-2.5" />
                                            {new Date(item.created_at).toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' })}
                                        </span>
                                    )}
                                </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                {item.type === 'file' && (
                                    <>
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setPreviewModal({ isOpen: true, item });
                                            }}
                                            className="p-2.5 bg-blue-600/10 hover:bg-blue-600/20 dark:bg-blue-500/10 dark:hover:bg-blue-500/20 rounded-lg transition-colors"
                                            title="Lihat"
                                        >
                                            <FaEye className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                                        </button>
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleDownload(item);
                                            }}
                                            className="p-2.5 bg-green-600/10 hover:bg-green-600/20 dark:bg-green-500/10 dark:hover:bg-green-500/20 rounded-lg transition-colors"
                                            title="Download"
                                        >
                                            <FaDownload className="w-4 h-4 text-green-600 dark:text-green-400" />
                                        </button>
                                    </>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Preview Modal */}
            {previewModal.isOpen && (
                <FilePreviewModal
                    isOpen={previewModal.isOpen}
                    onClose={() => setPreviewModal({ isOpen: false, item: null })}
                    item={previewModal.item}
                    onDownload={() => handleDownload(previewModal.item)}
                />
            )}
        </>
    );
}
