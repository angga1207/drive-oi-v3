import { cookies } from 'next/headers';
import { SESSION_CONFIG } from './config';
import { User } from './types';

/**
 * Session Management untuk Authentication
 * Menggunakan httpOnly cookies untuk keamanan maksimal
 */

interface SessionData {
  token: string;
  user: User;
  expiresAt: number;
}

/**
 * Encrypt session data (simplified, gunakan library crypto yang lebih robust di production)
 */
function encryptSession(data: SessionData): string {
  // Dalam production, gunakan crypto library yang lebih aman
  return Buffer.from(JSON.stringify(data)).toString('base64');
}

/**
 * Decrypt session data
 */
function decryptSession(encrypted: string): SessionData | null {
  try {
    const decrypted = Buffer.from(encrypted, 'base64').toString('utf-8');
    return JSON.parse(decrypted);
  } catch {
    return null;
  }
}

/**
 * Set session dengan token dan user data
 */
export async function setSession(token: string, user: User): Promise<void> {
  const cookieStore = await cookies();
  const expiresAt = Date.now() + SESSION_CONFIG.MAX_AGE * 1000;

  const sessionData: SessionData = {
    token,
    user,
    expiresAt,
  };

  const encrypted = encryptSession(sessionData);

  cookieStore.set(SESSION_CONFIG.COOKIE_NAME, encrypted, {
    httpOnly: SESSION_CONFIG.HTTP_ONLY,
    secure: SESSION_CONFIG.SECURE,
    sameSite: SESSION_CONFIG.SAME_SITE,
    maxAge: SESSION_CONFIG.MAX_AGE,
    path: SESSION_CONFIG.PATH,
  });
}

/**
 * Get session data dari cookies
 */
export async function getSession(): Promise<SessionData | null> {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get(SESSION_CONFIG.COOKIE_NAME);

  if (!sessionCookie?.value) {
    return null;
  }

  const session = decryptSession(sessionCookie.value);

  if (!session) {
    return null;
  }

  // Check if session expired
  if (Date.now() > session.expiresAt) {
    await clearSession();
    return null;
  }

  return session;
}

/**
 * Get current user dari session
 */
export async function getCurrentUser(): Promise<User | null> {
  const session = await getSession();
  return session?.user || null;
}

/**
 * Get bearer token dari session
 */
export async function getToken(): Promise<string | null> {
  const session = await getSession();
  return session?.token || null;
}

/**
 * Check if user is authenticated
 */
export async function isAuthenticated(): Promise<boolean> {
  const session = await getSession();
  return session !== null;
}

/**
 * Clear session (logout)
 */
export async function clearSession(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_CONFIG.COOKIE_NAME);
}

/**
 * Update user data dalam session (keep token tetap sama)
 */
export async function updateSessionUser(user: User): Promise<void> {
  const session = await getSession();
  if (session) {
    await setSession(session.token, user);
  }
}
