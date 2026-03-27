export type UserRole = 'superadmin' | 'admin' | 'public_user';

export interface MultilingualText {
    en: string;
    am: string;
}

export interface GenericResponse<T> {
    status: number;
    message: string;
    data: T;
}

export interface User {
    user_id: string;
    hotel_id: string;
    phone_no: string;
    email?: string;
    role: UserRole;
    is_active: boolean;
    created_at: string;
    updated_at: string;
}

export interface LoginResponse {
    token: string;
    refresh_token: string;
    user: User;
}

export interface RegisterRequest {
    hotel_id: string;
    phone_no: string;
    email: string;
    password: string;
    role: UserRole;
    name?: string;
}

export interface AuthState {
    user: User | null;
    isAuthenticated: boolean;
    isLoading: boolean;
}

export interface AuthContextType extends AuthState {
    login: (credentials: any) => Promise<User>;
    logout: () => void;
}
