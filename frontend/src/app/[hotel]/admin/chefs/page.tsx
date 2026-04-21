'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { getChefsByHotel, createChef, updateChef, deleteChef, getHotelById } from '@/lib/managerApi';
import { fetchSafe } from '@/lib/api';
import { Chef, CreateChefRequest } from '@/types';
import { Plus, User, Edit, Trash2, Camera, Loader2, X, AlertCircle, RefreshCw } from 'lucide-react';
import { ProtectedRoute } from '@/features/auth/components/protected-route';
import { ErrorState } from '@/components/ErrorState';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { createChefSchema, updateChefSchema } from '@/lib/schemas';

export default function ChefsPage() {
    const { hotel } = useParams() as { hotel: string };
    const [chefs, setChefs] = useState<Chef[]>([]);
    const [hotelData, setHotelData] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<{ message: string; status: number } | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingChef, setEditingChef] = useState<Chef | null>(null);
    const [chefToDelete, setChefToDelete] = useState<Chef | null>(null);
    const [retryCount, setRetryCount] = useState(0);

    const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<CreateChefRequest>({
        resolver: zodResolver(editingChef ? updateChefSchema : createChefSchema) as any,
        defaultValues: {
            hotel_id: '',
            name: '',
            bio_en: '',
            bio_am: '',
            image_url: '',
        }
    });

    useEffect(() => {
        const fetchChefs = async () => {
            setError(null);
            setLoading(true);
            try {
                const [chefRes, hotelRes] = await Promise.all([
                    fetchSafe<Chef[]>(() => getChefsByHotel(hotel)),
                    fetchSafe(() => getHotelById(hotel))
                ]);

                if (chefRes.error && !chefRes.data) {
                    setError({ message: chefRes.error, status: chefRes.status });
                } else {
                    setChefs(chefRes.data || []);
                    setHotelData(hotelRes.data);
                }
            } catch (err) {
                console.error('Failed to fetch chefs:', err);
                setError({ message: "Unable to load culinary staff.", status: 500 });
            } finally {
                setLoading(false);
            }
        };
        if (hotel) fetchChefs();
    }, [hotel, retryCount]);

    const handleRetry = () => setRetryCount(prev => prev + 1);

    const onSubmit = async (data: any) => {
        try {
            const formData = new FormData();
            if (editingChef) {
                if (data.name) formData.append('name', data.name);
                if (data.bio_en) formData.append('bio_en', data.bio_en);
                if (data.bio_am) formData.append('bio_am', data.bio_am);
                if (data.image_url) formData.append('image_url', data.image_url);
                await updateChef(editingChef.chef_id, formData);
            } else {
                formData.append('hotel_id', hotel);
                formData.append('name', data.name);
                if (data.bio_en) formData.append('bio_en', data.bio_en);
                if (data.bio_am) formData.append('bio_am', data.bio_am);
                if (data.image_url) formData.append('image_url', data.image_url);
                await createChef(formData);
            }
            // Refresh list
            const response = await getChefsByHotel(hotel);
            setChefs(response.data.data);
            closeModal();
        } catch (error) {
            console.error('Failed to save chef:', error);
        }
    };

    const handleDelete = async () => {
        if (!chefToDelete) return;
        try {
            await deleteChef(chefToDelete.chef_id);
            setChefs(chefs.filter(c => c.chef_id !== chefToDelete.chef_id));
            setChefToDelete(null);
        } catch (error) {
            console.error('Failed to delete chef:', error);
        }
    };

    const openModal = (chef?: Chef) => {
        if (chef) {
            setEditingChef(chef);
            reset({
                name: chef.name,
                bio_en: chef.bio_en || '',
                bio_am: chef.bio_am || '',
                image_url: chef.image_url || '',
            });
        } else {
            setEditingChef(null);
            reset({
                hotel_id: hotel,
                name: '',
                bio_en: '',
                bio_am: '',
                image_url: '',
            });
        }
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setEditingChef(null);
        reset();
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
            <div className="space-y-10 max-w-6xl mx-auto p-8">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                        <h1 className="text-4xl font-black text-gray-900 tracking-tight">
                            {hotelData?.name || 'Menu'} <span className="text-indigo-600 opacity-20">/</span> Chefs
                        </h1>
                        <p className="text-gray-500 font-medium">Manage the talent behind your amazing dishes.</p>
                    </div>
                    <button
                        onClick={() => openModal()}
                        className="bg-indigo-600 text-white px-8 py-4 rounded-[24px] font-bold hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-100 flex items-center gap-2 group active:scale-95"
                    >
                        <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform" />
                        Add New Chef
                    </button>
                </div>

                {error ? (
                    <div className="flex justify-center items-center py-20">
                        <ErrorState error={error.message} status={error.status} onRetry={handleRetry} />
                    </div>
                ) : chefs.length === 0 ? (
                    <div className="py-20 bg-white rounded-[48px] border border-gray-100 shadow-sm flex flex-col items-center justify-center text-center px-10 space-y-8 animate-in fade-in zoom-in duration-500">
                        <div className="w-28 h-28 bg-indigo-50 rounded-[36px] flex items-center justify-center text-indigo-600 shadow-sm transition-transform hover:scale-110 duration-500">
                            <User className="w-14 h-14" />
                        </div>
                        <div className="space-y-3">
                            <h3 className="text-3xl font-black text-gray-900 tracking-tight">Meet the Masters</h3>
                            <p className="text-gray-500 font-medium max-w-sm mx-auto text-lg leading-relaxed">Showcase the culinary talent behind your amazing dishes to your guests.</p>
                        </div>
                        <button
                            onClick={() => openModal()}
                            className="bg-indigo-600 text-white px-12 py-5 rounded-[28px] font-black hover:bg-indigo-700 transition-all active:scale-95 shadow-2xl shadow-indigo-100 text-lg"
                        >
                            Add Your First Chef
                        </button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {chefs.map((chef) => (
                            <div key={chef.chef_id} className="bg-white rounded-[42px] border border-gray-100 shadow-sm hover:shadow-2xl hover:shadow-indigo-100/50 transition-all duration-500 group overflow-hidden flex flex-col relative">
                                <div className="aspect-[4/3] bg-gray-50 relative overflow-hidden">
                                    {chef.image_url ? (
                                        <img src={chef.image_url} alt={chef.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-gray-200">
                                            <User className="w-20 h-20" />
                                        </div>
                                    )}

                                    {/* Overlay Gradient */}
                                    <div className="absolute inset-0 bg-gradient-to-t from-gray-900/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

                                    <div className="absolute top-6 right-6 flex gap-3 translate-x-4 opacity-0 group-hover:translate-x-0 group-hover:opacity-100 transition-all duration-500">
                                        <button
                                            onClick={() => openModal(chef)}
                                            className="p-3.5 bg-white/95 backdrop-blur-md rounded-2xl text-gray-600 hover:text-indigo-600 hover:scale-110 shadow-xl transition-all active:scale-95"
                                        >
                                            <Edit className="w-5 h-5" />
                                        </button>
                                        <button
                                            onClick={() => setChefToDelete(chef)}
                                            className="p-3.5 bg-white/95 backdrop-blur-md rounded-2xl text-gray-600 hover:text-red-600 hover:scale-110 shadow-xl transition-all active:scale-95"
                                        >
                                            <Trash2 className="w-5 h-5" />
                                        </button>
                                    </div>
                                </div>

                                <div className="p-8 flex-1 flex flex-col text-center relative">
                                    <h3 className="text-2xl font-black text-gray-900 mb-2 group-hover:text-indigo-600 transition-colors">{chef.name}</h3>
                                    <div className="space-y-4 mb-6">
                                        {chef.bio_en && (
                                            <p className="text-gray-500 text-sm leading-relaxed italic font-medium">
                                                "{chef.bio_en}"
                                            </p>
                                        )}
                                        {chef.bio_am && (
                                            <p className="text-gray-600 text-sm leading-relaxed font-bold">
                                                {chef.bio_am}
                                            </p>
                                        )}
                                        {!chef.bio_en && !chef.bio_am && (
                                            <p className="text-gray-400 text-sm italic">No bio available...</p>
                                        )}
                                    </div>

                                    <div className="pt-6 border-t border-gray-50 mt-auto flex justify-center items-center gap-4">
                                        <div className="flex -space-x-1">
                                            {[...Array(5)].map((_, i) => (
                                                <div key={i} className="w-2 h-2 rounded-full bg-indigo-100 group-hover:bg-indigo-500 transition-all duration-500" style={{ transitionDelay: `${i * 100}ms` }}></div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Modal */}
                {isModalOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-gray-900/60 backdrop-blur-sm animate-in fade-in duration-300">
                        <div className="bg-white w-full max-w-xl rounded-[48px] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
                            <div className="px-10 py-8 border-b border-gray-50 flex justify-between items-center">
                                <div>
                                    <h2 className="text-2xl font-black text-gray-900 tracking-tight">
                                        {editingChef ? 'Edit Chef Profile' : 'New Chef Profile'}
                                    </h2>
                                    <p className="text-sm text-gray-400 font-medium">Please fill in the details below.</p>
                                </div>
                                <button onClick={closeModal} className="p-3 hover:bg-gray-50 rounded-2xl text-gray-400 transition-colors">
                                    <X className="w-6 h-6" />
                                </button>
                            </div>

                            <form onSubmit={handleSubmit(onSubmit)} className="p-10 space-y-6">
                                <div className="space-y-2">
                                    <label className="text-xs font-black uppercase tracking-widest text-gray-400 ml-1">Full Name</label>
                                    <input
                                        {...register('name')}
                                        placeholder="Chef Name"
                                        className="w-full px-6 py-4 bg-gray-50 border-none rounded-2xl font-bold text-gray-900 placeholder:text-gray-300 focus:ring-2 focus:ring-indigo-100 transition-all"
                                    />
                                    {errors.name && <p className="text-red-500 text-xs font-bold ml-1">{errors.name.message}</p>}
                                </div>

                                <div className="space-y-2">
                                    <label className="text-xs font-black uppercase tracking-widest text-gray-400 ml-1">Bio (English)</label>
                                    <textarea
                                        {...register('bio_en')}
                                        placeholder="The chef's professional background..."
                                        rows={2}
                                        className="w-full px-6 py-4 bg-gray-50 border-none rounded-2xl font-bold text-gray-900 placeholder:text-gray-300 focus:ring-2 focus:ring-indigo-100 transition-all resize-none"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-xs font-black uppercase tracking-widest text-gray-400 ml-1">Bio (Amharic)</label>
                                    <textarea
                                        {...register('bio_am')}
                                        placeholder="የሼፍ ሙያዊ ዳራ..."
                                        rows={2}
                                        className="w-full px-6 py-4 bg-gray-50 border-none rounded-2xl font-bold text-gray-900 placeholder:text-gray-300 focus:ring-2 focus:ring-indigo-100 transition-all resize-none"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-xs font-black uppercase tracking-widest text-gray-400 ml-1">Image URL</label>
                                    <div className="relative">
                                        <input
                                            {...register('image_url')}
                                            placeholder="https://images.unsplash.com/..."
                                            className="w-full pl-14 pr-6 py-4 bg-gray-50 border-none rounded-2xl font-bold text-gray-900 placeholder:text-gray-300 focus:ring-2 focus:ring-indigo-100 transition-all"
                                        />
                                        <Camera className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-300" />
                                    </div>
                                    {errors.image_url && <p className="text-red-500 text-xs font-bold ml-1">{errors.image_url.message}</p>}
                                </div>

                                <div className="pt-4">
                                    <button
                                        disabled={isSubmitting}
                                        type="submit"
                                        className="w-full py-5 bg-indigo-600 text-white rounded-[28px] font-black tracking-tight hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-100 active:scale-95 disabled:opacity-50 disabled:active:scale-100 flex items-center justify-center gap-3"
                                    >
                                        {isSubmitting ? (
                                            <>
                                                <Loader2 className="w-5 h-5 animate-spin" />
                                                <span>{editingChef ? 'Saving Changes...' : 'Creating Profile...'}</span>
                                            </>
                                        ) : (
                                            <span>{editingChef ? 'Save Changes' : 'Create Profile'}</span>
                                        )}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
                {/* Delete Confirmation Modal */}
                {chefToDelete && (
                    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-gray-900/40 backdrop-blur-md animate-in fade-in duration-300">
                        <div className="bg-white w-full max-w-md rounded-[48px] shadow-2xl overflow-hidden p-10 text-center space-y-8 animate-in zoom-in-95 duration-300">
                            <div className="w-24 h-24 bg-red-50 rounded-[32px] flex items-center justify-center text-red-600 mx-auto shadow-sm">
                                <AlertCircle className="w-12 h-12" />
                            </div>
                            <div className="space-y-3">
                                <h3 className="text-3xl font-black text-gray-900 tracking-tight">Are you sure?</h3>
                                <p className="text-gray-500 font-medium px-4">
                                    You are about to remove <span className="text-gray-900 font-black">{chefToDelete.name}</span>. This action cannot be undone.
                                </p>
                            </div>
                            <div className="flex flex-col gap-3 pt-4">
                                <button
                                    onClick={handleDelete}
                                    className="w-full py-5 bg-red-600 text-white rounded-[28px] font-black tracking-tight hover:bg-red-700 transition-all shadow-xl shadow-red-100 active:scale-95"
                                >
                                    Yes, Delete Profile
                                </button>
                                <button
                                    onClick={() => setChefToDelete(null)}
                                    className="w-full py-5 bg-white text-gray-500 border-2 border-gray-100 rounded-[28px] font-black tracking-tight hover:bg-gray-50 transition-all active:scale-95"
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </ProtectedRoute>
    );
}
