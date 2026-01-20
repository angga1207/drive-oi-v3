'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { HiHome, HiRefresh } from 'react-icons/hi';
import { RiErrorWarningFill } from 'react-icons/ri';
import { BiCodeAlt } from 'react-icons/bi';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error('Error:', error);
  }, [error]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center px-4">
      <div className="max-w-2xl w-full">
        {/* Error Icon */}
        <div className="flex justify-center mb-8">
          <div className="relative">
            <div className="absolute inset-0 bg-red-500/20 rounded-full blur-xl animate-pulse"></div>
            <div className="relative bg-gradient-to-br from-red-500 to-red-600 p-6 rounded-full">
              <RiErrorWarningFill className="w-16 h-16 text-white" />
            </div>
          </div>
        </div>

        {/* Error Message */}
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
            Oops! Terjadi Kesalahan
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400 mb-6">
            Maaf, terjadi kesalahan yang tidak terduga.
          </p>

          {/* Error Details (Development Only) */}
          {process.env.NODE_ENV === 'development' && error.message && (
            <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border-2 border-red-200 dark:border-red-800 rounded-xl">
              <div className="flex items-center gap-2 mb-2 text-red-700 dark:text-red-400">
                <BiCodeAlt className="w-5 h-5" />
                <span className="font-semibold text-sm">Error Details:</span>
              </div>
              <p className="text-sm text-red-600 dark:text-red-400 font-mono text-left break-all">
                {error.message}
              </p>
              {error.digest && (
                <p className="text-xs text-red-500 dark:text-red-500 mt-2">
                  Error ID: {error.digest}
                </p>
              )}
            </div>
          )}

          <p className="text-base text-gray-500 dark:text-gray-500">
            Jangan khawatir, Anda dapat mencoba lagi atau kembali ke halaman utama.
          </p>
        </div>

        {/* Decorative Elements */}
        <div className="flex justify-center gap-4 mb-8">
          <div className="w-16 h-1 bg-gradient-to-r from-red-500 to-orange-500 rounded-full"></div>
          <div className="w-8 h-1 bg-gradient-to-r from-orange-500 to-red-500 rounded-full"></div>
          <div className="w-4 h-1 bg-red-500 rounded-full"></div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <button
            onClick={reset}
            className="group inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-[#003a69] to-[#005a9c] hover:from-[#002347] hover:to-[#003a69] text-white font-semibold rounded-xl shadow-lg shadow-[#003a69]/30 transition-all duration-300 hover:shadow-xl hover:shadow-[#003a69]/40 hover:scale-105"
          >
            <HiRefresh className="w-6 h-6 transition-transform group-hover:rotate-180 duration-500" />
            <span>Coba Lagi</span>
          </button>

          <Link
            href="/dashboard"
            className="group inline-flex items-center gap-3 px-8 py-4 bg-white dark:bg-gray-800 border-2 border-[#003a69]/20 hover:border-[#ebbd18] dark:border-gray-700 dark:hover:border-[#ebbd18] text-gray-700 dark:text-gray-300 font-semibold rounded-xl hover:bg-[#ebbd18]/5 dark:hover:bg-[#ebbd18]/10 transition-all duration-300 hover:shadow-lg hover:scale-105"
          >
            <HiHome className="w-6 h-6 transition-transform group-hover:scale-110" />
            <span>Kembali ke Dashboard</span>
          </Link>
        </div>

        {/* Additional Info */}
        <div className="mt-12 text-center">
          <p className="text-sm text-gray-500 dark:text-gray-500">
            Jika masalah terus berlanjut,{' '}
            <Link
              href="/dashboard"
              className="text-[#003a69] dark:text-[#ebbd18] hover:underline font-medium"
            >
              hubungi administrator
            </Link>
          </p>
        </div>

        {/* Floating Animation Elements */}
        <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-red-400 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-orange-400 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob [animation-delay:2s]"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-red-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob [animation-delay:4s]"></div>
        </div>
      </div>
    </div>
  );
}
