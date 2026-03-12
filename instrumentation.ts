/**
 * Next.js Instrumentation
 * File ini dijalankan SEKALI pada saat server startup, SEBELUM route manapun diload.
 * 
 * Digunakan untuk:
 * - Override API_BASE_URL dengan API_INTERNAL_URL (agar fetch ke localhost)
 * - Bypass SSL validation
 */
export async function register() {
    // Jalankan hanya di server (Node.js runtime)
    if (process.env.NEXT_RUNTIME === 'nodejs' || typeof window === 'undefined') {

        // Bypass SSL certificate validation
        if (!process.env.NODE_TLS_REJECT_UNAUTHORIZED) {
            process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
        }

        // Jika API_INTERNAL_URL di-set, override API_BASE_URL
        // agar semua code yang baca process.env.API_BASE_URL langsung pakai internal URL
        if (process.env.API_INTERNAL_URL) {
            console.log(`🔧 Instrumentation: Overriding API_BASE_URL`);
            console.log(`   External: ${process.env.API_BASE_URL}`);
            console.log(`   Internal: ${process.env.API_INTERNAL_URL}`);
            process.env.API_BASE_URL = process.env.API_INTERNAL_URL;
        }
    }
}
