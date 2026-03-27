'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { getIngredientsByHotel, createIngredient, deleteIngredient, getHotelById } from '@/lib/managerApi';
import { fetchSafe } from '@/lib/api';
import { Ingredient, CreateIngredientRequest } from '@/types';
import { Plus, Trash2, Loader2, X, Leaf, AlertTriangle, AlertCircle, RefreshCw } from 'lucide-react';
import { ProtectedRoute } from '@/features/auth/components/protected-route';
import { ErrorState } from '@/components/ErrorState';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { createIngredientSchema } from '@/lib/schemas';

export default function IngredientsPage() {
    const { hotel } = useParams() as { hotel: string };
    const [ingredients, setIngredients] = useState<Ingredient[]>([]);
    const [hotelData, setHotelData] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<{ message: string; status: number } | null>(null);
    const [isIdMapped, setIsIdMapped] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [retryCount, setRetryCount] = useState(0);

    const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<CreateIngredientRequest>({
        resolver: zodResolver(createIngredientSchema),
        defaultValues: {
            hotel_id: hotel,
            name: '',
            is_allergen: false,
        }
    });

    useEffect(() => {
        const fetchIngredients = async () => {
            setError(null);
            setLoading(true);
            try {
                const [ingredientRes, hotelRes] = await Promise.all([
                    fetchSafe<Ingredient[]>(() => getIngredientsByHotel(hotel)),
                    fetchSafe(() => getHotelById(hotel))
                ]);

                if (ingredientRes.error && !ingredientRes.data) {
                    setError({ message: ingredientRes.error, status: ingredientRes.status });
                } else {
                    setIngredients(ingredientRes.data || []);
                    setHotelData(hotelRes.data);
                }
            } catch (err) {
                console.error('Failed to fetch ingredients:', err);
                setError({ message: "Unable to load ingredient library.", status: 500 });
            } finally {
                setLoading(false);
            }
        };
        if (hotel) fetchIngredients();
    }, [hotel, retryCount]);

    const handleRetry = () => setRetryCount(prev => prev + 1);

    const onSubmit = async (data: CreateIngredientRequest) => {
        try {
            await createIngredient({ ...data, hotel_id: hotel });
            const response = await getIngredientsByHotel(hotel);
            setIngredients(response.data.data);
            closeModal();
        } catch (error) {
            console.error('Failed to save ingredient:', error);
        }
    };

    const handleDelete = async (id: string) => {
        if (window.confirm('Are you sure you want to delete this ingredient?')) {
            try {
                await deleteIngredient(id);
                setIngredients(ingredients.filter(i => i.ingredient_id !== id));
            } catch (error) {
                console.error('Failed to delete ingredient:', error);
            }
        }
    };

    const closeModal = () => {
        setIsModalOpen(false);
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
                            {hotelData?.name || 'Menu'} <span className="text-indigo-600 opacity-20">/</span> Ingredients
                        </h1>
                        <p className="text-gray-500 font-medium">Manage allergens and ingredient libraries for your menu.</p>
                    </div>
                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="bg-indigo-600 text-white px-8 py-4 rounded-[24px] font-bold hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-100 flex items-center gap-2 group active:scale-95"
                    >
                        <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform" />
                        Add Ingredient
                    </button>
                </div>

                {error ? (
                    <div className="flex justify-center items-center py-20">
                        <ErrorState error={error.message} status={error.status} onRetry={handleRetry} />
                    </div>
                ) : ingredients.length === 0 ? (
                    <div className="col-span-full py-24 bg-white rounded-[48px] border border-gray-100 shadow-sm flex flex-col items-center justify-center text-center px-10 space-y-8 animate-in fade-in zoom-in duration-500">
                        <div className="w-28 h-28 bg-green-50 rounded-[36px] flex items-center justify-center text-green-600 shadow-sm transition-transform hover:scale-110 duration-500">
                            <Leaf className="w-14 h-14" />
                        </div>
                        <div className="space-y-3">
                            <h3 className="text-3xl font-black text-gray-900 tracking-tight">Ingredient Library</h3>
                            <p className="text-gray-500 font-medium max-w-sm mx-auto text-lg leading-relaxed">Add ingredients here to easily tag them in your food items later for allergen warnings.</p>
                        </div>
                        <button
                            onClick={() => setIsModalOpen(true)}
                            className="bg-indigo-600 text-white px-12 py-5 rounded-[28px] font-black hover:bg-indigo-700 transition-all active:scale-95 shadow-2xl shadow-indigo-100 text-lg"
                        >
                            Add Your First Ingredient
                        </button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        {ingredients.map((ingredient) => (
                            <div key={ingredient.ingredient_id} className="bg-white p-6 rounded-[32px] border border-gray-100 shadow-sm hover:shadow-xl transition-all group flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className={`w-12 h-12 ${ingredient.is_allergen ? 'bg-amber-50 text-amber-600' : 'bg-green-50 text-green-600'} rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110`}>
                                        {ingredient.is_allergen ? <AlertTriangle className="w-6 h-6" /> : <Leaf className="w-6 h-6" />}
                                    </div>
                                    <div>
                                        <h3 className="font-black text-gray-900 line-clamp-1">{ingredient.name}</h3>
                                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">
                                            {ingredient.is_allergen ? 'Allergen' : 'Safe'}
                                        </p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => handleDelete(ingredient.ingredient_id)}
                                    className="p-3 text-gray-300 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all opacity-0 group-hover:opacity-100"
                                >
                                    <Trash2 className="w-5 h-5" />
                                </button>
                            </div>
                        ))}
                    </div>
                )}

                {/* Modal */}
                {isModalOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-gray-900/60 backdrop-blur-sm animate-in fade-in duration-300">
                        <div className="bg-white w-full max-w-md rounded-[48px] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
                            <div className="px-10 py-8 border-b border-gray-50 flex justify-between items-center">
                                <div>
                                    <h2 className="text-2xl font-black text-gray-900 tracking-tight">New Ingredient</h2>
                                    <p className="text-sm text-gray-400 font-medium">Add to your hotel's collection.</p>
                                </div>
                                <button onClick={closeModal} className="p-3 hover:bg-gray-50 rounded-2xl text-gray-400 transition-colors">
                                    <X className="w-6 h-6" />
                                </button>
                            </div>

                            <form onSubmit={handleSubmit(onSubmit)} className="p-10 space-y-6">
                                <div className="space-y-2">
                                    <label className="text-xs font-black uppercase tracking-widest text-gray-400 ml-1">Ingredient Name</label>
                                    <input
                                        {...register('name')}
                                        placeholder="e.g. Peanuts, Dairy, Gluten"
                                        className="w-full px-6 py-4 bg-gray-50 border-none rounded-2xl font-bold text-gray-900 placeholder:text-gray-300 focus:ring-2 focus:ring-indigo-100 transition-all"
                                    />
                                    {errors.name && <p className="text-red-500 text-xs font-bold ml-1">{errors.name.message}</p>}
                                </div>

                                <div className="flex items-center justify-between p-6 bg-amber-50 rounded-[32px] border border-amber-100">
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 bg-amber-200/50 rounded-xl flex items-center justify-center text-amber-700">
                                            <AlertTriangle className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <p className="font-black text-amber-900 text-sm">Mark as Allergen?</p>
                                            <p className="text-amber-700/60 text-[10px] font-bold uppercase tracking-tight">Will show warning on menu</p>
                                        </div>
                                    </div>
                                    <input
                                        type="checkbox"
                                        {...register('is_allergen')}
                                        className="w-6 h-6 rounded-lg border-amber-300 text-amber-600 focus:ring-amber-500"
                                    />
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
                                                <span>Adding to Library...</span>
                                            </>
                                        ) : (
                                            <span>Add to Library</span>
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
