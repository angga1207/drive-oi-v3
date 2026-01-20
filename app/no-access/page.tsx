'use client';

import Link from 'next/link';
import { HiLockClosed, HiExclamationTriangle } from 'react-icons/hi2';
import { FaWhatsapp } from 'react-icons/fa';
import { HiArrowLeft } from 'react-icons/hi';
import { logoutAction } from '@/app/actions/auth.actions';

export default function NoAccessPage() {
  const handleLogout = async () => {
    await logoutAction();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center px-4">
      <div className="max-w-2xl w-full">
        {/* Lock Icon */}
        <div className="flex justify-center mb-8">
          <div className="relative">
            <div className="absolute inset-0 bg-red-500/20 rounded-full blur-xl animate-pulse"></div>
            <div className="relative bg-gradient-to-br from-red-500 to-red-600 p-6 rounded-full">
              <HiLockClosed className="w-16 h-16 text-white" />
            </div>
          </div>
        </div>

        {/* Message Card */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 border-2 border-red-200 dark:border-red-800">
          {/* Warning Badge */}
          <div className="flex justify-center mb-6">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 rounded-full text-sm font-semibold">
              <HiExclamationTriangle className="w-5 h-5" />
              <span>Akses Ditolak</span>
            </div>
          </div>

          {/* Title */}
          <h1 className="text-3xl md:text-4xl font-bold text-center text-gray-900 dark:text-white mb-4">
            Akses Tidak Tersedia
          </h1>

          {/* Description */}
          <p className="text-lg text-center text-gray-600 dark:text-gray-400 mb-8">
            Akun Anda saat ini tidak memiliki akses untuk menggunakan aplikasi Drive Ogan Ilir.
          </p>

          {/* Info Box */}
          <div className="bg-blue-50 dark:bg-blue-900/20 border-2 border-blue-200 dark:border-blue-800 rounded-xl p-6 mb-8">
            <h2 className="text-lg font-semibold text-blue-900 dark:text-blue-300 mb-3 flex items-center gap-2">
              <HiExclamationTriangle className="w-5 h-5" />
              Cara Mendapatkan Akses:
            </h2>
            <ul className="space-y-2 text-blue-800 dark:text-blue-400">
              <li className="flex items-start gap-2">
                <span className="text-blue-500 dark:text-blue-400">•</span>
                <span>Hubungi Administrator melalui WhatsApp Center</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-500 dark:text-blue-400">•</span>
                <span>Sertakan informasi akun Anda (username/email)</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-500 dark:text-blue-400">•</span>
                <span>Tunggu konfirmasi aktivasi dari admin</span>
              </li>
            </ul>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="https://wa.me/6281255332004"
              target="_blank"
              rel="noopener noreferrer"
              className="group inline-flex items-center justify-center gap-3 px-8 py-4 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-semibold rounded-xl shadow-lg shadow-green-500/30 transition-all duration-300 hover:shadow-xl hover:shadow-green-500/40 hover:scale-105"
            >
              <FaWhatsapp className="w-6 h-6 transition-transform group-hover:scale-110" />
              <span>Hubungi WhatsApp Center</span>
            </a>

            <button
              onClick={handleLogout}
              className="group inline-flex items-center justify-center gap-3 px-8 py-4 bg-white dark:bg-gray-700 border-2 border-gray-300 dark:border-gray-600 hover:border-red-400 dark:hover:border-red-500 text-gray-700 dark:text-gray-300 font-semibold rounded-xl hover:bg-red-50 dark:hover:bg-red-900/20 transition-all duration-300 hover:shadow-lg hover:scale-105"
            >
              <HiArrowLeft className="w-6 h-6 transition-transform group-hover:-translate-x-1" />
              <span>Keluar</span>
            </button>
          </div>

          {/* Contact Info */}
          <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
            <p className="text-center text-sm text-gray-500 dark:text-gray-400">
              WhatsApp Center: <span className="font-semibold text-gray-700 dark:text-gray-300">+62 812-5533-2004</span>
            </p>
          </div>
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
