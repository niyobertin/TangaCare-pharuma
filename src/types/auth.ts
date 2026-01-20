export const UserRole = {
    PATIENT: 'patient',
    DOCTOR: 'doctor',
    ADMIN: 'admin',
    // Pharmacy Inventory Roles
    SUPER_ADMIN: 'super_admin',
    FACILITY_ADMIN: 'facility_admin',
    PHARMACIST: 'pharmacist',
    STORE_MANAGER: 'store_manager',
    AUDITOR: 'auditor',
} as const;

export type UserRole = (typeof UserRole)[keyof typeof UserRole];

export interface User {
    id: number;
    userId?: string;
    phone_number?: string;
    phoneNumber?: string;
    email: string;
    first_name?: string;
    firstName?: string;
    last_name?: string;
    lastName?: string;
    role: UserRole;
    gender?: 'male' | 'female' | 'other';
    date_of_birth?: string;
    address?: string;
    avatar_url?: string;
    is_active?: boolean;
    isActive?: boolean;
    created_at?: string;
    updated_at?: string;
    facility_id?: number;
    facility?: {
        id: number;
        name: string;
        type: string;
    };
}

export interface AuthTokens {
    accessToken: string;
    refreshToken: string;
}

export interface AuthResponse {
    status: string;
    message: string;
    data: {
        user: User;
        tokens: AuthTokens;
    };
}

export interface LoginCredentials {
    email: string;
    password: string;
}

export interface RegisterCredentials {
    email: string;
    password: string;
    first_name: string;
    last_name: string;
    phone_number?: string;
    role?: UserRole;
    gender?: string;
    date_of_birth?: string;
}
