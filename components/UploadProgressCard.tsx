'use client';

import { useState, useEffect } from 'react';
import { HiX, HiCheck, HiUpload } from 'react-icons/hi';
import { FaFile, FaCheckCircle, FaExclamationCircle, FaSpinner } from 'react-icons/fa';

interface UploadFile {
  id: string;
  file?: File;
  name: string;
  size: number;
  progress: number;
  status: 'pending' | 'uploading' | 'success' | 'error';
  error?: string;
}

interface UploadProgressCardProps {
  files: UploadFile[];
  onClose: () => void;
  onCancel: (id: string) => void;
}

export default function UploadProgressCard({ files, onClose, onCancel }: UploadProgressCardProps) {
  const [isMinimized, setIsMinimized] = useState(false);
  const [showCompleted, setShowCompleted] = useState(true);

  // Auto-minimize when all uploads are done
  useEffect(() => {
    const allDone = files.every(f => f.status === 'success' || f.status === 'error');
    if (allDone && files.length > 0) {
      setTimeout(() => setIsMinimized(true), 2000);
    }
  }, [files]);

  const activeUploads = files.filter(f => f.status === 'uploading' || f.status === 'pending');
  const completedUploads = files.filter(f => f.status === 'success');
  const failedUploads = files.filter(f => f.status === 'error');

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  if (files.length === 0) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 w-96 max-w-[calc(100vw-3rem)]">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border-2 border-[#ebbd18]/20 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 bg-gradient-to-r from-[#003a69] to-[#005a9c] text-white">
          <div className="flex items-center gap-3">
            <HiUpload className="w-5 h-5" />
            <div>
              <h3 className="font-semibold">
                {activeUploads.length > 0 ? `Mengunggah ${activeUploads.length} file` : 'Upload Selesai'}
              </h3>
              <p className="text-xs text-white/80">
                {completedUploads.length} berhasil
                {failedUploads.length > 0 && `, ${failedUploads.length} gagal`}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsMinimized(!isMinimized)}
              className="p-1.5 hover:bg-white/20 rounded-lg transition-colors"
              title={isMinimized ? 'Maximize' : 'Minimize'}
            >
              <span className="text-lg">{isMinimized ? '▲' : '▼'}</span>
            </button>
            {activeUploads.length === 0 && (
              <button
                onClick={onClose}
                className="p-1.5 hover:bg-white/20 rounded-lg transition-colors"
                title="Close"
              >
                <HiX className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>

        {/* Content */}
        {!isMinimized && (
          <div className="max-h-96 overflow-y-auto">
            {/* Active Uploads */}
            {activeUploads.map((file) => (
              <div
                key={file.id}
                className="p-4 border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
              >
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-[#003a69]/10 dark:bg-[#ebbd18]/10 rounded-lg">
                    {file.status === 'pending' ? (
                      <FaSpinner className="w-4 h-4 text-[#003a69] dark:text-[#ebbd18] animate-spin" />
                    ) : (
                      <FaFile className="w-4 h-4 text-[#003a69] dark:text-[#ebbd18]" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                      {file.name}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {formatFileSize(file.size)}
                    </p>
                    
                    {/* Progress Bar */}
                    <div className="mt-2 w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5 overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-[#003a69] to-[#ebbd18] transition-all duration-300"
                        style={{ width: `${file.progress}%` }}
                      />
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      {file.progress}%
                    </p>
                  </div>
                  
                  <button
                    onClick={() => onCancel(file.id)}
                    className="p-1.5 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors"
                    title="Cancel"
                  >
                    <HiX className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                  </button>
                </div>
              </div>
            ))}

            {/* Completed Uploads */}
            {showCompleted && completedUploads.map((file) => (
              <div
                key={file.id}
                className="p-4 border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
              >
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                    <FaCheckCircle className="w-4 h-4 text-green-600 dark:text-green-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                      {file.name}
                    </p>
                    <p className="text-xs text-green-600 dark:text-green-400">
                      Upload berhasil • {formatFileSize(file.size)}
                    </p>
                  </div>
                  <button
                    onClick={() => onCancel(file.id)}
                    className="p-1.5 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors"
                  >
                    <HiX className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                  </button>
                </div>
              </div>
            ))}

            {/* Failed Uploads */}
            {failedUploads.map((file) => (
              <div
                key={file.id}
                className="p-4 border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
              >
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-lg">
                    <FaExclamationCircle className="w-4 h-4 text-red-600 dark:text-red-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                      {file.name}
                    </p>
                    <p className="text-xs text-red-600 dark:text-red-400">
                      {file.error || 'Upload gagal'}
                    </p>
                  </div>
                  <button
                    onClick={() => onCancel(file.id)}
                    className="p-1.5 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors"
                  >
                    <HiX className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
