# Google Integration Feature

## Overview
Fitur Google Integration memungkinkan user untuk mengintegrasikan akun Google mereka dengan Drive OI. Setelah terintegrasi, user dapat login menggunakan akun Google dan data akan tersinkronisasi.

## Flow Diagram

```
┌─────────────────┐
│  Profile Page   │
│  [Hubungkan]    │
└────────┬────────┘
         │ Click "Hubungkan Google"
         ▼
┌─────────────────────────────────┐
│ /api/auth/google/integrate      │
│ - Verify user is authenticated  │
│ - Generate OAuth URL            │
└────────┬────────────────────────┘
         │ Redirect to Google
         ▼
┌─────────────────────────────────┐
│    Google OAuth Screen          │
│  - User selects account         │
│  - User grants permissions      │
└────────┬────────────────────────┘
         │ Callback with code
         ▼
┌──────────────────────────────────────┐
│ /api/auth/google/integrate/callback  │
│ - Exchange code for tokens           │
│ - Get user info from Google          │
│ - Send to Laravel backend            │
└────────┬─────────────────────────────┘
         │ POST /api/sync/google
         ▼
┌─────────────────────────────────┐
│   Laravel Backend               │
│ - Validate data                 │
│ - Link Google account to user   │
│ - Return success/failure        │
└────────┬────────────────────────┘
         │ Redirect to profile
         ▼
┌─────────────────────────────────┐
│  Profile Page                   │
│  - Show success message         │
│  - Display "Terhubung" badge    │
│  - Disable integration button   │
└─────────────────────────────────┘
```

## API Endpoints

### 1. Initialize Google Integration
**Endpoint:** `GET /api/auth/google/integrate`

**Purpose:** Start OAuth flow for Google integration

**Process:**
1. Verify user is authenticated (has valid token)
2. Create OAuth2 client
3. Generate authorization URL with:
   - Scopes: `userinfo.profile`, `userinfo.email`
   - State: `integration` (to differentiate from login)
   - Callback URL: `/api/auth/google/integrate/callback`
4. Redirect user to Google OAuth

**Response:** Redirect to Google OAuth screen

---

### 2. Handle OAuth Callback
**Endpoint:** `GET /api/auth/google/integrate/callback?code=...&state=integration`

**Purpose:** Handle callback from Google and sync account

**Process:**
1. Verify state parameter is `integration`
2. Verify user is still authenticated
3. Exchange authorization code for access tokens
4. Get user info from Google:
   - name
   - email
   - picture (profile photo)
5. Send data to Laravel backend via `/api/sync/google`
6. Redirect to profile page with success/error status

**Query Parameters:**
- `code`: Authorization code from Google
- `state`: Should be `integration`
- `error`: Optional error from Google

**Response:** Redirect to `/profile?success=google_synced` or `/profile?error=...`

---

### 3. Sync Google Account (Backend Proxy)
**Endpoint:** `POST /api/syncGoogle`

