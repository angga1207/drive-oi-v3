/**
 * Application Version Configuration
 * Update version here for all pages
 */

export const APP_VERSION = '3.0.6';
export const APP_NAME = 'Drive Ogan Ilir';
export const APP_BUILD_DATE = '2026-01-19';

export function getAppVersion() {
    return {
        version: APP_VERSION,
        name: APP_NAME,
        buildDate: APP_BUILD_DATE,
        fullVersion: `v${APP_VERSION} (Build: ${APP_BUILD_DATE})`,
    };
}
