import { getSession } from '@/lib/session';
import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import TrashListClient from '@/components/TrashListClient';
import { FaTrash } from 'react-icons/fa';

async function getTrashItems() {
    const session = await getSession();
    if (!session) return null;

    try {
        const cookieStore = await cookies();
        const sessionCookie = cookieStore.get('drive_session');
        
        if (!sessionCookie) {
            console.error('No session cookie found');
            return [];
        }

        const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
        const response = await fetch(`${baseUrl}/api/trash`, {
            headers: {
                'Cookie': `drive_session=${sessionCookie.value}`,
            },
            cache: 'no-store',
        });

        if (!response.ok) {
            console.error('Failed to fetch trash items:', response.status);
            return [];
        }

        const data = await response.json();
        return data.data || [];
    } catch (error) {
        console.error('Error fetching trash items:', error);
        return [];
    }
}

export default async function TrashPage() {
    const session = await getSession();

    if (!session) {
        redirect('/login');
    }

    const items = await getTrashItems();

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
                <h1 className="text-3xl font-bold text-[#003a69] dark:text-[#ebbd18] mb-2 flex items-center gap-2">
                    <FaTrash className="text-[#003a69] dark:text-[#ebbd18]" />
                    Kotak Sampah
                </h1>
                <p className="text-gray-600 dark:text-gray-400">
                    Daftar data yang telah dihapus dan berada di kotak sampah Anda.
                </p>
            </div>

            {/* Items List */}
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
                <TrashListClient items={items} />
            </div>
        </div>
    );
}
