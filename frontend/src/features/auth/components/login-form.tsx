'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useAuth } from '@/providers/auth-provider';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { UserRole } from '@/types/auth';

const loginSchema = z.object({
    phone_no: z.string().min(10, 'Phone number must be at least 10 characters'),
    password: z.string().min(6),
});

type LoginValues = z.infer<typeof loginSchema>;

export function LoginForm() {
    const { login } = useAuth();
    const router = useRouter();
    const [error, setError] = useState<string | null>(null);

    const form = useForm<LoginValues>({
        resolver: zodResolver(loginSchema),
        defaultValues: {
            phone_no: '',
            password: '',
        },
    });

    const onSubmit = async (data: LoginValues) => {
        setError(null);
        try {
            const user = await login({
                phone_no: data.phone_no,
                password: data.password
            });

            console.log('Login success - User Data:', JSON.stringify(user, null, 2));
            console.log('User Role:', user.role);

            if (!user) {
                setError('Login successful but no user data received.');
                return;
            }

            const role = user.role?.toLowerCase();
            console.log('Normalized Role:', role);

            // Redirect based on role and hotel_id from user object
            if (role === 'superadmin') {
                console.log('Redirecting to /super-admin');
                window.location.href = '/super-admin';
            } else if (role === 'admin' && user.hotel_id) {
                console.log(`Redirecting to /${user.hotel_id}/admin`);
                window.location.href = `/${user.hotel_id}/admin`;
            } else {
                console.log('No specific role match, redirecting to /');
                window.location.href = '/';
            }
        } catch (err: any) {
            console.error('Login Error:', err);
            const message = err.response?.data?.message || err.message || 'Invalid credentials';
            setError(message);
        }
    };

    return (
        <div className="flex flex-col gap-4 w-full max-w-md mx-auto p-6 bg-white rounded-xl shadow-lg border border-gray-100">
            <h1 className="text-2xl font-black text-center text-gray-900 tracking-tight">Login</h1>
            <p className="text-center text-gray-500 text-sm -mt-2 mb-4">Access your dashboard to manage your menu</p>

            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Phone Number</label>
                    <input
                        {...form.register('phone_no')}
                        type="text"
                        className="block w-full px-5 py-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-indigo-500 transition-all font-medium"
                        placeholder="+251..."
                    />
                    {form.formState.errors.phone_no && (
                        <p className="mt-1 text-xs text-red-600 font-bold ml-1">{form.formState.errors.phone_no.message}</p>
                    )}
                </div>

                <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Password</label>
                    <input
                        {...form.register('password')}
                        type="password"
                        className="block w-full px-5 py-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-indigo-500 transition-all font-medium"
                        placeholder="••••••••"
                    />
                    {form.formState.errors.password && (
                        <p className="mt-1 text-xs text-red-600 font-bold ml-1">{form.formState.errors.password.message}</p>
                    )}
                </div>

                {error && (
                    <div className="p-4 bg-red-50 text-red-600 rounded-2xl text-xs font-bold border border-red-100 animate-shake">
                        {error}
                    </div>
                )}

                <button
                    type="submit"
                    disabled={form.formState.isSubmitting}
                    className="w-full flex justify-center py-4 px-4 border border-transparent rounded-2xl shadow-xl shadow-indigo-100 text-sm font-black text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 transition-all active:scale-95"
                >
                    {form.formState.isSubmitting ? (
                        <div className="flex items-center gap-2">
                            <div className="animate-spin w-4 h-4 border-2 border-white/20 border-b-white rounded-full"></div>
                            Logging in...
                        </div>
                    ) : 'Login to Dashboard'}
                </button>
            </form>
        </div>
    );
}
