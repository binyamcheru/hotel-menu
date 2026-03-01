'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useAuth } from '@/providers/auth-provider';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { UserRole } from '@/types/auth';

const loginSchema = z.object({
    email: z.string().email(),
    password: z.string().min(6),
    role: z.enum(['SUPER_ADMIN', 'HOTEL_ADMIN', 'PUBLIC_USER']),
    hotelSlug: z.string().optional(),
});

type LoginValues = z.infer<typeof loginSchema>;

export function LoginForm() {
    const { login } = useAuth();
    const router = useRouter();
    const [error, setError] = useState<string | null>(null);

    const form = useForm<LoginValues>({
        resolver: zodResolver(loginSchema),
        defaultValues: {
            email: '',
            password: '',
            role: 'HOTEL_ADMIN',
            hotelSlug: '',
        },
    });

    const onSubmit = async (data: LoginValues) => {
        try {
            await login(data.role as UserRole, data.hotelSlug);

            // Redirect based on role
            if (data.role === 'SUPER_ADMIN') {
                router.push('/super-admin');
            } else if (data.role === 'HOTEL_ADMIN') {
                router.push(`/${data.hotelSlug}/admin`);
            } else {
                router.push(`/${data.hotelSlug}/menu`);
            }
        } catch (err) {
            setError('Invalid credentials');
        }
    };

    return (
        <div className="flex flex-col gap-4 w-full max-w-md mx-auto p-6 bg-white rounded-xl shadow-lg">
            <h1 className="text-2xl font-bold text-center">Login to Hotel Menu</h1>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700">Email</label>
                    <input
                        {...form.register('email')}
                        className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                        placeholder="admin@example.com"
                    />
                    {form.formState.errors.email && (
                        <p className="mt-1 text-sm text-red-600">{form.formState.errors.email.message}</p>
                    )}
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700">Role</label>
                    <select
                        {...form.register('role')}
                        className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    >
                        <option value="SUPER_ADMIN">Super Admin</option>
                        <option value="HOTEL_ADMIN">Hotel Admin</option>
                        <option value="PUBLIC_USER">Public User</option>
                    </select>
                </div>

                {form.watch('role') !== 'SUPER_ADMIN' && (
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Hotel Slug</label>
                        <input
                            {...form.register('hotelSlug')}
                            className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                            placeholder="hotel-1"
                        />
                    </div>
                )}

                {error && <p className="text-sm text-red-600 text-center">{error}</p>}

                <button
                    type="submit"
                    disabled={form.formState.isSubmitting}
                    className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                >
                    {form.formState.isSubmitting ? 'Logging in...' : 'Login'}
                </button>
            </form>
        </div>
    );
}
