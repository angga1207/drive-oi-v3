import { RiLoader4Line } from 'react-icons/ri';
import { BiSolidDashboard } from 'react-icons/bi';

export default function DashboardLoading() {
  return (
    <div className="space-y-6">
      {/* Header Skeleton */}
      <div>
        <div className="h-10 w-64 bg-gray-300 dark:bg-gray-700 rounded animate-pulse mb-4"></div>
        <div className="h-6 w-96 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
      </div>

      {/* Stats Cards Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[...Array(4)].map((_, i) => (
          <div
            key={i}
            className="bg-white dark:bg-gray-800 rounded-xl p-6 border-2 border-gray-200 dark:border-gray-700 animate-pulse"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-gray-300 dark:bg-gray-700 rounded-lg"></div>
              <div className="w-6 h-6 bg-gray-300 dark:bg-gray-700 rounded"></div>
            </div>
            <div className="space-y-2">
              <div className="h-4 w-20 bg-gray-300 dark:bg-gray-700 rounded"></div>
              <div className="h-8 w-32 bg-gray-300 dark:bg-gray-700 rounded"></div>
            </div>
          </div>
        ))}
      </div>

      {/* Loading Animation */}
      <div className="flex flex-col items-center justify-center min-h-[300px] space-y-4">
        <div className="relative">
          <RiLoader4Line className="w-16 h-16 text-[#003a69] dark:text-[#ebbd18] animate-spin" />
          <div className="absolute inset-0 flex items-center justify-center">
            <BiSolidDashboard className="w-8 h-8 text-[#003a69] dark:text-[#ebbd18] animate-pulse" />
          </div>
        </div>
        <div className="text-center">
          <p className="text-lg font-semibold text-gray-700 dark:text-gray-300">
            Memuat dashboard...
          </p>
          <div className="flex justify-center gap-1 mt-2">
            <div className="w-2 h-2 bg-[#003a69] dark:bg-[#ebbd18] rounded-full animate-bounce [animation-delay:0ms]"></div>
            <div className="w-2 h-2 bg-[#003a69] dark:bg-[#ebbd18] rounded-full animate-bounce [animation-delay:100ms]"></div>
            <div className="w-2 h-2 bg-[#003a69] dark:bg-[#ebbd18] rounded-full animate-bounce [animation-delay:200ms]"></div>
          </div>
        </div>
      </div>
    </div>
  );
}
