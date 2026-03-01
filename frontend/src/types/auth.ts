export type UserRole = 'SUPER_ADMIN' | 'HOTEL_ADMIN' | 'PUBLIC_USER';

export interface User {
    id: string;
    email: string;
    name: string;
    role: UserRole;
    hotelSlug?: string; // Only for HOTEL_ADMIN and PUBLIC_USER if relevant
}

export interface AuthState {
    user: User | null;
    isAuthenticated: boolean;
    isLoading: boolean;
}

export interface AuthContextType extends AuthState {
    login: (role: UserRole, hotelSlug?: string) => Promise<void>;
    logout: () => void;
}
