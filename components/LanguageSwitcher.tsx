'use client';

import { useState, useRef, useEffect } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { HiGlobeAlt, HiCheck } from 'react-icons/hi2';

const languages = [
  { code: 'id', name: 'Indonesia', flag: '🇮🇩' },
  { code: 'en', name: 'English', flag: '🇬🇧' },
  { code: 'plm', name: 'Palembang', flag: '🏛️' },
] as const;

interface LanguageSwitcherProps {
  iconOnly?: boolean;
}

export default function LanguageSwitcher({ iconOnly = false }: LanguageSwitcherProps) {
  const { language, setLanguage } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const currentLanguage = languages.find(lang => lang.code === language);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLanguageChange = (code: 'id' | 'en' | 'plm') => {
    setLanguage(code);
    setIsOpen(false);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center gap-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors ${
          iconOnly ? 'p-2' : 'px-3 py-2'
        }`}
        aria-label="Change Language"
      >
        <HiGlobeAlt className="w-5 h-5 text-gray-600 dark:text-gray-400" />
        {!iconOnly && (
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
            {currentLanguage?.flag} {currentLanguage?.name}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-1 z-50">
          {languages.map((lang) => (
            <button
              key={lang.code}
              onClick={() => handleLanguageChange(lang.code)}
              className={`w-full flex items-center justify-between px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors ${
                language === lang.code ? 'bg-[#003a69]/5 dark:bg-[#ebbd18]/5' : ''
              }`}
            >
              <div className="flex items-center gap-2">
                <span className="text-lg">{lang.flag}</span>
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  {lang.name}
                </span>
              </div>
              {language === lang.code && (
                <HiCheck className="w-5 h-5 text-[#003a69] dark:text-[#ebbd18]" />
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
