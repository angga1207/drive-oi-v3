'use client';

import { useEffect } from 'react';
import { HiRefresh } from 'react-icons/hi';
import { RiErrorWarningFill } from 'react-icons/ri';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error('Global Error:', error);
  }, [error]);

  return (
    <html lang="id">
      <body>
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center px-4">
          <div className="max-w-2xl w-full text-center">
            {/* Error Icon */}
            <div className="flex justify-center mb-8">
              <div className="relative">
                <div className="absolute inset-0 bg-red-500/20 rounded-full blur-xl animate-pulse"></div>
                <div className="relative bg-gradient-to-br from-red-500 to-red-600 p-6 rounded-full">
                  <RiErrorWarningFill className="w-20 h-20 text-white" />
                </div>
              </div>
            </div>

            {/* Error Message */}
            <h1 className="text-5xl font-bold text-gray-900 dark:text-white mb-4">
              Kesalahan Sistem
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-400 mb-8">
              Terjadi kesalahan kritis pada aplikasi. Silakan muat ulang halaman.
            </p>

            {/* Action Button */}
            <button
              onClick={reset}
              className="inline-flex items-center gap-3 px-10 py-5 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white text-lg font-semibold rounded-xl shadow-lg shadow-red-500/30 transition-all duration-300 hover:shadow-xl hover:shadow-red-500/40 hover:scale-105"
            >
              <HiRefresh className="w-7 h-7" />
              <span>Muat Ulang Aplikasi</span>
            </button>

            {/* Additional Info */}
            <div className="mt-12">
              <p className="text-sm text-gray-500 dark:text-gray-500">
                Jika masalah terus berlanjut, hubungi administrator sistem
              </p>
              {error.digest && (
                <p className="text-xs text-gray-400 dark:text-gray-600 mt-2">
                  Error ID: {error.digest}
                </p>
              )}
            </div>
          </div>
        </div>
      </body>
    </html>
  );
}
