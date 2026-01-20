'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { ProfileData, Activity } from '@/lib/types';
import { BiSolidData } from 'react-icons/bi';
import { HiDocumentText, HiFolder } from 'react-icons/hi2';
import { FiEdit2 } from 'react-icons/fi';
import { FaGoogle } from 'react-icons/fa';
import Swal from 'sweetalert2';
import { useLanguage } from '@/contexts/LanguageContext';
import {
  HiKey, HiArrowUpTray, HiTrash, HiArrowPath, HiExclamationTriangle,
  HiPencil, HiStar, HiLockOpen, HiFolderPlus, HiArrowRight, HiLink,
  HiClipboard, HiEnvelope, HiUserCircle, HiClock, HiGlobeAlt,
  HiComputerDesktop, HiXMark, HiFaceFrown, HiInboxArrowDown, HiChartBar
} from 'react-icons/hi2';

export default function ProfilePage() {
  const searchParams = useSearchParams();
  const { t } = useLanguage();
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [loadingActivities, setLoadingActivities] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editForm, setEditForm] = useState({
    firstname: '',
    lastname: '',
    username: '',
    password: '',
    password_confirmation: '',
  });
  const [selectedPhoto, setSelectedPhoto] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [editLoading, setEditLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  useEffect(() => {
    fetchProfile();
    fetchActivities(1);

    // Check for success/error from Google integration
    const success = searchParams.get('success');
    const error = searchParams.get('error');

    if (success === 'google_synced') {
      Swal.fire({
        icon: 'success',
        title: 'Berhasil!',
        text: 'Akun Google berhasil diintegrasikan',
        confirmButtonColor: '#003a69',
        timer: 3000,
      }).then(() => {
        // Refresh profile to get updated integration status
        fetchProfile();
        // Remove query params
        window.history.replaceState({}, '', '/profile');
      });
    } else if (error) {
      let errorMessage = 'Terjadi kesalahan saat integrasi Google';
      if (error === 'access_denied') errorMessage = 'Akses ditolak oleh pengguna';
      if (error === 'sync_failed') errorMessage = 'Gagal menyinkronkan akun Google';
      if (error === 'callback_error') errorMessage = 'Terjadi kesalahan pada callback';

      Swal.fire({
        icon: 'error',
        title: 'Gagal',
        text: errorMessage,
        confirmButtonColor: '#003a69',
      }).then(() => {
        window.history.replaceState({}, '', '/profile');
      });
    }
  }, [searchParams]);

  useEffect(() => {
    if (profile) {
      setEditForm({
        firstname: profile.firstname,
        lastname: profile.lastname,
        username: profile.username,
        password: '',
        password_confirmation: '',
      });
    }
  }, [profile]);

  const fetchProfile = async () => {
    try {
      const response = await fetch('/api/getProfile');
      const data = await response.json();

      if (data.status === 'success') {
        setProfile(data.data);
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchActivities = async (page: number) => {
    setLoadingActivities(true);
    try {
      const response = await fetch(`/api/getActivities?page=${page}`);
      const data = await response.json();

      if (data.status === 'success') {
        setActivities(data.data.data);
        setCurrentPage(data.data.current_page);
        setLastPage(data.data.last_page);
        setTotal(data.data.total);
      }
    } catch (error) {
      console.error('Error fetching activities:', error);
    } finally {
      setLoadingActivities(false);
    }
  };

  const handlePageChange = (page: number) => {
    fetchActivities(page);
  };

  const handleGoogleIntegration = async () => {
    if (profile?.googleIntegated) {
      Swal.fire({
        icon: 'info',
        title: 'Sudah Terintegrasi',
        text: 'Akun Google Anda sudah terintegrasi',
        confirmButtonColor: '#003a69',
      });
      return;
    }

    setGoogleLoading(true);
    // Redirect to Google OAuth for integration
    window.location.href = '/api/auth/google/integrate';
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedPhoto(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!editForm.firstname.trim() || !editForm.lastname.trim() || !editForm.username.trim()) {
      Swal.fire({
        icon: 'warning',
        title: 'Data Tidak Lengkap',
        text: 'Nama dan username tidak boleh kosong',
        confirmButtonColor: '#003a69',
      });
      return;
    }

    if (editForm.password && editForm.password !== editForm.password_confirmation) {
      Swal.fire({
        icon: 'error',
        title: 'Password Tidak Cocok',
        text: 'Password dan konfirmasi password tidak cocok',
        confirmButtonColor: '#003a69',
      });
      return;
    }

    setEditLoading(true);

    try {
      const formData = new FormData();
      formData.append('firstname', editForm.firstname);
      formData.append('lastname', editForm.lastname);
      formData.append('username', editForm.username);

      if (selectedPhoto) {
        formData.append('photo', selectedPhoto);
      }

      if (editForm.password) {
        formData.append('password', editForm.password);
        formData.append('password_confirmation', editForm.password_confirmation);
      }

      const response = await fetch('/api/updateProfile', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (data.status === 'success') {
        await Swal.fire({
          icon: 'success',
          title: 'Berhasil!',
          text: 'Profil berhasil diperbarui',
          confirmButtonColor: '#003a69',
          timer: 2000,
          showConfirmButton: false,
        });
        setShowEditModal(false);
        setSelectedPhoto(null);
        setPhotoPreview(null);
        setEditForm({
          ...editForm,
          password: '',
          password_confirmation: '',
        });
        // Refresh profile data
        fetchProfile();
      } else {
        Swal.fire({
          icon: 'error',
          title: 'Gagal',
          text: data.message || 'Gagal memperbarui profil',
          confirmButtonColor: '#003a69',
        });
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Terjadi kesalahan saat memperbarui profil',
        confirmButtonColor: '#003a69',
      });
    } finally {
      setEditLoading(false);
    }
  };

  const getEventIcon = (event: string) => {
    const eventIcons: Record<string, React.JSX.Element> = {
      'mobile-login': <HiKey className="w-5 h-5" />,
      'upload-file': <HiArrowUpTray className="w-5 h-5" />,
      'delete-item': <HiTrash className="w-5 h-5" />,
      'restore-item': <HiArrowPath className="w-5 h-5" />,
      'force-delete-item': <HiExclamationTriangle className="w-5 h-5" />,
      'rename-folder': <HiPencil className="w-5 h-5" />,
      'rename-file': <HiPencil className="w-5 h-5" />,
      'favorite-folder': <HiStar className="w-5 h-5" />,
      'publicity-folder': <HiLockOpen className="w-5 h-5" />,
      'create-folder': <HiFolderPlus className="w-5 h-5" />,
      'move-item': <HiArrowRight className="w-5 h-5" />,
      'share-item': <HiLink className="w-5 h-5" />,
    };
    return eventIcons[event] || <HiClipboard className="w-5 h-5" />;
  };

  const getEventColor = (event: string) => {
    const eventColors: Record<string, string> = {
      'mobile-login': 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400',
      'upload-file': 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400',
      'delete-item': 'bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400',
      'force-delete-item': 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400',
      'restore-item': 'bg-teal-100 dark:bg-teal-900/30 text-teal-600 dark:text-teal-400',
      'rename-folder': 'bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400',
      'rename-file': 'bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400',
      'favorite-folder': 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400',
      'publicity-folder': 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400',
    };
    return eventColors[event] || 'bg-gray-100 dark:bg-gray-900/30 text-gray-600 dark:text-gray-400';
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Baru saja';
    if (diffMins < 60) return `${diffMins} menit yang lalu`;
    if (diffHours < 24) return `${diffHours} jam yang lalu`;
    if (diffDays < 7) return `${diffDays} hari yang lalu`;

    return date.toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Memuat profil...</p>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <HiFaceFrown className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            Data profil tidak ditemukan
          </h3>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          <HiUserCircle className="inline-block w-8 h-8 mr-2 -mt-1" />
          Profil Saya
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Kelola informasi dan lihat aktivitas akun Anda
        </p>
      </div>

      {/* Profile Information */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-6">
            {/* Avatar */}
            <div className="shrink-0">
              <div className="relative">
                <img
                  src={profile.photo}
                  alt={profile.fullname}
                  className="w-32 h-32 rounded-full object-cover border-4 border-gray-200 dark:border-gray-700"
                />
                <div className="absolute bottom-0 right-0 w-8 h-8 bg-green-500 rounded-full border-4 border-white dark:border-gray-800"></div>
              </div>
            </div>

            {/* User Info */}
            <div className="grow">
              <div className="flex items-start justify-between mb-1">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                    {profile.fullname}
                  </h2>
                  <p className="text-gray-600 dark:text-gray-400 mt-1">@{profile.username}</p>
                </div>
                <button
                  onClick={() => setShowEditModal(true)}
                  className="group relative px-6 py-3 bg-linear-to-r from-primary to-primary-light hover:from-primary-dark hover:to-primary text-white rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105 flex items-center gap-2 font-semibold"
                >
                  <FiEdit2 className="w-5 h-5 group-hover:rotate-12 transition-transform" />
                  <span>{t.common.edit} {t.profile.title}</span>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                <div className="flex items-center gap-3 text-gray-700 dark:text-gray-300">
                  <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                    <HiEnvelope className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Email</p>
                    <p className="font-medium">{profile.email}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 text-gray-700 dark:text-gray-300">
                  <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center">
                    <HiLink className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Integrasi</p>
                    <div className="flex gap-2 mt-1">
                      {profile.googleIntegated && (
                        <span className="px-2 py-1 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 text-xs rounded-full">
                          Google
                        </span>
                      )}
                      {profile.semestaIntegrated && (
                        <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-xs rounded-full">
                          Semesta
                        </span>
                      )}
                      {profile.appleIntegrated && (
                        <span className="px-2 py-1 bg-gray-100 dark:bg-gray-900/30 text-gray-600 dark:text-gray-400 text-xs rounded-full">
                          Apple
                        </span>
                      )}
                      {!profile.googleIntegated && !profile.semestaIntegrated && !profile.appleIntegrated && (
                        <span className="text-gray-400 dark:text-gray-500 text-xs">Tidak ada</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Storage */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="w-12 h-12 bg-linear-to-br from-primary to-primary-light rounded-xl flex items-center justify-center shadow-lg">
                <BiSolidData className="w-6 h-6 text-white" />
              </div>
            </div>
            <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
              {t.profile.storageInfo}
            </h3>
            <p className="text-2xl font-bold text-primary dark:text-white mb-1">
              {profile.storage.used} / {profile.storage.total}
            </p>
            <div className="mt-3">
              <div className="flex items-center justify-between text-xs text-gray-600 dark:text-gray-400 mb-1">
                <span>{profile.storage.used} {t.profile.storageUsed}</span>
                <span>{Math.round(profile.storage.percent)}%</span>
              </div>
              <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                <div
                  className="h-full bg-linear-to-r from-primary to-primary-light transition-all duration-500"
                  style={{ width: `${Math.min(profile.storage.percent, 100)}%` }}
                ></div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Files */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="w-12 h-12 bg-linear-to-br from-primary-light to-primary rounded-xl flex items-center justify-center shadow-lg">
                <HiDocumentText className="w-6 h-6 text-white" />
              </div>
            </div>
            <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
              {t.profile.totalFiles}
            </h3>
            <p className="text-2xl font-bold text-primary dark:text-white">
              {profile.datas.files.toLocaleString()}
            </p>
          </CardContent>
        </Card>

        {/* Folders */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="w-12 h-12 bg-linear-to-br from-accent to-accent-dark rounded-xl flex items-center justify-center shadow-lg">
                <HiFolder className="w-6 h-6 text-white" />
              </div>
            </div>
            <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
              {t.profile.totalFolders}
            </h3>
            <p className="text-2xl font-bold text-primary dark:text-white">
              {profile.datas.folders.toLocaleString()}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Google Integration Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FaGoogle className="w-5 h-5 text-red-600" />
            {t.profile.accountSettings}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                Hubungkan Akun Google
              </h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                {profile?.googleIntegated
                  ? 'Akun Google Anda sudah terintegrasi dengan Drive Ogan Ilir. Anda dapat menggunakan akun Google untuk login dan sinkronisasi data.'
                  : 'Integrasikan akun Google Anda untuk memudahkan login dan sinkronisasi data. Setelah terintegrasi, Anda dapat login menggunakan akun Google.'}
              </p>
              {profile?.googleIntegated && (
                <div className="mt-3 flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-green-600 dark:text-green-400 text-sm font-medium">
                    {t.common.success}
                  </span>
                </div>
              )}
            </div>
            <button
              onClick={handleGoogleIntegration}
              disabled={googleLoading || profile?.googleIntegated}
              className={`shrink-0 flex items-center gap-3 px-6 py-3 rounded-xl font-semibold transition-all duration-300 shadow-lg hover:shadow-xl ${profile?.googleIntegated
                ? 'bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed'
                : 'bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-600 hover:border-red-500 dark:hover:border-red-500 text-gray-900 dark:text-white hover:scale-105'
                }`}
            >
              <FaGoogle className={`w-5 h-5 ${profile?.googleIntegated ? 'text-gray-400' : 'text-red-600'}`} />
              <span>
                {googleLoading ? t.profile.saving + '...' : profile?.googleIntegated ? t.common.success : 'Hubungkan Google'}
              </span>
            </button>
          </div>
        </CardContent>
      </Card>

      {/* Activity Log */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <HiChartBar className="w-5 h-5 text-primary" />
              Log Aktivitas
            </CardTitle>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              Total: {total} aktivitas
            </span>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {loadingActivities ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : activities.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12">
              <HiInboxArrowDown className="w-16 h-16 text-gray-400 mb-4" />
              <p className="text-gray-600 dark:text-gray-400">{t.files.noFiles}</p>
            </div>
          ) : (
            <>
              <div className="divide-y divide-gray-200 dark:divide-gray-700">
                {activities.map((activity) => (
                  <div
                    key={activity.id}
                    className="px-6 py-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                  >
                    <div className="flex items-start gap-4">
                      <div className={`shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${getEventColor(activity.event)}`}>
                        {getEventIcon(activity.event)}
                      </div>
                      <div className="grow min-w-0">
                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                          {activity.description}
                        </p>
                        <div className="flex items-center gap-3 mt-1 text-xs text-gray-500 dark:text-gray-400">
                          <span className="flex items-center gap-1">
                            <HiClock className="w-4 h-4" /> {formatDate(activity.created_at)}
                          </span>
                          <span className="flex items-center gap-1">
                            <HiGlobeAlt className="w-4 h-4" /> {activity.ip_address}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Pagination */}
              {lastPage > 1 && (
                <div className="px-6 py-4 bg-gray-50 dark:bg-gray-800/50 border-t border-gray-200 dark:border-gray-700">
                  <div className="flex items-center justify-between">
                    <button
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage === 1}
                      className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      ← Sebelumnya
                    </button>

                    <div className="flex items-center gap-2">
                      {Array.from({ length: lastPage }, (_, i) => i + 1).map((page) => (
                        <button
                          key={page}
                          onClick={() => handlePageChange(page)}
                          className={`w-10 h-10 text-sm font-medium rounded-lg transition-colors ${page === currentPage
                            ? 'bg-primary text-white'
                            : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                            }`}
                        >
                          {page}
                        </button>
                      ))}
                    </div>

                    <button
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={currentPage === lastPage}
                      className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      Selanjutnya →
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Edit Profile Modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Edit Profil</h2>
              <button
                onClick={() => {
                  setShowEditModal(false);
                  setSelectedPhoto(null);
                  setPhotoPreview(null);
                  if (profile) {
                    setEditForm({
                      firstname: profile.firstname,
                      lastname: profile.lastname,
                      username: profile.username,
                      password: '',
                      password_confirmation: '',
                    });
                  }
                }}
                className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
              >
                <HiXMark className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="p-6 space-y-6">
              {/* Photo Upload */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Foto Profil
                </label>
                <div className="flex items-center gap-4">
                  <img
                    src={photoPreview || profile?.photo}
                    alt="Profile"
                    className="w-24 h-24 rounded-full object-cover border-4 border-gray-200 dark:border-gray-700"
                  />
                  <label className="cursor-pointer">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handlePhotoChange}
                      className="hidden"
                    />
                    <span className="px-4 py-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg transition-colors inline-block">
                      Pilih Foto Baru
                    </span>
                  </label>
                </div>
              </div>

              {/* First Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Nama Depan
                  <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={editForm.firstname}
                  onChange={(e) => setEditForm({ ...editForm, firstname: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent"
                  required
                />
              </div>

              {/* Last Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Nama Belakang
                  <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={editForm.lastname}
                  onChange={(e) => setEditForm({ ...editForm, lastname: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent"
                  required
                />
              </div>

              {/* Username */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Username
                  <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={editForm.username}
                  disabled={profile?.semestaIntegrated ? true : false}
                  onChange={(e) => setEditForm({ ...editForm, username: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
                  required
                />
              </div>

              <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Ubah Password (Opsional)
                </h3>

                {/* Password */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Password Baru
                  </label>
                  <input
                    type="password"
                    value={editForm.password}
                    autoComplete='new-password'
                    onChange={(e) => setEditForm({ ...editForm, password: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent"
                    placeholder="Kosongkan jika tidak ingin mengubah password"
                  />
                </div>

                {/* Password Confirmation */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Konfirmasi Password Baru
                  </label>
                  <input
                    type="password"
                    value={editForm.password_confirmation}
                    autoComplete='new-password'
                    onChange={(e) => setEditForm({ ...editForm, password_confirmation: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent"
                    placeholder="Konfirmasi password baru"
                  />
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowEditModal(false);
                    setSelectedPhoto(null);
                    setPhotoPreview(null);
                    if (profile) {
                      setEditForm({
                        firstname: profile.firstname,
                        lastname: profile.lastname,
                        username: profile.username,
                        password: '',
                        password_confirmation: '',
                      });
                    }
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  disabled={editLoading}
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-primary hover:bg-primary-dark text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={editLoading}
                >
                  {editLoading ? 'Menyimpan...' : 'Simpan Perubahan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
