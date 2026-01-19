'use client';

import { useState, useRef, useEffect } from 'react';
import { FaUser, FaStar, FaRegStar, FaShareAlt, FaEdit, FaTrash, FaDownload, FaEye, FaCopy } from 'react-icons/fa';
import { HiDotsVertical } from 'react-icons/hi';
import Swal from 'sweetalert2';
import Tippy from '@tippyjs/react';
import 'tippy.js/dist/tippy.css';

interface FileActionMenuProps {
    item: any;
    onFavorite?: (slug: string) => void;
    onShare: (item: any) => void;
    onRename: (item: any) => void;
    onDelete: (item: any) => void;
    onDownload?: (item: any) => void;
    onOpen?: (item: any) => void;
    onMenuToggle?: (isOpen: boolean) => void;
    onRefresh?: () => void;
    isFavorite?: boolean;
    hideMove?: boolean;
}

export default function FileActionMenu({
    item,
    onFavorite,
    onShare,
    onRename,
    onDelete,
    onDownload,
    onOpen,
    onMenuToggle,
    onRefresh,
    isFavorite = false,
    hideMove = false,
}: FileActionMenuProps) {
    const [isOpen, setIsOpen] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);

    // Notify parent when menu is toggled
    useEffect(() => {
        if (onMenuToggle) {
            onMenuToggle(isOpen);
        }
    }, [isOpen, onMenuToggle]);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isOpen]);

    const handleDelete = () => {
        setIsOpen(false);
        Swal.fire({
            title: 'Hapus ' + (item.type === 'folder' ? 'Folder' : 'File') + '?',
            text: `Apakah Anda yakin ingin menghapus "${item.name}"? Item ini akan dipindahkan ke kotak sampah.`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#dc2626',
            cancelButtonColor: '#6b7280',
            confirmButtonText: 'Ya, Hapus!',
            cancelButtonText: 'Batal',
            background: '#fff',
            customClass: {
                popup: 'rounded-xl',
                confirmButton: 'rounded-lg px-6 py-2.5 font-semibold',
                cancelButton: 'rounded-lg px-6 py-2.5 font-semibold',
            },
        }).then((result) => {
            if (result.isConfirmed) {
                onDelete(item);
            }
        });
    };

    const handleToggleFavorite = () => {
        setIsOpen(false);

        if (!onFavorite) return;

        // Call the parent's onFavorite handler
        // Parent component (FilesListClient or FavoriteListClient) will handle the API call
        if (onRefresh) {
            onRefresh();
        } else {
            onFavorite(item.slug);
        }
    };

    const handleCopyLink = async () => {
        setIsOpen(false);
        const baseUrl = process.env.NEXT_PUBLIC_APP_URL || window.location.origin;
        const shareLink = `${baseUrl}/sharer?_id=${item.slug}`;

        try {
            await navigator.clipboard.writeText(shareLink);
            await Swal.fire({
                title: 'Berhasil!',
                text: 'Link berhasil disalin ke clipboard',
                icon: 'success',
                timer: 1500,
                showConfirmButton: false,
                customClass: {
                    popup: 'rounded-xl',
                },
            });
        } catch (err) {
            await Swal.fire({
                title: 'Gagal!',
                text: 'Gagal menyalin link',
                icon: 'error',
                confirmButtonText: 'OK',
                customClass: {
                    popup: 'rounded-xl',
                },
            });
        }
    };

    const menuItems = item.type === 'folder'
        ? [
            !isFavorite && {
                label: item.author.fullname,
                icon: <FaUser className="w-4 h-4" />,
                image: <img src={item.author.photo} alt={item.author.fullname} className="w-4 h-4 rounded-full" />,
                onClick: () => { },
                disabled: true,
                className: 'text-gray-500 cursor-default',
            },
            !isFavorite && { type: 'divider' },
            onFavorite && {
                label: isFavorite ? 'Hapus dari Favorit' : (item.favorite ? 'Hapus dari Favorit' : 'Tambah ke Favorit'),
                icon: (isFavorite || item.favorite) ? <FaStar className="w-4 h-4 text-[#ebbd18]" /> : <FaRegStar className="w-4 h-4" />,
                onClick: handleToggleFavorite,
            },
            {
                label: 'Bagikan Folder',
                icon: <FaShareAlt className="w-4 h-4" />,
                onClick: () => {
                    setIsOpen(false);
                    onShare(item);
                },
            }, item.publicity?.status === 'public' && {
                label: 'Salin Link',
                icon: <FaCopy className="w-4 h-4" />,
                onClick: handleCopyLink,
                className: 'text-[#ebbd18] hover:bg-[#ebbd18]/10',
            }, {
                label: 'Ganti Nama',
                icon: <FaEdit className="w-4 h-4" />,
                onClick: () => {
                    setIsOpen(false);
                    onRename(item);
                },
            },
            { type: 'divider' },
            {
                label: 'Hapus Folder',
                icon: <FaTrash className="w-4 h-4" />,
                onClick: handleDelete,
                className: 'text-red-600 hover:bg-red-50',
            },
        ].filter(Boolean)
        : [
            !isFavorite && {
                label: item.author.fullname,
                icon: <FaUser className="w-4 h-4" />,
                image: <img src={item.author.photo} alt={item.author.fullname} className="w-4 h-4 rounded-full" />,
                onClick: () => { },
                disabled: true,
                className: 'text-gray-500 cursor-default',
            },
            !isFavorite && { type: 'divider' },
            {
                label: 'Buka Berkas',
                icon: <FaEye className="w-4 h-4" />,
                onClick: () => {
                    setIsOpen(false);
                    if (onOpen) onOpen(item);
                },
            },
            onFavorite && {
                label: isFavorite ? 'Hapus dari Favorit' : (item.favorite ? 'Hapus dari Favorit' : 'Tambah ke Favorit'),
                icon: (isFavorite || item.favorite) ? <FaStar className="w-4 h-4 text-[#ebbd18]" /> : <FaRegStar className="w-4 h-4" />,
                onClick: handleToggleFavorite,
            },
            {
                label: 'Bagikan File',
                icon: <FaShareAlt className="w-4 h-4" />,
                onClick: () => {
                    setIsOpen(false);
                    onShare(item);
                },
            },
            item.publicity?.status === 'public' && {
                label: 'Salin Link',
                icon: <FaCopy className="w-4 h-4" />,
                onClick: handleCopyLink,
                className: 'text-[#ebbd18] hover:bg-[#ebbd18]/10',
            },
            {
                label: 'Ganti Nama',
                icon: <FaEdit className="w-4 h-4" />,
                onClick: () => {
                    setIsOpen(false);
                    onRename(item);
                },
            },
            {
                label: 'Unduh File',
                icon: <FaDownload className="w-4 h-4" />,
                onClick: () => {
                    setIsOpen(false);
                    if (onDownload) onDownload(item);
                },
            },
            { type: 'divider' },
            {
                label: 'Hapus File',
                icon: <FaTrash className="w-4 h-4" />,
                onClick: handleDelete,
                className: 'text-red-600 hover:bg-red-50',
            },
        ].filter(Boolean);

    // Filter out divider and disabled items for desktop view
    const actionButtons = menuItems.filter((item: any) => item.type !== 'divider');

    return (
        <>
            {/* Desktop View: Icon buttons with tooltips */}
            <div className="hidden lg:flex items-center gap-1">
                {actionButtons.map((menuItem: any, index) => (
                    <Tippy key={index} content={menuItem.label} placement="top">
                        <div className='h-8'>
                            <button
                                onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    menuItem.onClick();
                                }}
                                className={`p-2 rounded-lg transition-colors cursor-pointer ${menuItem.className?.includes('text-red')
                                    ? 'hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600'
                                    : 'hover:bg-[#003a69]/10 dark:hover:bg-[#003a69]/20 text-gray-600 dark:text-gray-400'
                                    }`}
                            >
                                {menuItem.image ? menuItem.image : menuItem.icon}
                            </button>
                        </div>
                    </Tippy>
                ))}
            </div>

            {/* Mobile & Tablet View: Dropdown menu */}
            <div className="lg:hidden relative z-100" ref={menuRef}>
                <button
                    onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setIsOpen(!isOpen);
                    }}
                    className="p-2 hover:bg-[#003a69]/10 rounded-lg transition-colors"
                >
                    <HiDotsVertical className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                </button>

                {isOpen && (
                    <div className="absolute right-0 top-full mt-1 w-56 bg-white dark:bg-gray-800 rounded-xl shadow-2xl border-2 border-[#ebbd18]/20 z-100 overflow-hidden">
                        <div className="py-1">
                            {menuItems.map((menuItem: any, index) => {
                                if (menuItem.type === 'divider') {
                                    return (
                                        <div
                                            key={`divider-${index}`}
                                            className="my-1 border-t border-gray-200 dark:border-gray-700"
                                        />
                                    );
                                }

                                return (
                                    <button
                                        key={index}
                                        onClick={(e) => {
                                            e.preventDefault();
                                            e.stopPropagation();
                                            if (!menuItem.disabled) {
                                                menuItem.onClick();
                                            }
                                        }}
                                        disabled={menuItem.disabled}
                                        className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm font-medium transition-colors ${menuItem.className ||
                                            'text-gray-700 dark:text-gray-300 hover:bg-[#ebbd18]/10 dark:hover:bg-[#ebbd18]/20'
                                            } ${menuItem.disabled ? 'opacity-60' : ''}`}
                                    >
                                        {menuItem.icon}
                                        <span>{menuItem.label}</span>
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                )}
            </div>
        </>
    );
}
