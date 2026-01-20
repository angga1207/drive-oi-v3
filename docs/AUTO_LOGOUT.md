# Auto-Logout untuk Token Expired/Invalid

## Fitur
Sistem akan otomatis melakukan logout dan redirect ke halaman login ketika:
1. Token bearer dari backend sudah dihapus
2. Token bearer sudah expired/invalid
3. Backend mengembalikan response error **"Unauthenticated."**

## Implementasi

### 1. API Client Error Detection
[lib/api-client.ts](../lib/api-client.ts) - Mendeteksi error 401 atau message "Unauthenticated"
```typescript
if (response.status === 401 || data.message === 'Unauthenticated.') {
    throw {
        status: 401,
        message: 'Unauthenticated.',
        isUnauthenticated: true, // Flag for auto-logout
    };
}
```

### 2. Service Layer
[lib/services/auth.service.ts](../lib/services/auth.service.ts) - Service functions menangkap error dan menandai dengan flag
```typescript
catch (error: any) {
    if (error.status === 401 || error.isUnauthenticated) {
        return {
            success: false,
            message: 'Unauthenticated.',
            isUnauthenticated: true,
        };
    }
}
```

### Server Components
Server components seperti [files/page.tsx](../app/(protected)/files/page.tsx) dan [shared/page.tsx](../app/(protected)/shared/page.tsx) akan:
- Check flag `isUnauthenticated` dari service response
- Redirect ke `/api/auto-logout?error=session_expired&redirect=/current-path`
- Auto-logout route handler akan clear session dan redirect ke login

**IMPORTANT**: Tidak boleh call `clearSession()` langsung di page component karena Next.js 15+ tidak mengizinkan modifikasi cookies di Server Component. Harus melalui Route Handler atau Server Action.

```typescript
if ((pathResponse as any).isUnauthenticated) {
    console.error('🔐 Token invalid/expired - Redirecting to auto-logout');
    redirect('/api/auto-logout?error=session_expired&redirect=/files');
}
```

### 6. Auto-Logout Route Handler ✨ NEW
[app/api/auto-logout/route.ts](../app/api/auto-logout/route.ts) - Route handler untuk clear session dengan aman
```typescript
export async function GET(request: Request) {
    await clearSession(); // Safe to modify cookies in Route Handler
    redirect('/login?error=session_expired&redirect=/original-path');
}
```

### 4. Client Components (Client-Side)
Client components dapat menggunakan helper dari [lib/auth-utils.ts](../lib/auth-utils.ts):

```typescript
import { handleApiError, isUnauthenticatedError } from '@/lib/auth-utils';

try {
    // API call
    const response = await fetch('/api/something');
    const data = await response.json();
    
    if (!response.ok) {
        // Auto-logout jika Unauthenticated
        await handleApiError(data);
    }
} catch (error) {
    await handleApiError(error);
}
```

### 5. Session API
[app/api/session/route.ts](../app/api/session/route.ts) - Support DELETE method untuk client-side logout
```typescript
// DELETE /api/session
export async function DELETE() {
    await clearSession();
    return NextResponse.json({ success: true });
}
```

## Flow Diagram

### Server-Side Flow (Server Components)
```
User Request Page
    ↓
Server Component fetch data → Service call API
    ↓
Backend returns 401 "Unauthenticated"
    ↓
Service returns { isUnauthenticated: true }
    ↓
Page checks isUnauthenticated flag
    ↓
redirect('/api/auto-logout?error=session_expired&redirect=/files')
    ↓
Auto-Logout Route Handler
    ↓
clearSession() - Clear cookies (Safe in Route Handler)
    ↓
redirect('/login?error=session_expired&redirect=/files')
```

### Client-Side Flow (Client Components)
```
User Action (click, etc)
    ↓
Client Component → API call
    ↓
API returns 401 or "Unauthenticated"
    ↓
handleApiError() detects isUnauthenticatedError
    ↓
Call DELETE /api/session
    ↓
window.location.href = '/login?error=session_expired'
```

## Error Messages

Di halaman login, user akan melihat pesan error yang jelas:
- **session_expired**: "Sesi Anda telah berakhir atau token tidak valid. Silakan login kembali."
- **access_denied**: "Akses ditolak oleh Google"
- **no_code**: "Kode otorisasi tidak ditemukan"
- **oauth_failed**: "Login dengan Google gagal"

## Affected Pages

Pages yang telah diproteksi dengan auto-logout:

### Server Components
- ✅ [/files](../app/(protected)/files/page.tsx) - File explorer
- ✅ [/shared](../app/(protected)/shared/page.tsx) - Shared files
- ✅ [/dashboard](../app/(protected)/dashboard/page.tsx) - Dashboard with profile
- 🔲 /favorite - Perlu ditambahkan
- 🔲 /trash - Perlu ditambahkan
- 🔲 /profile - Perlu ditambahkan

### Client Components
- ✅ Helper tersedia via `lib/auth-utils.ts`
- 🔲 Perlu diintegrasikan ke semua client components yang melakukan API calls

## Testing

### Test Scenario 1: Token Expired
1. Login ke aplikasi
2. Hapus token di backend (via Laravel admin atau database)
3. Refresh halaman atau navigate ke `/files`
4. **Expected**: Auto-logout dan redirect ke `/login?error=session_expired`

### Test Scenario 2: Manual Token Delete
1. Login ke aplikasi
2. Buka Developer Tools → Application → Cookies
3. Delete cookie `drive_session`
4. Refresh halaman
5. **Expected**: Redirect ke login karena no session

### Test Scenario 3: Backend 401 Response
1. Login normal
2. Backend returns 401 Unauthenticated pada API call
3. **Expected**: Auto-logout dan redirect dengan error message

## Notes

- Session timeout default: 30 hari (2,592,000 detik)
- Cookie name: `drive_session`
- Cookie attributes: `httpOnly`, `secure` (production), `sameSite: 'lax'`
- Auto-logout tidak akan trigger jika error bukan Unauthenticated (404, 500, dll)
- Redirect akan preserve current path di query param `?redirect=...` untuk kembali setelah login

## Future Improvements

1. Tambahkan auto-logout ke semua protected pages
2. Implementasi token refresh mechanism
3. Add countdown timer sebelum auto-logout (optional)
4. Tambahkan logging/analytics untuk track session expiry
5. Implementasi "Remember Me" feature dengan token yang lebih panjang
