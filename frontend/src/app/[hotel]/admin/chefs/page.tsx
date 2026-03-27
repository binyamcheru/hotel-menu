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
            if (editingChef) {
                await updateChef(editingChef.chef_id, data);
            } else {
                await createChef({ ...data, hotel_id: hotel });
            }
            // Refresh list
            const response = await getChefsByHotel(hotel);
            setChefs(response.data.data);
            closeModal();
        } catch (error) {
            console.error('Failed to save chef:', error);
        }
    };

    const handleDelete = async (id: string) => {
        if (window.confirm('Are you sure you want to delete this chef?')) {
            try {
                await deleteChef(id);
                setChefs(chefs.filter(c => c.chef_id !== id));
            } catch (error) {
                console.error('Failed to delete chef:', error);
            }
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
                            <div key={chef.chef_id} className="bg-white rounded-[42px] border border-gray-100 shadow-sm hover:shadow-2xl transition-all group overflow-hidden flex flex-col">
                                <div className="aspect-[4/3] bg-gray-50 relative overflow-hidden">
                                    {chef.image_url ? (
                                        <img src={chef.image_url} alt={chef.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-gray-300">
                                            <User className="w-16 h-16" />
                                        </div>
                                    )}
                                    <div className="absolute top-4 right-4 flex gap-2 translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all">
                                        <button
                                            onClick={() => openModal(chef)}
                                            className="p-3 bg-white/90 backdrop-blur-md rounded-2xl text-gray-600 hover:text-indigo-600 hover:bg-white shadow-lg transition-all"
                                        >
                                            <Edit className="w-5 h-5" />
                                        </button>
                                        <button
                                            onClick={() => handleDelete(chef.chef_id)}
                                            className="p-3 bg-white/90 backdrop-blur-md rounded-2xl text-gray-600 hover:text-red-600 hover:bg-white shadow-lg transition-all"
                                        >
                                            <Trash2 className="w-5 h-5" />
                                        </button>
                                    </div>
                                </div>
                                <div className="p-8 flex-1 flex flex-col text-center">
                                    <h3 className="text-2xl font-black text-gray-900 mb-2">{chef.name}</h3>
                                    <div className="text-sm text-gray-400 font-bold uppercase tracking-widest mb-4">Master Chef</div>
                                    <p className="text-gray-500 text-sm leading-relaxed mb-6 line-clamp-3 italic">
                                        {chef.bio_en || 'No bio available...'}
                                    </p>
                                    <div className="pt-6 border-t border-gray-50 mt-auto flex justify-center">
                                        <div className="flex gap-1">
                                            {[...Array(5)].map((_, i) => (
                                                <div key={i} className="w-1.5 h-1.5 rounded-full bg-indigo-100 group-hover:bg-indigo-400 transition-colors" style={{ transitionDelay: `${i * 100}ms` }}></div>
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
                                        rows={3}
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
            </div>
        </ProtectedRoute>
    );
}
