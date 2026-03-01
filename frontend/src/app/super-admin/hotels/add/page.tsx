'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { HotelService } from '@/features/hotels/services/hotel.service';
import { useRouter } from 'next/navigation';
import { ArrowLeft, CheckCircle2, Hotel as HotelIcon, Mail, MapPin, Globe, User } from 'lucide-react';
import Link from 'next/link';

const hotelSchema = z.object({
    name: z.string().min(3, 'Hotel name must be at least 3 characters'),
    slug: z.string().min(3, 'Slug must be at least 3 characters').regex(/^[a-z0-9-]+$/, 'Slug can only contain lowercase letters, numbers, and dashes'),
    address: z.string().min(5, 'Address is required'),
    contactEmail: z.string().email('Invalid email address'),
    managerName: z.string().min(3, 'Manager name is required'),
    status: z.enum(['ACTIVE', 'INACTIVE']),
});

type HotelFormValues = z.infer<typeof hotelSchema>;

export default function AddHotelPage() {
    const router = useRouter();
    const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<HotelFormValues>({
        resolver: zodResolver(hotelSchema),
        defaultValues: { status: 'ACTIVE' },
    });

    const onSubmit = async (data: HotelFormValues) => {
        try {
            await HotelService.addHotel(data);
            router.push('/super-admin/hotels');
        } catch (error) {
            console.error('Failed to add hotel:', error);
        }
    };

    return (
        <div className="max-w-4xl mx-auto space-y-8">
            <Link href="/super-admin/hotels" className="inline-flex items-center gap-2 text-sm font-bold text-gray-400 hover:text-indigo-600 transition-colors">
                <ArrowLeft className="w-4 h-4" />
                Back to Hotels
            </Link>

            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-black text-gray-900 tracking-tight">Add New Hotel</h1>
                    <p className="text-gray-500">Register a new hotel property to the platform.</p>
                </div>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="bg-white p-8 rounded-[32px] border border-gray-100 shadow-xl space-y-6 md:col-span-2">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-gray-700 flex items-center gap-2">
                                <HotelIcon className="w-4 h-4 text-indigo-400" />
                                Hotel Name
                            </label>
                            <input
                                {...register('name')}
                                placeholder="e.g. Grand Plaza Hotel"
                                className="w-full px-5 py-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-indigo-500 transition-all font-medium"
                            />
                            {errors.name && <p className="text-xs text-red-500 font-bold ml-2">{errors.name.message}</p>}
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-bold text-gray-700 flex items-center gap-2">
                                <Globe className="w-4 h-4 text-indigo-400" />
                                Unique Slug
                            </label>
                            <div className="relative">
                                <span className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 font-medium select-none">/</span>
                                <input
                                    {...register('slug')}
                                    placeholder="grand-plaza"
                                    className="w-full pl-8 pr-5 py-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-indigo-500 transition-all font-medium"
                                />
                            </div>
                            {errors.slug && <p className="text-xs text-red-500 font-bold ml-2">{errors.slug.message}</p>}
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-bold text-gray-700 flex items-center gap-2">
                                <User className="w-4 h-4 text-indigo-400" />
                                Primary Manager
                            </label>
                            <input
                                {...register('managerName')}
                                placeholder="Full Name"
                                className="w-full px-5 py-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-indigo-500 transition-all font-medium"
                            />
                            {errors.managerName && <p className="text-xs text-red-500 font-bold ml-2">{errors.managerName.message}</p>}
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-bold text-gray-700 flex items-center gap-2">
                                <Mail className="w-4 h-4 text-indigo-400" />
                                Contact Email
                            </label>
                            <input
                                {...register('contactEmail')}
                                placeholder="manager@hotel.com"
                                className="w-full px-5 py-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-indigo-500 transition-all font-medium"
                            />
                            {errors.contactEmail && <p className="text-xs text-red-500 font-bold ml-2">{errors.contactEmail.message}</p>}
                        </div>

                        <div className="space-y-2 md:col-span-2">
                            <label className="text-sm font-bold text-gray-700 flex items-center gap-2">
                                <MapPin className="w-4 h-4 text-indigo-400" />
                                Physical Address
                            </label>
                            <textarea
                                {...register('address')}
                                rows={3}
                                placeholder="123 Luxury Ave, Downtown District..."
                                className="w-full px-5 py-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-indigo-500 transition-all font-medium resize-none"
                            />
                            {errors.address && <p className="text-xs text-red-500 font-bold ml-2">{errors.address.message}</p>}
                        </div>

                        <div className="space-y-4 md:col-span-2">
                            <label className="text-sm font-bold text-gray-700">Initial Status</label>
                            <div className="flex gap-4">
                                <label className="flex-1 flex items-center justify-between p-4 bg-gray-50 rounded-2xl border-2 border-transparent has-[:checked]:border-indigo-600 has-[:checked]:bg-indigo-50 transition-all cursor-pointer">
                                    <div className="flex items-center gap-3">
                                        <div className="w-2 h-2 rounded-full bg-green-500"></div>
                                        <span className="font-bold text-gray-900">Active</span>
                                    </div>
                                    <input type="radio" {...register('status')} value="ACTIVE" className="w-5 h-5 accent-indigo-600" />
                                </label>
                                <label className="flex-1 flex items-center justify-between p-4 bg-gray-50 rounded-2xl border-2 border-transparent has-[:checked]:border-red-600 has-[:checked]:bg-red-50 transition-all cursor-pointer">
                                    <div className="flex items-center gap-3">
                                        <div className="w-2 h-2 rounded-full bg-red-500"></div>
                                        <span className="font-bold text-gray-900">Inactive</span>
                                    </div>
                                    <input type="radio" {...register('status')} value="INACTIVE" className="w-5 h-5 accent-red-600" />
                                </label>
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-end gap-4 pt-6">
                        <Link href="/super-admin/hotels" className="px-8 py-4 bg-gray-100 text-gray-600 rounded-2xl font-bold hover:bg-gray-200 transition-all">
                            Cancel
                        </Link>
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="px-10 py-4 bg-indigo-600 text-white rounded-2xl font-bold hover:bg-indigo-700 shadow-xl shadow-indigo-100 transition-all disabled:opacity-50 flex items-center gap-2"
                        >
                            {isSubmitting && <div className="animate-spin w-4 h-4 border-2 border-white/20 border-b-white rounded-full"></div>}
                            Create Hotel
                        </button>
                    </div>
                </div>
            </form>
        </div>
    );
}
