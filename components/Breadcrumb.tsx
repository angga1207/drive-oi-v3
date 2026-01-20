'use client';

import Tippy from '@tippyjs/react';
import Link from 'next/link';
import { HiHome, HiChevronRight } from 'react-icons/hi';

interface BreadcrumbPath {
  id: number;
  name: string;
  slug: string;
  parent_slug: string | number;
}

interface BreadcrumbProps {
  paths: BreadcrumbPath[];
  current: string;
  basePath?: string;
  homeLabel?: string;
  paramLabel?: string;
}

export default function Breadcrumb({ paths, current, basePath = '/files', homeLabel = 'Beranda', paramLabel = 'p' }: BreadcrumbProps) {

  return (
    <nav className="flex items-center space-x-2 text-sm mb-6 max-w-full overflow-x-auto" aria-label="Breadcrumb">
      {/* Home / Root */}
      <Link
        href={basePath}
        className="flex items-center text-[#003a69] dark:text-[#ebbd18] hover:underline font-medium transition-colors"
      >
        <HiHome className="w-4 h-4 mr-1" />
        <Tippy content={homeLabel} placement="top">
          <div>
            {homeLabel}
          </div>
        </Tippy>
      </Link>

      {/* Path segments */}
      {paths.map((path, index) => (
        <div key={path.id} className="flex items-center">
          <HiChevronRight className="w-4 h-4 text-gray-400" />
          <Tippy content={path.name} placement="top">
            <Link
              href={`${basePath}?_${paramLabel || 'p'}=${path.slug}`}
              className="ml-2 text-[#003a69] dark:text-[#ebbd18] hover:underline font-medium transition-colors max-w-[150px] truncate whitespace-nowrap"
            >
              {path.name}
            </Link>
          </Tippy>
        </div>
      ))}

      {/* Current folder */}
      {current && (
        <div className="flex items-center">
          <HiChevronRight className="w-4 h-4 text-gray-400" />
          <Tippy content={current} placement="top">
            <span className="ml-2 text-gray-700 dark:text-gray-300 font-semibold whitespace-nowrap">
              {current}
            </span>
          </Tippy>
        </div>
      )}
    </nav>
  );
}
