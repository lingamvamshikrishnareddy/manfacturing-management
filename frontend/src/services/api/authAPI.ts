import { User } from '../../types';
import { ApiResponse } from '../../types';
import axios from './config';

interface AuthResponse {
  user: User;
  token: string;
}

export const login = async (email: string, password: string): Promise<ApiResponse<AuthResponse | null>> => {
  try {
    const response = await axios.post('/api/auth/login', { email, password });

    if (response.data && response.data.success) {
      return {
        success: true,
        message: 'Login successful',
        data: response.data.data,
        timestamp: new Date().toISOString(),
      };
    } else {
      return {
        success: false,
        message: response.data?.message || 'Login failed',
        data: null,
        timestamp: new Date().toISOString(),
      };
    }
  } catch (error) {
    console.error('Login API error:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Network error during login',
      data: null,
      timestamp: new Date().toISOString(),
    };
  }
};

export const register = async (userData: Omit<User, 'id' | 'createdAt' | 'updatedAt'> & { password: string }): Promise<ApiResponse<AuthResponse | null>> => {
  try {
    const response = await axios.post('/api/auth/register', userData);

    if (response.data && response.data.success) {
      return {
        success: true,
        message: 'Registration successful',
        data: response.data.data,
        timestamp: new Date().toISOString(),
      };
    } else {
      return {
        success: false,
        message: response.data?.message || 'Registration failed',
        data: null,
        timestamp: new Date().toISOString(),
      };
    }
  } catch (error) {
    console.error('Registration API error:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Network error during registration',
      data: null,
      timestamp: new Date().toISOString(),
    };
  }
};

export const logout = async (): Promise<ApiResponse<null>> => {
  try {
    const response = await axios.post('/api/auth/logout');

    if (response.data && response.data.success) {
      return {
        success: true,
        message: 'Logout successful',
        data: null,
        timestamp: new Date().toISOString(),
      };
    } else {
      return {
        success: false,
        message: response.data?.message || 'Logout failed',
        data: null,
        timestamp: new Date().toISOString(),
      };
    }
  } catch (error) {
    console.error('Logout API error:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Network error during logout',
      data: null,
      timestamp: new Date().toISOString(),
    };
  }
};

export const getCurrentUser = async (): Promise<ApiResponse<User | null>> => {
  try {
    const response = await axios.get('/api/auth/me');

    if (response.data && response.data.success) {
      return {
        success: true,
        message: 'User fetched successfully',
        data: response.data.data,
        timestamp: new Date().toISOString(),
      };
    } else {
      return {
        success: false,
        message: response.data?.message || 'Failed to fetch user',
        data: null,
        timestamp: new Date().toISOString(),
      };
    }
  } catch (error) {
    console.error('Get current user API error:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Network error while fetching user',
      data: null,
      timestamp: new Date().toISOString(),
    };
  }
};

export const googleLogin = async (credential: string): Promise<ApiResponse<AuthResponse | null>> => {
  try {
    const response = await axios.post('/api/auth/google', { credential });

    if (response.data && response.data.success) {
      return {
        success: true,
        message: 'Google login successful',
        data: response.data.data,
        timestamp: new Date().toISOString(),
      };
    } else {
      return {
        success: false,
        message: response.data?.message || 'Google login failed',
        data: null,
        timestamp: new Date().toISOString(),
      };
    }
  } catch (error) {
    console.error('Google login API error:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Network error during Google login',
      data: null,
      timestamp: new Date().toISOString(),
    };
  }
};