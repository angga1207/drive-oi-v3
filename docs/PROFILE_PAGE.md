# Halaman Profile - Dokumentasi

## Deskripsi
Halaman profile menampilkan informasi lengkap tentang pengguna, statistik penyimpanan, dan log aktivitas mereka dalam sistem Drive OI. Halaman ini juga dilengkapi dengan fitur edit profil.

## Fitur

### 1. **Informasi Profil Pengguna**
- Avatar/foto profil
- Nama lengkap dan username
- Email
- Status integrasi (Google, Semesta, Apple)
- Status online (indikator hijau)

### 2. **Statistik Penyimpanan**
- Icon: BiSolidData dari react-icons
- Total penyimpanan dan penggunaan
- Progress bar visual dengan gradient
- Persentase penggunaan
- Gradient: from-primary to-primary-light

### 3. **Statistik File & Folder**
- **Total File**
  - Icon: HiDocumentText dari react-icons/hi2
  - Gradient: from-primary-light to-primary
- **Total Folder**
  - Icon: HiFolder dari react-icons/hi2
  - Gradient: from-accent to-accent-dark
- Total item yang dibagikan

### 4. **Log Aktivitas**
- Daftar aktivitas pengguna dengan pagination
- Icon visual untuk setiap jenis aktivitas
- Badge berwarna sesuai kategori event
- Informasi detail:
  - Deskripsi aktivitas
  - Timestamp (dengan format relatif)
  - IP Address
  - User Agent
- Pagination untuk navigasi halaman

### 5. **Edit Profil** ✨ NEW
- Modal form untuk edit profil
- Fields yang dapat diedit:
  - Nama Depan (firstname) *
  - Nama Belakang (lastname) *
  - Username *
  - Foto Profil (opsional)
  - Password Baru (opsional)
  - Konfirmasi Password (opsional)
- Preview foto profil sebelum upload
- Validasi form
- Loading state saat menyimpan

## Endpoint API

### GET /api/getProfile
Mengambil data profil pengguna dari backend Laravel.

**Request:**
- Method: GET
- Headers: Authorization Bearer token (otomatis dari session)

**Response:**
```json
{
  "status": "success",
  "message": null,
  "data": {
    "id": 4,
    "fullname": "Airlangga Satria",
    "firstname": "Airlangga",
    "lastname": "Satria",
    "username": "angga1207",
    "email": "angga.coolsnew@gmail.com",
    "googleIntegated": true,
    "semestaIntegrated": false,
    "appleIntegrated": false,
    "photo": "https://...",
    "storage": {
      "total": "51 GB",
      "used": "1 GB",
      "rest": "50 GB",
      "percent": 1.97,
      "total_raw": 51
    },
    "datas": {
      "files": 84,
      "folders": 34,
      "shared": 43
    },
    "access": true,
    "created_at": null,
    "updated_at": "2026-01-13T07:53:40.000000Z"
  }
}
```

### POST /api/updateProfile ✨ NEW
Update data profil pengguna.

**Request:**
- Method: POST
- Headers: Authorization Bearer token (otomatis dari session)
- Body: FormData
  - `firstname` (string, required) - Nama depan
  - `lastname` (string, required) - Nama belakang
  - `username` (string, required) - Username
  - `photo` (file, optional) - Foto profil (image file)
  - `password` (string, optional) - Password baru
  - `password_confirmation` (string, optional) - Konfirmasi password baru

**Response:**
```json
{
  "status": "success",
  "message": "Profile updated successfully",
  "data": {
    "id": 4,
    "fullname": "Airlangga Satria",
    "firstname": "Airlangga",
    "lastname": "Satria",
    "username": "angga1207",
    "email": "angga.coolsnew@gmail.com",
    "photo": "https://...",
    "updated_at": "2026-01-19T12:00:00.000000Z"
  }
}
```

**Validasi:**
- Firstname, lastname, dan username tidak boleh kosong
- Jika password diisi, maka password_confirmation harus sama
- Photo harus berupa file gambar (jika diupload)

### GET /api/getActivities
Mengambil log aktivitas pengguna dengan pagination.

**Request:**
- Method: GET
- Query Params: `page` (integer, default: 1)
- Headers: Authorization Bearer token (otomatis dari session)

**Response:**
```json
{
  "status": "success",
  "message": "Activities",
  "data": {
    "data": [
      {
        "id": 32828,
        "description": "Merubah status folder 1234 menjadi public",
        "ip_address": "10.20.1.1",
        "agent": "node",
        "event": "publicity-folder",
        "created_at": "2026-01-15 15:49:46"
      }
    ],
    "current_page": 1,
    "last_page": 3,
    "total": 22
  }
}
```

## Jenis Event & Icon

| Event | Icon | Warna |
|-------|------|-------|
| mobile-login | 🔑 | Blue |
| upload-file | 📤 | Green |
| delete-item | 🗑️ | Orange |
| force-delete-item | ⚠️ | Red |
| restore-item | ♻️ | Teal |
| rename-folder | ✏️ | Purple |
| rename-file | ✏️ | Purple |
| favorite-folder | ⭐ | Yellow |
| publicity-folder | 🔓 | Indigo |
| create-folder | 📁 | Gray |
| move-item | ➡️ | Gray |
| share-item | 🔗 | Gray |

## Komponen

### Files Created/Modified:
1. `/app/(protected)/profile/page.tsx` - Main profile page component (with edit modal)
2. `/app/api/getProfile/route.ts` - API route untuk profile
3. `/app/api/getActivities/route.ts` - API route untuk activities
4. `/app/api/updateProfile/route.ts` - API route untuk update profile ✨ NEW
5. `/lib/types.ts` - Type definitions (ProfileData, Activity, ActivitiesResponse)

## React Icons yang Digunakan

```tsx
import { BiSolidData } from 'react-icons/bi';           // Storage icon
import { HiDocumentText, HiFolder } from 'react-icons/hi2'; // File & Folder icons
import { FiEdit2 } from 'react-icons/fi';                // Edit button icon
```

Icon ini disesuaikan dengan yang digunakan di halaman dashboard untuk konsistensi UI.
3. `/app/api/getActivities/route.ts` - API route untuk activities
4. `/lib/types.ts` - Type definitions (ProfileData, Activity, ActivitiesResponse)

## UI/UX Features

### Desain Minimalis
- Card-based layout dengan shadow dan border halus
- Responsive design (mobile & desktop)
- Dark mode support
- Smooth transitions dan hover effects
- Icon yang konsisten dengan dashboard

### Edit Profile Modal
- Full-screen overlay dengan backdrop blur
- Centered modal dengan max-width
- Scrollable content untuk mobile
- Preview foto sebelum upload
- Clear button untuk close modal
- Form validation feedback

### Loading States
- Spinner untuk initial loading
- Separate loading state untuk activities pagination
- Button loading state saat menyimpan edit

### Error Handling
- Empty state untuk no data
- User-friendly error messages
- Alert untuk validation errors
- Alert untuk success/error update

### Accessibility
- Semantic HTML
- Proper contrast ratios
- Keyboard navigation support

## Format Timestamp
Timestamp ditampilkan dengan format relatif untuk pengalaman yang lebih baik:
- "Baru saja" (< 1 menit)
- "X menit yang lalu" (< 1 jam)
- "X jam yang lalu" (< 1 hari)
- "X hari yang lalu" (< 1 minggu)
- Format lengkap dengan tanggal (> 1 minggu)

## Testing
Halaman dapat diakses di: `http://localhost:3000/profile`

**Catatan:** Pengguna harus login terlebih dahulu untuk mengakses halaman ini. Token autentikasi diambil otomatis dari session.
