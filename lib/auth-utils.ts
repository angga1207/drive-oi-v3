/**
 * Authentication Utilities for Client-Side
 * Helper functions untuk handle auth errors dan auto-logout
 */

/**
 * Check if error is Unauthenticated error
 */
export function isUnauthenticatedError(error: any): boolean {
  return (
    error?.status === 401 ||
    error?.isUnauthenticated === true ||
    error?.message === 'Unauthenticated.' ||
    error?.message === 'Unauthenticated'
  );
}

/**
 * Handle auto-logout when token is invalid/expired
 * Call this function when API returns Unauthenticated error
 */
export async function handleAutoLogout(errorMessage?: string): Promise<void> {
  console.error('🔐 Auto-logout triggered:', errorMessage || 'Token invalid or expired');
  
  // Clear session via API
  try {
    await fetch('/api/session', {
      method: 'DELETE',
    });
  } catch (error) {
    console.error('❌ Failed to clear session:', error);
  }

  // Redirect to login with error message
  const currentPath = window.location.pathname;
  const redirectParam = currentPath !== '/' && currentPath !== '/login' 
    ? `?redirect=${encodeURIComponent(currentPath)}&error=session_expired` 
    : '?error=session_expired';
  
  window.location.href = `/login${redirectParam}`;
}

/**
 * Handle API error with auto-logout if needed
 * Use this in try-catch blocks for API calls
 */
export async function handleApiError(error: any, showAlert: boolean = true): Promise<void> {
  if (isUnauthenticatedError(error)) {
    // Auto-logout for unauthenticated errors
    await handleAutoLogout(error.message);
    return;
  }

  // Handle other errors
  if (showAlert && typeof window !== 'undefined') {
    const Swal = (await import('sweetalert2')).default;
    Swal.fire({
      icon: 'error',
      title: 'Error',
      text: error.message || 'Terjadi kesalahan',
      confirmButtonColor: '#003a69',
    });
  }
}
