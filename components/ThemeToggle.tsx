'use client';

import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';
import { HiSun, HiMoon, HiDesktopComputer } from 'react-icons/hi';

export default function ThemeToggle() {
    const { theme, setTheme } = useTheme();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) {
        return (
            <div className="flex items-center gap-2 p-2 bg-gray-100 dark:bg-gray-700 rounded-lg">
                <div className="w-20 h-8 bg-gray-200 dark:bg-gray-600 rounded animate-pulse" />
            </div>
        );
    }

    const themes = [
        { name: 'light', icon: <HiSun className="w-4 h-4" />, label: 'Light' },
        { name: 'dark', icon: <HiMoon className="w-4 h-4" />, label: 'Dark' },
        { name: 'system', icon: <HiDesktopComputer className="w-4 h-4" />, label: 'System' },
    ];

    return (
        <div className="space-y-2">
            <label className="text-xs font-semibold text-gray-600 dark:text-gray-400 px-2">
                Tema Tampilan
            </label>
            <div className="flex items-center gap-1 p-1 bg-gray-100 dark:bg-gray-700 rounded-lg">
                {themes.map((t) => (
                    <button
                        key={t.name}
                        onClick={() => setTheme(t.name)}
                        className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-md text-xs font-medium transition-all cursor-pointer ${theme === t.name
                            ? 'bg-white dark:bg-gray-600 text-[#003a69] dark:text-[#ebbd18] shadow-sm'
                            : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                            }`}
                        title={t.label}
                    >
                        {t.icon}
                    </button>
                ))}
            </div>
        </div>
    );
}
