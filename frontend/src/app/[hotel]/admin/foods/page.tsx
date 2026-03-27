'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import {
    getMenuItemsByHotel,
    createMenuItem,
    updateMenuItem,
    deleteMenuItem,
    getCategoriesByHotel,
    getChefsByHotel,
    getIngredientsByHotel,
    getMenuItemIngredients,
    addIngredientToMenuItem,
    removeIngredientFromMenuItem,
    getHotelById
} from '@/lib/managerApi';
import { fetchSafe } from '@/lib/api';
import { MenuItem, Category, Chef, Ingredient } from '@/types';
import { Search, Plus, Edit, Trash2, Loader2, X, Utensils, DollarSign, Camera, Video, Star, CheckCircle, XCircle, Info, PlusCircle, MinusCircle, RefreshCw, AlertCircle } from 'lucide-react';
import { ProtectedRoute } from '@/features/auth/components/protected-route';
import { ErrorState } from '@/components/ErrorState';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { createMenuItemSchema, updateMenuItemSchema } from '@/lib/schemas';

export default function FoodsPage() {
    const { hotel } = useParams() as { hotel: string };
    const [foods, setFoods] = useState<MenuItem[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [chefs, setChefs] = useState<Chef[]>([]);
    const [allIngredients, setAllIngredients] = useState<Ingredient[]>([]);
    const [hotelData, setHotelData] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<{ message: string; status: number } | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingFood, setEditingFood] = useState<MenuItem | null>(null);
    const [linkedIngredients, setLinkedIngredients] = useState<Ingredient[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [retryCount, setRetryCount] = useState(0);

    const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<any>({
        resolver: zodResolver(editingFood ? updateMenuItemSchema : createMenuItemSchema),
    });

    useEffect(() => {
        const fetchData = async () => {
            setError(null);
            setLoading(true);

            try {
                const [foodRes, catRes, chefRes, ingRes, hotelRes] = await Promise.all([
                    fetchSafe<MenuItem[]>(() => getMenuItemsByHotel(hotel)),
                    fetchSafe<Category[]>(() => getCategoriesByHotel(hotel)),
                    fetchSafe<Chef[]>(() => getChefsByHotel(hotel)),
                    fetchSafe<Ingredient[]>(() => getIngredientsByHotel(hotel)),
                    fetchSafe(() => getHotelById(hotel))
                ]);

                if (foodRes.error && !foodRes.data) {
                    setError({ message: foodRes.error, status: foodRes.status });
                } else {
                    setFoods(foodRes.data || []);
                    setCategories(catRes.data || []);
                    setChefs(chefRes.data || []);
                    setAllIngredients(ingRes.data || []);
                    setHotelData(hotelRes.data);
                }
            } catch (err) {
                console.error('Failed to fetch food data:', err);
                setError({ message: "Unable to load your digital menu.", status: 500 });
            } finally {
                setLoading(false);
            }
        };
        if (hotel) fetchData();
    }, [hotel, retryCount]);

    const handleRetry = () => setRetryCount(prev => prev + 1);

    const onSubmit = async (data: any) => {
        try {
            // Clean up optional fields that might be empty strings
            const sanitizedData = { ...data };
            if (!sanitizedData.chef_id) delete sanitizedData.chef_id;
            if (!sanitizedData.image_url) delete sanitizedData.image_url;
            if (!sanitizedData.video_url) delete sanitizedData.video_url;

            const payload = {
                ...sanitizedData,
                price: Number(data.price),
                hotel_id: hotel
            };

            if (editingFood) {
                // Remove hotel_id from update if it's not expected
                const { hotel_id, ...updatePayload } = payload;
                await updateMenuItem(editingFood.menu_item_id, updatePayload);
            } else {
                await createMenuItem(payload);
            }

            const response = await getMenuItemsByHotel(hotel);
            setFoods(response.data.data);
            closeModal();
        } catch (error: any) {
            const errorMsg = error.response?.data?.message || error.message || 'Failed to save food item';
            console.error('Failed to save food item:', errorMsg, error.response?.data);
        }
    };

    const handleDelete = async (id: string) => {
        if (window.confirm('Are you sure you want to delete this dish?')) {
            try {
                await deleteMenuItem(id);
                setFoods(foods.filter(f => f.menu_item_id !== id));
            } catch (error) {
                console.error('Failed to delete food item:', error);
            }
        }
    };

    const openModal = async (food?: MenuItem) => {
        if (food) {
            setEditingFood(food);
            reset({
                category_id: food.category_id,
                chef_id: food.chef_id || '',
                name_en: food.name_en,
                name_am: food.name_am || '',
                description_en: food.description_en || '',
                description_am: food.description_am || '',
                price: food.price,
                image_url: food.image_url || '',
                video_url: food.video_url || '',
                is_available: food.is_available,
                is_special: food.is_special,
            });
            // Fetch linked ingredients
            try {
                const ingRes = await getMenuItemIngredients(food.menu_item_id);
                setLinkedIngredients(ingRes.data.data || []);
            } catch (e) {
                console.error('Failed to fetch linked ingredients:', e);
            }
        } else {
            setEditingFood(null);
            setLinkedIngredients([]);
            reset({
                hotel_id: hotel,
                category_id: categories[0]?.category_id || '',
                chef_id: '',
                name_en: '',
                name_am: '',
                description_en: '',
                description_am: '',
                price: 0,
                image_url: '',
                video_url: '',
                is_available: true,
                is_special: false,
            });
        }
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setEditingFood(null);
        setLinkedIngredients([]);
        reset();
    };

    const handleAddIngredient = async (ingredient: Ingredient) => {
        if (!editingFood) return;
        try {
            await addIngredientToMenuItem({
                menu_item_id: editingFood.menu_item_id,
                ingredient_id: ingredient.ingredient_id
            });
            setLinkedIngredients([...linkedIngredients, ingredient]);
        } catch (e) {
            console.error('Failed to link ingredient:', e);
        }
    };

    const handleRemoveIngredient = async (ingredientId: string) => {
        if (!editingFood) return;
        try {
            await removeIngredientFromMenuItem(editingFood.menu_item_id, ingredientId);
            setLinkedIngredients(linkedIngredients.filter(i => i.ingredient_id !== ingredientId));
        } catch (e) {
            console.error('Failed to unlink ingredient:', e);
        }
    };

    const getCategoryName = (id: string) => categories.find(c => c.category_id === id)?.name_en || 'Unknown';

    const filteredFoods = foods.filter(f =>
        f.name_en.toLowerCase().includes(searchQuery.toLowerCase()) ||
        getCategoryName(f.category_id).toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (loading) {
        return (
            <div className="flex justify-center items-center h-[60vh]">
                <Loader2 className="w-10 h-10 animate-spin text-indigo-600" />
            </div>
        );
    }

    return (
        <ProtectedRoute allowedRoles={['admin']} requireHotelMatch={true}>
            <div className="space-y-10 max-w-7xl mx-auto p-8">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                    <div>
                        <h1 className="text-4xl font-black text-gray-900 tracking-tight">
                            {hotelData?.name || 'Menu'} <span className="text-indigo-600 opacity-20">/</span> Foods
                        </h1>
                        <p className="text-gray-500 font-medium">Manage your dishes, prices, and special offerings.</p>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
                        <div className="relative flex-1">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search dishes..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-12 pr-6 py-4 bg-white border border-gray-100 rounded-[24px] font-bold text-gray-900 focus:ring-2 focus:ring-indigo-100 transition-all shadow-sm"
                            />
                        </div>
                        <button
                            onClick={() => openModal()}
                            className="bg-indigo-600 text-white px-8 py-4 rounded-[24px] font-bold hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-100 flex items-center justify-center gap-2 group active:scale-95 whitespace-nowrap"
                        >
                            <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform" />
                            Add Dish
                        </button>
                    </div>
                </div>

                {error ? (
                    <div className="flex justify-center items-center py-20">
                        <ErrorState error={error.message} status={error.status} onRetry={handleRetry} />
                    </div>
                ) : filteredFoods.length === 0 ? (
                    <div className="bg-white rounded-[48px] p-24 border border-gray-100 shadow-sm text-center space-y-8 animate-in fade-in zoom-in duration-500">
                        <div className="bg-indigo-50 w-28 h-28 rounded-[36px] flex items-center justify-center mx-auto transition-transform hover:scale-110 duration-500">
                            <Utensils className="w-14 h-14 text-indigo-600" />
                        </div>
                        <div className="space-y-3">
                            <h3 className="text-3xl font-black text-gray-900 tracking-tight">
                                {searchQuery ? 'No matches found' : 'Your menu is empty'}
                            </h3>
                            <p className="text-gray-500 font-medium max-w-sm mx-auto text-lg leading-relaxed">
                                {searchQuery
                                    ? `We couldn't find anything matching "${searchQuery}". Try a different search term.`
                                    : 'Tell your culinary story! Start by adding your first signature dish to the digital menu.'}
                            </p>
                        </div>
                        {!searchQuery && (
                            <button
                                onClick={() => openModal()}
                                className="bg-indigo-600 text-white px-12 py-5 rounded-[28px] font-black hover:bg-indigo-700 transition-all active:scale-95 shadow-2xl shadow-indigo-100 text-lg"
                            >
                                Add Your First Dish
                            </button>
                        )}
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                        {filteredFoods.map((food) => (
                            <div key={food.menu_item_id} className="bg-white rounded-[42px] border border-gray-100 shadow-sm hover:shadow-2xl transition-all group overflow-hidden flex flex-col">
                                <div className="aspect-square bg-gray-50 relative overflow-hidden">
                                    {food.image_url ? (
                                        <img src={food.image_url} alt={food.name_en} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-gray-300">
                                            <Utensils className="w-12 h-12" />
                                        </div>
                                    )}
                                    <div className="absolute top-4 right-4 flex gap-2 translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all">
                                        <button onClick={() => openModal(food)} className="p-3 bg-white/90 backdrop-blur-md rounded-2xl text-gray-600 hover:text-indigo-600 hover:bg-white shadow-lg transition-all">
                                            <Edit className="w-5 h-5" />
                                        </button>
                                        <button onClick={() => handleDelete(food.menu_item_id)} className="p-3 bg-white/90 backdrop-blur-md rounded-2xl text-gray-600 hover:text-red-600 hover:bg-white shadow-lg transition-all">
                                            <Trash2 className="w-5 h-5" />
                                        </button>
                                    </div>
                                    <div className="absolute bottom-4 left-4">
                                        <span className="px-3 py-1.5 bg-white/90 backdrop-blur-md rounded-xl text-[10px] font-black uppercase text-indigo-600 shadow-sm">
                                            {getCategoryName(food.category_id)}
                                        </span>
                                    </div>
                                </div>
                                <div className="p-6 flex-1 flex flex-col">
                                    <div className="flex justify-between items-start mb-2">
                                        <h3 className="text-xl font-black text-gray-900 line-clamp-1">{food.name_en}</h3>
                                        <p className="font-black text-indigo-600">${food.price.toFixed(2)}</p>
                                    </div>
                                    <p className="text-gray-400 text-xs font-medium line-clamp-2 mb-4 leading-relaxed">
                                        {food.description_en || 'No description provided...'}
                                    </p>
                                    <div className="mt-auto pt-4 border-t border-gray-50 flex justify-between items-center text-[10px] font-black uppercase tracking-widest">
                                        <div className="flex gap-2">
                                            {food.is_special && (
                                                <span className="text-amber-500 flex items-center gap-1">
                                                    <Star className="w-3 h-3 fill-amber-500" />
                                                    Promo
                                                </span>
                                            )}
                                            {food.video_url && <span className="text-indigo-400 flex items-center gap-1"><Video className="w-3 h-3" /> Video</span>}
                                        </div>
                                        {food.is_available ? (
                                            <span className="text-green-500 flex items-center gap-1"><CheckCircle className="w-3 h-3" /> In Stock</span>
                                        ) : (
                                            <span className="text-red-400 flex items-center gap-1"><XCircle className="w-3 h-3" /> Sold Out</span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Modal */}
                {isModalOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-gray-900/60 backdrop-blur-sm animate-in fade-in duration-300 overflow-y-auto">
                        <div className="bg-white w-full max-w-4xl rounded-[48px] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 my-8 flex flex-col lg:flex-row">

                            <form onSubmit={handleSubmit(onSubmit)} className="flex-1 p-10 space-y-6 border-r border-gray-50">
                                <div className="flex justify-between items-center mb-6">
                                    <div>
                                        <h2 className="text-2xl font-black text-gray-900 tracking-tight">
                                            {editingFood ? 'Edit Dish Details' : 'Add New Dish'}
                                        </h2>
                                        <p className="text-sm text-gray-400 font-medium">Showcase your culinary creations.</p>
                                    </div>
                                    <button type="button" onClick={closeModal} className="lg:hidden p-3 hover:bg-gray-50 rounded-2xl text-gray-400 transition-colors">
                                        <X className="w-6 h-6" />
                                    </button>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2 col-span-full">
                                        <label className="text-xs font-black uppercase tracking-widest text-gray-400 ml-1">Dish Name (English)</label>
                                        <input
                                            {...register('name_en')}
                                            placeholder="e.g. Grilled Salmon"
                                            className="w-full px-6 py-4 bg-gray-50 border-none rounded-2xl font-bold text-gray-900 focus:ring-2 focus:ring-indigo-100 transition-all"
                                        />
                                        {errors.name_en?.message && <p className="text-red-500 text-xs font-bold ml-1">{String(errors.name_en.message)}</p>}
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-xs font-black uppercase tracking-widest text-gray-400 ml-1">Category</label>
                                        <select
                                            {...register('category_id')}
                                            className="w-full px-6 py-4 bg-gray-50 border-none rounded-2xl font-bold text-gray-900 focus:ring-2 focus:ring-indigo-100 transition-all appearance-none"
                                        >
                                            {categories.map(c => <option key={c.category_id} value={c.category_id}>{c.name_en}</option>)}
                                        </select>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-xs font-black uppercase tracking-widest text-gray-400 ml-1">Price ($)</label>
                                        <div className="relative">
                                            <input
                                                type="number"
                                                step="0.01"
                                                {...register('price')}
                                                placeholder="15.00"
                                                className="w-full pl-14 pr-6 py-4 bg-gray-50 border-none rounded-2xl font-bold text-gray-900 focus:ring-2 focus:ring-indigo-100 transition-all"
                                            />
                                            <DollarSign className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-300" />
                                        </div>
                                    </div>

                                    <div className="space-y-2 col-span-full">
                                        <label className="text-xs font-black uppercase tracking-widest text-gray-400 ml-1">Description (English)</label>
                                        <textarea
                                            {...register('description_en')}
                                            rows={2}
                                            placeholder="Briefly describe the dish..."
                                            className="w-full px-6 py-4 bg-gray-50 border-none rounded-2xl font-bold text-gray-900 focus:ring-2 focus:ring-indigo-100 transition-all resize-none"
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-xs font-black uppercase tracking-widest text-gray-400 ml-1">Chef (Optional)</label>
                                        <select
                                            {...register('chef_id')}
                                            className="w-full px-6 py-4 bg-gray-50 border-none rounded-2xl font-bold text-gray-900 focus:ring-2 focus:ring-indigo-100 transition-all appearance-none"
                                        >
                                            <option value="">No specific chef</option>
                                            {chefs.map(c => <option key={c.chef_id} value={c.chef_id}>{c.name}</option>)}
                                        </select>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-xs font-black uppercase tracking-widest text-gray-400 ml-1">Image URL</label>
                                        <div className="relative">
                                            <input
                                                {...register('image_url')}
                                                placeholder="Link to dish photo"
                                                className="w-full pl-14 pr-6 py-4 bg-gray-50 border-none rounded-2xl font-bold text-gray-900 focus:ring-2 focus:ring-indigo-100 transition-all"
                                            />
                                            <Camera className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-300" />
                                        </div>
                                    </div>

                                    <div className="flex gap-4 col-span-full">
                                        <label className="flex-1 flex items-center justify-between p-4 bg-gray-50 rounded-2xl cursor-pointer hover:bg-gray-100 transition-colors">
                                            <span className="font-bold text-gray-700">Available</span>
                                            <input type="checkbox" {...register('is_available')} className="w-6 h-6 rounded-lg text-indigo-600 focus:ring-indigo-500" />
                                        </label>
                                        <label className="flex-1 flex items-center justify-between p-4 bg-gray-50 rounded-2xl cursor-pointer hover:bg-gray-100 transition-colors">
                                            <span className="font-bold text-gray-700">Special</span>
                                            <input type="checkbox" {...register('is_special')} className="w-6 h-6 rounded-lg text-amber-500 focus:ring-amber-500" />
                                        </label>
                                    </div>
                                </div>

                                <div className="pt-4">
                                    <button
                                        disabled={isSubmitting}
                                        type="submit"
                                        className="w-full py-5 bg-indigo-600 text-white rounded-[28px] font-black tracking-tight hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-100 active:scale-95 disabled:opacity-50 flex items-center justify-center gap-3"
                                    >
                                        {isSubmitting ? (
                                            <>
                                                <Loader2 className="w-5 h-5 animate-spin" />
                                                <span>{editingFood ? 'Saving Changes...' : 'Creating Dish...'}</span>
                                            </>
                                        ) : (
                                            <span>{editingFood ? 'Save Changes' : 'Create Dish'}</span>
                                        )}
                                    </button>
                                </div>
                            </form>

                            {/* Ingredient Sidebar in Modal */}
                            <div className="lg:w-80 bg-gray-50/50 p-10 flex flex-col">
                                <div className="flex justify-between items-start mb-6 lg:mb-10">
                                    <div>
                                        <h3 className="text-lg font-black text-gray-900 tracking-tight">Ingredients</h3>
                                        <p className="text-xs text-gray-400 font-medium tracking-wide border-b-2 border-indigo-100 pb-1 inline-block">Nutrition & Allergens</p>
                                    </div>
                                    <button type="button" onClick={closeModal} className="hidden lg:block p-3 hover:bg-white rounded-2xl text-gray-400 transition-colors shadow-sm">
                                        <X className="w-6 h-6" />
                                    </button>
                                </div>

                                {!editingFood ? (
                                    <div className="flex-1 flex flex-col items-center justify-center text-center p-6 border-2 border-dashed border-gray-100 rounded-[32px]">
                                        <Info className="w-10 h-10 text-gray-200 mb-4" />
                                        <p className="text-xs font-bold text-gray-400 leading-relaxed uppercase tracking-widest">Create the dish first to add ingredients.</p>
                                    </div>
                                ) : (
                                    <div className="flex-1 flex flex-col space-y-8 overflow-hidden">
                                        <div className="space-y-4">
                                            <p className="text-[10px] font-black uppercase text-gray-400 tracking-[0.2em]">Selected</p>
                                            <div className="flex flex-wrap gap-2">
                                                {linkedIngredients.length > 0 ? linkedIngredients.map(ing => (
                                                    <button
                                                        key={ing.ingredient_id}
                                                        onClick={() => handleRemoveIngredient(ing.ingredient_id)}
                                                        className="flex items-center gap-2 px-3 py-2 bg-white border border-gray-100 rounded-xl text-xs font-bold text-gray-700 hover:bg-red-50 hover:text-red-500 hover:border-red-100 transition-all group"
                                                    >
                                                        {ing.name}
                                                        <MinusCircle className="w-3 h-3 text-gray-300 group-hover:text-red-500" />
                                                    </button>
                                                )) : (
                                                    <p className="text-xs text-gray-300 italic">No ingredients linked yet.</p>
                                                )}
                                            </div>
                                        </div>

                                        <div className="flex-1 flex flex-col space-y-4 overflow-hidden">
                                            <p className="text-[10px] font-black uppercase text-gray-400 tracking-[0.2em]">Available Library</p>
                                            <div className="flex-1 overflow-y-auto pr-2 space-y-2 custom-scrollbar">
                                                {allIngredients
                                                    .filter(i => !linkedIngredients.find(li => li.ingredient_id === i.ingredient_id))
                                                    .map(ing => (
                                                        <button
                                                            key={ing.ingredient_id}
                                                            onClick={() => handleAddIngredient(ing)}
                                                            className="w-full flex items-center justify-between p-4 bg-white hover:bg-indigo-50 border border-transparent hover:border-indigo-100 rounded-2xl transition-all group"
                                                        >
                                                            <div className="flex flex-col items-start">
                                                                <span className="text-xs font-bold text-gray-700">{ing.name}</span>
                                                                {ing.is_allergen && <span className="text-[8px] font-black text-amber-500 uppercase tracking-widest">Allergen</span>}
                                                            </div>
                                                            <PlusCircle className="w-4 h-4 text-gray-200 group-hover:text-indigo-600 group-hover:rotate-90 transition-all" />
                                                        </button>
                                                    ))}
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </div>
            <style jsx global>{`
                .custom-scrollbar::-webkit-scrollbar { width: 4px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: #E5E7EB; border-radius: 20px; }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #6366F1; }
            `}</style>
        </ProtectedRoute>
    );
}
