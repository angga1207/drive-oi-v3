import { redirect } from 'next/navigation';
import { isAuthenticated } from '@/lib/session';
import { cookies } from 'next/headers';

export default async function Home({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  // Check if auto-login params exist FIRST before checking authentication
  const aoSemesta = searchParams['ao-semesta'];
  const nip = searchParams['nip'];
  const key = searchParams['key'];
  const VALID_KEY = '049976129942';

  // If auto-login params are present and valid, force logout and redirect to login
  if (aoSemesta === 'true' && nip && key === VALID_KEY) {
    // Clear session cookie immediately to force logout
    const cookieStore = await cookies();
    cookieStore.delete('token');

    const params = new URLSearchParams({
      'ao-semesta': 'true',
      nip: nip as string,
      key: key as string,
    });
    redirect(`/login?${params.toString()}`);
  }

  // Normal flow: check authentication
  const authenticated = await isAuthenticated();

  if (authenticated) {
    redirect('/dashboard');
  } else {
    redirect('/login');
  }
}
