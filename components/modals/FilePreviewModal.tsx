'use client';

import { useMemo } from 'react';
import {
    FaTimes,
    FaDownload,
    FaFilePdf,
    FaFileWord,
    FaFileExcel,
    FaFilePowerpoint,
    FaFileImage,
    FaFileVideo,
    FaFileAudio,
    FaFile,
    FaFileArchive,
} from 'react-icons/fa';

type FileAuthor = {
    firstname?: string;
    fullname?: string;
    photo?: string;
    id?: number;
};

type FilePreviewItem = {
    name: string;
    slug?: string | number;

    size?: string;
    extension?: string;
    mime?: string;

    path?: string; // for sv_in=2 proxy/local or id for sv_in=1
    sv_in?: number;

    author?: FileAuthor;
    created_at?: string;
    updated_at?: string | null;
};

interface FilePreviewModalProps {
    isOpen: boolean;
    onClose: () => void;
    item: FilePreviewItem | null;
    onDownload: () => void;
}

function formatDateTimeId(input?: string | null) {
    if (!input) return '-';
    const d = new Date(input);
    if (Number.isNaN(d.getTime())) return '-';
    return d.toLocaleString('id-ID', {
        year: 'numeric',
        month: 'short',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
    });
}

function truncateMiddle(input: string, maxLen: number) {
    if (input.length <= maxLen) return input;
    const half = Math.max(5, Math.floor((maxLen - 3) / 2));
    return `${input.slice(0, half)}...${input.slice(-half)}`;
}

