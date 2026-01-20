'use client';

import { useState, useCallback, useEffect } from 'react';
import { HiUpload } from 'react-icons/hi';
import { useLanguage } from '@/contexts/LanguageContext';

interface DragDropZoneProps {
  onFilesDropped: (files: File[]) => void;
  children: React.ReactNode;
}

export default function DragDropZone({ onFilesDropped, children }: DragDropZoneProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [dragCounter, setDragCounter] = useState(0);
  const { t } = useLanguage();

  // Global drag handlers to catch drag anywhere on the page
  useEffect(() => {
    const handleWindowDragEnter = (e: DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      
      setDragCounter(prev => prev + 1);
      
      if (e.dataTransfer?.items && e.dataTransfer.items.length > 0) {
        setIsDragging(true);
      }
    };

    const handleWindowDragLeave = (e: DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      
      setDragCounter(prev => {
        const newCount = prev - 1;
        if (newCount === 0) {
          setIsDragging(false);
        }
        return newCount;
      });
    };

    const handleWindowDragOver = (e: DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
    };

    const handleWindowDrop = (e: DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      
      setIsDragging(false);
      setDragCounter(0);
      
      const files = Array.from(e.dataTransfer?.files || []);
      if (files && files.length > 0) {
        onFilesDropped(files);
      }
    };

    // Add event listeners to window
    window.addEventListener('dragenter', handleWindowDragEnter);
    window.addEventListener('dragleave', handleWindowDragLeave);
    window.addEventListener('dragover', handleWindowDragOver);
    window.addEventListener('drop', handleWindowDrop);

    return () => {
      window.removeEventListener('dragenter', handleWindowDragEnter);
      window.removeEventListener('dragleave', handleWindowDragLeave);
      window.removeEventListener('dragover', handleWindowDragOver);
      window.removeEventListener('drop', handleWindowDrop);
    };
  }, [onFilesDropped]);

  return (
    <div className="relative min-h-[400px]">
      {children}
      
      {/* Drag Overlay */}
      {isDragging && (
        <div className="fixed inset-0 z-[60] bg-[#003a69]/95 backdrop-blur-sm flex items-center justify-center">
          <div className="text-center pointer-events-none">
            <div className="inline-flex items-center justify-center w-32 h-32 bg-white/10 rounded-full mb-6 animate-bounce">
              <HiUpload className="w-16 h-16 text-[#ebbd18]" />
            </div>
            <h2 className="text-3xl font-bold text-white mb-2">
              {t.files.dropToUpload}
            </h2>
            <p className="text-xl text-white/80">
              {t.files.dropMessage}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
