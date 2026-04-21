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
    getHotelById,
    bulkAddIngredientsToMenuItem,
    getMenuItemById,
    getDiscountsByHotel,
    getHotelQRCode
} from '@/lib/managerApi';
import { fetchSafe } from '@/lib/api';
import { MenuItem, Category, Chef, Ingredient, Discount } from '@/types';
import { Search, Plus, Edit, Trash2, Loader2, X, Utensils, DollarSign, Camera, Video, Star, CheckCircle, XCircle, Info, PlusCircle, MinusCircle, RefreshCw, AlertCircle, Leaf, AlertTriangle } from 'lucide-react';
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
    const [createStep, setCreateStep] = useState<1 | 2>(1);
    const [editingFood, setEditingFood] = useState<MenuItem | null>(null);
    const [foodToDelete, setFoodToDelete] = useState<MenuItem | null>(null);
    const [linkedIngredients, setLinkedIngredients] = useState<Ingredient[]>([]);
    const [selectedIngredientIds, setSelectedIngredientIds] = useState<string[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [discounts, setDiscounts] = useState<Discount[]>([]);
    const [modalError, setModalError] = useState<string | null>(null);
    const [retryCount, setRetryCount] = useState(0);
    const [uploadingImage, setUploadingImage] = useState(false);
    const [uploadingVideo, setUploadingVideo] = useState(false);
    const [selectedImageFile, setSelectedImageFile] = useState<File | null>(null);
    const [selectedVideoFile, setSelectedVideoFile] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [videoPreview, setVideoPreview] = useState<string | null>(null);

    const { register, handleSubmit, reset, setValue, formState: { errors, isSubmitting } } = useForm<any>({
        resolver: zodResolver(editingFood ? updateMenuItemSchema : createMenuItemSchema),
    });

    useEffect(() => {
        const fetchData = async () => {
            setError(null);
            setLoading(true);

            try {
                const [foodRes, catRes, chefRes, ingRes, hotelRes, discRes] = await Promise.all([
                    fetchSafe<MenuItem[]>(() => getMenuItemsByHotel(hotel)),
                    fetchSafe<Category[]>(() => getCategoriesByHotel(hotel)),
                    fetchSafe<Chef[]>(() => getChefsByHotel(hotel)),
                    fetchSafe<Ingredient[]>(() => getIngredientsByHotel(hotel)),
                    fetchSafe(() => getHotelById(hotel)),
                    fetchSafe<Discount[]>(() => getDiscountsByHotel(hotel))
                ]);

                if (foodRes.error && !foodRes.data) {
                    setError({ message: foodRes.error, status: foodRes.status });
                } else {
                    setFoods(foodRes.data || []);
                    setCategories(catRes.data || []);
                    setChefs(chefRes.data || []);
                    setAllIngredients(ingRes.data || []);
                    setHotelData(hotelRes.data);
                    setDiscounts(discRes.data || []);
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

    const handleFileUpload = async (file: File, type: 'image' | 'video') => {
        const isImage = type === 'image';
        const objectUrl = URL.createObjectURL(file);

        if (isImage) {
            setSelectedImageFile(file);
            setImagePreview(objectUrl);
        } else {
            setSelectedVideoFile(file);
            setVideoPreview(objectUrl);
        }
    };

    const onSubmit = async (data: any) => {
        try {
            const formData = new FormData();
            const targetHotelId = hotelData?.hotel_id || data.hotel_id || hotel;

            formData.append('hotel_id', targetHotelId);
            formData.append('category_id', data.category_id);
            if (data.chef_id && data.chef_id !== '') {
                formData.append('chef_id', data.chef_id);
            }
            formData.append('name_en', data.name_en);
            formData.append('name_am', data.name_am || '');
            formData.append('description_en', data.description_en || '');
            formData.append('description_am', data.description_am || '');
            formData.append('price', data.price.toString());
            formData.append('is_available', String(data.is_available ?? true));
            formData.append('is_special', String(data.is_special ?? false));

            // Single-Step Upload: Append files directly to FormData (matches Postman)
            if (selectedImageFile) {
                formData.append('image', selectedImageFile, selectedImageFile.name);
            } else if (data.image_url) {
                formData.append('image_url', data.image_url);
            }

            if (selectedVideoFile) {
                formData.append('video', selectedVideoFile, selectedVideoFile.name);
            } else if (data.video_url) {
                formData.append('video_url', data.video_url);
            }

            if (editingFood) {
                await updateMenuItem(editingFood.menu_item_id, formData);
                const response = await getMenuItemsByHotel(hotel);
                setFoods(response.data.data);
                closeModal();
            } else {
                const res = await createMenuItem(hotel, formData);
                const newFood = res.data.data;

                // Move to Step 2: Ingredients
                setEditingFood(newFood);
                setCreateStep(2);
                setModalError(null);

                // Refresh list in background
                const response = await getMenuItemsByHotel(hotel);
                setFoods(response.data.data);
            }
        } catch (error: any) {
            const errorData = error.response?.data;
            const errorMsg = errorData?.message || error.message || 'Failed to save food item';
            console.error('Save failed:', errorMsg, errorData);
            setModalError(errorMsg);
        }
    };

    const handleDelete = async () => {
        if (!foodToDelete) return;
        try {
            await deleteMenuItem(foodToDelete.menu_item_id);
            setFoods(foods.filter(f => f.menu_item_id !== foodToDelete.menu_item_id));
            setFoodToDelete(null);
        } catch (error) {
            console.error('Failed to delete food item:', error);
        }
    };

    const openModal = async (food?: MenuItem) => {
        setCreateStep(1);
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
            try {
                const detailRes = await getMenuItemById(food.menu_item_id);
                const fullFood = detailRes.data.data;
                if (fullFood?.ingredients) {
                    setLinkedIngredients(fullFood.ingredients);
                    setSelectedIngredientIds(fullFood.ingredients.map((i: any) => i.ingredient_id));
                }
            } catch (e) {
                console.error('Failed to fetch full item detail:', e);
            }
        } else {
            setEditingFood(null);
            setLinkedIngredients([]);
            setSelectedIngredientIds([]);
            setModalError(null);
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
        setImagePreview(food?.image_url || null);
        setVideoPreview(food?.video_url || null);
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setCreateStep(1);
        setEditingFood(null);
        setLinkedIngredients([]);
        setImagePreview(null);
        setVideoPreview(null);
        setSelectedImageFile(null);
        setSelectedVideoFile(null);
        reset();
    };

    const handleAddIngredient = (ingredient: Ingredient) => {
        if (!selectedIngredientIds.includes(ingredient.ingredient_id)) {
            setSelectedIngredientIds([...selectedIngredientIds, ingredient.ingredient_id]);
            setLinkedIngredients([...linkedIngredients, ingredient]);
        }
    };

    const handleRemoveIngredient = (ingredientId: string) => {
        setSelectedIngredientIds(selectedIngredientIds.filter(id => id !== ingredientId));
        setLinkedIngredients(linkedIngredients.filter(i => i.ingredient_id !== ingredientId));
    };

    const handleFinalize = async () => {
        if (editingFood) {
            try {
                setLoading(true);
                await bulkAddIngredientsToMenuItem(editingFood.menu_item_id, selectedIngredientIds);
                closeModal();
            } catch (e: any) {
                console.error('Failed to save ingredients in bulk:', e);
                setModalError(e.message || 'Unknown error');
            } finally {
                setLoading(false);
            }
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
                    <div className="space-y-12">
                        {filteredFoods.map((food) => {
                            const chef = chefs.find(c => c.chef_id === food.chef_id);
                            const category = categories.find(c => c.category_id === food.category_id);
                            const itemDiscount = food.discount || discounts.find(d => d.menu_item_id === food.menu_item_id && d.is_active);
                            const isDiscounted = (itemDiscount && itemDiscount.is_active) || (food.discounted_price && food.discounted_price < food.price);
                            const finalDiscountedPrice = food.discounted_price || (itemDiscount ? food.price * (1 - itemDiscount.percentage / 100) : food.price);
                            const isDirectVideo = food.video_url && (food.video_url.includes('cloudinary') || food.video_url.endsWith('.mp4') || food.video_url.endsWith('.webm'));
                            console.log(`somenthing ${food.image_url}`)
                            return (
                                <div key={food.menu_item_id} className="bg-white rounded-[72px] border border-gray-100 shadow-sm hover:shadow-2xl transition-all group overflow-hidden flex flex-col xl:flex-row min-h-[600px]">
                                    {/* Visual Section: Stacked Image and Video */}
                                    <div className="xl:base-1/3 xl:w-1/3 p-8 flex flex-col gap-6 bg-gray-50/30">
                                        <div className="relative aspect-video xl:aspect-square w-full rounded-[42px] overflow-hidden shadow-sm border border-white">
                                            {food.image_url ? (
                                                <img src={food.image_url} alt={food.name_en} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000" />
                                            ) : (
                                                <div className="w-full h-full flex flex-col items-center justify-center text-gray-200 bg-white">
                                                    <Utensils className="w-16 h-16 mb-4 opacity-10" />
                                                </div>
                                            )}

                                            <div className="absolute top-6 left-6">
                                                <span className="px-5 py-2 bg-indigo-600 text-white rounded-xl text-[10px] font-black uppercase tracking-[0.2em] shadow-lg">
                                                    {category?.name_en || 'Signature'}
                                                </span>
                                            </div>
                                        </div>

                                        <div className="relative flex-1 rounded-[42px] overflow-hidden bg-black shadow-lg border-2 border-white min-h-[250px]">
                                            {food.video_url ? (
                                                isDirectVideo ? (
                                                    <video
                                                        src={food.video_url}
                                                        controls
                                                        className="w-full h-full object-cover"
                                                        poster={food.image_url || undefined}
                                                        playsInline
                                                    />
                                                ) : (
                                                    <div className="w-full h-full flex flex-col items-center justify-center text-white/40 p-8 text-center gap-4">
                                                        <Video className="w-10 h-10 opacity-20" />
                                                        <p className="text-[10px] font-black uppercase tracking-widest leading-relaxed">External Video Link Available</p>
                                                        <a href={food.video_url} target="_blank" rel="noopener noreferrer" className="px-6 py-3 bg-white/10 hover:bg-white/20 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all">Open Link</a>
                                                    </div>
                                                )
                                            ) : (
                                                <div className="w-full h-full flex flex-col items-center justify-center text-gray-200">
                                                    <Video className="w-12 h-12 mb-4 opacity-10" />
                                                    <span className="text-[10px] font-black uppercase tracking-widest opacity-30">No Video Provided</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Detailed Content Section */}
                                    <div className="flex-1 p-12 md:p-16 flex flex-col">
                                        <div className="flex flex-col md:flex-row justify-between items-start gap-8 mb-12">
                                            <div className="space-y-4">
                                                <div className="flex items-center gap-4">
                                                    <h3 className="text-5xl font-black text-gray-900 tracking-tighter leading-tight">
                                                        {food.name_en}
                                                    </h3>
                                                    {/* Luxury Controls */}
                                                    <div className="flex gap-2">
                                                        <button onClick={() => openModal(food)} className="p-3 bg-gray-50 hover:bg-indigo-50 hover:text-indigo-600 rounded-xl transition-all">
                                                            <Edit className="w-4 h-4" />
                                                        </button>
                                                        <button onClick={() => setFoodToDelete(food)} className="p-3 bg-gray-50 hover:bg-red-50 hover:text-red-500 rounded-xl transition-all">
                                                            <Trash2 className="w-4 h-4" />
                                                        </button>
                                                    </div>
                                                </div>
                                                <p className="text-2xl font-bold text-indigo-600/40 font-amharic Amharic tracking-normal">
                                                    {food.name_am || 'የምግብ ስም'}
                                                </p>
                                            </div>
                                            <div className="text-right">
                                                {isDiscounted ? (
                                                    <div className="space-y-1">
                                                        <div className="text-[10px] font-black uppercase tracking-[0.2em] text-red-500 bg-red-50 px-3 py-1 rounded-lg inline-block mb-2">
                                                            Save {itemDiscount?.percentage || Math.round((1 - (finalDiscountedPrice || 0) / food.price) * 100)}%
                                                        </div>
                                                        <div className="flex items-center justify-end gap-3">
                                                            <span className="text-2xl font-bold text-gray-300 line-through decoration-gray-200">
                                                                ${food.price.toFixed(2)}
                                                            </span>
                                                            <div className="text-5xl font-black text-indigo-600 tracking-tighter">
                                                                ${finalDiscountedPrice.toFixed(2)}
                                                            </div>
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <div className="text-5xl font-black text-indigo-600 mb-4 tracking-tighter">
                                                        ${food.price.toFixed(2)}
                                                    </div>
                                                )}
                                                <div className="flex items-center justify-end gap-3 flex-wrap">
                                                    {food.is_special && (!itemDiscount || !itemDiscount.is_active) && (
                                                        <span className="px-4 py-2 bg-amber-100 text-amber-600 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2">
                                                            <Star className="w-3.5 h-3.5 fill-amber-600" /> Promotion
                                                        </span>
                                                    )}
                                                    <span className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 ${food.is_available ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                                                        {food.is_available ? <CheckCircle className="w-3.5 h-3.5" /> : <XCircle className="w-3.5 h-3.5" />}
                                                        {food.is_available ? 'In Stock' : 'Out of Stock'}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-16 flex-1">
                                            <div className="space-y-8">
                                                <div className="space-y-4">
                                                    <p className="text-[12px] font-black uppercase text-gray-400 tracking-[0.3em] flex items-center gap-3">
                                                        <span className="w-8 h-[2px] bg-indigo-100"></span>
                                                        Narrative
                                                    </p>
                                                    <p className="text-gray-500 text-lg leading-relaxed">
                                                        {food.description_en}
                                                    </p>
                                                    {food.description_am && (
                                                        <p className="text-gray-400 text-base leading-relaxed font-amharic Amharic opacity-60">
                                                            {food.description_am}
                                                        </p>
                                                    )}
                                                </div>

                                                <div className="space-y-6">
                                                    <p className="text-[12px] font-black uppercase text-gray-400 tracking-[0.3em] flex items-center gap-3">
                                                        <span className="w-8 h-[2px] bg-indigo-100"></span>
                                                        Hub Ingredients
                                                    </p>
                                                    <div className="flex flex-wrap gap-2">
                                                        {food.ingredients && food.ingredients.length > 0 ? (
                                                            food.ingredients.map((ing: any) => (
                                                                <span key={ing.ingredient_id} className="px-4 py-2 bg-white border border-gray-100 rounded-xl text-[10px] font-bold text-gray-500 shadow-sm">
                                                                    {ing.name}
                                                                </span>
                                                            ))
                                                        ) : (
                                                            <p className="text-xs font-bold text-gray-300 italic">No ingredients provided</p>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="space-y-8">
                                                <div className="space-y-6">
                                                    <p className="text-[12px] font-black uppercase text-gray-400 tracking-[0.3em] flex items-center gap-3">
                                                        <span className="w-8 h-[2px] bg-indigo-100"></span>
                                                        Artisan
                                                    </p>
                                                    <div className="flex items-center gap-6 p-6 bg-gray-50/50 rounded-[42px] border border-gray-100/50">
                                                        <div className="w-20 h-20 bg-white rounded-3xl overflow-hidden shadow-lg border-2 border-white">
                                                            {chef?.image_url ? (
                                                                <img src={chef.image_url} className="w-full h-full object-cover" />
                                                            ) : (
                                                                <div className="w-full h-full flex items-center justify-center text-indigo-100 bg-indigo-50"><Utensils /></div>
                                                            )}
                                                        </div>
                                                        <div>
                                                            <h4 className="text-xl font-black text-gray-900 tracking-tight">{chef?.name || 'Grand Chef'}</h4>
                                                            <p className="text-sm text-gray-400 font-bold mb-1">{chef?.bio_en || 'Culinary Perfectionist'}</p>
                                                            <p className="text-xs text-indigo-600/40 font-amharic Amharic line-clamp-1">{chef?.bio_am}</p>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}

                {/* Detailed Modal with Steps */}
                {isModalOpen && (
                    <div className="fixed inset-0 z-50 flex items-start justify-center p-4 sm:p-10 bg-gray-900/60 backdrop-blur-sm animate-in fade-in duration-300 overflow-y-auto">
                        <div className="bg-white w-full max-w-5xl rounded-[48px] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 my-auto flex flex-col">
                            {/* Step Indicator */}
                            <div className="px-10 pt-10 pb-6 bg-gray-50/30 flex items-center gap-4">
                                <button
                                    type="button"
                                    onClick={() => setCreateStep(1)}
                                    disabled={!editingFood}
                                    className={`flex items-center gap-3 px-6 py-2 rounded-full border transition-all ${createStep === 1 ? 'bg-indigo-600 border-indigo-600 text-white shadow-lg shadow-indigo-100' : 'bg-white border-gray-100 text-gray-400 cursor-pointer hover:border-indigo-100'}`}
                                >
                                    <span className="text-xs font-black uppercase tracking-widest">01</span>
                                    <span className="text-sm font-bold">Dish Details</span>
                                </button>
                                <div className="w-8 h-[2px] bg-gray-100"></div>
                                <button
                                    type="button"
                                    onClick={() => setCreateStep(2)}
                                    disabled={!editingFood}
                                    className={`flex items-center gap-3 px-6 py-2 rounded-full border transition-all ${createStep === 2 ? 'bg-indigo-600 border-indigo-600 text-white shadow-lg shadow-indigo-100' : 'bg-white border-gray-100 text-gray-400 cursor-pointer hover:border-indigo-100'}`}
                                >
                                    <span className="text-xs font-black uppercase tracking-widest">02</span>
                                    <span className="text-sm font-bold">Ingredients Library</span>
                                </button>
                                <button onClick={closeModal} className="ml-auto p-3 hover:bg-white rounded-2xl text-gray-400 transition-colors shadow-sm">
                                    <X className="w-6 h-6" />
                                </button>
                            </div>

                            {modalError && (
                                <div className="px-10 py-4 bg-red-50 border-y border-red-100 flex items-center gap-3 text-red-600 animate-in slide-in-from-top-2 duration-300">
                                    <AlertTriangle className="w-5 h-5" />
                                    <p className="text-sm font-bold">{modalError}</p>
                                    <button onClick={() => setModalError(null)} className="ml-auto p-2 hover:bg-red-100 rounded-lg transition-colors">
                                        <X className="w-4 h-4" />
                                    </button>
                                </div>
                            )}

                            <div className="flex flex-col lg:flex-row min-h-[500px]">
                                {createStep === 1 ? (
                                    <form onSubmit={handleSubmit(onSubmit)} className="flex-1 p-10 pt-4 space-y-6">
                                        <input type="hidden" {...register('hotel_id')} />
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div className="space-y-2">
                                                <label className="text-xs font-black uppercase tracking-widest text-gray-400 ml-1">Name (EN)</label>
                                                <input
                                                    {...register('name_en')}
                                                    placeholder="Grilled Salmon"
                                                    className="w-full px-6 py-4 bg-gray-50 border-none rounded-2xl font-bold text-gray-900 focus:ring-2 focus:ring-indigo-100 transition-all"
                                                />
                                                {errors.name_en?.message && <p className="text-red-500 text-xs font-bold ml-1">{String(errors.name_en.message)}</p>}
                                            </div>

                                            <div className="space-y-2">
                                                <label className="text-xs font-black uppercase tracking-widest text-gray-400 ml-1">Name (AM)</label>
                                                <input
                                                    {...register('name_am')}
                                                    placeholder="ሽሮ"
                                                    className="w-full px-6 py-4 bg-gray-50 border-none rounded-2xl font-bold text-gray-900 focus:ring-2 focus:ring-indigo-100 transition-all"
                                                />
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
                                                        {...register('price', { valueAsNumber: true })}
                                                        placeholder="15.00"
                                                        className="w-full pl-14 pr-6 py-4 bg-gray-50 border-none rounded-2xl font-bold text-gray-900 focus:ring-2 focus:ring-indigo-100 transition-all"
                                                    />
                                                    <DollarSign className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-300" />
                                                </div>
                                                {errors.price?.message && <p className="text-red-500 text-xs font-bold ml-1">{String(errors.price.message)}</p>}
                                            </div>

                                            <div className="space-y-2">
                                                <label className="text-xs font-black uppercase tracking-widest text-gray-400 ml-1">Description (EN)</label>
                                                <textarea
                                                    {...register('description_en')}
                                                    rows={2}
                                                    placeholder="English description..."
                                                    className="w-full px-6 py-4 bg-gray-50 border-none rounded-2xl font-bold text-gray-900 focus:ring-2 focus:ring-indigo-100 transition-all resize-none"
                                                />
                                            </div>

                                            <div className="space-y-2">
                                                <label className="text-xs font-black uppercase tracking-widest text-gray-400 ml-1">Description (AM)</label>
                                                <textarea
                                                    {...register('description_am')}
                                                    rows={2}
                                                    placeholder="Amharic description..."
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

                                            <div className="space-y-4">
                                                <label className="text-xs font-black uppercase tracking-widest text-gray-400 ml-1">Dish Photo</label>
                                                <div className="relative group">
                                                    <div className={`w-full aspect-video bg-gray-50 rounded-[32px] border-2 border-dashed transition-all flex flex-col items-center justify-center overflow-hidden h-40 ${imagePreview ? 'border-indigo-100' : 'border-gray-200'}`}>
                                                        {uploadingImage ? (
                                                            <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
                                                        ) : imagePreview ? (
                                                            <>
                                                                <img src={imagePreview} className="w-full h-full object-cover" />
                                                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4">
                                                                    <label className="p-3 bg-white rounded-xl text-gray-900 cursor-pointer hover:scale-110 transition-transform">
                                                                        <RefreshCw className="w-5 h-5" />
                                                                        <input type="file" accept="image/*" className="hidden" onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0], 'image')} />
                                                                    </label>
                                                                    <button type="button" onClick={() => { setImagePreview(null); setSelectedImageFile(null); setValue('image_url', ''); }} className="p-3 bg-white rounded-xl text-red-600 hover:scale-110 transition-transform">
                                                                        <Trash2 className="w-5 h-5" />
                                                                    </button>
                                                                </div>
                                                            </>
                                                        ) : (
                                                            <label className="w-full h-full flex flex-col items-center justify-center cursor-pointer hover:bg-gray-100/50 transition-colors">
                                                                <Camera className="w-10 h-10 text-gray-300 mb-2" />
                                                                <span className="text-xs font-bold text-gray-400">Upload Image</span>
                                                                <input type="file" accept="image/*" className="hidden" onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0], 'image')} />
                                                            </label>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="space-y-4">
                                                <label className="text-xs font-black uppercase tracking-widest text-gray-400 ml-1">Promo Video</label>
                                                <div className="relative group">
                                                    <div className={`w-full aspect-video bg-gray-50 rounded-[32px] border-2 border-dashed transition-all flex flex-col items-center justify-center overflow-hidden h-40 ${videoPreview ? 'border-indigo-100' : 'border-gray-200'}`}>
                                                        {uploadingVideo ? (
                                                            <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
                                                        ) : videoPreview ? (
                                                            <>
                                                                <div className="w-full h-full flex items-center justify-center bg-gray-900 text-white">
                                                                    <Video className="w-10 h-10 opacity-40" />
                                                                </div>
                                                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4">
                                                                    <label className="p-3 bg-white rounded-xl text-gray-900 cursor-pointer hover:scale-110 transition-transform">
                                                                        <RefreshCw className="w-5 h-5" />
                                                                        <input type="file" accept="video/*" className="hidden" onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0], 'video')} />
                                                                    </label>
                                                                    <button type="button" onClick={() => { setVideoPreview(null); setSelectedVideoFile(null); setValue('video_url', ''); }} className="p-3 bg-white rounded-xl text-red-600 hover:scale-110 transition-transform">
                                                                        <Trash2 className="w-5 h-5" />
                                                                    </button>
                                                                </div>
                                                            </>
                                                        ) : (
                                                            <label className="w-full h-full flex flex-col items-center justify-center cursor-pointer hover:bg-gray-100/50 transition-colors">
                                                                <Video className="w-10 h-10 text-gray-300 mb-2" />
                                                                <span className="text-xs font-bold text-gray-400">Upload Video</span>
                                                                <input type="file" accept="video/*" className="hidden" onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0], 'video')} />
                                                            </label>
                                                        )}
                                                    </div>
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
                                                    <Loader2 className="w-5 h-5 animate-spin" />
                                                ) : editingFood ? (
                                                    'Update Details & Save'
                                                ) : (
                                                    'Continue to Ingredients'
                                                )}
                                            </button>
                                        </div>
                                    </form>
                                ) : (
                                    <div className="flex-1 flex flex-col p-10 pt-4 animate-in slide-in-from-right-8 duration-500">
                                        <div className="mb-8">
                                            <h3 className="text-2xl font-black text-gray-900 tracking-tight">Select Ingredients</h3>
                                            <p className="text-gray-400 font-medium italic">Tag ingredients for <span className="text-indigo-600 font-black">"{editingFood?.name_en}"</span> to track allergens.</p>
                                        </div>

                                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 flex-1 overflow-hidden">
                                            <div className="space-y-6 flex flex-col">
                                                <div className="flex items-center justify-between">
                                                    <p className="text-[10px] font-black uppercase text-gray-400 tracking-[0.2em]">In Dish</p>
                                                    <span className="px-3 py-1 bg-indigo-50 text-indigo-600 rounded-full text-[10px] font-black">{linkedIngredients.length} Items</span>
                                                </div>
                                                <div className="flex-1 overflow-y-auto pr-2 space-y-3 custom-scrollbar min-h-[300px]">
                                                    {linkedIngredients.length > 0 ? linkedIngredients.map(ing => (
                                                        <div
                                                            key={ing.ingredient_id}
                                                            className="flex items-center justify-between p-4 bg-white border border-gray-100 rounded-[24px] shadow-sm group hover:border-red-100 transition-all"
                                                        >
                                                            <div className="flex items-center gap-4">
                                                                <div className={`w-10 h-10 ${ing.is_allergen ? 'bg-amber-50 text-amber-600' : 'bg-green-50 text-green-600'} rounded-xl flex items-center justify-center`}>
                                                                    {ing.is_allergen ? <AlertTriangle className="w-5 h-5" /> : <Leaf className="w-5 h-5" />}
                                                                </div>
                                                                <span className="font-bold text-gray-700">{ing.name}</span>
                                                            </div>
                                                            <button
                                                                type="button"
                                                                onClick={() => handleRemoveIngredient(ing.ingredient_id)}
                                                                className="p-2 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                                                            >
                                                                <MinusCircle className="w-5 h-5" />
                                                            </button>
                                                        </div>
                                                    )) : (
                                                        <div className="flex flex-col items-center justify-center h-48 bg-gray-50/50 rounded-[32px] border-2 border-dashed border-gray-100 text-gray-300">
                                                            <Info className="w-8 h-8 mb-2 opacity-20" />
                                                            <p className="text-sm font-bold">No ingredients tagged yet</p>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>

                                            <div className="space-y-6 flex flex-col">
                                                <p className="text-[10px] font-black uppercase text-gray-400 tracking-[0.2em]">Library</p>
                                                <div className="flex-1 overflow-y-auto pr-2 space-y-3 custom-scrollbar min-h-[300px]">
                                                    {allIngredients
                                                        .filter(i => !linkedIngredients.find(li => li.ingredient_id === i.ingredient_id))
                                                        .map(ing => (
                                                            <button
                                                                key={ing.ingredient_id}
                                                                type="button"
                                                                onClick={() => handleAddIngredient(ing)}
                                                                className="w-full flex items-center justify-between p-4 bg-white hover:bg-indigo-50 border border-gray-50 hover:border-indigo-100 rounded-[24px] transition-all group shadow-sm text-left"
                                                            >
                                                                <div className="flex items-center gap-4">
                                                                    <div className={`w-10 h-10 ${ing.is_allergen ? 'bg-amber-50/50 text-amber-400' : 'bg-gray-50 text-gray-300'} rounded-xl flex items-center justify-center group-hover:bg-white transition-colors`}>
                                                                        {ing.is_allergen ? <AlertTriangle className="w-5 h-5" /> : <PlusCircle className="w-5 h-5" />}
                                                                    </div>
                                                                    <div className="flex flex-col">
                                                                        <span className="font-bold text-gray-700">{ing.name}</span>
                                                                        {ing.is_allergen && <span className="text-[8px] font-black text-amber-500 uppercase tracking-widest">Allergen alert</span>}
                                                                    </div>
                                                                </div>
                                                                <PlusCircle className="w-5 h-5 text-gray-200 group-hover:text-indigo-600 transition-all" />
                                                            </button>
                                                        ))}
                                                </div>
                                            </div>
                                        </div>

                                        <div className="pt-10">
                                            <button
                                                onClick={handleFinalize}
                                                className="w-full py-5 bg-gray-900 text-white rounded-[28px] font-black tracking-tight hover:bg-black transition-all shadow-xl shadow-gray-200 active:scale-95 flex items-center justify-center gap-3"
                                            >
                                                Finalize & Save Dish
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {/* Delete Confirmation Modal */}
                {foodToDelete && (
                    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-gray-900/40 backdrop-blur-md animate-in fade-in duration-300">
                        <div className="bg-white w-full max-w-md rounded-[48px] shadow-2xl overflow-hidden p-10 text-center space-y-8 animate-in zoom-in-95 duration-300">
                            <div className="w-24 h-24 bg-red-50 rounded-[32px] flex items-center justify-center text-red-600 mx-auto shadow-sm">
                                <AlertTriangle className="w-12 h-12" />
                            </div>
                            <div className="space-y-3">
                                <h3 className="text-3xl font-black text-gray-900 tracking-tight">Remove Dish?</h3>
                                <p className="text-gray-500 font-medium px-4">
                                    You are deleting <span className="text-gray-900 font-black">{foodToDelete.name_en}</span>. This action is irreversible.
                                </p>
                            </div>
                            <div className="flex flex-col gap-3 pt-4">
                                <button
                                    onClick={handleDelete}
                                    className="w-full py-5 bg-red-600 text-white rounded-[28px] font-black tracking-tight hover:bg-red-700 transition-all shadow-xl shadow-red-100 active:scale-95"
                                >
                                    Yes, Remove Dish
                                </button>
                                <button
                                    onClick={() => setFoodToDelete(null)}
                                    className="w-full py-5 bg-white text-gray-500 border-2 border-gray-100 rounded-[28px] font-black tracking-tight hover:bg-gray-50 transition-all active:scale-95"
                                >
                                    Cancel
                                </button>
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
        </ProtectedRoute >
    );
}
