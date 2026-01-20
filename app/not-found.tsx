'use client';

import Link from 'next/link';
import { HiHome, HiArrowLeft } from 'react-icons/hi';
import { RiErrorWarningFill } from 'react-icons/ri';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center px-4">
      <div className="max-w-2xl w-full">
        {/* Animated 404 */}
        <div className="text-center mb-8">
          <div className="inline-block relative">
            <h1 className="text-[150px] md:text-[200px] font-bold bg-gradient-to-br from-[#003a69] via-[#005a9c] to-[#ebbd18] bg-clip-text text-transparent animate-pulse">
              404
            </h1>
            <div className="absolute inset-0 bg-gradient-to-br from-[#003a69] via-[#005a9c] to-[#ebbd18] opacity-20 blur-3xl animate-pulse"></div>
          </div>
        </div>

        {/* Error Icon */}
        <div className="flex justify-center mb-6">
          <div className="relative">
            <div className="absolute inset-0 bg-[#ebbd18]/20 rounded-full blur-xl animate-pulse"></div>
            <div className="relative bg-gradient-to-br from-[#003a69] to-[#005a9c] p-6 rounded-full">
              <RiErrorWarningFill className="w-16 h-16 text-white" />
            </div>
          </div>
        </div>

        {/* Message */}
        <div className="text-center mb-8">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Halaman Tidak Ditemukan
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-400 mb-2">
            Maaf, halaman yang Anda cari tidak dapat ditemukan.
          </p>
          <p className="text-base text-gray-500 dark:text-gray-500">
            Halaman mungkin telah dipindahkan, dihapus, atau tidak pernah ada.
          </p>
        </div>

        {/* Decorative Elements */}
        <div className="flex justify-center gap-4 mb-8">
          <div className="w-16 h-1 bg-gradient-to-r from-[#003a69] to-[#ebbd18] rounded-full"></div>
          <div className="w-8 h-1 bg-gradient-to-r from-[#ebbd18] to-[#003a69] rounded-full"></div>
          <div className="w-4 h-1 bg-[#003a69] rounded-full"></div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Link
            href="/dashboard"
            className="group inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-[#003a69] to-[#005a9c] hover:from-[#002347] hover:to-[#003a69] text-white font-semibold rounded-xl shadow-lg shadow-[#003a69]/30 transition-all duration-300 hover:shadow-xl hover:shadow-[#003a69]/40 hover:scale-105"
          >
            <HiHome className="w-6 h-6 transition-transform group-hover:scale-110" />
            <span>Kembali ke Dashboard</span>
          </Link>

          <button
            onClick={() => window.history.back()}
            className="group inline-flex items-center gap-3 px-8 py-4 bg-white dark:bg-gray-800 border-2 border-[#003a69]/20 hover:border-[#ebbd18] dark:border-gray-700 dark:hover:border-[#ebbd18] text-gray-700 dark:text-gray-300 font-semibold rounded-xl hover:bg-[#ebbd18]/5 dark:hover:bg-[#ebbd18]/10 transition-all duration-300 hover:shadow-lg hover:scale-105"
          >
            <HiArrowLeft className="w-6 h-6 transition-transform group-hover:-translate-x-1" />
            <span>Kembali</span>
          </button>
        </div>

        {/* Additional Info */}
        <div className="mt-12 text-center">
          <p className="text-sm text-gray-500 dark:text-gray-500">
            Butuh bantuan?{' '}
            <Link
              href="/dashboard"
              className="text-[#003a69] dark:text-[#ebbd18] hover:underline font-medium"
            >
              Hubungi Support
            </Link>
          </p>
        </div>

        {/* Floating Animation Elements */}
        <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-[#ebbd18] rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-[#003a69] rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob [animation-delay:2s]"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-[#005a9c] rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob [animation-delay:4s]"></div>
        </div>
      </div>
    </div>
  );
}
