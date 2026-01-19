'use client';

import { useState, useEffect } from 'react';
import { FaTimes, FaEdit } from 'react-icons/fa';
import { HiRefresh } from 'react-icons/hi';

interface RenameModalProps {
    isOpen: boolean;
    onClose: () => void;
    item: any;
    onRename: (newName: string) => Promise<void>;
}

export default function RenameModal({ isOpen, onClose, item, onRename }: RenameModalProps) {
    const [name, setName] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        if (item) {
            setName(item.name);
            setError('');
        }
    }, [item]);

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!name.trim()) {
            setError('Nama tidak boleh kosong');
            return;
        }

        if (name.trim() === item.name) {
            setError('Nama tidak berubah');
            return;
        }

        setIsLoading(true);
        setError('');

        try {
            await onRename(name.trim());
            // Success will be handled by parent component
        } catch (err: any) {
            setError(err.message || 'Gagal mengubah nama');
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
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-[#ebbd18]/10 rounded-lg">
                            <FaEdit className="w-5 h-5 text-[#ebbd18]" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-[#003a69] dark:text-white">
                                Ganti Nama {item?.type === 'folder' ? 'Folder' : 'File'}
                            </h2>
                        </div>
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
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                            Nama {item?.type === 'folder' ? 'Folder' : 'File'} Baru
                        </label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => {
                                setName(e.target.value);
                                setError('');
                            }}
                            placeholder={`Masukkan nama ${item?.type === 'folder' ? 'folder' : 'file'} baru`}
                            className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-[#ebbd18] focus:border-[#ebbd18] bg-white dark:bg-gray-900 text-gray-900 dark:text-white font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                            autoFocus
                            required
                            disabled={isLoading}
                        />
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                            Nama sebelumnya: <span className="font-semibold">{item?.name}</span>
                        </p>
                        {error && (
                            <p className="text-xs text-red-600 dark:text-red-400 mt-2 flex items-center gap-1 animate-shake">
                                <span>⚠️</span>
                                {error}
                            </p>
                        )}
                    </div>

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
                                    <span>Menyimpan...</span>
                                </>
                            ) : (
                                <span>Simpan</span>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
