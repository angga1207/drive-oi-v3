'use server';

import { redirect } from 'next/navigation';
import { loginService, registerService, logoutService } from '@/lib/services/auth.service';
import { setSession, clearSession } from '@/lib/session';
import { LoginCredentials, RegisterData, ApiResponse } from '@/lib/types';

/**
 * Server Actions untuk Authentication
 * Ini adalah layer yang aman antara client dan backend Laravel
 * Client hanya memanggil Server Actions, tidak pernah langsung ke Laravel API
 */

/**
 * Login action (form-based)
 */
export async function loginFormAction(formData: FormData): Promise<ApiResponse> {
    const username = formData.get('username') as string;
    const password = formData.get('password') as string;

    // console.log('🔐 loginFormAction called with username:', username);

    if (!username || !password) {
        return {
            success: false,
            message: 'Username and password are required',
            errors: {},
        };
    }

    return loginAction({ username, password });
}

/**
 * Login action
 */
export async function loginAction(
    credentials: LoginCredentials
): Promise<ApiResponse> {
    //   console.log('\n🔐 ========== LOGIN ACTION START ==========');
    //   console.log('📋 Credentials:', { username: credentials.username, password: '***' });
    //   console.log('🎯 Target API:', process.env.API_BASE_URL || 'http://127.0.0.1:8000/api');

    try {
        // console.log('📞 Calling loginService...');
        const result = await loginService(credentials);
        // console.log('📥 Login service result:', JSON.stringify(result, null, 2));

        if (result.success && result.data) {
            //   console.log('✅ Login successful!');
            //   console.log('👤 User:', result.data.user.username);
            //   console.log('🔑 Token:', result.data.token.substring(0, 20) + '...');
            //   console.log('💾 Setting session...');

            await setSession(result.data.token, result.data.user);

            //   console.log('✅ Session saved successfully!');
            //   console.log('🔐 ========== LOGIN ACTION END (SUCCESS) ==========\n');

            return {
                success: true,
                message: 'Login successful',
            };
        }

        // console.log('❌ Login failed:', result.message);
        // console.log('🔐 ========== LOGIN ACTION END (FAILED) ==========\n');

        return {
            success: false,
            message: result.message || 'Login failed',
            errors: result.errors,
        };
    } catch (error: any) {
        // console.error('❌ Login action error:', error);
        // console.log('🔐 ========== LOGIN ACTION END (ERROR) ==========\n');
        return {
            success: false,
            message: error.message || 'Login failed',
            errors: {},
        };
    }
}

/**
 * Register action
 */
export async function registerAction(
    data: RegisterData
): Promise<ApiResponse> {
    const result = await registerService(data);

    if (result.success && result.data) {
        // Set session dengan token dan user data
        await setSession(result.data.token, result.data.user);

        return {
            success: true,
            message: 'Registration successful',
        };
    }

    return {
        success: false,
        message: result.message || 'Registration failed',
        errors: result.errors,
    };
}

/**
 * Logout action
 */
export async function logoutAction(): Promise<void> {
    // Call backend logout
    await logoutService();

    // Clear session
    await clearSession();

    // Redirect to login
    redirect('/login');
}
