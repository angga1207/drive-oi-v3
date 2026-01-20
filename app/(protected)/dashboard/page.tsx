import { getCurrentUser } from '@/lib/session';
import { redirect } from 'next/navigation';
import { getProfileService, getLatestFilesService } from '@/lib/services/auth.service';
import { LatestFile } from '@/lib/types';
import DashboardClient from './page-client';

export default async function DashboardPage() {
    const user = await getCurrentUser();

    if (!user) {
        redirect('/login');
    }

    // Fetch profile data from backend
    const profileResponse = await getProfileService();

    // Check if token is invalid/expired (Unauthenticated error)
    if ((profileResponse as any).isUnauthenticated) {
        console.error('🔐 Token invalid/expired - Redirecting to auto-logout');
        redirect('/api/auto-logout?error=session_expired&redirect=/dashboard');
    }

    const profileData: any = profileResponse.success ? profileResponse : null;

    // Fetch latest files from backend
    const latestFilesResponse = await getLatestFilesService();

    // Check if token is invalid/expired for latest files
    if ((latestFilesResponse as any).isUnauthenticated) {
        console.error('🔐 Token invalid/expired - Redirecting to auto-logout');
        redirect('/api/auto-logout?error=session_expired&redirect=/dashboard');
    }

    const recentFiles: LatestFile[] = latestFilesResponse.success && latestFilesResponse.data ? latestFilesResponse.data : [];

    return <DashboardClient user={user} profileData={profileData} latestFiles={recentFiles} />;
}
