/**
 * API Configuration
 * Centralized configuration untuk API calls
 */

export const API_CONFIG = {
    BASE_URL: process.env.API_BASE_URL || 'http://127.0.0.1:8000/api',
    TIMEOUT: parseInt(process.env.API_TIMEOUT || '30000'),
    HEADERS: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
    },
} as const;

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
