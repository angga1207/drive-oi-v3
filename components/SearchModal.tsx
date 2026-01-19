'use client';

import { useState, useEffect, useRef } from 'react';
import { FaSearch, FaTimes, FaFolder, FaFile, FaSpinner } from 'react-icons/fa';
import { useRouter } from 'next/navigation';

interface SearchResult {
    id: number;
    name: string;
    type: 'folder' | 'file';
    slug: string;
    parent_slug: string | number;
    parent_name: string;
    extension: string;
    mime: string;
    size: string;
    created_at: string;
}

interface SearchModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function SearchModal({ isOpen, onClose }: SearchModalProps) {
    const [searchQuery, setSearchQuery] = useState('');
    const [results, setResults] = useState<SearchResult[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [hasSearched, setHasSearched] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);
    const router = useRouter();

    // Focus input when modal opens
    useEffect(() => {
        if (isOpen && inputRef.current) {
            inputRef.current.focus();
        }
    }, [isOpen]);

    // Handle escape key to close modal
    useEffect(() => {
        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === 'Escape' && isOpen) {
                onClose();
            }
        };

        document.addEventListener('keydown', handleEscape);
        return () => document.removeEventListener('keydown', handleEscape);
    }, [isOpen, onClose]);

    const handleSearch = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!searchQuery.trim()) return;

        setIsLoading(true);
        setHasSearched(true);

        try {
            const response = await fetch(`/api/search?search=${encodeURIComponent(searchQuery.trim())}`);
            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Gagal melakukan pencarian');
            }

            setResults(data.data || []);
        } catch (error: any) {
            console.error('Search error:', error);
            setResults([]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleResultClick = (result: SearchResult) => {
        if (result.type === 'folder') {
            // Navigate to folder
            router.push(`/files?_p=${result.slug}`);
        } else {
            // For files, navigate to parent folder with highlight parameter
            if (result.parent_slug && result.parent_slug !== 0) {
                router.push(`/files?_p=${result.parent_slug}&highlight=${result.slug}`);
            } else {
                router.push(`/files?highlight=${result.slug}`);
            }
        }
        onClose();
        // Reset search
        setSearchQuery('');
        setResults([]);
        setHasSearched(false);
    };

    const getFileIcon = (type: string, mime: string) => {
        if (type === 'folder') {
            return <FaFolder className="text-[#ebbd18]" />;
        }
        
        // You can add more specific icons based on mime type
        return <FaFile className="text-gray-500" />;
    };

    if (!isOpen) return null;

    return (
        <div 
            className="fixed inset-0 z-50 flex items-start justify-center pt-20 bg-black/50 backdrop-blur-sm"
            onClick={onClose}
        >
            <div 
                className="w-full max-w-2xl mx-4 bg-white dark:bg-gray-800 rounded-2xl shadow-2xl overflow-hidden animate-in fade-in slide-in-from-top-4 duration-200"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Search Input - More Simple & Attractive */}
                <form onSubmit={handleSearch} className="p-6">
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
                            <FaSearch className="text-gray-400 text-lg" />
                        </div>
                        <input
                            ref={inputRef}
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Cari file atau folder..."
                            className="w-full pl-12 pr-12 py-4 bg-gray-50 dark:bg-gray-700/50 border-2 border-transparent hover:border-[#003a69]/20 focus:border-[#003a69] dark:focus:border-[#ebbd18] rounded-xl text-gray-900 dark:text-white text-lg outline-none placeholder-gray-400 transition-all"
                        />
                        <div className="absolute inset-y-0 right-0 flex items-center pr-3 gap-2">
                            {isLoading && (
                                <FaSpinner className="text-[#003a69] dark:text-[#ebbd18] text-lg animate-spin" />
                            )}
                            <button
                                type="button"
                                onClick={onClose}
                                className="p-2 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors"
                            >
                                <FaTimes className="text-gray-500 dark:text-gray-400" />
                            </button>
                        </div>
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-3 ml-1">
                        💡 Tekan <kbd className="px-2 py-0.5 bg-gray-200 dark:bg-gray-700 rounded text-xs font-semibold">Enter</kbd> untuk mencari
                    </p>
                </form>

                {/* Search Results */}
                <div className="max-h-[60vh] overflow-y-auto border-t border-gray-200 dark:border-gray-700">
                    {isLoading ? (
                        <div className="flex items-center justify-center py-12">
                            <FaSpinner className="text-[#003a69] text-3xl animate-spin" />
                        </div>
                    ) : hasSearched ? (
                        results.length > 0 ? (
                            <div className="divide-y divide-gray-200 dark:divide-gray-700">
                                {results.map((result) => (
                                    <button
                                        key={result.id}
                                        onClick={() => handleResultClick(result)}
                                        className="w-full p-4 flex items-center gap-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-all text-left group"
                                    >
                                        <div className="w-10 h-10 flex items-center justify-center bg-gray-100 dark:bg-gray-700 rounded-lg text-2xl group-hover:scale-110 transition-transform">
                                            {getFileIcon(result.type, result.mime)}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h3 className="font-semibold text-gray-900 dark:text-white truncate group-hover:text-[#003a69] dark:group-hover:text-[#ebbd18] transition-colors">
                                                {result.name}
                                            </h3>
                                            <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400 mt-1">
                                                <span className="px-2 py-0.5 bg-gray-100 dark:bg-gray-700 rounded font-medium">
                                                    {result.type === 'folder' ? 'Folder' : result.extension.toUpperCase()}
                                                </span>
                                                {result.parent_name && result.parent_name !== 'Root' && (
                                                    <>
                                                        <span>•</span>
                                                        <span className="truncate">{result.parent_name}</span>
                                                    </>
                                                )}
                                                <span>•</span>
                                                <span>{result.size}</span>
                                            </div>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center py-12 px-4">
                                <FaSearch className="text-gray-300 text-5xl mb-4" />
                                <p className="text-gray-500 text-center">
                                    Tidak ada hasil untuk &quot;{searchQuery}&quot;
                                </p>
                                <p className="text-gray-400 text-sm text-center mt-2">
                                    Coba kata kunci lain
                                </p>
                            </div>
                        )
                    ) : (
                        <div className="flex flex-col items-center justify-center py-12 px-4">
                            <FaSearch className="text-gray-300 text-5xl mb-4" />
                            <p className="text-gray-500 text-center">
                                Masukkan kata kunci dan tekan Enter untuk mencari
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
