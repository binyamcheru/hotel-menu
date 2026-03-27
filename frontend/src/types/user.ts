import { UserRole } from './auth';

export interface CreateUserRequest {
    hotel_id: string;
    phone_no: string;
    email?: string;
    password: string;
    role: UserRole;
}

export interface UpdateUserRequest {
    phone_no?: string;
    email?: string;
    password?: string;
    role?: string;
    is_active?: boolean;
}
