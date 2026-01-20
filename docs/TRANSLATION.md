# Multi-Language Translation Feature

## Overview
Aplikasi Drive Ogan Ilir kini mendukung 3 bahasa:
1. **Indonesia (Default)** - Bahasa Indonesia
2. **English** - Bahasa Inggris
3. **Palembang** - Bahasa daerah Palembang

## Struktur File

### Translation Files
- `/locales/id.ts` - Bahasa Indonesia (default)
- `/locales/en.ts` - Bahasa Inggris
- `/locales/plm.ts` - Bahasa Palembang

### Context & Components
- `/contexts/LanguageContext.tsx` - Context untuk manage bahasa
- `/components/LanguageSwitcher.tsx` - Komponen dropdown untuk switch bahasa

## Cara Penggunaan

### 1. Menggunakan Hook `useLanguage`

```tsx
import { useLanguage } from '@/contexts/LanguageContext';

function MyComponent() {
  const { t, language, setLanguage } = useLanguage();
  
  return (
    <div>
      <h1>{t.dashboard.welcome}</h1>
      <p>{t.dashboard.greeting}</p>
    </div>
  );
}
```

### 2. Menambahkan Translation Baru

Edit file di `/locales/` untuk menambahkan key baru:

```typescript
// locales/id.ts
export const id = {
  common: {
    welcome: 'Selamat Datang',
    // tambahkan key baru di sini
  }
};

// locales/en.ts
export const en: TranslationKeys = {
  common: {
    welcome: 'Welcome',
    // tambahkan key baru di sini
  }
};

// locales/plm.ts
export const plm: TranslationKeys = {
  common: {
    welcome: 'Slamat Datang',
    // tambahkan key baru di sini
  }
};
```

### 3. Kategori Translation yang Tersedia

- `common` - Text umum (welcome, loading, save, cancel, dll)
- `nav` - Navigasi menu
- `dashboard` - Halaman dashboard
- `files` - Halaman files
- `auth` - Authentication (login, register)
- `errors` - Error messages
- `footer` - Footer links

## Komponen Language Switcher

Language switcher sudah ditambahkan di:
- ✅ Sidebar desktop (Protected Layout)
- ✅ Login page (Top right corner)
- ✅ No-access page (melalui layout)

### Tampilan Language Switcher
- Menampilkan flag emoji dan nama bahasa
- Dropdown dengan 3 pilihan bahasa
- Check mark untuk bahasa aktif
- Auto-close saat click outside

## Persistence
Bahasa yang dipilih disimpan di **localStorage** dengan key `language`, sehingga pilihan bahasa user tetap tersimpan setelah refresh atau login kembali.

## Halaman yang Sudah Support Translation

### ✅ Sudah Diimplementasi
1. **Protected Layout** (Sidebar Navigation)
   - Menu navigasi: Dashboard, Files, Favorite, Shared, Trash, Profile, Users
   - Logout button

2. **Dashboard Page**
   - Welcome message
   - Stats cards (Storage, Files, Folders, Shared)
   - Recent files section
   - Relative time formatting (berbeda per bahasa)

3. **Login Page**
   - Session expired message
   - Language switcher di top right

4. **No-access Page**
   - Error messages
   - Contact admin messages
   - Logout button

### 🔲 Belum Diimplementasi (Opsional)
- Files page
- Favorite page
- Shared page
- Trash page
- Profile page
- Privacy Policy page
- Terms & Conditions page
- Modals (Rename, Share, Move, Preview)

## Menambahkan Translation ke Halaman Baru

1. **Tambahkan LanguageProvider di layout** (jika belum ada):
```tsx
import { LanguageProvider } from '@/contexts/LanguageContext';

export default function Layout({ children }) {
  return (
    <LanguageProvider>
      {children}
    </LanguageProvider>
  );
}
```

2. **Gunakan hook di component**:
```tsx
'use client';
import { useLanguage } from '@/contexts/LanguageContext';

export default function MyPage() {
  const { t } = useLanguage();
  
  return <h1>{t.common.welcome}</h1>;
}
```

## Tips

1. **Type Safety**: Semua translation key sudah di-type dengan TypeScript, jadi akan ada autocomplete dan error jika key tidak ditemukan.

2. **Relative Time**: Dashboard menggunakan relative time yang berbeda per bahasa (e.g., "2 hours ago" vs "2 jam yang lalu" vs "2 jam yang lalu").

3. **Konsistensi**: Pastikan semua 3 bahasa memiliki key yang sama untuk menghindari error.

4. **Bahasa Palembang**: Gunakan dialek yang umum dan mudah dipahami masyarakat Palembang.

## Testing

Test dengan:
1. Switch bahasa di sidebar
2. Refresh page (harus tetap di bahasa yang dipilih)
3. Login/logout (localStorage tetap tersimpan)
4. Test di berbagai halaman yang sudah support translation
