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
    const { user, isAuthenticated, isLoading } = useAuth();
    const router = useRouter();
    const params = useParams();
    const hotelSlug = params?.hotel as string;

    useEffect(() => {
        if (!isLoading) {
            if (!isAuthenticated) {
                router.push('/login');
                return;
            }

            if (allowedRoles && user && !allowedRoles.includes(user.role)) {
                router.push('/login'); // Or a forbidden page
                return;
            }

            if (requireHotelMatch && user && user.role === 'HOTEL_ADMIN' && user.hotelSlug !== hotelSlug) {
                router.push('/login'); // Or a forbidden page
                return;
            }
        }
    }, [isLoading, isAuthenticated, user, allowedRoles, requireHotelMatch, hotelSlug, router]);

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
            </div>
        );
    }

    if (!isAuthenticated) return null;
    if (allowedRoles && user && !allowedRoles.includes(user.role)) return null;
    if (requireHotelMatch && user && user.role === 'HOTEL_ADMIN' && user.hotelSlug !== hotelSlug) return null;

    return <>{children}</>;
}
