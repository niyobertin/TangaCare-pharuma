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
        const user = response.data.data.user;
        if (user) {
            localStorage.setItem('user_data', JSON.stringify(user));
        }
        const orgs = response.data.data.organizations;
        const facilities = response.data.data.facilities;
        if (orgs?.length) {
            const firstOrg = orgs[0];
            localStorage.setItem('selected_organization_id', String(firstOrg.id));
        }
        if (facilities?.length) {
            const firstFacility = facilities[0];
            localStorage.setItem('selected_facility_id', String(firstFacility.id));
        } else {
            const fid = user?.facility_id ?? user?.facility?.id;
            if (fid) localStorage.setItem('selected_facility_id', String(fid));
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
        localStorage.removeItem('selected_organization_id');
        localStorage.removeItem('selected_facility_id');
    },

    async getProfile(): Promise<User> {
        const response = await api.get<{ data: User }>('/auth/me');
        return response.data.data;
    },

    async forgotPassword(email: string): Promise<any> {
        // Backend likely expects identifier based on other endpoints, but let's send both or map it if needed.
        // Keeping as email for now if that matches api, otherwise:
        const response = await api.post('/auth/forgot-password', { identifier: email });
        return response.data;
    },

    async verifyResetOtp(identifier: string, otp: string): Promise<any> {
        const response = await api.post('/auth/verify-reset-otp', { identifier, otp });
        return response.data;
    },

    async verifyRegistrationOtp(email: string, otp: string): Promise<any> {
        // Using /auth/verify-otp as per plan for account verification
        // User confirmed payload uses "identifier"
        const response = await api.post('/auth/verify-otp', { identifier: email, otp });
        return response.data;
    },

    async resetPassword(data: { identifier: string; otp: string; newPassword: string }): Promise<any> {
        const response = await api.post('/auth/reset-password', data);
        return response.data;
    },
};
