# Google OAuth Setup Guide

## 🔧 Setup Google OAuth Credentials

### 1. Buka Google Cloud Console
Kunjungi: https://console.cloud.google.com/

### 2. Buat Project Baru (jika belum ada)
- Klik "Select a project" di bagian atas
- Klik "New Project"
- Nama project: "Drive OI" (atau nama lain)
- Klik "Create"

### 3. Enable Google+ API
- Di sidebar, pilih "APIs & Services" > "Library"
- Cari "Google+ API"
- Klik "Enable"

### 4. Configure OAuth Consent Screen
- Di sidebar, pilih "APIs & Services" > "OAuth consent screen"
- Pilih "External" (untuk testing) atau "Internal" (untuk organisasi)
- Klik "Create"

**App Information:**
- App name: `Drive OI`
- User support email: (email Anda)
- App logo: (optional)

**App domain:**
- Application home page: `http://localhost:3000`
- Application privacy policy: `http://localhost:3000/privacy`
- Application terms of service: `http://localhost:3000/terms`

**Authorized domains:**
- `localhost` (untuk development)

**Developer contact information:**
- Email: (email Anda)

Klik "Save and Continue"

**Scopes:**
- Klik "Add or Remove Scopes"
- Pilih:
  - `.../auth/userinfo.email`
  - `.../auth/userinfo.profile`
  - `openid`
- Klik "Update" > "Save and Continue"

**Test users (untuk External):**
- Tambahkan email yang akan digunakan untuk testing
- Klik "Save and Continue"

### 5. Create OAuth 2.0 Credentials
- Di sidebar, pilih "APIs & Services" > "Credentials"
- Klik "Create Credentials" > "OAuth client ID"

**Application type:**
- Pilih "Web application"

**Name:**
- `Drive OI - Web Client` (atau nama lain)

**Authorized JavaScript origins:**
- `http://localhost:3000`

**Authorized redirect URIs:**
- `http://localhost:3000/api/auth/callback/google`

⚠️ **PENTING:** Redirect URI harus PERSIS seperti di atas!

Klik "Create"

### 6. Copy Credentials
Setelah dibuat, akan muncul popup dengan:
- **Client ID**: Copy nilai ini
- **Client Secret**: Copy nilai ini

### 7. Update .env.local
Buka file `.env.local` dan update:

```env
# Google OAuth Credentials
GOOGLE_CLIENT_ID=YOUR_CLIENT_ID_HERE
GOOGLE_CLIENT_SECRET=YOUR_CLIENT_SECRET_HERE

# NextAuth Secret (generate random string)
NEXTAUTH_SECRET=YOUR_RANDOM_SECRET_STRING_HERE
```

**Generate NEXTAUTH_SECRET:**
```bash
# Di terminal:
openssl rand -base64 32
```

### 8. Restart Development Server
```bash
# Stop server (Ctrl+C)
npm run dev
```

## ✅ Testing

1. Buka http://localhost:3000/login
2. Klik "Sign in with Google"
3. Pilih akun Google
4. Jika berhasil, akan redirect ke dashboard

## 🐛 Troubleshooting

### Error: "Configuration"
- ❌ GOOGLE_CLIENT_ID atau GOOGLE_CLIENT_SECRET tidak diset
- ✅ Pastikan sudah di .env.local dan restart server

### Error: "OAuthCallback"
- ❌ Redirect URI tidak match
- ✅ Pastikan di Google Console: `http://localhost:3000/api/auth/callback/google`

### Error: "Access denied"
- ❌ User belum di-add ke Test Users (untuk External app)
- ✅ Tambahkan email di OAuth consent screen > Test users

### Error: "This app hasn't been verified"
- ⚠️ Normal untuk development
- ✅ Klik "Advanced" > "Go to Drive OI (unsafe)"

### Backend tidak menerima data
- ❌ Laravel backend tidak running
- ✅ Pastikan Laravel di http://127.0.0.1:8000 sudah running
- ✅ Cek terminal server untuk melihat log API call

## 📊 Check Logs

### Terminal Server (Next.js)
Lihat log untuk debug:
```
🔐 ========== GOOGLE SIGN IN CALLBACK ==========
👤 Google User: {...}
📤 Sending data to Laravel backend...
✅ Backend login successful!
```

### Browser Console
Lihat error detail jika ada masalah

## 🚀 Production Setup

Untuk production:
1. Ganti redirect URI ke domain production
2. Set `NEXTAUTH_URL` ke domain production
3. Update Authorized domains di Google Console
4. Publish OAuth app (bukan Test mode)

## 📞 Need Help?

Jika masih ada error:
1. Cek terminal server untuk detail error
2. Cek browser console
3. Pastikan semua credentials sudah benar
4. Restart development server
