import api from '@/lib/api';
import { User, LoginResponse, RegisterRequest, GenericResponse } from '@/types/auth';

export const AuthService = {
    login: async (credentials: any): Promise<LoginResponse> => {
        const response = await api.post<GenericResponse<LoginResponse>>('/auth/login', credentials);
        const data = response.data.data;
        if (data && data.token) {
            localStorage.setItem('token', data.token);
            localStorage.setItem('refresh_token', data.refresh_token);
            localStorage.setItem('user_role', data.user.role);
            localStorage.setItem('hotel_id', data.user.hotel_id || '');
            localStorage.setItem('user_id', data.user.user_id);
            localStorage.setItem('user_phone', data.user.phone_no || '');
        }
        return data;
    },

    register: async (data: RegisterRequest): Promise<User> => {
        const response = await api.post<GenericResponse<User>>('/auth/register', data);
        return response.data.data;
    },

    logout: () => {
        localStorage.removeItem('token');
        localStorage.removeItem('refresh_token');
        localStorage.removeItem('user');
        localStorage.removeItem('user_role');
        localStorage.removeItem('hotel_id');
        localStorage.removeItem('user_id');
        localStorage.removeItem('user_phone');
        window.location.href = '/login';
    },

    getCurrentUser: (): User | null => {
        if (typeof window === 'undefined') return null;
        const role = localStorage.getItem('user_role') as any;
        const hotel_id = localStorage.getItem('hotel_id') || '';
        const user_id = localStorage.getItem('user_id') || '';

        if (role) {
            return {
                user_id,
                hotel_id,
                role,
                phone_no: '', // Not mission critical for UI
                is_active: true,
                created_at: '',
                updated_at: ''
            };
        }
        return null;
    },

    refreshToken: async (): Promise<string> => {
        const refreshToken = localStorage.getItem('refresh_token');
        if (!refreshToken) throw new Error('No refresh token available');

        const response = await api.post<GenericResponse<{ token: string }>>('/auth/refresh', { refresh_token: refreshToken });
        const newToken = response.data.data.token;
        localStorage.setItem('token', newToken);

        return newToken;
    }
};
