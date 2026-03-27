'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { AuthState, AuthContextType } from '@/types/auth';
import { AuthService } from '@/features/auth/services/auth.service';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [state, setState] = useState<AuthState>({
        user: null,
        isAuthenticated: false,
        isLoading: true,
    });

    useEffect(() => {
        const user = AuthService.getCurrentUser();
        const token = localStorage.getItem('token');

        if (user && token) {
            setState({
                user,
                isAuthenticated: true,
                isLoading: false,
            });
        } else {
            setState((prev) => ({ ...prev, isLoading: false }));
        }
    }, []);

    const login = async (credentials: any) => {
        setState((prev) => ({ ...prev, isLoading: true }));
        try {
            const data = await AuthService.login(credentials);
            console.log('AuthService.login response:', data);
            setState({
                user: data.user,
                isAuthenticated: true,
                isLoading: false,
            });
            return data.user;
        } catch (error) {
            console.error('AuthService.login error:', error);
            setState((prev) => ({ ...prev, isLoading: false }));
            throw error;
        }
    };

    const logout = () => {
        AuthService.logout();
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
