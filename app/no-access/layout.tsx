import { ReactNode } from 'react';
import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/session';
import ThemeProvider from '@/components/ThemeProvider';
import { LanguageProvider } from '@/contexts/LanguageContext';

interface NoAccessLayoutProps {
    children: ReactNode;
}

export default async function NoAccessLayout({ children }: NoAccessLayoutProps) {
    const user = await getCurrentUser();

    // If not logged in, redirect to login
    if (!user) {
        redirect('/login');
    }

    // If user has access, redirect to dashboard
    if (user.access) {
        redirect('/dashboard');
    }

    return (
        <LanguageProvider>
            <ThemeProvider>
                {children}
            </ThemeProvider>
        </LanguageProvider>
    );
}