**Purpose:** Proxy request to Laravel backend

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@gmail.com",
  "image": "https://lh3.googleusercontent.com/..."
}
```

**Headers:**
- `Authorization: Bearer {token}`
- `Content-Type: application/json`

**Laravel Endpoint:** `POST /api/sync/google`

**Laravel Validation:**
```php
[
    'name' => 'required|string',
    'email' => 'required|email',
    'image' => 'nullable|url',
]
```

**Response:**
```json
{
  "status": "success",
  "message": "Google account synced successfully",
  "data": {
    "googleIntegated": true
  }
}
```

## Frontend Components

### Profile Page Updates

**New State:**
```typescript
const [googleLoading, setGoogleLoading] = useState(false);
```

**New Handler:**
```typescript
const handleGoogleIntegration = async () => {
  if (profile?.googleIntegated) {
    Swal.fire({
      icon: 'info',
      title: 'Sudah Terintegrasi',
      text: 'Akun Google Anda sudah terintegrasi',
      confirmButtonColor: '#003a69',
    });
    return;
  }

  setGoogleLoading(true);
  window.location.href = '/api/auth/google/integrate';
};
```

**New UI Section:**
- Card with Google Integration title
- Description text (changes based on integration status)
- Status indicator (green pulse dot for connected)
- Integration button:
  - Enabled: "Hubungkan Google" (white with border, hover effects)
  - Disabled: "Sudah Terhubung" (gray, disabled)
  - Loading: "Menghubungkan..." (during OAuth)

**Success/Error Handling:**
```typescript
useEffect(() => {
  const success = searchParams.get('success');
  const error = searchParams.get('error');

  if (success === 'google_synced') {
    Swal.fire({
      icon: 'success',
      title: 'Berhasil!',
      text: 'Akun Google berhasil diintegrasikan',
    }).then(() => {
      fetchProfile(); // Refresh to get updated status
      window.history.replaceState({}, '', '/profile');
    });
  } else if (error) {
    // Handle error cases
  }
}, [searchParams]);
```

## Security Considerations

1. **Authentication Check:**
   - Both `/integrate` and `/integrate/callback` verify user has valid token
   - If not authenticated, redirect to login

2. **State Parameter:**
   - Use `state=integration` to differentiate from login flow
   - Verify state in callback to prevent CSRF attacks

3. **Token Authorization:**
   - All backend requests include `Authorization: Bearer {token}`
   - Laravel backend validates token before syncing

4. **Scope Limitation:**
   - Only request necessary scopes: `userinfo.profile`, `userinfo.email`
   - No write access to Google account

## Error Handling

### Frontend Errors
- `access_denied`: User denied permission → "Akses ditolak oleh pengguna"
- `sync_failed`: Backend sync failed → "Gagal menyinkronkan akun Google"
- `callback_error`: General error → "Terjadi kesalahan pada callback"
- `no_code`: No authorization code → Redirect to profile with error
- `invalid_state`: Invalid state parameter → Redirect to profile with error

### Backend Errors
- Missing required fields (name/email) → 400 Bad Request
- Authentication failure → 401 Unauthorized
- Backend sync failure → Return Laravel error message

## Testing Checklist

- [ ] Click "Hubungkan Google" button
- [ ] Verify redirect to Google OAuth screen
- [ ] Select Google account
- [ ] Grant permissions
- [ ] Verify redirect back to profile page
- [ ] Check success notification appears
- [ ] Verify "Terhubung" badge is displayed
- [ ] Verify button is disabled and shows "Sudah Terhubung"
- [ ] Check profile.googleIntegated is true
- [ ] Test clicking button when already integrated (should show info message)
- [ ] Test error scenarios (deny permission, network failure)
- [ ] Verify console logs show complete flow

## Files Modified/Created

### Created:
1. `/app/api/syncGoogle/route.ts` - Proxy endpoint for syncing
2. `/app/api/auth/google/integrate/route.ts` - OAuth initialization
3. `/app/api/auth/google/integrate/callback/route.ts` - OAuth callback handler
4. `/docs/GOOGLE_INTEGRATION.md` - This documentation

### Modified:
1. `/app/(protected)/profile/page.tsx`:
   - Added `useSearchParams` import
   - Added `FaGoogle` icon import
   - Added `googleLoading` state
   - Added `handleGoogleIntegration` handler
   - Added success/error handling in useEffect
   - Added Google Integration UI section

## Environment Variables Required

```env
AUTH_GOOGLE_ID=your_google_client_id
AUTH_GOOGLE_SECRET=your_google_client_secret
NEXTAUTH_URL=http://localhost:3000
```

## Backend Requirements (Laravel)

**Endpoint:** `POST /api/sync/google`

**Middleware:** `auth:sanctum`

**Controller Logic:**
1. Validate request data
2. Find authenticated user
3. Update user record with Google data:
   - Store Google email
   - Store Google name
   - Store Google photo URL
   - Set `google_integrated` flag to true
4. Return success response

**Database Schema:**
```sql
ALTER TABLE users ADD COLUMN google_integrated BOOLEAN DEFAULT FALSE;
ALTER TABLE users ADD COLUMN google_email VARCHAR(255) NULLABLE;
ALTER TABLE users ADD COLUMN google_name VARCHAR(255) NULLABLE;
ALTER TABLE users ADD COLUMN google_photo VARCHAR(500) NULLABLE;
```

## Notes

- Integration is separate from login - user must already be logged in
- After integration, user can use either regular login OR Google login
- Google data (name, email, photo) is synced to Drive OI database
- Integration status is stored in `profile.googleIntegated` field
- UI automatically updates based on integration status