export default function FilePreviewModal({ isOpen, onClose, item, onDownload }: FilePreviewModalProps) {
    // IMPORTANT:
    // Hooks must be called in the same order on every render.
    // Therefore: do NOT early-return before calling hooks.
    const mime = item?.mime ?? '';
    const extension = item?.extension ?? '';
    const svIn = item?.sv_in ?? 2;
    const path = item?.path ?? '';
    const size = item?.size ?? '';
    const authorValue = item?.author?.firstname || item?.author?.fullname || '';
    const createdAt = item?.created_at ?? null;
    const updatedAt = item?.updated_at ?? null;
    const slug = item?.slug;

    const getFileIcon = (mimeStr: string, ext: string) => {
        if (ext === 'pdf') return <FaFilePdf className="w-16 h-16 text-red-500" />;
        if (['doc', 'docx'].includes(ext)) return <FaFileWord className="w-16 h-16 text-blue-600" />;
        if (['xls', 'xlsx'].includes(ext)) return <FaFileExcel className="w-16 h-16 text-green-600" />;
        if (['ppt', 'pptx'].includes(ext)) return <FaFilePowerpoint className="w-16 h-16 text-orange-600" />;
        if (['zip', 'rar', '7z', 'tar', 'gz', 'bz2'].includes(ext)) return <FaFileArchive className="w-16 h-16 text-yellow-600" />;
        if (mimeStr.startsWith('image')) return <FaFileImage className="w-16 h-16 text-purple-600" />;
        if (mimeStr.startsWith('video')) return <FaFileVideo className="w-16 h-16 text-pink-600" />;
        if (mimeStr.startsWith('audio')) return <FaFileAudio className="w-16 h-16 text-indigo-600" />;
        return <FaFile className="w-16 h-16 text-gray-600" />;
    };

    const canPreview = (mimeStr: string, ext: string, svInValue: number) => {
        return (
            mimeStr.startsWith('image') ||
            ext === 'pdf' ||
            mimeStr.startsWith('video') ||
            mimeStr.startsWith('audio') ||
            ['doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx'].includes(ext) ||
            mimeStr.startsWith('text') ||
            ((svInValue ?? 2) === 1 && ['zip', 'rar', '7z', 'tar', 'gz', 'bz2'].includes(ext))
        );
    };

    const isPreviewable = canPreview(mime, extension, svIn);

    // Preview URL based on sv_in mode
    const previewUrl = (() => {
        if (svIn === 1) {
            // Google Drive embed mode
            return `https://drive.google.com/file/d/${path}/preview`;
        }

        // Direct preview mode (sv_in === 2)
        if (['doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx'].includes(extension)) {
            return `https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(path)}`;
        }

        // Proxy local files through Next.js API to avoid cross-origin issues
        try {
            const url = new URL(path);
            const storagePath = url.pathname;
            if (storagePath.startsWith('/storage/')) {
                return `/api/file-proxy?url=${encodeURIComponent(storagePath)}`;
            }
        } catch {
            // path is not a valid URL, use as-is
        }

        return path;
    })();

    const isGoogleOfficeEditable =
        svIn === 1 && ['doc', 'docx', 'xls', 'xlsx'].includes(extension) && !!path;

    const googleOfficeEditUrl = isGoogleOfficeEditable
        ? ['xls', 'xlsx'].includes(extension)
            ? `https://docs.google.com/spreadsheets/d/${path}/edit`
            : `https://docs.google.com/document/d/${path}/edit`
        : '';

    const metaEntries = useMemo(() => {
        const entries: Array<{ label: string; value: string }> = [];

        entries.push({ label: 'Jenis', value: extension ? extension.toUpperCase() : '-' });
        entries.push({ label: 'MIME', value: mime || '-' });
        entries.push({ label: 'Ukuran', value: size || '-' });

        entries.push({
            label: 'SV Mode',
            value: svIn === 1 ? 'Google Drive' : 'Direct',
        });

        entries.push({
            label: 'Penulis',
            value: authorValue || '-',
        });

        entries.push({ label: 'Dibuat', value: formatDateTimeId(createdAt) });

        if (updatedAt) {
            entries.push({ label: 'Diubah', value: formatDateTimeId(updatedAt) });
        }

        if (path) {
            entries.push({
                label: 'Path',
                value: truncateMiddle(String(path), 44),
            });
        }

        if (slug !== undefined) {
            entries.push({ label: 'ID/Slug', value: String(slug) });
        }

        return entries;
    }, [extension, mime, size, svIn, authorValue, createdAt, updatedAt, path, slug]);

    // Now it's safe to early-return AFTER hooks
    if (!isOpen || !item) return null;

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
            onClick={onClose}
        >
            <div
                className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full h-[95vh] overflow-hidden border-2 border-[#ebbd18]/20 flex flex-col"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex-1 overflow-hidden p-4 sm:p-6">
                    <div className="h-full flex gap-4">
                        {/* Preview */}
                        <div className="flex-1 overflow-auto rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/20">
                            <div className="min-h-[520px] p-4 sm:p-5">
                                {isPreviewable ? (
                                    <div className="w-full h-[85vh]">
                                        {svIn === 1 && isGoogleOfficeEditable ? (
                                            <iframe
                                                src={googleOfficeEditUrl}
                                                className="w-full h-full rounded-lg border border-gray-200 dark:border-gray-700"
                                                title={item.name}
                                                allow="autoplay"
                                            />
                                        ) : (
                                            svIn === 1 && (
                                                <iframe
                                                    src={previewUrl}
                                                    className="w-full h-full rounded-lg border border-gray-200 dark:border-gray-700"
                                                    title={item.name}
                                                    allow="autoplay"
                                                />
                                            )
                                        )}

                                        {svIn === 2 && (
                                            <>
                                                {mime.startsWith('image') && (
                                                    <img
                                                        src={previewUrl}
                                                        alt={item.name}
                                                        className="max-w-full max-h-full object-contain rounded-lg"
                                                    />
                                                )}

                                                {extension === 'pdf' && (
                                                    <iframe
                                                        src={previewUrl}
                                                        className="w-full h-full rounded-lg border border-gray-200 dark:border-gray-700"
                                                        title={item.name}
                                                    />
                                                )}

                                                {['doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx'].includes(extension) && (
                                                    <iframe
                                                        src={previewUrl}
                                                        className="w-full h-full rounded-lg border border-gray-200 dark:border-gray-700"
                                                        title={item.name}
                                                    />
                                                )}

                                                {mime.startsWith('video') && (
                                                    <video
                                                        src={previewUrl}
                                                        controls
                                                        className="max-w-full max-h-full rounded-lg"
                                                    >
                                                        Browser Anda tidak mendukung video player.
                                                    </video>
                                                )}

                                                {mime.startsWith('audio') && (
                                                    <div className="w-full max-w-xl">
                                                        <div className="flex justify-center mb-6">
                                                            {getFileIcon(mime, extension)}
                                                        </div>
                                                        <audio src={previewUrl} controls className="w-full" />
                                                    </div>
                                                )}

                                                {mime.startsWith('text') && (
                                                    <div className="w-full max-w-3xl">
                                                        <div className="flex justify-center mb-6">
                                                            {getFileIcon(mime, extension)}
                                                        </div>
                                                        <iframe
                                                            src={previewUrl}
                                                            className="w-full h-[620px] rounded-lg border border-gray-200 dark:border-gray-700"
                                                            title={item.name}
                                                        />
                                                    </div>
                                                )}
                                            </>
                                        )}
                                    </div>
                                ) : (
                                    <div className="flex flex-col items-center justify-center h-full text-center py-10">
                                        <div className="mb-4">{getFileIcon(mime, extension)}</div>
                                        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                                            Preview Tidak Tersedia
                                        </h3>
                                        <p className="text-gray-600 dark:text-gray-400 mb-6">
                                            File ini tidak dapat di-preview di browser. Silakan unduh untuk membuka.
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Metadata sidebar (no collapse) */}
                        <aside className="w-80 hidden lg:flex flex-col border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden bg-white dark:bg-gray-800 shrink-0">
                            <div className="flex-1 overflow-auto p-4">
                                <div className="mb-4">
                                    <h2 className="text-sm font-bold text-gray-800 dark:text-gray-100 truncate">
                                        {item.name}
                                    </h2>
                                    <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400 mt-1">
                                        {extension ? (
                                            <span className="px-2 py-0.5 bg-gray-100 dark:bg-gray-700 rounded">
                                                {extension.toUpperCase()}
                                            </span>
                                        ) : null}
                                        {size ? <span className="truncate">{size}</span> : null}
                                    </div>
                                </div>

                                <dl className="text-sm">
                                    {metaEntries.map((e, idx) => (
                                        <div
                                            key={`${e.label}-${idx}`}
                                            className={`py-2 ${idx === metaEntries.length - 1 ? '' : 'border-b border-gray-100 dark:border-gray-700'}`}
                                        >
                                            <dt className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                                                {e.label}
                                            </dt>
                                            <dd className="mt-1 text-gray-900 dark:text-gray-100 break-words">
                                                {e.value}
                                            </dd>
                                        </div>
                                    ))}
                                </dl>
                            </div>

                            {/* Buttons moved below metadata */}
                            <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/30 shrink-0">
                                <div className="flex flex-col gap-2">
                                    {svIn === 1 && isGoogleOfficeEditable && (
                                        <a
                                            href={googleOfficeEditUrl}
                                            target="_blank"
                                            rel="noreferrer"
                                            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-[#003a69] text-white font-semibold hover:bg-[#002347] transition-colors"
                                        >
                                            <span aria-hidden className="font-bold">
                                                ✎
                                            </span>
                                            Edit dengan Google
                                        </a>
                                    )}

                                    <button
                                        onClick={onDownload}
                                        className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-[#ebbd18] text-black font-semibold hover:bg-[#d4a915] transition-colors"
                                        title="Unduh File"
                                    >
                                        <FaDownload className="w-4 h-4" />
                                        Unduh File
                                    </button>

                                    <button
                                        onClick={onClose}
                                        className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 font-semibold hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
                                    >
                                        <FaTimes className="w-4 h-4" />
                                        Tutup
                                    </button>
                                </div>
                            </div>
                        </aside>
                    </div>
                </div>

                {/* Mobile metadata + buttons */}
                <div className="lg:hidden border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/30">
                    {/* <div className="p-4">
                        <h2 className="text-sm font-bold text-gray-800 dark:text-gray-100 truncate">{item.name}</h2>
                        <dl className="text-sm mt-3">
                            {metaEntries.map((e, idx) => (
                                <div
                                    key={`${e.label}-${idx}`}
                                    className={`py-2 ${idx === metaEntries.length - 1 ? '' : 'border-b border-gray-100 dark:border-gray-700'}`}
                                >
                                    <dt className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                                        {e.label}
                                    </dt>
                                    <dd className="mt-1 text-gray-900 dark:text-gray-100 break-words">{e.value}</dd>
                                </div>
                            ))}
                        </dl>
                    </div> */}

                    <div className="p-4 border-t border-gray-200 dark:border-gray-700">
                        <div className="flex flex-col gap-2">
                            {svIn === 1 && isGoogleOfficeEditable && (
                                <a
                                    href={googleOfficeEditUrl}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-[#003a69] text-white font-semibold hover:bg-[#002347] transition-colors"
                                >
                                    <span aria-hidden className="font-bold">
                                        ✎
                                    </span>
                                    Edit dengan Google
                                </a>
                            )}

                            <button
                                onClick={onDownload}
                                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-[#ebbd18] text-black font-semibold hover:bg-[#d4a915] transition-colors"
                            >
                                <FaDownload className="w-4 h-4" />
                                Unduh File
                            </button>

                            <button
                                onClick={onClose}
                                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 font-semibold hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
                            >
                                <FaTimes className="w-4 h-4" />
                                Tutup
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
