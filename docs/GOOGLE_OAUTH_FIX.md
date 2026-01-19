# Fix Google OAuth Redirect URI Issue

## Problem
Google OAuth mengarahkan ke `https://localhost:30066/` padahal seharusnya menggunakan `NEXT_PUBLIC_APP_URL` dari `.env.local` yaitu `http://localhost:3000`.

## Root Cause
URL redirect hardcoded di **Google Cloud Console OAuth 2.0 Client ID Configuration**.

## Solution

### 1. Update Google Cloud Console

1. Buka [Google Cloud Console](https://console.cloud.google.com/)
2. Pilih project Anda: **Drive Ogan Ilir** (atau nama project yang Anda gunakan)
3. Navigate ke: **APIs & Services** → **Credentials**
4. Klik pada OAuth 2.0 Client ID yang Anda gunakan
5. Di bagian **Authorized redirect URIs**, tambahkan/update dengan:

   **Untuk Development (localhost):**
   ```
   http://localhost:3000/api/auth/google/callback
   http://localhost:3000/api/auth/google/integrate/callback
   ```

   **Untuk Production:**
   ```
   https://drive.oganilirkab.go.id/api/auth/google/callback
   https://drive.oganilirkab.go.id/api/auth/google/integrate/callback
   ```

6. **HAPUS** redirect URI yang lama: `https://localhost:30066/`
7. Klik **SAVE**

### 2. Restart Development Server

Setelah mengupdate Google Cloud Console:

```bash
# Stop server (Ctrl+C)
# Start ulang
npm run dev
```

### 3. Test Google Login

1. Buka: `http://localhost:3000/login`
2. Klik tombol "Sign in with Google"
3. Seharusnya sekarang redirect ke `http://localhost:3000/api/auth/google/callback` (bukan https://localhost:30066/)

### 4. Debug Logging

Code sudah ditambahkan logging untuk debug. Cek terminal output saat Google login:

```
🔐 Google OAuth: Starting authentication
🌐 NEXT_PUBLIC_APP_URL: http://localhost:3000
🔗 Redirect URI: http://localhost:3000/api/auth/google/callback
```

Pastikan nilai NEXT_PUBLIC_APP_URL dan Redirect URI sesuai dengan yang ada di `.env.local`.

## Environment Variables

Pastikan `.env.local` berisi:

```env
# Development
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Production (uncomment saat deploy)
# NEXT_PUBLIC_APP_URL=https://drive.oganilirkab.go.id

# Google OAuth credentials
AUTH_GOOGLE_ID=70028828224-9v0q0hld9gk406f4gd20l4rio8vlaa30.apps.googleusercontent.com
AUTH_GOOGLE_SECRET=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
```

## Checklist

- [ ] Update Google Cloud Console Authorized redirect URIs
- [ ] Remove old redirect URI (https://localhost:30066/)
- [ ] Restart development server
- [ ] Test Google login
- [ ] Verify redirect ke URL yang benar
- [ ] Check terminal logs untuk memastikan NEXT_PUBLIC_APP_URL correct

## Notes

- Google Cloud Console perlu waktu beberapa detik untuk apply perubahan
- Jika masih error setelah update, tunggu 1-2 menit dan coba lagi
- Pastikan tidak ada typo di redirect URI (perhatikan http vs https)
- Untuk production, gunakan https:// bukan http://

## Common Errors

### Error: redirect_uri_mismatch
**Cause:** Redirect URI di code tidak match dengan yang ada di Google Cloud Console

**Fix:** 
1. Check console log untuk melihat Redirect URI yang digunakan
2. Copy exact URI tersebut
3. Tambahkan ke Google Cloud Console Authorized redirect URIs

### Error: invalid_client
**Cause:** Client ID atau Client Secret salah

**Fix:**
1. Verify `AUTH_GOOGLE_ID` dan `AUTH_GOOGLE_SECRET` di `.env.local`
2. Pastikan match dengan credentials di Google Cloud Console
