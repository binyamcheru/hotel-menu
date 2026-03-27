'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { HotelService } from '@/features/hotels/services/hotel.service';
import { AuthService } from '@/features/auth/services/auth.service';
import { useRouter } from 'next/navigation';
import { ArrowLeft, CheckCircle2, Hotel as HotelIcon, Mail, MapPin, Globe, User } from 'lucide-react';
import Link from 'next/link';
import { ProtectedRoute } from '@/features/auth/components/protected-route';

const hotelSchema = z.object({
    name: z.string().min(3, 'Hotel name must be at least 3 characters'),
    address: z.string().min(5, 'Address is required'),
    phone: z.string().min(10, 'Hotel phone number is required'),
    logo: z.string().url('Invalid logo URL').optional().or(z.literal('')),
    language_settings: z.string().min(2, 'Language settings are required'),
    // Manager Account
    manager_email: z.string().email('Invalid email address'),
    manager_phone: z.string().min(10, 'Manager phone number is required'),
    manager_password: z.string().min(6, 'Password must be at least 6 characters'),
});

type HotelFormValues = z.infer<typeof hotelSchema>;

export default function AddHotelPage() {
    const router = useRouter();
    const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<HotelFormValues>({
        resolver: zodResolver(hotelSchema),
        defaultValues: { language_settings: 'en' },
    });

    const onSubmit = async (data: HotelFormValues) => {
        try {
            // 1. Create Hotel
            const hotel = await HotelService.addHotel({
                name: data.name,
                address: data.address,
                phone: data.phone,
                logo: data.logo || '',
                language_settings: data.language_settings
            });

            // 2. Register Manager
            await AuthService.register({
                hotel_id: hotel.hotel_id,
                phone_no: data.manager_phone,
                email: data.manager_email,
                password: data.manager_password,
                role: 'admin'
            });

            router.push('/super-admin/hotels');
        } catch (error) {
            console.error('Failed to register hotel and manager:', error);
        }
    };

    return (
        <ProtectedRoute allowedRoles={['superadmin']}>
            <div className="max-w-4xl mx-auto space-y-8">
                <Link href="/super-admin/hotels" className="inline-flex items-center gap-2 text-sm font-bold text-gray-400 hover:text-indigo-600 transition-colors">
                    <ArrowLeft className="w-4 h-4" />
                    Back to Hotels
                </Link>

                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <h1 className="text-3xl font-black text-gray-900 tracking-tight">Add New Hotel</h1>
                        <p className="text-gray-500">Register a new hotel property and its manager.</p>
                    </div>
                </div>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-8 pb-20">
                    {/* Hotel Details */}
                    <div className="bg-white p-8 rounded-[32px] border border-gray-100 shadow-xl space-y-6">
                        <h2 className="text-xl font-black text-gray-900 flex items-center gap-2">
                            <HotelIcon className="w-6 h-6 text-indigo-600" />
                            Hotel Information
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-gray-700">Hotel Name</label>
                                <input
                                    {...register('name')}
                                    placeholder="e.g. Grand Plaza Hotel"
                                    className="w-full px-5 py-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-indigo-500 transition-all font-medium"
                                />
                                {errors.name && <p className="text-xs text-red-500 font-bold ml-2">{errors.name.message}</p>}
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-bold text-gray-700">Language Settings</label>
                                <input
                                    {...register('language_settings')}
                                    placeholder="e.g. en, am"
                                    className="w-full px-5 py-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-indigo-500 transition-all font-medium"
                                />
                                {errors.language_settings && <p className="text-xs text-red-500 font-bold ml-2">{errors.language_settings.message}</p>}
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-bold text-gray-700">Hotel Phone</label>
                                <input
                                    {...register('phone')}
                                    placeholder="+251..."
                                    className="w-full px-5 py-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-indigo-500 transition-all font-medium"
                                />
                                {errors.phone && <p className="text-xs text-red-500 font-bold ml-2">{errors.phone.message}</p>}
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-bold text-gray-700">Logo URL</label>
                                <input
                                    {...register('logo')}
                                    placeholder="https://..."
                                    className="w-full px-5 py-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-indigo-500 transition-all font-medium"
                                />
                                {errors.logo && <p className="text-xs text-red-500 font-bold ml-2">{errors.logo.message}</p>}
                            </div>

                            <div className="space-y-2 md:col-span-2">
                                <label className="text-sm font-bold text-gray-700">Physical Address</label>
                                <textarea
                                    {...register('address')}
                                    rows={2}
                                    placeholder="123 Luxury Ave, Downtown District..."
                                    className="w-full px-5 py-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-indigo-500 transition-all font-medium resize-none"
                                />
                                {errors.address && <p className="text-xs text-red-500 font-bold ml-2">{errors.address.message}</p>}
                            </div>
                        </div>
                    </div>

                    {/* Manager Account */}
                    <div className="bg-white p-8 rounded-[32px] border border-gray-100 shadow-xl space-y-6">
                        <h2 className="text-xl font-black text-gray-900 flex items-center gap-2">
                            <User className="w-6 h-6 text-purple-600" />
                            Manager Account
                        </h2>
                        <p className="text-sm text-gray-400 font-medium -mt-4">Credentials for the hotel administrator to manage their menu.</p>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                            <div className="space-y-2">
                                <label className="text-sm font-bold text-gray-700">Phone Number (Login)</label>
                                <input
                                    {...register('manager_phone')}
                                    placeholder="+251..."
                                    className="w-full px-5 py-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-purple-500 transition-all font-medium"
                                />
                                {errors.manager_phone && <p className="text-xs text-red-500 font-bold ml-2">{errors.manager_phone.message}</p>}
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-bold text-gray-700">Email Address</label>
                                <input
                                    {...register('manager_email')}
                                    placeholder="manager@hotel.com"
                                    className="w-full px-5 py-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-purple-500 transition-all font-medium"
                                />
                                {errors.manager_email && <p className="text-xs text-red-500 font-bold ml-2">{errors.manager_email.message}</p>}
                            </div>

                            <div className="space-y-2 md:col-span-2">
                                <label className="text-sm font-bold text-gray-700">Dashboard Password</label>
                                <input
                                    {...register('manager_password')}
                                    type="password"
                                    placeholder="••••••••"
                                    className="w-full px-5 py-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-purple-500 transition-all font-medium"
                                />
                                {errors.manager_password && <p className="text-xs text-red-500 font-bold ml-2">{errors.manager_password.message}</p>}
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-end gap-4">
                        <Link href="/super-admin/hotels" className="px-8 py-4 bg-gray-100 text-gray-600 rounded-2xl font-bold hover:bg-gray-200 transition-all">
                            Cancel
                        </Link>
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="px-10 py-4 bg-indigo-600 text-white rounded-2xl font-bold hover:bg-indigo-700 shadow-xl shadow-indigo-100 transition-all disabled:opacity-50 flex items-center gap-2"
                        >
                            {isSubmitting && <div className="animate-spin w-4 h-4 border-2 border-white/20 border-b-white rounded-full"></div>}
                            Save Hotel & Manager
                        </button>
                    </div>
                </form>
            </div>
        </ProtectedRoute>
    );
}
