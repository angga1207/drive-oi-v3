import { apiClient } from '@/lib/api-client';
import { API_ENDPOINTS } from '@/lib/config';
import { getToken } from '@/lib/session';
import {
    LoginCredentials,
    RegisterData,
    AuthResponse,
    User,
    ApiResponse,
} from '@/lib/types';

/**
 * Authentication Service
 * Semua function ini dipanggil dari Server Actions atau API Routes
 * TIDAK PERNAH dipanggil langsung dari Client Components
 */

/**
 * Get items (files and folders)
 */
export async function getItemsService(slug?: string): Promise<ApiResponse<any>> {
    try {
        const token = await getToken();
        
        if (!token) {
            return {
                success: false,
                message: 'No authentication token found',
            };
        }

        const url = slug 
            ? `${API_ENDPOINTS.DRIVE.GET_ITEMS}?slug=${slug}`
            : API_ENDPOINTS.DRIVE.GET_ITEMS;

        const response = await apiClient.get<any>(
            url,
            {
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            }
        );

        if (response.status === 'success' && response.data) {
            return {
                success: true,
                data: response.data,
                message: response.message,
            };
        }

        return {
            success: false,
            message: response.message || 'Failed to get items',
        };
    } catch (error: any) {
        console.error('❌ Get items error:', error.message);
        return {
            success: false,
            message: error.message || 'Failed to get items',
        };
    }
}

/**
 * Get path breadcrumb
 */
export async function getPathService(slug?: string): Promise<ApiResponse<any>> {
    try {
        const token = await getToken();
        
        if (!token) {
            return {
                success: false,
                message: 'No authentication token found',
            };
        }

        const url = slug 
            ? `${API_ENDPOINTS.DRIVE.GET_PATH}?slug=${slug}`
            : API_ENDPOINTS.DRIVE.GET_PATH;

        const response = await apiClient.get<any>(
            url,
            {
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            }
        );

        if (response.status === 'success' && response.data) {
            return {
                success: true,
                data: response.data,
                message: response.message,
            };
        }

        return {
            success: false,
            message: response.message || 'Failed to get path',
        };
    } catch (error: any) {
        console.error('❌ Get path error:', error.message);
        return {
            success: false,
            message: error.message || 'Failed to get path',
        };
    }
}

/**
 * Get current user profile
 */
export async function getProfileService(): Promise<ApiResponse<any>> {
    try {
        const token = await getToken();
        
        if (!token) {
            return {
                success: false,
                message: 'No authentication token found',
            };
        }

        const response = await apiClient.get<any>(
            API_ENDPOINTS.AUTH.GET_PROFILE,
            {
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            }
        );

        if (response.status === 'success' && response.data) {
            return {
                success: true,
                data: response.data,
                message: response.message,
            };
        }

        return {
            success: false,
            message: response.message || 'Failed to get profile',
        };
    } catch (error: any) {
        console.error('❌ Get profile error:', error.message);
        return {
            success: false,
            message: error.message || 'Failed to get profile',
        };
    }
}

/**
 * Login user
 */
export async function loginService(
    credentials: LoginCredentials
): Promise<ApiResponse<{ user: User; token: string }>> {
    try {
        // console.log('\n🌐 ========== LOGIN SERVICE START ==========');
        // console.log('🎯 API Endpoint:', API_ENDPOINTS.AUTH.LOGIN);
        // console.log('📦 Request body:', { username: credentials.username, password: '***' });
        // console.log('⏳ Calling Laravel backend API...');

        const response = await apiClient.post<AuthResponse>(
            API_ENDPOINTS.AUTH.LOGIN,
            credentials
        );

        // console.log('✅ API Response received!');
        // console.log('📊 Response status:', response.status);
        // console.log('💬 Response message:', response.message);
        // console.log('👤 User data:', response.data?.user ? 'Present' : 'Missing');
        // console.log('🔑 Token:', response.data?.token ? response.data.token.substring(0, 20) + '...' : 'Missing');
        // console.log('🌐 ========== LOGIN SERVICE END ==========\n');

        // Check if login successful
        if (response.status === 'success' && response.data) {
            return {
                success: true,
                data: {
                    user: response.data.user,
                    token: response.data.token,
                },
                message: response.message,
            };
        }

        return {
            success: false,
            message: response.message || 'Login failed',
        };
    } catch (error: any) {
        return {
            success: false,
            message: error.message || 'Login failed',
            errors: error.errors || {},
        };
    }
}

