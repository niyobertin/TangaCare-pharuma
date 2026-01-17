export type UserRole =
    | 'Patient' | 'PATIENT'
    | 'Doctor' | 'DOCTOR'
    | 'Admin' | 'ADMIN'
    | 'Pharmacist' | 'PHARMACIST'
    | 'Super Admin' | 'SUPER_ADMIN'
    | 'Store Manager' | 'STORE_MANAGER'
    | 'Auditor' | 'AUDITOR'
    | 'Facility Admin' | 'FACILITY_ADMIN';

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
