/**
 * Application Version Configuration
 * Update version here for all pages
 */

export const APP_VERSION = '3.2.8';
export const APP_NAME = 'Drive Ogan Ilir';
export const APP_BUILD_DATE = '2026-01-19';
export const APP_LAST_UPDATE = '2026-03-05';

export function getAppVersion() {
    return {
        version: APP_VERSION,
        name: APP_NAME,
        buildDate: APP_BUILD_DATE,
        lastUpdate: APP_LAST_UPDATE,
        fullVersion: `v${APP_VERSION} (Build: ${APP_BUILD_DATE}, Last Update: ${APP_LAST_UPDATE})`,
    };
}
