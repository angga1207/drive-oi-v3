'use client';

import { ReactNode, useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { logoutAction } from '@/app/actions/auth.actions';
import { cn } from '@/lib/utils';
import Image from 'next/image';
import { HiHome, HiStar, HiLink, HiTrash, HiLogout, HiFolderOpen, HiUser } from 'react-icons/hi';
import { HiUsers } from 'react-icons/hi2';
import ThemeToggle from '@/components/ThemeToggle';
import AddMenu from '@/components/AddMenu';
import SearchModal from '@/components/SearchModal';
import { UploadProvider } from '@/contexts/UploadContext';
import { getAppVersion } from '@/lib/version';
import { useLanguage } from '@/contexts/LanguageContext';
import LanguageSwitcher from '@/components/LanguageSwitcher';

interface ProtectedLayoutProps {
  children: ReactNode;
  user?: {
    id: number;
    name: {
      fullname: string;
      firstname: string;
    };
    username: string;
    photo: string;
  };
}

export default function ProtectedLayout({ children, user }: ProtectedLayoutProps) {
  const pathname = usePathname();
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);
  const { t } = useLanguage();

  // Keyboard shortcut for search modal (Ctrl+K or Cmd+K)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setIsSearchModalOpen(true);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  const navigation = [
    { name: t.nav.dashboard, href: '/dashboard', icon: <HiHome className="w-5 h-5" /> },
    { name: t.nav.files, href: '/files', icon: <HiFolderOpen className="w-5 h-5" /> },
    { name: t.nav.favorite, href: '/favorite', icon: <HiStar className="w-5 h-5" /> },
    { name: t.nav.shared, href: '/shared', icon: <HiLink className="w-5 h-5" /> },
    { name: t.nav.trash, href: '/trash', icon: <HiTrash className="w-5 h-5" /> },
    // Conditional menu for admin (user ID 1 or 4)
    ...(user && (user.id === 1 || user.id === 4) ? [{ name: t.nav.users, href: '/users', icon: <HiUsers className="w-5 h-5" /> }] : []),
    { name: t.nav.profile, href: '/profile', icon: <HiUser className="w-5 h-5" /> },
  ];

  // Mobile navigation - only show most important items
  const mobileNavigation = [
    { name: 'Home', href: '/dashboard', icon: <HiHome className="w-5 h-5" /> },
    { name: 'Files', href: '/files', icon: <HiFolderOpen className="w-5 h-5" /> },
    { name: t.nav.favorite, href: '/favorite', icon: <HiStar className="w-5 h-5" /> },
    { name: t.nav.profile, href: '/profile', icon: <HiUser className="w-5 h-5" /> },
  ];

  const handleLogout = async () => {
    await logoutAction();
  };

  return (
    <UploadProvider>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        {/* Sidebar */}
        <aside className="fixed inset-y-0 left-0 z-50 w-72 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 hidden lg:flex lg:flex-col">
          {/* Logo */}
          <div className="flex items-center justify-between gap-3 px-6 py-5 border-b border-gray-200 dark:border-gray-700 select-none">
            <div className="flex items-center gap-3">
              <img
                src="/favicon.png"
                alt="Logo Drive"
                className="h-10 w-auto drop-shadow-2xl"
              />
              <img
                src="/word.png"
                alt="Logo Drive"
                className="h-8 w-auto drop-shadow-2xl"
              />
            </div>
            <LanguageSwitcher iconOnly />
          </div>

          {/* Add Menu */}
          <div className="px-3 pt-4 pb-3 border-b border-gray-200 dark:border-gray-700">
            <AddMenu />
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-3 py-4 space-y-1">
            {navigation.map((item) => {
              const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    'flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200',
                    isActive
                      ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                  )}
                >
                  <span>{item.icon}</span>
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </nav>

          {/* User Section */}
          <div className="p-4 border-t border-gray-200 dark:border-gray-700 space-y-3">
            {/* Theme Toggle */}
            <ThemeToggle />

            {user && (
              <div className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-700/50">
                <div className="relative w-11 h-11 rounded-full overflow-hidden shrink-0 ring-2 ring-[#003a69] dark:ring-[#ebbd18]">
                  <Image
                    src={user.photo}
                    alt={user.name.fullname}
                    fill
                    className="object-cover"
                    unoptimized
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                    {user.name.firstname}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                    @{user.username}
                  </p>
                </div>
              </div>
            )}
            <button
              onClick={handleLogout}
              className="group w-full flex items-center justify-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
            >
              <HiLogout className="w-5 h-5 group-hover:rotate-180 transition-transform duration-300" />
              <span>{t.common.logout}</span>
            </button>
          </div>
        </aside>

        {/* Mobile Header */}
        <header className="lg:hidden fixed top-0 left-0 right-0 z-40 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between px-4 py-3">
            <div className="flex items-center gap-2">
              <img
                src="/favicon.png"
                alt="Logo Drive"
                className="h-10 w-auto drop-shadow-2xl"
              />
              <img
                src="/word.png"
                alt="Logo Drive"
                className="h-8 w-auto drop-shadow-2xl"
              />
            </div>
            <div className="flex items-center gap-2">
              <LanguageSwitcher iconOnly />
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-3 py-2 rounded-lg bg-gradient-to-r from-red-500 to-red-600 text-white text-sm font-semibold shadow-md hover:shadow-lg transition-all duration-300 active:scale-95"
              >
                <HiLogout className="w-4 h-4" />
                <span className="hidden sm:inline">{t.common.logout}</span>
              </button>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="lg:pl-72 pt-16 lg:pt-0">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {children}
          </div>
        </main>

        {/* Mobile Navigation */}
        <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 safe-area-bottom">
          <div className="grid grid-cols-4 gap-1 px-2 py-2">
            {mobileNavigation.map((item) => {
              const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    'flex flex-col items-center justify-center gap-1 py-2 rounded-lg transition-all duration-200',
                    isActive
                      ? 'text-[#003a69] dark:text-[#ebbd18]'
                      : 'text-gray-500 dark:text-gray-400'
                  )}
                >
                  <span className={cn(
                    'transition-transform duration-200',
                    isActive && 'scale-110'
                  )}>{item.icon}</span>
                  <span className="text-[10px] font-medium truncate max-w-full">{item.name}</span>
                </Link>
              );
            })}
          </div>
        </nav>

        {/* Floating Add Button for Mobile */}
        <div className="lg:hidden fixed bottom-20 right-4 z-50">
          <AddMenu isMobile />
        </div>

        {/* Search Modal */}
        <SearchModal
          isOpen={isSearchModalOpen}
          onClose={() => setIsSearchModalOpen(false)}
        />

        {/* Version Info - Desktop Sidebar */}
        <div className="hidden lg:block fixed bottom-4 right-4 z-10 select-none">
          <div className="text-xs text-gray-500 dark:text-gray-400">
            <p className="font-medium">{getAppVersion().name}</p>
            <p>Version {getAppVersion().version}</p>
          </div>
        </div>
      </div>
    </UploadProvider>
  );
}
