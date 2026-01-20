import { RiLoader4Line } from 'react-icons/ri';
import { HiFolder } from 'react-icons/hi';

export default function Loading() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
      <div className="text-center">
        {/* Animated Logo/Icon */}
        <div className="flex justify-center mb-6">
          <div className="relative">
            {/* Outer rotating ring */}
            <div className="absolute inset-0">
              <RiLoader4Line className="w-24 h-24 text-[#003a69] dark:text-[#ebbd18] animate-spin" />
            </div>
            {/* Inner icon */}
            <div className="flex items-center justify-center w-24 h-24">
              <div className="bg-gradient-to-br from-[#003a69] to-[#005a9c] p-4 rounded-2xl shadow-lg">
                <HiFolder className="w-8 h-8 text-white animate-pulse" />
              </div>
            </div>
          </div>
        </div>

        {/* Loading Text */}
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          Memuat...
        </h2>
        <p className="text-base text-gray-600 dark:text-gray-400">
          Mohon tunggu sebentar
        </p>

        {/* Loading Dots Animation */}
        <div className="flex justify-center gap-2 mt-6">
            <div className="w-2 h-2 bg-[#003a69] dark:bg-[#ebbd18] rounded-full animate-bounce [animation-delay:0ms]"></div>
            <div className="w-2 h-2 bg-[#003a69] dark:bg-[#ebbd18] rounded-full animate-bounce [animation-delay:100ms]"></div>
            <div className="w-2 h-2 bg-[#003a69] dark:bg-[#ebbd18] rounded-full animate-bounce [animation-delay:200ms]"></div>
        </div>

        {/* Decorative gradient bar */}
        <div className="mt-8 flex justify-center">
          <div className="w-48 h-1 bg-gradient-to-r from-transparent via-[#003a69] dark:via-[#ebbd18] to-transparent rounded-full animate-pulse"></div>
        </div>
      </div>

      {/* Background Animation */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-[#ebbd18] rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-[#003a69] rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob [animation-delay:2s]"></div>
      </div>
    </div>
  );
}