/**
 * Google Login - Send Google user data to Laravel backend
 */
export async function googleLoginService(googleData: {
  name: string;
  email: string;
  image: string;
}): Promise<ApiResponse<{ user: User; token: string }>> {
  try {
    console.log('\n🌐 ========== GOOGLE LOGIN SERVICE START ==========');
    console.log('🎯 API Endpoint:', API_ENDPOINTS.AUTH.LOGINGOOGLE);
    console.log('📦 Request body:', { 
      name: googleData.name, 
      email: googleData.email,
      image: googleData.image ? 'Present' : 'Missing'
    });
    console.log('⏳ Calling Laravel backend API...');
    
    const response = await apiClient.post<AuthResponse>(
      API_ENDPOINTS.AUTH.LOGINGOOGLE,
      googleData
    );
    
    console.log('✅ API Response received!');
    console.log('📊 Response status:', response.status);
    console.log('💬 Response message:', response.message);
    console.log('👤 User data:', response.data?.user ? 'Present' : 'Missing');
    console.log('🔑 Token:', response.data?.token ? response.data.token.substring(0, 20) + '...' : 'Missing');
    console.log('🌐 ========== GOOGLE LOGIN SERVICE END ==========\n');

    // Check if login successful
    if (response.status === 'success' && response.data) {
      return {
        success: true,
        data: {
          user: response.data.user,
          token: response.data.token,
        },
        message: response.message,
      };
    }

    return {
      success: false,
      message: response.message || 'Google login failed',
    };
  } catch (error: any) {
    console.error('❌ Google login service error:', error);
    return {
      success: false,
      message: error.message || 'Google login failed',
      errors: error.errors || {},
    };
  }
}

/**
 * Register user
 */
export async function registerService(
    data: RegisterData
): Promise<ApiResponse<AuthResponse>> {
    try {
        const response = await apiClient.post<AuthResponse>(
            API_ENDPOINTS.AUTH.REGISTER,
            data
        );

        return {
            success: true,
            data: response,
        };
    } catch (error: any) {
        return {
            success: false,
            message: error.message || 'Registration failed',
            errors: error.errors || {},
        };
    }
}

/**
 * Logout user
 */
export async function logoutService(): Promise<ApiResponse<void>> {
    try {
        const token = await getToken();

        if (token) {
            await apiClient.post(API_ENDPOINTS.AUTH.LOGOUT, {}, { token });
        }

        return {
            success: true,
        };
    } catch (error: any) {
        // Even if backend logout fails, we still consider it success
        // because we'll clear the session anyway
        return {
            success: true,
        };
    }
}

/**
 * Get current user from backend
 */
export async function getMeService(): Promise<ApiResponse<User>> {
    try {
        const token = await getToken();

        if (!token) {
            return {
                success: false,
                message: 'Not authenticated',
            };
        }

        const response = await apiClient.get<{ user: User }>(
            API_ENDPOINTS.AUTH.GET_PROFILE,
            { token }
        );

        return {
            success: true,
            data: response.user,
        };
    } catch (error: any) {
        return {
            success: false,
            message: error.message || 'Failed to get user data',
        };
    }
}

/**
 * Refresh token
 */
export async function refreshTokenService(): Promise<ApiResponse<AuthResponse>> {
    try {
        const token = await getToken();

        if (!token) {
            return {
                success: false,
                message: 'Not authenticated',
            };
        }

        const response = await apiClient.post<AuthResponse>(
            API_ENDPOINTS.AUTH.REFRESH,
            {},
            { token }
        );

        return {
            success: true,
            data: response,
        };
    } catch (error: any) {
        return {
            success: false,
            message: error.message || 'Token refresh failed',
        };
    }
}
