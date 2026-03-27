'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { HotelService, Hotel } from '@/features/hotels/services/hotel.service';
import { useRouter, useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { ArrowLeft, Hotel as HotelIcon, MapPin, Globe, Phone, ImageIcon } from 'lucide-react';
import Link from 'next/link';
import { ProtectedRoute } from '@/features/auth/components/protected-route';

const hotelSchema = z.object({
    name: z.string().min(3, 'Hotel name must be at least 3 characters'),
    address: z.string().min(5, 'Address is required'),
    phone: z.string().min(10, 'Hotel phone number is required'),
    logo: z.string().url('Invalid logo URL').optional().or(z.literal('')),
    language_settings: z.string().min(2, 'Language settings are required'),
});

type HotelFormValues = z.infer<typeof hotelSchema>;

export default function EditHotelPage() {
    const router = useRouter();
    const params = useParams();
    const hotelId = params.id as string;
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<HotelFormValues>({
        resolver: zodResolver(hotelSchema),
    });

    useEffect(() => {
        const fetchHotel = async () => {
            try {
                const hotel = await HotelService.getHotelById(hotelId);
                reset({
                    name: hotel.name,
                    address: hotel.address,
                    phone: hotel.phone,
                    logo: hotel.logo,
                    language_settings: hotel.language_settings,
                });
            } catch (err) {
                console.error('Failed to fetch hotel:', err);
                setError('Failed to load hotel details');
            } finally {
                setLoading(false);
            }
        };

        if (hotelId) {
            fetchHotel();
        }
    }, [hotelId, reset]);

    const onSubmit = async (data: HotelFormValues) => {
        try {
            await HotelService.updateHotel(hotelId, data);
            router.push('/super-admin/hotels');
        } catch (err) {
            console.error('Failed to update hotel:', err);
            alert('Failed to update hotel');
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="animate-spin w-8 h-8 border-4 border-indigo-600 border-b-transparent rounded-full"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="text-center py-20">
                <p className="text-red-500 font-bold">{error}</p>
                <Link href="/super-admin/hotels" className="text-indigo-600 hover:underline mt-4 inline-block">
                    Back to Hotels
                </Link>
            </div>
        );
    }

    return (
        <ProtectedRoute allowedRoles={['superadmin']}>
            <div className="max-w-4xl mx-auto space-y-8">
                <Link href="/super-admin/hotels" className="inline-flex items-center gap-2 text-sm font-bold text-gray-400 hover:text-indigo-600 transition-colors">
                    <ArrowLeft className="w-4 h-4" />
                    Back to Hotels
                </Link>

                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <h1 className="text-3xl font-black text-gray-900 tracking-tight">Edit Hotel</h1>
                        <p className="text-gray-500">Update hotel property information.</p>
                    </div>
                </div>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-8 pb-20">
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
                            Update Hotel
                        </button>
                    </div>
                </form>
            </div>
        </ProtectedRoute>
    );
}
