import api from '../lib/api';
import type { AuthResponse, LoginCredentials, RegisterCredentials, User } from '../types/auth';

export const authService = {
    async login(credentials: LoginCredentials): Promise<AuthResponse> {
        // Map email to identifier as expected by backend
        const response = await api.post<AuthResponse>('/auth/login', {
            identifier: credentials.email,
            password: credentials.password,
        });
        if (response.data.data.tokens) {
            localStorage.setItem('access_token', response.data.data.tokens.accessToken);
            localStorage.setItem('refresh_token', response.data.data.tokens.refreshToken);
        }
        if (response.data.data.user) {
            localStorage.setItem('user_data', JSON.stringify(response.data.data.user));
        }
        return response.data;
    },

    async register(credentials: RegisterCredentials): Promise<AuthResponse> {
        const response = await api.post<AuthResponse>('/auth/register', credentials);
        return response.data;
    },

    async logout(): Promise<void> {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        localStorage.removeItem('user_data');
    },

    async getProfile(): Promise<User> {
        const response = await api.get<{ data: User }>('/auth/me');
        return response.data.data;
    },

    async forgotPassword(email: string): Promise<any> {
        const response = await api.post('/auth/forgot-password', { email });
        return response.data;
    },

    async verifyOtp(email: string, otp: string): Promise<any> {
        const response = await api.post('/auth/verify-otp', { email, otp });
        return response.data;
    },

    async resetPassword(data: any): Promise<any> {
        const response = await api.post('/auth/reset-password', data);
        return response.data;
    },
};
