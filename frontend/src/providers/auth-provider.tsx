'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { AuthState, AuthContextType, User, UserRole } from '@/types/auth';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [state, setState] = useState<AuthState>({
        user: null,
        isAuthenticated: false,
        isLoading: true,
    });

    useEffect(() => {
        // Check for stored user on mount
        const storedUser = localStorage.getItem('auth_user');
        if (storedUser) {
            setState({
                user: JSON.parse(storedUser),
                isAuthenticated: true,
                isLoading: false,
            });
        } else {
            setState((prev) => ({ ...prev, isLoading: false }));
        }
    }, []);

    const login = async (role: UserRole, hotelSlug?: string) => {
        setState((prev) => ({ ...prev, isLoading: true }));

        // Mock login delay
        await new Promise((resolve) => setTimeout(resolve, 1000));

        const mockUser: User = {
            id: Math.random().toString(36).substring(7),
            email: `${role.toLowerCase()}@example.com`,
            name: `${role.replace('_', ' ')} Mock User`,
            role,
            hotelSlug,
        };

        localStorage.setItem('auth_user', JSON.stringify(mockUser));
        setState({
            user: mockUser,
            isAuthenticated: true,
            isLoading: false,
        });
    };

    const logout = () => {
        localStorage.removeItem('auth_user');
        setState({
            user: null,
            isAuthenticated: false,
            isLoading: false,
        });
    };

    return (
        <AuthContext.Provider value={{ ...state, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}
