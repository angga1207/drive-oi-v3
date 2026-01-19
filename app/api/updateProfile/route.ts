import { NextRequest, NextResponse } from 'next/server';
import { getToken } from '@/lib/session';
import { API_CONFIG } from '@/lib/config';

export async function POST(request: NextRequest) {
  try {
    // Get token from session
    const token = await getToken();
    
    if (!token) {
      return NextResponse.json(
        { status: 'error', message: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get form data
    const formData = await request.formData();

    // Prepare FormData for backend
    const backendFormData = new FormData();
    
    // Add required fields
    const firstname = formData.get('firstname');
    const lastname = formData.get('lastname');
    const username = formData.get('username');
    
    if (firstname) backendFormData.append('firstname', firstname as string);
    if (lastname) backendFormData.append('lastname', lastname as string);
    if (username) backendFormData.append('username', username as string);

    // Add optional fields
    const photo = formData.get('photo');
    if (photo && photo instanceof File && photo.size > 0) {
      backendFormData.append('photo', photo);
    }

    const password = formData.get('password');
    const passwordConfirmation = formData.get('password_confirmation');
    if (password && passwordConfirmation) {
      backendFormData.append('password', password as string);
      backendFormData.append('password_confirmation', passwordConfirmation as string);
    }

    // Call Laravel backend API
    const response = await fetch(`${API_CONFIG.BASE_URL}/updateProfile`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        // Don't set Content-Type for FormData, let browser set it with boundary
      },
      body: backendFormData,
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        { status: 'error', message: data.message || 'Failed to update profile' },
        { status: response.status }
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error updating profile:', error);
    return NextResponse.json(
      { status: 'error', message: 'Internal server error' },
      { status: 500 }
    );
  }
}
