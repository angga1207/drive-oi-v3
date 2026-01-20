'use client';

import { FaTimes, FaDownload, FaFilePdf, FaFileWord, FaFileExcel, FaFilePowerpoint, FaFileImage, FaFileVideo, FaFileAudio, FaFile } from 'react-icons/fa';

interface FilePreviewModalProps {
    isOpen: boolean;
    onClose: () => void;
    item: any;
    onDownload: () => void;
}

export default function FilePreviewModal({ isOpen, onClose, item, onDownload }: FilePreviewModalProps) {
    if (!isOpen || !item) return null;

    const getFileIcon = (mime: string, extension: string) => {
        if (extension === 'pdf') return <FaFilePdf className="w-16 h-16 text-red-500" />;
        if (['doc', 'docx'].includes(extension)) return <FaFileWord className="w-16 h-16 text-blue-600" />;
        if (['xls', 'xlsx'].includes(extension)) return <FaFileExcel className="w-16 h-16 text-green-600" />;
        if (['ppt', 'pptx'].includes(extension)) return <FaFilePowerpoint className="w-16 h-16 text-orange-600" />;
        if (mime.startsWith('image')) return <FaFileImage className="w-16 h-16 text-purple-600" />;
        if (mime.startsWith('video')) return <FaFileVideo className="w-16 h-16 text-pink-600" />;
        if (mime.startsWith('audio')) return <FaFileAudio className="w-16 h-16 text-indigo-600" />;
        return <FaFile className="w-16 h-16 text-gray-600" />;
    };

    const canPreview = (mime: string, extension: string) => {
        return (
            mime.startsWith('image') ||
            extension === 'pdf' ||
            mime.startsWith('video') ||
            mime.startsWith('audio') ||
            ['doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx'].includes(extension) ||
            mime.startsWith('text')
        );
    };

    // Get preview URL based on sv_in mode
    const getPreviewUrl = () => {
        const svIn = item.sv_in || 2; // Default to 2 if not specified
        const path = item.path || '';

        if (svIn === 1) {
            // Google Drive embed mode
            return `https://drive.google.com/file/d/${path}/preview`;
        } else {
            // Direct preview mode (sv_in === 2)
            // For Office files, use Office Web Viewer
            if (['doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx'].includes(item.extension)) {
                return `https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(path)}`;
            }
            // For other files, use direct path
            return path;
        }
    };

    const isPreviewable = canPreview(item.mime, item.extension);
    const previewUrl = getPreviewUrl();
    const svIn = item.sv_in || 2;

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
            onClick={onClose}
        >
            <div
                className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-7xl h-[90vh] overflow-hidden border-2 border-[#ebbd18]/20 flex flex-col"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700 shrink-0">
                    <div className="flex-1 min-w-0">
                        <h2 className="text-xl font-bold text-[#003a69] dark:text-white truncate">
                            {item.name}
                        </h2>
                        <div className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-400 mt-1">
                            <span>{item.size}</span>
                            <span>•</span>
                            <span>{item.extension?.toUpperCase()}</span>
                            <span>•</span>
                            <span>{item.author.firstname}</span>
                        </div>
                    </div>
                    <div className="flex items-center gap-2 ml-4">
                        <button
                            onClick={onDownload}
                            className="p-2.5 hover:bg-[#ebbd18]/10 rounded-lg transition-colors"
                            title="Unduh File"
                        >
                            <FaDownload className="w-5 h-5 text-[#ebbd18]" />
                        </button>
                        <button
                            onClick={onClose}
                            className="p-2.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                        >
                            <FaTimes className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                        </button>
                    </div>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-auto p-6">
                    {isPreviewable ? (
                        <div className="flex items-center justify-center h-full">
                            {/* Google Drive embed mode (sv_in === 1) */}
                            {svIn === 1 && (
                                <iframe
                                    src={previewUrl}
                                    className="w-full h-full min-h-[500px] rounded-lg border-2 border-gray-200 dark:border-gray-700"
                                    title={item.name}
                                    allow="autoplay"
                                />
                            )}

                            {/* Direct preview mode (sv_in === 2) */}
                            {svIn === 2 && (
                                <>
                                    {/* Image preview */}
                                    {item.mime.startsWith('image') && (
                                        <img
                                            src={previewUrl}
                                            alt={item.name}
                                            className="max-w-full max-h-full object-contain rounded-lg"
                                        />
                                    )}

                                    {/* PDF preview */}
                                    {item.extension === 'pdf' && (
                                        <iframe
                                            src={previewUrl}
                                            className="w-full h-full min-h-[500px] rounded-lg border-2 border-gray-200 dark:border-gray-700"
                                            title={item.name}
                                        />
                                    )}

                                    {/* Office files preview (Word, Excel, PowerPoint) */}
                                    {['doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx'].includes(item.extension) && (
                                        <iframe
                                            src={previewUrl}
                                            className="w-full h-full min-h-[500px] rounded-lg border-2 border-gray-200 dark:border-gray-700"
                                            title={item.name}
                                        />
                                    )}

                                    {/* Video preview */}
                                    {item.mime.startsWith('video') && (
                                        <video
                                            src={previewUrl}
                                            controls
                                            className="max-w-full max-h-full rounded-lg"
                                        >
                                            Browser Anda tidak mendukung video player.
                                        </video>
                                    )}

                                    {/* Audio preview */}
                                    {item.mime.startsWith('audio') && (
                                        <div className="w-full max-w-xl">
                                            <div className="flex justify-center mb-6">
                                                {getFileIcon(item.mime, item.extension)}
                                            </div>
                                            <audio
                                                src={previewUrl}
                                                controls
                                                className="w-full"
                                            >
                                                Browser Anda tidak mendukung audio player.
                                            </audio>
                                        </div>
                                    )}

                                    {/* Fallback for unsupported preview types */}
                                    {item.mime.startsWith('text') && (
                                        <div className="w-full max-w-3xl">
                                            <div className="flex justify-center mb-6">
                                                {getFileIcon(item.mime, item.extension)}
                                            </div>
                                            <iframe
                                                src={previewUrl}
                                                className="w-full h-[600px] rounded-lg border-2 border-gray-200 dark:border-gray-700"
                                                title={item.name}
                                            />
                                        </div>
                                    )}
                                </>
                            )}
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center h-full text-center py-12">
                            <div className="mb-6">
                                {getFileIcon(item.mime, item.extension)}
                            </div>
                            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                                Preview Tidak Tersedia
                            </h3>
                            <p className="text-gray-600 dark:text-gray-400 mb-6">
                                File ini tidak dapat di-preview di browser. Silakan unduh untuk membuka.
                            </p>
                            <button
                                onClick={onDownload}
                                className="flex items-center gap-2 px-6 py-3 rounded-lg bg-gradient-to-r from-[#003a69] to-[#005a9c] text-white font-semibold hover:from-[#002347] hover:to-[#003a69] transition-all shadow-lg"
                            >
                                <FaDownload className="w-4 h-4" />
                                Unduh File
                            </button>
                        </div>
                    )}
                </div>

                {/* Footer Info */}
                <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50 shrink-0">
                    <div className="flex items-center justify-between text-xs text-gray-600 dark:text-gray-400">
                        <span>Dibuat: {new Date(item.created_at).toLocaleDateString('id-ID')}</span>
                        {item.updated_at && (
                            <span>Diubah: {new Date(item.updated_at).toLocaleDateString('id-ID')}</span>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
