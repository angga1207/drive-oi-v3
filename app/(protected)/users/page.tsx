'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { AdminUser, UsersListResponse } from '@/lib/types';
import Swal from 'sweetalert2';
import {
    HiUsers, HiMagnifyingGlass, HiUserPlus, HiPencil, HiTrash,
    HiLockClosed, HiLockOpen, HiChevronLeft, HiChevronRight,
    HiCheckBadge, HiXCircle, HiChevronUp, HiChevronDown
} from 'react-icons/hi2';
import { FaGoogle } from 'react-icons/fa';

export default function UsersPage() {
    const router = useRouter();
    const [users, setUsers] = useState<AdminUser[]>([]);
    const [stats, setStats] = useState({
        total: 0,
        accessed: 0,
        unaccessed: 0,
        google: 0,
        semesta: 0,
        googleAndSemesta: 0,
        noIntegrated: 0,
    });
    const [currentPage, setCurrentPage] = useState(1);
    const [lastPage, setLastPage] = useState(1);
    const [perPage, setPerPage] = useState(10);
    const [searchParams, setSearchParams] = useState('');
    const [search, setSearch] = useState('');
    const [orderBy, setOrderBy] = useState<'fullname' | 'id' | 'drive_usage'>('id');
    const [orderDirection, setOrderDirection] = useState<'asc' | 'desc'>('desc');
    const [loading, setLoading] = useState(true);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);
    const [createForm, setCreateForm] = useState({
        firstname: '',
        lastname: '',
        email: '',
        username: '',
        capacity: 50,
        password: '',
        password_confirmation: '',
    });
    const [editForm, setEditForm] = useState({
        id: 0,
        firstname: '',
        lastname: '',
        username: '',
        email: '',
        capacity: 50,
    });

    useEffect(() => {
        checkAdminAccess();
        fetchUsers();
    }, [currentPage, perPage, search, orderBy, orderDirection]);

    const checkAdminAccess = async () => {
        try {
            const response = await fetch('/api/session');
            const data = await response.json();

            // Only allow users with id 1 or id 4
            if (!data.user || (data.user.id !== 1 && data.user.id !== 4)) {
                Swal.fire({
                    icon: 'error',
                    title: 'Akses Ditolak',
                    text: 'Anda tidak memiliki akses ke halaman ini',
                    confirmButtonColor: '#003a69',
                }).then(() => {
                    router.push('/dashboard');
                });
            }
        } catch (error) {
            console.error('Error checking admin access:', error);
            router.push('/dashboard');
        }
    };

    const fetchUsers = async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams({
                per_page: perPage.toString(),
                order_by: orderBy,
                order_direction: orderDirection,
                page: currentPage.toString(),
                ...(search && { search }),
            });

            const response = await fetch(`/api/admin/getUsers?${params.toString()}`);
            const data: UsersListResponse = await response.json();

            if (data.status === 'success') {
                setUsers(data.data.data);
                setCurrentPage(data.data.current_page);
                setLastPage(data.data.last_page);
                setStats({
                    total: data.data.total,
                    accessed: data.data.accessed_users_count,
                    unaccessed: data.data.unaccessed_users_count,
                    google: data.data.google_users_count,
                    semesta: data.data.semesta_users_count,
                    googleAndSemesta: data.data.google_and_semesta_users_count,
                    noIntegrated: data.data.no_integrated_users_count,
                });
            }
        } catch (error) {
            console.error('Error fetching users:', error);
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'Gagal memuat data pengguna',
                confirmButtonColor: '#003a69',
            });
        } finally {
            setLoading(false);
        }
    };

    const handleSort = (column: 'fullname' | 'drive_usage') => {
        if (orderBy === column) {
            setOrderDirection(orderDirection === 'asc' ? 'desc' : 'asc');
        } else {
            setOrderBy(column);
            setOrderDirection('asc');
        }
    };

    const handleCreateUser = async (e: React.FormEvent) => {
        e.preventDefault();

        if (createForm.password !== createForm.password_confirmation) {
            Swal.fire({
                icon: 'error',
                title: 'Password Tidak Cocok',
                text: 'Password dan konfirmasi password harus sama',
                confirmButtonColor: '#003a69',
            });
            return;
        }

        try {
            const response = await fetch('/api/admin/createUser', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(createForm),
            });

            const data = await response.json();

            if (data.status === 'success') {
                await Swal.fire({
                    icon: 'success',
                    title: 'Berhasil!',
                    text: 'Pengguna berhasil ditambahkan',
                    confirmButtonColor: '#003a69',
                    timer: 2000,
                });
                setShowCreateModal(false);
                setCreateForm({
                    firstname: '',
                    lastname: '',
                    email: '',
                    username: '',
                    capacity: 50,
                    password: '',
                    password_confirmation: '',
                });
                fetchUsers();
            } else {
                Swal.fire({
                    icon: 'error',
                    title: 'Gagal',
                    text: data.message || 'Gagal menambahkan pengguna',
                    confirmButtonColor: '#003a69',
                });
            }
        } catch (error) {
            console.error('Error creating user:', error);
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'Terjadi kesalahan saat menambahkan pengguna',
                confirmButtonColor: '#003a69',
            });
        }
    };

    const handleEditUser = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            const response = await fetch(`/api/admin/updateUser/${editForm.id}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(editForm),
            });


            const data = await response.json();

            if (data.status === 'success') {
                await Swal.fire({
                    icon: 'success',
                    title: 'Berhasil!',
                    text: 'Pengguna berhasil diperbarui',
                    confirmButtonColor: '#003a69',
                    timer: 2000,
                });
                setShowEditModal(false);
                setSelectedUser(null);
                fetchUsers();
            } else {
                Swal.fire({
                    icon: 'error',
                    title: 'Gagal',
                    text: data.message || 'Gagal memperbarui pengguna',
                    confirmButtonColor: '#003a69',
                });
            }
        } catch (error) {
            console.error('Error updating user:', error);
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'Terjadi kesalahan saat memperbarui pengguna',
                confirmButtonColor: '#003a69',
            });
        }
    };

    const handleToggleAccess = async (user: AdminUser) => {
        const result = await Swal.fire({
            icon: 'warning',
            title: `${user.access ? 'Nonaktifkan' : 'Aktifkan'} Akses?`,
            text: `Apakah Anda yakin ingin ${user.access ? 'menonaktifkan' : 'mengaktifkan'} akses untuk ${user.fullname}?`,
            showCancelButton: true,
            confirmButtonColor: user.access ? '#dc2626' : '#16a34a',
            cancelButtonColor: '#6b7280',
            confirmButtonText: 'Ya, Lanjutkan',
            cancelButtonText: 'Batal',
        });

        if (result.isConfirmed) {
            try {
                const response = await fetch(`/api/admin/updateUserAccess/${user.id}`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ access: user.access ? 0 : 1 }),
                });

                const data = await response.json();

                if (data.status === 'success') {
                    await Swal.fire({
                        icon: 'success',
                        title: 'Berhasil!',
                        text: `Akses berhasil ${user.access ? 'dinonaktifkan' : 'diaktifkan'}`,
                        confirmButtonColor: '#003a69',
                        timer: 2000,
                    });
                    fetchUsers();
                } else {
                    Swal.fire({
                        icon: 'error',
                        title: 'Gagal',
                        text: data.message || 'Gagal mengubah akses pengguna',
                        confirmButtonColor: '#003a69',
                    });
                }
            } catch (error) {
                console.error('Error toggling access:', error);
                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: 'Terjadi kesalahan saat mengubah akses pengguna',
                    confirmButtonColor: '#003a69',
                });
            }
        }
    };

    const handleDeleteUser = async (user: AdminUser) => {
        const result = await Swal.fire({
            icon: 'warning',
            title: 'Hapus Pengguna?',
            html: `Apakah Anda yakin ingin menghapus pengguna <strong>${user.fullname}</strong>?<br/><small class="text-red-600">Tindakan ini tidak dapat dibatalkan!</small>`,
            showCancelButton: true,
            confirmButtonColor: '#dc2626',
            cancelButtonColor: '#6b7280',
            confirmButtonText: 'Ya, Hapus',
            cancelButtonText: 'Batal',
        });

        if (result.isConfirmed) {
            try {
                const response = await fetch(`/api/admin/deleteUser/${user.id}`, {
                    method: 'DELETE',
                });

                const data = await response.json();

                if (data.status === 'success') {
                    await Swal.fire({
                        icon: 'success',
                        title: 'Berhasil!',
                        text: 'Pengguna berhasil dihapus',
                        confirmButtonColor: '#003a69',
                        timer: 2000,
                    });
                    fetchUsers();
                } else {
                    Swal.fire({
                        icon: 'error',
                        title: 'Gagal',
                        text: data.message || 'Gagal menghapus pengguna',
                        confirmButtonColor: '#003a69',
                    });
                }
            } catch (error) {
                console.error('Error deleting user:', error);
                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: 'Terjadi kesalahan saat menghapus pengguna',
                    confirmButtonColor: '#003a69',
                });
            }
        }
    };

    const openEditModal = (user: AdminUser) => {
        setSelectedUser(user);
        setEditForm({
            id: user.id,
            firstname: user.firstname,
            lastname: user.lastname,
            username: user.username,
            email: user.email,
            capacity: user.storage.total_raw,
        });
        setShowEditModal(true);
    };

    if (loading && users.length === 0) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                    <p className="text-gray-600 dark:text-gray-400">Memuat data pengguna...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6 pb-8">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2 flex items-center gap-3">
                        <HiUsers className="w-8 h-8 text-primary" />
                        Manajemen Pengguna
                    </h1>
                    <p className="text-gray-600 dark:text-gray-400">
                        Kelola pengguna Drive Ogan Ilir
                    </p>
                </div>
                <button
                    onClick={() => setShowCreateModal(true)}
                    className="flex items-center gap-2 px-6 py-3 bg-primary hover:bg-primary-dark text-white rounded-xl font-semibold transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105"
                >
                    <HiUserPlus className="w-5 h-5" />
                    Tambah Pengguna
                </button>
            </div>

            {/* Statistics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600 dark:text-gray-400">Total Pengguna</p>
                                <p className="text-2xl font-bold text-primary">{stats.total}</p>
                            </div>
                            <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center">
                                <HiUsers className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600 dark:text-gray-400">Terintegrasi Semesta</p>
                                <p className="text-2xl font-bold text-purple-600">{stats.semesta}</p>
                            </div>
                            <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-xl flex items-center justify-center">
                                <HiCheckBadge className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600 dark:text-gray-400">Terintegrasi Google</p>
                                <p className="text-2xl font-bold text-red-600">{stats.google}</p>
                            </div>
                            <div className="w-12 h-12 bg-red-100 dark:bg-red-900/30 rounded-xl flex items-center justify-center">
                                <FaGoogle className="w-6 h-6 text-red-600 dark:text-red-400" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600 dark:text-gray-400">Google & Semesta</p>
                                <p className="text-2xl font-bold text-indigo-600">{stats.googleAndSemesta}</p>
                            </div>
                            <div className="w-12 h-12 bg-indigo-100 dark:bg-indigo-900/30 rounded-xl flex items-center justify-center">
                                <HiCheckBadge className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600 dark:text-gray-400">Tidak Terintegrasi</p>
                                <p className="text-2xl font-bold text-gray-600">{stats.noIntegrated}</p>
                            </div>
                            <div className="w-12 h-12 bg-gray-100 dark:bg-gray-700 rounded-xl flex items-center justify-center">
                                <HiXCircle className="w-6 h-6 text-gray-600 dark:text-gray-400" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600 dark:text-gray-400">Dengan Akses</p>
                                <p className="text-2xl font-bold text-green-600">{stats.accessed}</p>
                            </div>
                            <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-xl flex items-center justify-center">
                                <HiLockOpen className="w-6 h-6 text-green-600 dark:text-green-400" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600 dark:text-gray-400">Tanpa Akses</p>
                                <p className="text-2xl font-bold text-orange-600">{stats.unaccessed}</p>
                            </div>
                            <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900/30 rounded-xl flex items-center justify-center">
                                <HiLockClosed className="w-6 h-6 text-orange-600 dark:text-orange-400" />
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Filters and Search */}
            <Card>
                <CardContent className="p-6">
                    <div className="flex items-center gap-4">
                        {/* Search */}
                        <div className="flex-1">
                            <div className="relative">
                                <HiMagnifyingGlass className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                <input
                                    type="search"
                                    value={searchParams}
                                    onChange={(e) => {
                                        setSearchParams(e.target.value);
                                        if (e.target.value === '') {
                                            setSearch('');
                                            setCurrentPage(1);
                                        }
                                    }}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter') {
                                            setSearch(searchParams);
                                            setCurrentPage(1);
                                        }
                                    }}
                                    placeholder="Cari nama, email, atau username..."
                                    className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent"
                                />
                            </div>
                        </div>

                        {/* Per Page */}
                        <div>
                            <select
                                value={perPage}
                                onChange={(e) => {
                                    setPerPage(parseInt(e.target.value));
                                    setCurrentPage(1);
                                }}
                                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent"
                            >
                                <option value="10">10 per halaman</option>
                                <option value="25">25 per halaman</option>
                                <option value="50">50 per halaman</option>
                                <option value="100">100 per halaman</option>
                            </select>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Users Table */}
            <Card>
                <CardHeader>
                    <CardTitle>Daftar Pengguna</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
                                <tr>
                                    <th
                                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors select-none"
                                        onClick={() => handleSort('fullname')}
                                    >
                                        <div className="flex items-center gap-2">
                                            <span>Pengguna</span>
                                            {orderBy === 'fullname' && (
                                                orderDirection === 'asc' ? (
                                                    <HiChevronUp className="w-4 h-4" />
                                                ) : (
                                                    <HiChevronDown className="w-4 h-4" />
                                                )
                                            )}
                                        </div>
                                    </th>
                                    <th
                                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors select-none"
                                        onClick={() => handleSort('drive_usage')}
                                    >
                                        <div className="flex items-center gap-2">
                                            <span>Storage</span>
                                            {orderBy === 'drive_usage' && (
                                                orderDirection === 'asc' ? (
                                                    <HiChevronUp className="w-4 h-4" />
                                                ) : (
                                                    <HiChevronDown className="w-4 h-4" />
                                                )
                                            )}
                                        </div>
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                        Data
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                        Integrasi
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                        Status
                                    </th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                        Aksi
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
                                {users.map((user) => (
                                    <tr key={user.id} className="hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center gap-3">
                                                <img
                                                    src={user.photo}
                                                    onError={(e) => {
                                                        e.currentTarget.src = '/logo-oi.webp';
                                                    }}
                                                    alt={user.fullname}
                                                    className="w-10 h-10 rounded-full object-cover"
                                                />
                                                <div>
                                                    <div className="text-sm font-medium text-gray-900 dark:text-white">
                                                        {user.fullname}
                                                    </div>
                                                    <div className="text-sm text-gray-500 dark:text-gray-400">
                                                        @{user.username}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm text-gray-900 dark:text-white">
                                                {user.storage.used} / {user.storage.total}
                                            </div>
                                            <div className="w-24 h-2 bg-gray-200 dark:bg-gray-700 rounded-full mt-1">
                                                <div
                                                    className="h-full bg-primary rounded-full transition-all"
                                                    style={{ width: `${Math.min(user.storage.percent, 100)}%` }}
                                                ></div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm text-gray-900 dark:text-white">
                                                {user.datas.files} files
                                            </div>
                                            <div className="text-sm text-gray-500 dark:text-gray-400">
                                                {user.datas.folders} folders
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex gap-1">
                                                {user.googleIntegated && (
                                                    <span className="px-2 py-1 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 text-xs rounded-full">
                                                        Google
                                                    </span>
                                                )}
                                                {user.semestaIntegrated && (
                                                    <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-xs rounded-full">
                                                        Semesta
                                                    </span>
                                                )}
                                                {!user.googleIntegated && !user.semestaIntegrated && (
                                                    <span className="text-gray-400 text-xs">-</span>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span
                                                className={`px-3 py-1 rounded-full text-xs font-medium ${user.access
                                                    ? 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400'
                                                    : 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400'
                                                    }`}
                                            >
                                                {user.access ? 'Aktif' : 'Nonaktif'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            <div className="flex items-center justify-end gap-2">
                                                <button
                                                    onClick={() => openEditModal(user)}
                                                    className="p-2 text-blue-600 hover:bg-blue-100 dark:hover:bg-blue-900/30 rounded-lg transition-colors"
                                                    title="Edit"
                                                >
                                                    <HiPencil className="w-5 h-5" />
                                                </button>
                                                <button
                                                    onClick={() => handleToggleAccess(user)}
                                                    className={`p-2 rounded-lg transition-colors ${user.access
                                                        ? 'text-orange-600 hover:bg-orange-100 dark:hover:bg-orange-900/30'
                                                        : 'text-green-600 hover:bg-green-100 dark:hover:bg-green-900/30'
                                                        }`}
                                                    title={user.access ? 'Nonaktifkan' : 'Aktifkan'}
                                                >
                                                    {user.access ? <HiLockClosed className="w-5 h-5" /> : <HiLockOpen className="w-5 h-5" />}
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteUser(user)}
                                                    className="p-2 text-red-600 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-lg transition-colors"
                                                    title="Hapus"
                                                >
                                                    <HiTrash className="w-5 h-5" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    {lastPage > 1 && (
                        <div className="px-6 py-4 bg-gray-50 dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
                            <div className="flex items-center justify-between">
                                <div className="text-sm text-gray-600 dark:text-gray-400">
                                    Menampilkan {users.length} dari {stats.total} pengguna
                                </div>
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => setCurrentPage(currentPage - 1)}
                                        disabled={currentPage === 1}
                                        className="p-2 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                    >
                                        <HiChevronLeft className="w-5 h-5" />
                                    </button>
                                    <span className="text-sm text-gray-600 dark:text-gray-400">
                                        Halaman {currentPage} dari {lastPage}
                                    </span>
                                    <button
                                        onClick={() => setCurrentPage(currentPage + 1)}
                                        disabled={currentPage === lastPage}
                                        className="p-2 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                    >
                                        <HiChevronRight className="w-5 h-5" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Create User Modal */}
            {showCreateModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4">
                            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Tambah Pengguna Baru</h2>
                        </div>

                        <form onSubmit={handleCreateUser} className="p-6 space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        Nama Depan <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        value={createForm.firstname}
                                        placeholder='Nama Depan'
                                        onChange={(e) => setCreateForm({ ...createForm, firstname: e.target.value })}
                                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        Nama Belakang <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        value={createForm.lastname}
                                        placeholder='Nama Belakang'
                                        onChange={(e) => setCreateForm({ ...createForm, lastname: e.target.value })}
                                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent"
                                        required
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Email <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="email"
                                    value={createForm.email}
                                    placeholder='Email'
                                    autoComplete='new-email'
                                    onChange={(e) => setCreateForm({ ...createForm, email: e.target.value })}
                                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Username <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    value={createForm.username}
                                    placeholder='Username'
                                    autoComplete='new-username'
                                    onChange={(e) => setCreateForm({ ...createForm, username: e.target.value })}
                                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Kapasitas Storage (GB) <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="number"
                                    value={createForm.capacity}
                                    onChange={(e) => setCreateForm({ ...createForm, capacity: parseInt(e.target.value) })}
                                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent"
                                    min="1"
                                    required
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        Password <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="password"
                                        value={createForm.password}
                                        placeholder='Password'
                                        autoComplete='new-password'
                                        onChange={(e) => setCreateForm({ ...createForm, password: e.target.value })}
                                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        Konfirmasi Password <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="password"
                                        value={createForm.password_confirmation}
                                        placeholder='Konfirmasi Password'
                                        autoComplete='new-password-confirmation'
                                        onChange={(e) => setCreateForm({ ...createForm, password_confirmation: e.target.value })}
                                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="flex gap-3 pt-4">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setShowCreateModal(false);
                                        setCreateForm({
                                            firstname: '',
                                            lastname: '',
                                            email: '',
                                            username: '',
                                            capacity: 50,
                                            password: '',
                                            password_confirmation: '',
                                        });
                                    }}
                                    className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                                >
                                    Batal
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 px-4 py-2 bg-primary hover:bg-primary-dark text-white rounded-lg transition-colors"
                                >
                                    Tambah Pengguna
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Edit User Modal */}
            {showEditModal && selectedUser && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4">
                            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Edit Pengguna</h2>
                        </div>

                        <form onSubmit={handleEditUser} className="p-6 space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        Nama Depan <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        value={editForm.firstname}
                                        placeholder='Nama Depan'
                                        onChange={(e) => setEditForm({ ...editForm, firstname: e.target.value })}
                                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        Nama Belakang <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        value={editForm.lastname}
                                        placeholder='Nama Belakang'
                                        onChange={(e) => setEditForm({ ...editForm, lastname: e.target.value })}
                                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent"
                                        required
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Email <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="email"
                                    value={editForm.email}
                                    placeholder='Email'
                                    autoComplete='new-email'
                                    onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Kapasitas Storage (GB) <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="number"
                                    value={editForm.capacity}
                                    onChange={(e) => setEditForm({ ...editForm, capacity: parseInt(e.target.value) })}
                                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent"
                                    min="1"
                                    required
                                />
                            </div>

                            <div className="flex gap-3 pt-4">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setShowEditModal(false);
                                        setSelectedUser(null);
                                    }}
                                    className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                                >
                                    Batal
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 px-4 py-2 bg-primary hover:bg-primary-dark text-white rounded-lg transition-colors"
                                >
                                    Simpan Perubahan
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
