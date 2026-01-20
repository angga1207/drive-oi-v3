import { RiLoader4Line } from 'react-icons/ri';
import { HiUserGroup } from 'react-icons/hi';

export default function SharedLoading() {
  return (
    <div className="space-y-6 select-none">
      {/* Header Skeleton */}
      <div>
        <div className="flex items-center gap-2 mb-2">
          <div className="w-8 h-8 bg-gray-300 dark:bg-gray-700 rounded animate-pulse"></div>
          <div className="h-10 w-64 bg-gray-300 dark:bg-gray-700 rounded animate-pulse"></div>
        </div>
      </div>

      {/* Loading Animation */}
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
        <div className="relative">
          <RiLoader4Line className="w-16 h-16 text-[#003a69] dark:text-[#ebbd18] animate-spin" />
          <div className="absolute inset-0 flex items-center justify-center">
            <HiUserGroup className="w-8 h-8 text-[#003a69] dark:text-[#ebbd18] animate-pulse" />
          </div>
        </div>
        <div className="text-center">
          <p className="text-lg font-semibold text-gray-700 dark:text-gray-300">
            Memuat file yang dibagikan...
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
