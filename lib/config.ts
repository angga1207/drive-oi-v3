/**
 * API Configuration
 * Centralized configuration untuk API calls
 */

// Bypass SSL certificate validation di production
// Ini mengatasi error "fetch failed" karena self-signed cert atau cert chain tidak trusted
if (typeof process !== 'undefined' && process.env) {
    if (!process.env.NODE_TLS_REJECT_UNAUTHORIZED) {
        process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
    }
}

/**
 * Internal URL Resolver
 * 
 * Masalah: Ketika Next.js dan Laravel backend berjalan di server yang SAMA (misal AAPanel),
 * fetch ke domain publik (https://drive-backend.oganilirkab.go.id) sering gagal karena:
 * - Firewall memblokir loopback ke IP publik sendiri
 * - Hairpin NAT tidak disupport
 * - Koneksi timeout (Connect Timeout Error)
 * 
 * Solusi: Set API_INTERNAL_URL di .env production (misal http://127.0.0.1:80/api)
 * agar komunikasi server-to-server lewat localhost, bukan lewat internet.
 * Host header otomatis di-inject agar Nginx bisa routing ke site yang benar.
 */

// Extract hostname dari URL
function extractHostname(url: string): string | null {
    try {
        return new URL(url).host;
    } catch {
        return null;
    }
}

// Simpan hostname backend asli SEBELUM di-override (untuk Host header)
const _originalBackendHost = process.env.API_INTERNAL_URL
    ? extractHostname(process.env.API_BASE_URL || '')
    : null;

// Jika API_INTERNAL_URL di-set, override API_BASE_URL di process.env
// sehingga SEMUA code yang baca process.env.API_BASE_URL langsung juga pakai internal URL
if (typeof process !== 'undefined' && process.env?.API_INTERNAL_URL) {
    process.env.API_BASE_URL = process.env.API_INTERNAL_URL;
}

export const API_CONFIG = {
    BASE_URL: process.env.API_BASE_URL || 'http://127.0.0.1:8000/api',
    TIMEOUT: parseInt(process.env.API_TIMEOUT || '30000'),
    HEADERS: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
    },
    /**
     * Host header dari domain backend asli.
     * Diperlukan saat menggunakan API_INTERNAL_URL agar Nginx bisa routing ke site yang benar.
     * Bernilai null jika tidak pakai API_INTERNAL_URL.
     */
    BACKEND_HOST: _originalBackendHost,
} as const;

/**
 * Monkey-patch global fetch untuk otomatis inject Host header
 * ketika request ditujukan ke backend internal URL.
 * 
 * Ini memastikan SEMUA fetch() di seluruh codebase (baik via apiClient
 * maupun direct fetch di API routes) otomatis mendapat Host header yang benar,
 * TANPA perlu mengubah masing-masing file.
 */
if (typeof globalThis !== 'undefined' && _originalBackendHost && API_CONFIG.BASE_URL) {
    const _originalFetch = globalThis.fetch;
    const _internalBaseUrl = API_CONFIG.BASE_URL;
    const _hostHeader = _originalBackendHost;

    globalThis.fetch = function patchedFetch(
        input: RequestInfo | URL,
        init?: RequestInit
    ): Promise<Response> {
        // Ambil URL string dari berbagai tipe input
        let url: string;
        if (typeof input === 'string') {
            url = input;
        } else if (input instanceof URL) {
            url = input.toString();
        } else if (input instanceof Request) {
            url = input.url;
        } else {
            return _originalFetch(input, init);
        }

        // Hanya inject Host header untuk request ke backend internal
        if (url.startsWith(_internalBaseUrl)) {
            const headers = new Headers(init?.headers);
            if (!headers.has('Host')) {
                headers.set('Host', _hostHeader);
            }
            return _originalFetch(input, { ...init, headers });
        }

        return _originalFetch(input, init);
    } as typeof fetch;

    console.log(`✅ Backend fetch patched: ${_internalBaseUrl} → Host: ${_hostHeader}`);
}

/**
 * API Endpoints
 * Definisi semua endpoint yang digunakan
 */
export const API_ENDPOINTS = {
    // Authentication
    AUTH: {
        // LOGIN: '/login',
        LOGIN: '/mobile-login',
        LOGINGOOGLE: '/login/google',
        REGISTER: '/register',
        LOGOUT: '/logout',
        GET_PROFILE: '/getProfile',
        REFRESH: '/refresh',
    },
    // User
    USER: {
        PROFILE: '/user/profile',
        UPDATE: '/user/update',
    },
    // Drive
    DRIVE: {
        LIST: '/drive',
        GET_PATH: '/getPath',
        GET_ITEMS: '/getItems',
        GET_FAVORITE_ITEMS: '/getFavoriteItems',
        LATEST_FILES: '/latestFiles',
        CREATE_FOLDER: '/drive/folder',
        UPLOAD: '/drive/upload',
        DELETE: '/drive',
        RENAME: '/drive',
        MOVE: '/drive/move',
        SHARE: '/drive/share',
    },
} as const;

/**
 * Session Cookie Configuration
 */
export const SESSION_CONFIG = {
    COOKIE_NAME: 'drive_session',
    MAX_AGE: 60 * 60 * 24 * 7, // 7 days
    PATH: '/',
    SECURE: process.env.NODE_ENV === 'production',
    HTTP_ONLY: true,
    SAME_SITE: 'lax' as const,
} as const;
