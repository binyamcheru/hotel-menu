'use client';

import { useAuth } from '@/providers/auth-provider';
import { useRouter, useParams } from 'next/navigation';
import { useEffect } from 'react';
import { UserRole } from '@/types/auth';

interface ProtectedRouteProps {
    children: React.ReactNode;
    allowedRoles?: UserRole[];
    requireHotelMatch?: boolean;
}

export function ProtectedRoute({
    children,
    allowedRoles,
    requireHotelMatch = false
}: ProtectedRouteProps) {
    const { user: contextUser, isAuthenticated: contextIsAuthenticated, isLoading } = useAuth();
    const router = useRouter();
    const params = useParams();
    const hotelSlug = params?.hotel as string;

    useEffect(() => {
        // Direct localStorage check as fallback for SPA sync issues
        const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
        const role = typeof window !== 'undefined' ? localStorage.getItem('user_role') : null;
        const hotelId = typeof window !== 'undefined' ? localStorage.getItem('hotel_id') : null;

        const isActuallyAuthenticated = contextIsAuthenticated || !!token;
        const effectiveRole = contextUser?.role || (role as UserRole);

        console.log('ProtectedRoute Check:', {
            isLoading,
            contextIsAuthenticated,
            hasToken: !!token,
            effectiveRole,
            allowedRoles,
            path: window.location.pathname
        });

        if (!isLoading) {
            if (!isActuallyAuthenticated) {
                console.log('ProtectedRoute - Not authenticated, redirecting to /login');
                router.push('/login');
                return;
            }

            if (allowedRoles && effectiveRole && !allowedRoles.includes(effectiveRole)) {
                console.log(`ProtectedRoute - Role mismatch. User: ${effectiveRole}, Allowed: ${allowedRoles}. Redirecting to /login`);
                router.push('/login');
                return;
            }

            if (requireHotelMatch && effectiveRole === 'admin' && (contextUser?.hotel_id || hotelId) !== hotelSlug) {
                console.log(`ProtectedRoute - Hotel mismatch. User: ${contextUser?.hotel_id || hotelId}, Slug: ${hotelSlug}. Redirecting to /login`);
                router.push('/login');
                return;
            }
        }
    }, [isLoading, contextIsAuthenticated, contextUser, allowedRoles, requireHotelMatch, hotelSlug, router]);

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
            </div>
        );
    }

    // Direct check for final rendering
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    const isActuallyAuthenticated = contextIsAuthenticated || !!token;

    if (!isActuallyAuthenticated) return null;

    const role = typeof window !== 'undefined' ? localStorage.getItem('user_role') : null;
    const effectiveRole = contextUser?.role || (role as UserRole);

    if (allowedRoles && effectiveRole && !allowedRoles.includes(effectiveRole)) return null;

    return <>{children}</>;
}
