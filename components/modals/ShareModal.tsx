'use client';

import { useEffect, useState } from 'react';
import { FaTimes, FaLink, FaGlobe, FaLock, FaCopy, FaCheck } from 'react-icons/fa';
import { HiRefresh } from 'react-icons/hi';

interface ShareModalProps {
    isOpen: boolean;
    onClose: () => void;
    item: any;
    onShare: (data: any) => Promise<void>;
}

export default function ShareModal({ isOpen, onClose, item, onShare }: ShareModalProps) {
    const [shareType, setShareType] = useState<'public' | 'private'>('public');
    const [editable, setEditable] = useState(false);
    const [forever, setForever] = useState(true);
    const [expiredDate, setExpiredDate] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [copied, setCopied] = useState(false);

    useEffect(() => {
        // Replace default values when modal opens with item data
        if (item) {
            setShareType(item?.publicity?.status === 'private' ? 'private' : 'public');
            setEditable(item?.publicity?.editable || false);
            setForever(item?.publicity?.forever || false);
            setExpiredDate(item?.publicity?.expired_at ? item.publicity.expired_at.slice(0, 16) : '');
            setError('');
            setCopied(false);
        }
    }, [isOpen, item]);

    if (!isOpen) return null;

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || (typeof window !== 'undefined' ? window.location.origin : '');
    const shareLink = `${baseUrl}/sharer?_id=${item?.slug}`;
    
    const handleCopyLink = async () => {
        try {
            await navigator.clipboard.writeText(shareLink);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            console.error('Failed to copy:', err);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Only validate expired date for public sharing
        if (shareType === 'public' && !forever && !expiredDate) {
            setError('Tanggal kadaluarsa harus diisi');
            return;
        }

        setIsLoading(true);
        setError('');

        try {
            await onShare({
                status: shareType,
                editable,
                forever,
                expired_at: forever ? '9999-12-31 23:59:59' : expiredDate,
            });
            // Success will be handled by parent component
        } catch (err: any) {
            setError(err.message || 'Gagal membagikan item');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div 
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
            onClick={onClose}
        >
            <div 
                className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-md border-2 border-[#ebbd18]/20"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
                    <div>
                        <h2 className="text-xl font-bold text-[#003a69] dark:text-white">
                            Bagikan {item?.type === 'folder' ? 'Folder' : 'File'}
                        </h2>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{item?.name}</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                    >
                        <FaTimes className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                    </button>
                </div>

                {/* Content */}
                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    {/* Copy Link Section - Only show if item is already public */}
                    {item?.publicity?.status === 'public' && (
                        <div className="p-4 bg-gradient-to-r from-[#ebbd18]/10 to-[#ebbd18]/5 rounded-xl border-2 border-[#ebbd18]/20">
                            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                                Link Berbagi
                            </label>
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    value={shareLink}
                                    readOnly
                                    className="flex-1 px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg text-sm text-gray-700 dark:text-gray-300 focus:outline-none"
                                />
                                <button
                                    type="button"
                                    onClick={handleCopyLink}
                                    className="px-4 py-2 bg-[#ebbd18] hover:bg-[#d4a915] text-white rounded-lg font-medium transition-colors flex items-center gap-2"
                                >
                                    {copied ? (
                                        <>
                                            <FaCheck className="w-4 h-4" />
                                            <span>Tersalin</span>
                                        </>
                                    ) : (
                                        <>
                                            <FaCopy className="w-4 h-4" />
                                            <span>Salin</span>
                                        </>
                                    )}
                                </button>
                            </div>
                            <p className="text-xs text-gray-600 dark:text-gray-400 mt-2">
                                Siapa saja dengan link ini dapat mengakses {item?.type === 'folder' ? 'folder' : 'file'} ini
                            </p>
                        </div>
                    )}

                    {/* Share Type */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                            Tipe Berbagi
                        </label>
                        <div className="space-y-2">
                            <button
                                type="button"
                                onClick={() => setShareType('public')}
                                disabled={isLoading}
                                className={`w-full flex items-center gap-3 p-4 rounded-xl border-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed ${shareType === 'public'
                                    ? 'border-[#ebbd18] bg-[#ebbd18]/5'
                                    : 'border-gray-200 dark:border-gray-700 hover:border-[#ebbd18]/40'
                                    }`}
                            >
                                <FaGlobe className={`w-5 h-5 ${shareType === 'public' ? 'text-[#ebbd18]' : 'text-gray-400'}`} />
                                <div className="flex-1 text-left">
                                    <p className="font-semibold text-gray-900 dark:text-white">Publik</p>
                                    <p className="text-xs text-gray-600 dark:text-gray-400">Siapa saja dapat melihat</p>
                                </div>
                            </button>
                            <button
                                type="button"
                                onClick={() => setShareType('private')}
                                disabled={isLoading}
                                className={`w-full flex items-center gap-3 p-4 rounded-xl border-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed ${shareType === 'private'
                                    ? 'border-[#003a69] bg-[#003a69]/5'
                                    : 'border-gray-200 dark:border-gray-700 hover:border-[#003a69]/40'
                                    }`}
                            >
                                <FaLock className={`w-5 h-5 ${shareType === 'private' ? 'text-[#003a69]' : 'text-gray-400'}`} />
                                <div className="flex-1 text-left">
                                    <p className="font-semibold text-gray-900 dark:text-white">Privat</p>
                                    <p className="text-xs text-gray-600 dark:text-gray-400">Hanya Anda yang dapat melihat</p>
                                </div>
                            </button>
                        </div>
                    </div>

                    {/* Options */}
                    {shareType === 'public' && (
                        <>
                            <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
                                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Dapat diedit</span>
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={editable}
                                        onChange={(e) => setEditable(e.target.checked)}
                                        disabled={isLoading}
                                        className="sr-only peer"
                                    />
                                    <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[#ebbd18]/20 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#ebbd18] peer-disabled:opacity-50 peer-disabled:cursor-not-allowed"></div>
                                </label>
                            </div>

                            <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
                                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Selamanya</span>
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={forever}
                                        onChange={(e) => setForever(e.target.checked)}
                                        disabled={isLoading}
                                        className="sr-only peer"
                                    />
                                    <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[#ebbd18]/20 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#ebbd18] peer-disabled:opacity-50 peer-disabled:cursor-not-allowed"></div>
                                </label>
                            </div>

                            {!forever && (
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        Tanggal dan Jam Kadaluarsa
                                    </label>
                                    <input
                                        type="datetime-local"
                                        value={expiredDate}
                                        onChange={(e) => {
                                            setExpiredDate(e.target.value);
                                            setError('');
                                        }}
                                        min={new Date().toISOString().slice(0, 16)}
                                        className="w-full px-4 py-2.5 border-2 border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-[#ebbd18] focus:border-[#ebbd18] bg-white dark:bg-gray-900 text-gray-900 dark:text-white disabled:opacity-50 disabled:cursor-not-allowed"
                                        required={!forever}
                                        disabled={isLoading}
                                    />
                                </div>
                            )}
                        </>
                    )}

                    {/* Error Message */}
                    {error && (
                        <p className="text-xs text-red-600 dark:text-red-400 flex items-center gap-1 animate-shake">
                            <span>⚠️</span>
                            {error}
                        </p>
                    )}

                    {/* Actions */}
                    <div className="flex gap-3 pt-4">
                        <button
                            type="button"
                            onClick={onClose}
                            disabled={isLoading}
                            className="flex-1 px-6 py-2.5 rounded-lg border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 font-semibold hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Batal
                        </button>
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="flex-1 px-6 py-2.5 rounded-lg bg-gradient-to-r from-[#003a69] to-[#005a9c] text-white font-semibold hover:from-[#002347] hover:to-[#003a69] transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                            {isLoading ? (
                                <>
                                    <HiRefresh className="w-5 h-5 animate-spin" />
                                    <span>Membagikan...</span>
                                </>
                            ) : (
                                <span>Bagikan</span>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
