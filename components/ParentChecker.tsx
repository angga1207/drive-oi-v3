'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Swal from 'sweetalert2';

interface ParentCheckerProps {
    slug: string;
}

interface ParentData {
    id: number;
    parent_id: number;
    type: string;
    name: string;
    slug: string;
    publicity: {
        status: string;
        editable: boolean;
    };
    author: {
        id: number;
        fullname: string;
    };
}

export default function ParentChecker({ slug }: ParentCheckerProps) {
    const router = useRouter();
    const [checking, setChecking] = useState(true);

    useEffect(() => {
        async function checkParent() {
            try {
                // Get current user session
                const sessionResponse = await fetch('/api/session');
                const sessionData = await sessionResponse.json();
                const isLoggedIn = sessionData.authenticated && sessionData.user !== null;
                const currentUserId = sessionData.user?.id;

                // Get parent info
                const pathResponse = await fetch(`/api/path?slug=${slug}`);
                if (!pathResponse.ok) {
                    setChecking(false);
                    return;
                }

                const pathData = await pathResponse.json();
                const parent: ParentData = pathData.data?.current;

                if (!parent) {
                    setChecking(false);
                    return;
                }

                // Check conditions:
                // 1. Parent is a folder
                // 2. Has publicity.editable = true
                // 3. User is logged in
                // 4. Author is someone else
                if (
                    parent.type === 'folder' &&
                    parent.publicity?.editable === true &&
                    isLoggedIn &&
                    parent.author?.id !== currentUserId
                ) {
                    // Request access to folder
                    const accessResponse = await fetch('/api/getAccessToFolder', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({ slug: parent.slug }),
                    });

                    if (accessResponse.ok) {
                        // Show success message and redirect
                        await Swal.fire({
                            title: 'Akses Diperoleh!',
                            text: 'Anda telah mendapatkan akses ke folder ini',
                            icon: 'success',
                            timer: 1500,
                            showConfirmButton: false,
                        });

                        // Redirect to /shared
                        router.push('/shared');
                    } else {
                        setChecking(false);
                    }
                } else {
                    setChecking(false);
                }
            } catch (error) {
                console.error('Error checking parent:', error);
                setChecking(false);
            }
        }

        checkParent();
    }, [slug, router]);

    // Don't render anything, just handles the logic
    return null;
}
