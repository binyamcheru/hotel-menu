'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { getHotelById, updateHotel } from '@/lib/managerApi';
import { Loader2, Save, Camera, MapPin, Phone, Globe, Info, CheckCircle } from 'lucide-react';
import { ProtectedRoute } from '@/features/auth/components/protected-route';
import { useForm } from 'react-hook-form';

export default function SettingsPage() {
    const { hotel: hotelId } = useParams() as { hotel: string };
    const [hotelData, setHotelData] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [success, setSuccess] = useState(false);

    const { register, handleSubmit, reset, watch, formState: { errors } } = useForm();
    const watchedName = watch('name');

    useEffect(() => {
        const fetchHotel = async () => {
            try {
                const response = await getHotelById(hotelId);
                setHotelData(response.data.data);
                reset(response.data.data);
            } catch (error) {
                console.error('Failed to fetch hotel settings:', error);
            } finally {
                setLoading(false);
            }
        };
        if (hotelId) fetchHotel();
    }, [hotelId, reset]);

    const onSubmit = async (data: any) => {
        setSubmitting(true);
        setSuccess(false);
        try {
            await updateHotel(hotelId, data);
            setSuccess(true);
            setTimeout(() => setSuccess(false), 3000);
        } catch (error) {
            console.error('Failed to update hotel:', error);
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-[60vh]">
                <Loader2 className="w-10 h-10 animate-spin text-indigo-600" />
            </div>
        );
    }

    return (
        <ProtectedRoute allowedRoles={['admin']} requireHotelMatch={true}>
            <div className="max-w-4xl mx-auto p-8 space-y-10">
                <div className="flex justify-between items-end">
                    <div>
                        <h1 className="text-4xl font-black text-gray-900 tracking-tight">
                            {watchedName || hotelData?.name || 'Menu'} <span className="text-indigo-600 opacity-20">/</span> Profile
                        </h1>
                        <p className="text-gray-500 font-medium">Manage your hotel identity and public menu settings.</p>
                    </div>
                    {success && (
                        <div className="flex items-center gap-2 text-green-600 font-bold bg-green-50 px-4 py-2 rounded-xl animate-in fade-in slide-in-from-right-4">
                            <CheckCircle className="w-5 h-5" />
                            Settings Saved!
                        </div>
                    )}
                </div>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
                    <div className="bg-white rounded-[48px] border border-gray-100 shadow-xl overflow-hidden">
                        <div className="p-10 space-y-10">
                            {/* Basic Info */}
                            <section className="space-y-6">
                                <div className="flex items-center gap-3 text-indigo-600">
                                    <Info className="w-5 h-5" />
                                    <h2 className="text-lg font-black uppercase tracking-widest">General Information</h2>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2 col-span-full">
                                        <label className="text-xs font-black uppercase tracking-widest text-gray-400 ml-1">Hotel Name</label>
                                        <input
                                            {...register('name', { required: 'Name is required' })}
                                            className="w-full px-8 py-5 bg-gray-50 border-none rounded-[24px] font-bold text-gray-900 focus:ring-2 focus:ring-indigo-100 transition-all text-xl"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-black uppercase tracking-widest text-gray-400 ml-1">Contact Phone</label>
                                        <div className="relative">
                                            <input
                                                {...register('phone')}
                                                className="w-full pl-14 pr-8 py-4 bg-gray-50 border-none rounded-2xl font-bold text-gray-900 focus:ring-2 focus:ring-indigo-100 transition-all"
                                            />
                                            <Phone className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-300" />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-black uppercase tracking-widest text-gray-400 ml-1">Location / Address</label>
                                        <div className="relative">
                                            <input
                                                {...register('address')}
                                                className="w-full pl-14 pr-8 py-4 bg-gray-50 border-none rounded-2xl font-bold text-gray-900 focus:ring-2 focus:ring-indigo-100 transition-all"
                                            />
                                            <MapPin className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-300" />
                                        </div>
                                    </div>
                                </div>
                            </section>

                            <hr className="border-gray-50" />

                            {/* Branding */}
                            <section className="space-y-6">
                                <div className="flex items-center gap-3 text-indigo-600">
                                    <Camera className="w-5 h-5" />
                                    <h2 className="text-lg font-black uppercase tracking-widest">Branding</h2>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
                                    <div className="md:col-span-2 space-y-2">
                                        <label className="text-xs font-black uppercase tracking-widest text-gray-400 ml-1">Logo URL</label>
                                        <input
                                            {...register('logo')}
                                            placeholder="https://..."
                                            className="w-full px-8 py-4 bg-gray-50 border-none rounded-2xl font-bold text-gray-900 focus:ring-2 focus:ring-indigo-100 transition-all"
                                        />
                                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mt-2 ml-1">Use a high-resolution PNG or SVG for best results.</p>
                                    </div>
                                    <div className="aspect-square bg-gray-50 rounded-3xl border-2 border-dashed border-gray-100 flex items-center justify-center p-4">
                                        <img src="https://via.placeholder.com/150" alt="Preview" className="max-w-full max-h-full rounded-xl opacity-20 grayscale" />
                                    </div>
                                </div>
                            </section>

                            <hr className="border-gray-50" />

                            {/* Localization */}
                            <section className="space-y-6">
                                <div className="flex items-center gap-3 text-indigo-600">
                                    <Globe className="w-5 h-5" />
                                    <h2 className="text-lg font-black uppercase tracking-widest">Localization</h2>
                                </div>
                                <div className="space-y-4">
                                    <label className="text-xs font-black uppercase tracking-widest text-gray-400 ml-1">Enabled Languages</label>
                                    <div className="flex gap-4">
                                        <label className="flex-1 flex items-center justify-between p-5 bg-indigo-50 border-2 border-indigo-100 rounded-3xl cursor-not-allowed">
                                            <span className="font-black text-indigo-900">English</span>
                                            <input type="checkbox" checked readOnly className="w-6 h-6 rounded-lg text-indigo-600" />
                                        </label>
                                        <label className="flex-1 flex items-center justify-between p-5 bg-gray-50 rounded-3xl cursor-pointer hover:bg-gray-100 transition-colors">
                                            <span className="font-black text-gray-700">Amharic</span>
                                            <input type="checkbox" {...register('language_settings')} value="am" className="w-6 h-6 rounded-lg text-indigo-600" />
                                        </label>
                                    </div>
                                </div>
                            </section>
                        </div>

                        <div className="p-10 bg-gray-50 border-t border-gray-100 flex justify-end">
                            <button
                                disabled={submitting}
                                type="submit"
                                className="bg-indigo-600 text-white px-12 py-5 rounded-[28px] font-black tracking-tight hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-100 flex items-center gap-3 active:scale-95 disabled:opacity-50"
                            >
                                {submitting ? <Loader2 className="w-6 h-6 animate-spin" /> : <Save className="w-6 h-6" />}
                                Update Profile
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        </ProtectedRoute>
    );
}
