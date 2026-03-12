import { API_CONFIG } from './config';

/**
 * Base API Client untuk komunikasi dengan Laravel Backend
 * HANYA digunakan di SERVER SIDE (API Routes atau Server Components)
 * TIDAK PERNAH di-expose ke client side
 */

interface RequestOptions extends RequestInit {
    token?: string;
    params?: Record<string, string>;
}

class ApiClient {
    private baseURL: string;
    private timeout: number;

    constructor() {
        this.baseURL = API_CONFIG.BASE_URL;
        this.timeout = API_CONFIG.TIMEOUT;
    }

    /**
     * Build URL dengan query parameters
     */
    private buildURL(endpoint: string, params?: Record<string, string>): string {
        // Pastikan baseURL dan endpoint digabungkan dengan benar
        const fullUrl = this.baseURL + endpoint;
        const url = new URL(fullUrl);

        if (params) {
            Object.entries(params).forEach(([key, value]) => {
                url.searchParams.append(key, value);
            });
        }

        return url.toString();
    }

    /**
     * Build headers dengan Bearer token jika ada
     */
    private buildHeaders(token?: string): HeadersInit {
        const headers: Record<string, string> = {
            ...API_CONFIG.HEADERS,
        };

        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }

        return headers;
    }

    /**
     * Generic request method dengan timeout
     */
    private async request<T>(
        endpoint: string,
        options: RequestOptions = {}
    ): Promise<T> {
        const { token, params, ...fetchOptions } = options;

        const url = this.buildURL(endpoint, params);
        const headers = this.buildHeaders(token);

        // console.log('\n🚀 ========== API CLIENT REQUEST ==========');
        // console.log('🔗 Full URL:', url);
        // console.log('📡 Method:', fetchOptions.method || 'GET');
        // console.log('📋 Headers:', JSON.stringify(headers, null, 2));
        // console.log('📦 Body:', fetchOptions.body || 'No body');
        // console.log('⏳ Sending request to Laravel backend...');

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), this.timeout);

        try {
            const response = await fetch(url, {
                ...fetchOptions,
                headers: {
                    ...headers,
                    ...fetchOptions.headers,
                },
                signal: controller.signal,
                // @ts-ignore - Next.js extended fetch options
                cache: 'no-store',
            });

            clearTimeout(timeoutId);

            // Parse response
            const data = await response.json();

            if (!response.ok) {
                // Check if error is "Unauthenticated" - token invalid/expired
                if (response.status === 401 || data.message === 'Unauthenticated.' || data.message === 'Unauthenticated') {
                    console.error('❌ Token invalid or expired - Unauthenticated');
                    throw {
                        status: 401,
                        message: 'Unauthenticated.',
                        errors: data.errors || {},
                        isUnauthenticated: true,
                    };
                }
                
                throw {
                    status: response.status,
                    message: data.message || 'An error occurred',
                    errors: data.errors || {},
                };
            }

            return data;
        } catch (error: any) {
            clearTimeout(timeoutId);

            if (error.name === 'AbortError') {
                throw {
                    status: 408,
                    message: 'Request timeout',
                    errors: {},
                };
            }

            // Enhanced error logging for server-side fetch failures
            if (error.message === 'fetch failed' || error.cause) {
                const cause = error.cause?.message || error.cause?.code || 'unknown';
                console.error(`❌ Fetch failed to ${url}`);
                console.error(`   Cause: ${cause}`);
                console.error(`   API_BASE_URL: ${this.baseURL}`);
                console.error(`   NODE_TLS_REJECT_UNAUTHORIZED: ${process.env.NODE_TLS_REJECT_UNAUTHORIZED}`);
                
                throw {
                    status: 0,
                    message: `Tidak dapat terhubung ke server backend (${cause}). Pastikan backend API dapat diakses dari server.`,
                    errors: {},
                };
            }

            throw error;
        }
    }

    /**
     * GET request
     */
    async get<T>(
        endpoint: string,
        options: RequestOptions = {}
    ): Promise<T> {
        return this.request<T>(endpoint, {
            ...options,
            method: 'GET',
        });
    }

    /**
     * POST request
     */
    async post<T>(
        endpoint: string,
        body?: any,
        options: RequestOptions = {}
    ): Promise<T> {
        return this.request<T>(endpoint, {
            ...options,
            method: 'POST',
            body: JSON.stringify(body),
        });
    }

    /**
     * PUT request
     */
    async put<T>(
        endpoint: string,
        body?: any,
        options: RequestOptions = {}
    ): Promise<T> {
        return this.request<T>(endpoint, {
            ...options,
            method: 'PUT',
            body: JSON.stringify(body),
        });
    }

    /**
     * PATCH request
     */
    async patch<T>(
        endpoint: string,
        body?: any,
        options: RequestOptions = {}
    ): Promise<T> {
        return this.request<T>(endpoint, {
            ...options,
            method: 'PATCH',
            body: JSON.stringify(body),
        });
    }

    /**
     * DELETE request
     */
    async delete<T>(
        endpoint: string,
        options: RequestOptions = {}
    ): Promise<T> {
        return this.request<T>(endpoint, {
            ...options,
            method: 'DELETE',
        });
    }

    /**
     * Upload file dengan FormData
     */
    async upload<T>(
        endpoint: string,
        formData: FormData,
        options: RequestOptions = {}
    ): Promise<T> {
        const { token, ...fetchOptions } = options;
        const url = this.buildURL(endpoint);

        const headers: Record<string, string> = {
            'Accept': 'application/json',
        };

        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), this.timeout * 2); // Double timeout untuk upload

        try {
            const response = await fetch(url, {
                ...fetchOptions,
                method: 'POST',
                headers,
                body: formData,
                signal: controller.signal,
                // @ts-ignore - Next.js extended fetch options
                cache: 'no-store',
            });

            clearTimeout(timeoutId);

            const data = await response.json();

            if (!response.ok) {
                throw {
                    status: response.status,
                    message: data.message || 'Upload failed',
                    errors: data.errors || {},
                };
            }

            return data;
        } catch (error: any) {
            clearTimeout(timeoutId);

            if (error.name === 'AbortError') {
                throw {
                    status: 408,
                    message: 'Upload timeout',
                    errors: {},
                };
            }

            // Enhanced error logging for upload fetch failures
            if (error.message === 'fetch failed' || error.cause) {
                const cause = error.cause?.message || error.cause?.code || 'unknown';
                console.error(`❌ Upload fetch failed to ${url}`);
                console.error(`   Cause: ${cause}`);
                
                throw {
                    status: 0,
                    message: `Tidak dapat terhubung ke server backend untuk upload (${cause}).`,
                    errors: {},
                };
            }

            throw error;
        }
    }
}

// Export singleton instance
export const apiClient = new ApiClient();
