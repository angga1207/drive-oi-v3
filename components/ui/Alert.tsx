'use client';

import { useEffect } from 'react';
import { cn } from '@/lib/utils';

interface AlertProps {
  variant?: 'success' | 'error' | 'warning' | 'info';
  title?: string;
  message: string;
  onClose?: () => void;
  autoClose?: boolean;
  autoCloseDelay?: number;
}

export default function Alert({
  variant = 'info',
  title,
  message,
  onClose,
  autoClose = false,
  autoCloseDelay = 5000,
}: AlertProps) {
  useEffect(() => {
    if (autoClose && onClose) {
      const timer = setTimeout(onClose, autoCloseDelay);
      return () => clearTimeout(timer);
    }
  }, [autoClose, autoCloseDelay, onClose]);

  const variants = {
    success: {
      container: 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800',
      icon: '✓',
      iconBg: 'bg-green-100 dark:bg-green-800 text-green-600 dark:text-green-300',
      title: 'text-green-800 dark:text-green-300',
      message: 'text-green-700 dark:text-green-400',
    },
    error: {
      container: 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800',
      icon: '✕',
      iconBg: 'bg-red-100 dark:bg-red-800 text-red-600 dark:text-red-300',
      title: 'text-red-800 dark:text-red-300',
      message: 'text-red-700 dark:text-red-400',
    },
    warning: {
      container: 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800',
      icon: '⚠',
      iconBg: 'bg-yellow-100 dark:bg-yellow-800 text-yellow-600 dark:text-yellow-300',
      title: 'text-yellow-800 dark:text-yellow-300',
      message: 'text-yellow-700 dark:text-yellow-400',
    },
    info: {
      container: 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800',
      icon: 'ℹ',
      iconBg: 'bg-blue-100 dark:bg-blue-800 text-blue-600 dark:text-blue-300',
      title: 'text-blue-800 dark:text-blue-300',
      message: 'text-blue-700 dark:text-blue-400',
    },
  };

  const style = variants[variant];

  return (
    <div className={cn('rounded-lg border p-4', style.container)}>
      <div className="flex items-start gap-3">
        <div className={cn('shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-sm font-bold', style.iconBg)}>
          {style.icon}
        </div>
        <div className="flex-1 min-w-0">
          {title && (
            <p className={cn('text-sm font-semibold mb-1', style.title)}>
              {title}
            </p>
          )}
          <p className={cn('text-sm', style.message)}>
            {message}
          </p>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className={cn('shrink-0 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors')}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>
    </div>
  );
}
