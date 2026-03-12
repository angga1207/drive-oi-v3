'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { AdminUser, UsersListResponse } from '@/lib/types';
import Swal from 'sweetalert2';
import {
    HiUsers, HiMagnifyingGlass, HiUserPlus, HiPencil, HiTrash,
    HiLockClosed, HiLockOpen, HiChevronLeft, HiChevronRight,
    HiCheckBadge, HiXCircle, HiChevronUp, HiChevronDown,
    HiEye, HiEyeSlash, HiXMark,
    HiFolder, HiDocument, HiShare, HiServerStack,
    HiShieldCheck, HiShieldExclamation,
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
    const [showCreatePassword, setShowCreatePassword] = useState(false);
    const [showCreateConfirmPassword, setShowCreateConfirmPassword] = useState(false);
    const [showEditPassword, setShowEditPassword] = useState(false);
    const [showEditConfirmPassword, setShowEditConfirmPassword] = useState(false);
    const [editPasswordError, setEditPasswordError] = useState('');
    const [createPasswordError, setCreatePasswordError] = useState('');
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
        password: '',
        password_confirmation: '',
    });

    useEffect(() => {
        checkAdminAccess();
        fetchUsers();
    }, [currentPage, perPage, search, orderBy, orderDirection]);

    const checkAdminAccess = async () => {
        try {
            const response = await fetch('/api/session');
            const data = await response.json();

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

    const validateCreateFormPassword = (): boolean => {
        if (createForm.password.length < 6) {
            setCreatePasswordError('Password minimal 6 karakter');
            return false;
        }
        if (createForm.password !== createForm.password_confirmation) {
            setCreatePasswordError('Password dan konfirmasi password tidak cocok');
            return false;
        }
        setCreatePasswordError('');
        return true;
    };

    const validateEditFormPassword = (): boolean => {
        if (editForm.password && editForm.password.length < 6) {
            setEditPasswordError('Password minimal 6 karakter');
            return false;
        }
        if (editForm.password !== editForm.password_confirmation) {
            setEditPasswordError('Password dan konfirmasi password tidak cocok');
            return false;
        }
        setEditPasswordError('');
        return true;
    };

    const handleCreateUser = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateCreateFormPassword()) return;

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
                setCreatePasswordError('');
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

        if (!validateEditFormPassword()) return;

        try {
            // Only send password fields if password is filled
            const payload: any = {
                id: editForm.id,
                firstname: editForm.firstname,
                lastname: editForm.lastname,
                email: editForm.email,
                capacity: editForm.capacity,
            };

            if (editForm.password) {
                payload.password = editForm.password;
                payload.password_confirmation = editForm.password_confirmation;
            }

            const response = await fetch(`/api/admin/updateUser/${editForm.id}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
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
                setEditPasswordError('');
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
            password: '',
            password_confirmation: '',
        });
        setEditPasswordError('');
        setShowEditPassword(false);
        setShowEditConfirmPassword(false);
        setShowEditModal(true);
    };

    const getStorageBarColor = (percent: number) => {
        if (percent >= 90) return 'bg-red-500';
        if (percent >= 70) return 'bg-amber-500';
        return 'bg-emerald-500';
    };

    if (loading && users.length === 0) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <div className="relative w-20 h-20 mx-auto mb-6">
                        <div className="absolute inset-0 rounded-full border-4 border-gray-200 dark:border-gray-700"></div>
                        <div className="absolute inset-0 rounded-full border-4 border-t-primary border-r-transparent border-b-transparent border-l-transparent animate-spin"></div>
                        <HiUsers className="absolute inset-0 m-auto w-8 h-8 text-primary/60" />
                    </div>
                    <p className="text-gray-500 dark:text-gray-400 font-medium">Memuat data pengguna...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6 pb-8 select-none">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white flex items-center gap-3">
                        <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-primary to-[#005a9c] flex items-center justify-center shadow-lg shadow-primary/20">
                            <HiUsers className="w-6 h-6 text-white" />
                        </div>
                        Manajemen Pengguna
                    </h1>
                    <p className="text-gray-500 dark:text-gray-400 mt-1 ml-14">
                        Kelola {stats.total} pengguna Drive Ogan Ilir
                    </p>
                </div>
                <button
                    onClick={() => {
                        setShowCreateModal(true);
                        setShowCreatePassword(false);
                        setShowCreateConfirmPassword(false);
                        setCreatePasswordError('');
                    }}
                    className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-primary to-[#005a9c] hover:from-[#002d52] hover:to-primary text-white rounded-xl font-semibold transition-all duration-300 shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 active:scale-[0.98]"
                >
                    <HiUserPlus className="w-5 h-5" />
                    Tambah Pengguna
                </button>
            </div>

            {/* Statistics row */}
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
                {[
                    { label: 'Total', value: stats.total, icon: HiUsers, color: 'blue', gradient: 'from-blue-500 to-blue-600' },
                    { label: 'Aktif', value: stats.accessed, icon: HiShieldCheck, color: 'emerald', gradient: 'from-emerald-500 to-emerald-600' },
                    { label: 'Nonaktif', value: stats.unaccessed, icon: HiShieldExclamation, color: 'amber', gradient: 'from-amber-500 to-amber-600' },
                    { label: 'Google', value: stats.google, icon: FaGoogle, color: 'red', gradient: 'from-red-500 to-red-600' },
                    { label: 'Semesta', value: stats.semesta, icon: HiCheckBadge, color: 'purple', gradient: 'from-purple-500 to-purple-600' },
                    { label: 'Keduanya', value: stats.googleAndSemesta, icon: HiCheckBadge, color: 'indigo', gradient: 'from-indigo-500 to-indigo-600' },
                    { label: 'Tanpa', value: stats.noIntegrated, icon: HiXCircle, color: 'gray', gradient: 'from-gray-400 to-gray-500' },
                ].map((stat) => (
                    <div
                        key={stat.label}
                        className="group relative bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700/60 p-3 hover:border-gray-200 dark:hover:border-gray-600 transition-all duration-200 overflow-hidden"
                    >
                        <div className={`absolute top-0 left-0 w-full h-0.5 bg-gradient-to-r ${stat.gradient}`}></div>
                        <div className="flex items-center gap-2.5">
                            <div className={`w-9 h-9 rounded-lg bg-${stat.color}-50 dark:bg-${stat.color}-900/20 flex items-center justify-center shrink-0`}>
                                <stat.icon className={`w-4.5 h-4.5 text-${stat.color}-500 dark:text-${stat.color}-400`} />
                            </div>
                            <div className="min-w-0">
                                <p className={`text-xl font-bold text-${stat.color}-600 dark:text-${stat.color}-400 leading-tight`}>{stat.value}</p>
                                <p className="text-[11px] text-gray-500 dark:text-gray-400 truncate">{stat.label}</p>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Search + Filter Bar */}
            <div className="flex flex-col sm:flex-row gap-3">
                <div className="flex-1 relative">
                    <HiMagnifyingGlass className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
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
                        className="w-full pl-11 pr-4 py-2.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all outline-none placeholder:text-gray-400"
                    />
                </div>
                <select
                    value={perPage}
                    onChange={(e) => {
                        setPerPage(parseInt(e.target.value));
                        setCurrentPage(1);
                    }}
                    className="px-4 py-2.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-700 dark:text-gray-300 text-sm focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all outline-none cursor-pointer"
                >
                    <option value="10">10 / halaman</option>
                    <option value="25">25 / halaman</option>
                    <option value="50">50 / halaman</option>
                    <option value="100">100 / halaman</option>
                </select>
            </div>

            {/* Users Card List */}
            <div className="space-y-3">
                {/* Column Headers (desktop) */}
                <div className="hidden lg:grid lg:grid-cols-[1fr_160px_150px_120px_90px_110px] gap-4 px-5 py-2.5 text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider">
                    <button className="flex items-center gap-1 hover:text-gray-600 dark:hover:text-gray-300 transition-colors text-left" onClick={() => handleSort('fullname')}>
                        Pengguna
                        {orderBy === 'fullname' && (orderDirection === 'asc' ? <HiChevronUp className="w-3.5 h-3.5" /> : <HiChevronDown className="w-3.5 h-3.5" />)}
                    </button>
                    <button className="flex items-center gap-1 hover:text-gray-600 dark:hover:text-gray-300 transition-colors text-left" onClick={() => handleSort('drive_usage')}>
                        Storage
                        {orderBy === 'drive_usage' && (orderDirection === 'asc' ? <HiChevronUp className="w-3.5 h-3.5" /> : <HiChevronDown className="w-3.5 h-3.5" />)}
                    </button>
                    <span>Data</span>
                    <span>Integrasi</span>
                    <span>Status</span>
                    <span className="text-right">Aksi</span>
                </div>

                {/* User Items */}
                {users.map((user) => (
                    <div
                        key={user.id}
                        className={`group bg-white dark:bg-gray-800 rounded-xl border transition-all duration-200 hover:shadow-md ${user.access
                            ? 'border-gray-100 dark:border-gray-700/60 hover:border-gray-200 dark:hover:border-gray-600'
                            : 'border-red-100 dark:border-red-900/30 bg-red-50/30 dark:bg-red-950/10'
                            }`}
                    >
                        {/* Desktop layout */}
                        <div className="hidden lg:grid lg:grid-cols-[1fr_160px_150px_120px_90px_110px] gap-4 items-center px-5 py-3.5">
                            {/* User info */}
                            <div className="flex items-center gap-3 min-w-0">
                                <div className="relative shrink-0">
                                    <img
                                        src={user.photo}
                                        onError={(e) => { e.currentTarget.src = '/favicon.png'; }}
                                        alt={user.fullname}
                                        className="w-10 h-10 rounded-full object-contain ring-2 ring-gray-100 dark:ring-gray-700"
                                    />
                                    <div className={`absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full border-2 border-white dark:border-gray-800 ${user.access ? 'bg-emerald-400' : 'bg-gray-300 dark:bg-gray-600'}`}></div>
                                </div>
                                <div className="min-w-0">
                                    <h3 className="text-sm font-semibold text-gray-900 dark:text-white truncate">{user.fullname}</h3>
                                    <p className="text-xs text-gray-400 dark:text-gray-500 truncate">@{user.username} · {user.email}</p>
                                </div>
                            </div>

                            {/* Storage */}
                            <div>
                                <div className="flex items-center justify-between text-xs mb-1">
                                    <span className="text-gray-500 dark:text-gray-400 font-medium">{user.storage.used}</span>
                                    <span className="text-gray-400 dark:text-gray-500">{user.storage.total}</span>
                                </div>
                                <div className="w-full h-1.5 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                                    <div
                                        className={`h-full rounded-full ${getStorageBarColor(user.storage.percent)} transition-all duration-500`}
                                        style={{ width: `${Math.min(user.storage.percent, 100)}%` }}
                                    ></div>
                                </div>
                                <p className="text-xs font-semibold text-gray-400 mt-0.5">{new Intl.NumberFormat('id-ID', { maximumFractionDigits: 2 }).format(user.storage.percent)}%</p>
                            </div>

                            {/* Data */}
                            <div className="flex items-center gap-3 text-xs text-gray-500 dark:text-gray-400">
                                <span className="flex items-center gap-1"><HiDocument className="w-3.5 h-3.5" />{user.datas.files}</span>
                                <span className="flex items-center gap-1"><HiFolder className="w-3.5 h-3.5" />{user.datas.folders}</span>
                                <span className="flex items-center gap-1"><HiShare className="w-3.5 h-3.5" />{user.datas.shared}</span>
                            </div>

                            {/* Integrations */}
                            <div className="flex gap-1 flex-wrap">
                                {user.googleIntegated && (
                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-red-50 dark:bg-red-900/20 text-red-500 dark:text-red-400 text-[10px] font-medium rounded-md">
                                        <FaGoogle className="w-2.5 h-2.5" /> Google
                                    </span>
                                )}
                                {user.semestaIntegrated && (
                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-purple-50 dark:bg-purple-900/20 text-purple-500 dark:text-purple-400 text-[10px] font-medium rounded-md">
                                        <HiServerStack className="w-2.5 h-2.5" /> Semesta
                                    </span>
                                )}
                                {!user.googleIntegated && !user.semestaIntegrated && (
                                    <span className="text-gray-300 dark:text-gray-600 text-xs">—</span>
                                )}
                            </div>

                            {/* Status */}
                            <div>
                                <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold ${user.access
                                    ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400'
                                    : 'bg-red-50 dark:bg-red-900/20 text-red-500 dark:text-red-400'
                                    }`}>
                                    <div className={`w-1.5 h-1.5 rounded-full ${user.access ? 'bg-emerald-500' : 'bg-red-500'}`}></div>
                                    {user.access ? 'Aktif' : 'Nonaktif'}
                                </span>
                            </div>

                            {/* Actions */}
                            <div className="flex items-center justify-end gap-1">
                                <button
                                    onClick={() => openEditModal(user)}
                                    className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-all"
                                    title="Edit"
                                >
                                    <HiPencil className="w-4 h-4" />
                                </button>
                                <button
                                    onClick={() => handleToggleAccess(user)}
                                    className={`p-1.5 rounded-lg transition-all ${user.access
                                        ? 'text-gray-400 hover:text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-900/20'
                                        : 'text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/20'
                                        }`}
                                    title={user.access ? 'Nonaktifkan' : 'Aktifkan'}
                                >
                                    {user.access ? <HiLockClosed className="w-4 h-4" /> : <HiLockOpen className="w-4 h-4" />}
                                </button>
                                <button
                                    onClick={() => handleDeleteUser(user)}
                                    className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all"
                                    title="Hapus"
                                >
                                    <HiTrash className="w-4 h-4" />
                                </button>
                            </div>
                        </div>

                        {/* Mobile layout */}
                        <div className="lg:hidden p-4">
                            <div className="flex items-start justify-between gap-3">
                                <div className="flex items-center gap-3 min-w-0">
                                    <div className="relative shrink-0">
                                        <img
                                            src={user.photo}
                                            onError={(e) => { e.currentTarget.src = '/favicon.png'; }}
                                            alt={user.fullname}
                                            className="w-12 h-12 rounded-full object-contain ring-2 ring-gray-100 dark:ring-gray-700"
                                        />
                                        <div className={`absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full border-2 border-white dark:border-gray-800 ${user.access ? 'bg-emerald-400' : 'bg-gray-300 dark:bg-gray-600'}`}></div>
                                    </div>
                                    <div className="min-w-0">
                                        <h3 className="text-sm font-semibold text-gray-900 dark:text-white truncate">{user.fullname}</h3>
                                        <p className="text-xs text-gray-400 truncate">@{user.username}</p>
                                        <p className="text-xs text-gray-400 truncate">{user.email}</p>
                                    </div>
                                </div>
                                <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold shrink-0 ${user.access
                                    ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400'
                                    : 'bg-red-50 dark:bg-red-900/20 text-red-500 dark:text-red-400'
                                    }`}>
                                    <div className={`w-1.5 h-1.5 rounded-full ${user.access ? 'bg-emerald-500' : 'bg-red-500'}`}></div>
                                    {user.access ? 'Aktif' : 'Nonaktif'}
                                </span>
                            </div>

                            {/* Mobile detail row */}
                            <div className="mt-3 grid grid-cols-3 gap-3 text-xs">
                                <div>
                                    <p className="text-gray-400">Storage</p>
                                    <p className="font-medium text-gray-700 dark:text-gray-300">{user.storage.used}/{user.storage.total}</p>
                                    <div className="w-full h-1 bg-gray-100 dark:bg-gray-700 rounded-full mt-1 overflow-hidden">
                                        <div className={`h-full rounded-full ${getStorageBarColor(user.storage.percent)}`}
                                            style={{ width: `${Math.min(user.storage.percent, 100)}%` }}></div>
                                    </div>
                                </div>
                                <div>
                                    <p className="text-gray-400">Data</p>
                                    <p className="font-medium text-gray-700 dark:text-gray-300">{user.datas.files}F · {user.datas.folders}D</p>
                                </div>
                                <div>
                                    <p className="text-gray-400">Integrasi</p>
                                    <div className="flex gap-1 mt-0.5">
                                        {user.googleIntegated && <span className="px-1.5 py-0.5 bg-red-50 dark:bg-red-900/20 text-red-500 text-[9px] rounded">G</span>}
                                        {user.semestaIntegrated && <span className="px-1.5 py-0.5 bg-purple-50 dark:bg-purple-900/20 text-purple-500 text-[9px] rounded">S</span>}
                                        {!user.googleIntegated && !user.semestaIntegrated && <span className="text-gray-300">—</span>}
                                    </div>
                                </div>
                            </div>

                            {/* Mobile actions */}
                            <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-700/50 flex items-center gap-2">
                                <button onClick={() => openEditModal(user)} className="flex-1 flex items-center justify-center gap-1.5 py-1.5 text-xs font-medium text-blue-600 bg-blue-50 dark:bg-blue-900/20 dark:text-blue-400 rounded-lg transition-colors hover:bg-blue-100 dark:hover:bg-blue-900/30">
                                    <HiPencil className="w-3.5 h-3.5" /> Edit
                                </button>
                                <button onClick={() => handleToggleAccess(user)} className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 text-xs font-medium rounded-lg transition-colors ${user.access ? 'text-amber-600 bg-amber-50 dark:bg-amber-900/20 dark:text-amber-400 hover:bg-amber-100' : 'text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20 dark:text-emerald-400 hover:bg-emerald-100'}`}>
                                    {user.access ? <><HiLockClosed className="w-3.5 h-3.5" /> Nonaktifkan</> : <><HiLockOpen className="w-3.5 h-3.5" /> Aktifkan</>}
                                </button>
                                <button onClick={() => handleDeleteUser(user)} className="flex items-center justify-center gap-1.5 py-1.5 px-3 text-xs font-medium text-red-600 bg-red-50 dark:bg-red-900/20 dark:text-red-400 rounded-lg transition-colors hover:bg-red-100 dark:hover:bg-red-900/30">
                                    <HiTrash className="w-3.5 h-3.5" />
                                </button>
                            </div>
                        </div>
                    </div>
                ))}

                {/* Empty state */}
                {users.length === 0 && !loading && (
                    <div className="text-center py-16 bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700">
                        <HiUsers className="w-16 h-16 text-gray-200 dark:text-gray-700 mx-auto mb-4" />
                        <h3 className="text-lg font-semibold text-gray-500 dark:text-gray-400">Tidak ada pengguna ditemukan</h3>
                        <p className="text-sm text-gray-400 mt-1">Coba ubah kata kunci pencarian</p>
                    </div>
                )}
            </div>

            {/* Pagination */}
            {lastPage > 1 && (
                <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 px-5 py-3">
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                        Halaman <span className="font-semibold text-gray-700 dark:text-gray-200">{currentPage}</span> dari <span className="font-semibold text-gray-700 dark:text-gray-200">{lastPage}</span>
                        <span className="hidden sm:inline"> · {stats.total} pengguna</span>
                    </p>
                    <div className="flex items-center gap-1">
                        <button
                            onClick={() => setCurrentPage(1)}
                            disabled={currentPage === 1}
                            className="px-3 py-1.5 text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                        >
                            Awal
                        </button>
                        <button
                            onClick={() => setCurrentPage(currentPage - 1)}
                            disabled={currentPage === 1}
                            className="p-1.5 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                        >
                            <HiChevronLeft className="w-5 h-5" />
                        </button>

                        {/* Page numbers */}
                        {Array.from({ length: Math.min(5, lastPage) }, (_, i) => {
                            let page: number;
                            if (lastPage <= 5) {
                                page = i + 1;
                            } else if (currentPage <= 3) {
                                page = i + 1;
                            } else if (currentPage >= lastPage - 2) {
                                page = lastPage - 4 + i;
                            } else {
                                page = currentPage - 2 + i;
                            }
                            return (
                                <button
                                    key={page}
                                    onClick={() => setCurrentPage(page)}
                                    className={`w-9 h-9 text-sm font-medium rounded-lg transition-all ${page === currentPage
                                        ? 'bg-primary text-white shadow-md shadow-primary/25'
                                        : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                                        }`}
                                >
                                    {page}
                                </button>
                            );
                        })}

                        <button
                            onClick={() => setCurrentPage(currentPage + 1)}
                            disabled={currentPage === lastPage}
                            className="p-1.5 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                        >
                            <HiChevronRight className="w-5 h-5" />
                        </button>
                        <button
                            onClick={() => setCurrentPage(lastPage)}
                            disabled={currentPage === lastPage}
                            className="px-3 py-1.5 text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                        >
                            Akhir
                        </button>
                    </div>
                </div>
            )}

            {/* ==================== CREATE USER MODAL ==================== */}
            {showCreateModal && (
                <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={() => setShowCreateModal(false)}>
                    <div
                        className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto animate-in zoom-in-95 fade-in duration-200"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Header */}
                        <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-100 dark:border-gray-700 px-6 py-4 flex items-center justify-between z-10">
                            <div className="flex items-center gap-3">
                                <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-primary to-[#005a9c] flex items-center justify-center">
                                    <HiUserPlus className="w-5 h-5 text-white" />
                                </div>
                                <h2 className="text-lg font-bold text-gray-900 dark:text-white">Tambah Pengguna</h2>
                            </div>
                            <button onClick={() => setShowCreateModal(false)} className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors">
                                <HiXMark className="w-5 h-5" />
                            </button>
                        </div>

                        <form onSubmit={handleCreateUser} className="p-6 space-y-4">
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1.5 uppercase tracking-wider">
                                        Nama Depan <span className="text-red-400">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        value={createForm.firstname}
                                        placeholder="Nama Depan"
                                        onChange={(e) => setCreateForm({ ...createForm, firstname: e.target.value })}
                                        className="w-full px-3.5 py-2.5 bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-xl text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1.5 uppercase tracking-wider">
                                        Nama Belakang <span className="text-red-400">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        value={createForm.lastname}
                                        placeholder="Nama Belakang"
                                        onChange={(e) => setCreateForm({ ...createForm, lastname: e.target.value })}
                                        className="w-full px-3.5 py-2.5 bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-xl text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none"
                                        required
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1.5 uppercase tracking-wider">
                                    Email <span className="text-red-400">*</span>
                                </label>
                                <input
                                    type="email"
                                    value={createForm.email}
                                    placeholder="email@example.com"
                                    autoComplete="new-email"
                                    onChange={(e) => setCreateForm({ ...createForm, email: e.target.value })}
                                    className="w-full px-3.5 py-2.5 bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-xl text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none"
                                    required
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1.5 uppercase tracking-wider">
                                        Username <span className="text-red-400">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        value={createForm.username}
                                        placeholder="username"
                                        autoComplete="new-username"
                                        onChange={(e) => setCreateForm({ ...createForm, username: e.target.value })}
                                        className="w-full px-3.5 py-2.5 bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-xl text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1.5 uppercase tracking-wider">
                                        Kapasitas (GB) <span className="text-red-400">*</span>
                                    </label>
                                    <input
                                        type="number"
                                        value={createForm.capacity}
                                        onChange={(e) => setCreateForm({ ...createForm, capacity: parseInt(e.target.value) })}
                                        className="w-full px-3.5 py-2.5 bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-xl text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none"
                                        min="1"
                                        required
                                    />
                                </div>
                            </div>

                            {/* Password Section */}
                            <div className="border-t border-gray-100 dark:border-gray-700 pt-4">
                                <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-3 uppercase tracking-wider flex items-center gap-1.5">
                                    <HiLockClosed className="w-3.5 h-3.5" /> Password
                                </p>
                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5">
                                            Password <span className="text-red-400">*</span>
                                        </label>
                                        <div className="relative">
                                            <input
                                                type={showCreatePassword ? 'text' : 'password'}
                                                value={createForm.password}
                                                placeholder="Min. 6 karakter"
                                                autoComplete="new-password"
                                                onChange={(e) => {
                                                    setCreateForm({ ...createForm, password: e.target.value });
                                                    setCreatePasswordError('');
                                                }}
                                                className="w-full px-3.5 py-2.5 pr-10 bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-xl text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none"
                                                required
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowCreatePassword(!showCreatePassword)}
                                                className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                                                tabIndex={-1}
                                            >
                                                {showCreatePassword ? <HiEyeSlash className="w-4 h-4" /> : <HiEye className="w-4 h-4" />}
                                            </button>
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5">
                                            Konfirmasi <span className="text-red-400">*</span>
                                        </label>
                                        <div className="relative">
                                            <input
                                                type={showCreateConfirmPassword ? 'text' : 'password'}
                                                value={createForm.password_confirmation}
                                                placeholder="Ulangi password"
                                                autoComplete="new-password"
                                                onChange={(e) => {
                                                    setCreateForm({ ...createForm, password_confirmation: e.target.value });
                                                    setCreatePasswordError('');
                                                }}
                                                className="w-full px-3.5 py-2.5 pr-10 bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-xl text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none"
                                                required
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowCreateConfirmPassword(!showCreateConfirmPassword)}
                                                className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                                                tabIndex={-1}
                                            >
                                                {showCreateConfirmPassword ? <HiEyeSlash className="w-4 h-4" /> : <HiEye className="w-4 h-4" />}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                                {createPasswordError && (
                                    <p className="text-xs text-red-500 mt-2 flex items-center gap-1">
                                        <HiXCircle className="w-3.5 h-3.5 shrink-0" /> {createPasswordError}
                                    </p>
                                )}
                            </div>

                            <div className="flex gap-3 pt-2">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setShowCreateModal(false);
                                        setCreateForm({ firstname: '', lastname: '', email: '', username: '', capacity: 50, password: '', password_confirmation: '' });
                                        setCreatePasswordError('');
                                    }}
                                    className="flex-1 px-4 py-2.5 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-xl text-sm font-medium hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                                >
                                    Batal
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 px-4 py-2.5 bg-gradient-to-r from-primary to-[#005a9c] text-white rounded-xl text-sm font-semibold hover:from-[#002d52] hover:to-primary transition-all shadow-lg shadow-primary/20"
                                >
                                    Tambah Pengguna
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* ==================== EDIT USER MODAL ==================== */}
            {showEditModal && selectedUser && (
                <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={() => { setShowEditModal(false); setSelectedUser(null); }}>
                    <div
                        className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto animate-in zoom-in-95 fade-in duration-200"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Header with user avatar */}
                        <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-100 dark:border-gray-700 px-6 py-4 z-10">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <img
                                        src={selectedUser.photo}
                                        onError={(e) => { e.currentTarget.src = '/favicon.png'; }}
                                        alt={selectedUser.fullname}
                                        className="w-10 h-10 rounded-full object-contain ring-2 ring-gray-100 dark:ring-gray-700"
                                    />
                                    <div>
                                        <h2 className="text-lg font-bold text-gray-900 dark:text-white">Edit Pengguna</h2>
                                        <p className="text-xs text-gray-400">@{selectedUser.username}</p>
                                    </div>
                                </div>
                                <button onClick={() => { setShowEditModal(false); setSelectedUser(null); }} className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors">
                                    <HiXMark className="w-5 h-5" />
                                </button>
                            </div>
                        </div>

                        <form onSubmit={handleEditUser} className="p-6 space-y-4">
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1.5 uppercase tracking-wider">
                                        Nama Depan <span className="text-red-400">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        value={editForm.firstname}
                                        placeholder="Nama Depan"
                                        onChange={(e) => setEditForm({ ...editForm, firstname: e.target.value })}
                                        className="w-full px-3.5 py-2.5 bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-xl text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1.5 uppercase tracking-wider">
                                        Nama Belakang <span className="text-red-400">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        value={editForm.lastname}
                                        placeholder="Nama Belakang"
                                        onChange={(e) => setEditForm({ ...editForm, lastname: e.target.value })}
                                        className="w-full px-3.5 py-2.5 bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-xl text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none"
                                        required
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1.5 uppercase tracking-wider">
                                    Email <span className="text-red-400">*</span>
                                </label>
                                <input
                                    type="email"
                                    value={editForm.email}
                                    placeholder="email@example.com"
                                    autoComplete="new-email"
                                    onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                                    className="w-full px-3.5 py-2.5 bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-xl text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1.5 uppercase tracking-wider">
                                    Kapasitas Storage (GB) <span className="text-red-400">*</span>
                                </label>
                                <input
                                    type="number"
                                    value={editForm.capacity}
                                    onChange={(e) => setEditForm({ ...editForm, capacity: parseInt(e.target.value) })}
                                    className="w-full px-3.5 py-2.5 bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-xl text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none"
                                    min="1"
                                    required
                                />
                            </div>

                            {/* Password Section (Optional) */}
                            <div className="border-t border-gray-100 dark:border-gray-700 pt-4">
                                <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1 uppercase tracking-wider flex items-center gap-1.5">
                                    <HiLockClosed className="w-3.5 h-3.5" /> Ubah Password
                                </p>
                                <p className="text-[11px] text-gray-400 dark:text-gray-500 mb-3">
                                    Kosongkan jika tidak ingin mengubah password
                                </p>
                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5">
                                            Password Baru
                                        </label>
                                        <div className="relative">
                                            <input
                                                type={showEditPassword ? 'text' : 'password'}
                                                value={editForm.password}
                                                placeholder="Min. 6 karakter"
                                                autoComplete="new-password"
                                                onChange={(e) => {
                                                    setEditForm({ ...editForm, password: e.target.value });
                                                    setEditPasswordError('');
                                                }}
                                                className="w-full px-3.5 py-2.5 pr-10 bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-xl text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowEditPassword(!showEditPassword)}
                                                className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                                                tabIndex={-1}
                                            >
                                                {showEditPassword ? <HiEyeSlash className="w-4 h-4" /> : <HiEye className="w-4 h-4" />}
                                            </button>
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5">
                                            Konfirmasi
                                        </label>
                                        <div className="relative">
                                            <input
                                                type={showEditConfirmPassword ? 'text' : 'password'}
                                                value={editForm.password_confirmation}
                                                placeholder="Ulangi password"
                                                autoComplete="new-password"
                                                onChange={(e) => {
                                                    setEditForm({ ...editForm, password_confirmation: e.target.value });
                                                    setEditPasswordError('');
                                                }}
                                                className="w-full px-3.5 py-2.5 pr-10 bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-xl text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowEditConfirmPassword(!showEditConfirmPassword)}
                                                className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                                                tabIndex={-1}
                                            >
                                                {showEditConfirmPassword ? <HiEyeSlash className="w-4 h-4" /> : <HiEye className="w-4 h-4" />}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                                {editPasswordError && (
                                    <p className="text-xs text-red-500 mt-2 flex items-center gap-1">
                                        <HiXCircle className="w-3.5 h-3.5 shrink-0" /> {editPasswordError}
                                    </p>
                                )}
                                {editForm.password && editForm.password_confirmation && editForm.password === editForm.password_confirmation && editForm.password.length >= 6 && (
                                    <p className="text-xs text-emerald-500 mt-2 flex items-center gap-1">
                                        <HiCheckBadge className="w-3.5 h-3.5 shrink-0" /> Password cocok
                                    </p>
                                )}
                            </div>

                            <div className="flex gap-3 pt-2">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setShowEditModal(false);
                                        setSelectedUser(null);
                                        setEditPasswordError('');
                                    }}
                                    className="flex-1 px-4 py-2.5 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-xl text-sm font-medium hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                                >
                                    Batal
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 px-4 py-2.5 bg-gradient-to-r from-primary to-[#005a9c] text-white rounded-xl text-sm font-semibold hover:from-[#002d52] hover:to-primary transition-all shadow-lg shadow-primary/20"
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
