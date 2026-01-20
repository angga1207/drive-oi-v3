import { ReactNode } from 'react';
import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/session';
import ProtectedLayoutClient from './layout-client';

interface ProtectedLayoutServerProps {
  children: ReactNode;
}

export default async function ProtectedLayout({ children }: ProtectedLayoutServerProps) {
  const user = await getCurrentUser();

  if (!user) {
    redirect('/login');
  }

  // Check if user has access
  if (!user.access) {
    redirect('/no-access');
  }

  return <ProtectedLayoutClient user={user}>{children}</ProtectedLayoutClient>;
}
