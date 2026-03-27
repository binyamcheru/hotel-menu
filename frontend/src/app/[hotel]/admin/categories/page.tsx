'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { getCategoriesByHotel, createCategory, updateCategory, deleteCategory, getHotelById } from '@/lib/managerApi';
import { fetchSafe } from '@/lib/api';
import { Category, CreateCategoryRequest } from '@/types';
import { Plus, Tag, Edit, Trash2, Loader2, X, CheckCircle, XCircle, AlertCircle, RefreshCw } from 'lucide-react';
import { ProtectedRoute } from '@/features/auth/components/protected-route';
import { ErrorState } from '@/components/ErrorState';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { createCategorySchema, updateCategorySchema } from '@/lib/schemas';

export default function CategoriesPage() {
    const { hotel } = useParams() as { hotel: string };
    const [categories, setCategories] = useState<Category[]>([]);
    const [hotelData, setHotelData] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<{ message: string; status: number } | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingCategory, setEditingCategory] = useState<Category | null>(null);
    const [retryCount, setRetryCount] = useState(0);

    const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<CreateCategoryRequest | any>({
        resolver: zodResolver(editingCategory ? updateCategorySchema : createCategorySchema),
    });

    useEffect(() => {
        const fetchCategories = async () => {
            setError(null);
            setLoading(true);

            try {
                const [catRes, hotelRes] = await Promise.all([
                    fetchSafe<Category[]>(() => getCategoriesByHotel(hotel)),
                    fetchSafe(() => getHotelById(hotel))
                ]);

                if (catRes.error && !catRes.data) {
                    setError({ message: catRes.error, status: catRes.status });
                } else {
                    setCategories(catRes.data || []);
                    setHotelData(hotelRes.data);
                }
            } catch (err) {
                console.error('Failed to fetch categories:', err);
                setError({ message: "Unable to load menu categories.", status: 500 });
            } finally {
                setLoading(false);
            }
        };
        if (hotel) fetchCategories();
    }, [hotel, retryCount]);

    const handleRetry = () => setRetryCount(prev => prev + 1);

    const onSubmit = async (data: any) => {
        try {
            if (editingCategory) {
                const response = await updateCategory(editingCategory.category_id, data);
                setCategories(prev => prev.map(c => c.category_id === editingCategory.category_id ? response.data.data : c));
            } else {
                const response = await createCategory({ ...data, hotel_id: hotel });
                setCategories(prev => [...prev, response.data.data]);
            }
            closeModal();
        } catch (error) {
            console.error('Failed to save category:', error);
        }
    };

    const handleDelete = async (id: string) => {
        if (window.confirm('Are you sure you want to delete this category? All related food items might be affected.')) {
            try {
                await deleteCategory(id);
                setCategories(categories.filter(c => c.category_id !== id));
            } catch (error) {
                console.error('Failed to delete category:', error);
            }
        }
    };

    const openModal = (category?: Category) => {
        if (category) {
            setEditingCategory(category);
            reset({
                name_en: category.name_en,
                name_am: category.name_am || '',
                is_active: category.is_active,
            });
        } else {
            setEditingCategory(null);
            reset({
                hotel_id: hotel,
                name_en: '',
                name_am: '',
                is_active: true,
            });
        }
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setEditingCategory(null);
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
            <div className="space-y-10 max-w-5xl mx-auto p-8">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                        <h1 className="text-4xl font-black text-gray-900 tracking-tight">
                            {hotelData?.name || 'Menu'} <span className="text-indigo-600 opacity-20">/</span> Categories
                        </h1>
                        <p className="text-gray-500 font-medium">Structure your menu for better guest navigation.</p>
                    </div>
                    <button
                        onClick={() => openModal()}
                        className="bg-indigo-600 text-white px-8 py-4 rounded-[24px] font-bold hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-100 flex items-center gap-2 group active:scale-95"
                    >
                        <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform" />
                        Create Category
                    </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {error ? (
                        <div className="col-span-full">
                            <ErrorState error={error.message} status={error.status} onRetry={handleRetry} />
                        </div>
                    ) : categories.length === 0 ? (
                        <div className="col-span-full bg-white rounded-[48px] p-20 border border-gray-100 shadow-sm text-center space-y-6">
                            <div className="bg-indigo-50 w-24 h-24 rounded-[32px] flex items-center justify-center mx-auto transition-transform hover:scale-110 duration-500">
                                <Tag className="w-12 h-12 text-indigo-600" />
                            </div>
                            <div className="space-y-2">
                                <h3 className="text-2xl font-black text-gray-900 tracking-tight">No categories yet</h3>
                                <p className="text-gray-500 font-medium max-w-sm mx-auto">Start by adding your first category to organize your digital menu.</p>
                            </div>
                            <button
                                onClick={() => setIsModalOpen(true)}
                                className="bg-indigo-600 text-white px-12 py-5 rounded-[28px] font-black hover:bg-indigo-700 transition-all active:scale-95 shadow-2xl shadow-indigo-100"
                            >
                                Create First Category
                            </button>
                        </div>
                    ) : (
                        categories.map((category) => (
                            <div key={category.category_id} className="bg-white rounded-[42px] border border-gray-100 shadow-sm hover:shadow-2xl transition-all group p-8 flex items-center justify-between">
                                <div className="flex items-center gap-6">
                                    <div className={`w-16 h-16 ${category.is_active ? 'bg-indigo-50 text-indigo-600' : 'bg-gray-50 text-gray-300'} rounded-[24px] flex items-center justify-center transition-all group-hover:scale-110`}>
                                        <Tag className="w-8 h-8" />
                                    </div>
                                    <div>
                                        <h3 className="text-2xl font-black text-gray-900 group-hover:text-indigo-600 transition-colors">{category.name_en}</h3>
                                        <div className="flex items-center gap-2 mt-1">
                                            {category.is_active ? (
                                                <span className="flex items-center gap-1 text-[10px] font-black uppercase text-green-600 bg-green-50 px-2 py-0.5 rounded-full">
                                                    <CheckCircle className="w-3 h-3" />
                                                    Visible
                                                </span>
                                            ) : (
                                                <span className="flex items-center gap-1 text-[10px] font-black uppercase text-red-500 bg-red-50 px-2 py-0.5 rounded-full">
                                                    <XCircle className="w-3 h-3" />
                                                    Hidden
                                                </span>
                                            )}
                                            <span className="text-[10px] text-gray-300 font-bold uppercase tracking-widest pl-2 border-l border-gray-100">
                                                {category.name_am || 'No Amharic name'}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex gap-2">
                                    <button onClick={() => openModal(category)} className="p-3 bg-gray-50 rounded-2xl text-gray-400 hover:text-indigo-600 hover:bg-white border border-transparent hover:border-indigo-50 transition-all">
                                        <Edit className="w-5 h-5" />
                                    </button>
                                    <button onClick={() => handleDelete(category.category_id)} className="p-3 bg-gray-50 rounded-2xl text-gray-400 hover:text-red-600 hover:bg-white border border-transparent hover:border-red-50 transition-all">
                                        <Trash2 className="w-5 h-5" />
                                    </button>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                {/* Modal */}
                {isModalOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-gray-900/60 backdrop-blur-sm animate-in fade-in duration-300">
                        <div className="bg-white w-full max-w-xl rounded-[48px] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
                            <div className="px-10 py-8 border-b border-gray-50 flex justify-between items-center">
                                <div>
                                    <h2 className="text-2xl font-black text-gray-900 tracking-tight">
                                        {editingCategory ? 'Edit Category' : 'New Category'}
                                    </h2>
                                    <p className="text-sm text-gray-400 font-medium">Enter classification details.</p>
                                </div>
                                <button onClick={closeModal} className="p-3 hover:bg-gray-50 rounded-2xl text-gray-400 transition-colors">
                                    <X className="w-6 h-6" />
                                </button>
                            </div>

                            <form onSubmit={handleSubmit(onSubmit)} className="p-10 space-y-6">
                                <div className="space-y-2">
                                    <label className="text-xs font-black uppercase tracking-widest text-gray-400 ml-1">Name (English)</label>
                                    <input
                                        {...register('name_en')}
                                        placeholder="e.g. Main Courses, Desserts"
                                        className="w-full px-6 py-4 bg-gray-50 border-none rounded-2xl font-bold text-gray-900 placeholder:text-gray-300 focus:ring-2 focus:ring-indigo-100 transition-all"
                                    />
                                    {errors.name_en?.message && <p className="text-red-500 text-xs font-bold ml-1">{String(errors.name_en.message)}</p>}
                                </div>

                                <div className="space-y-2">
                                    <label className="text-xs font-black uppercase tracking-widest text-gray-400 ml-1">Name (Amharic - Optional)</label>
                                    <input
                                        {...register('name_am')}
                                        placeholder="የዋና ምግቦች"
                                        className="w-full px-6 py-4 bg-gray-50 border-none rounded-2xl font-bold text-gray-900 placeholder:text-gray-300 focus:ring-2 focus:ring-indigo-100 transition-all font-serif"
                                    />
                                </div>

                                <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-2xl">
                                    <input
                                        type="checkbox"
                                        {...register('is_active')}
                                        id="cat_is_active"
                                        className="w-5 h-5 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                                    />
                                    <label htmlFor="cat_is_active" className="font-bold text-gray-700">Display in Menu</label>
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
                                                <span>{editingCategory ? 'Saving Changes...' : 'Creating Category...'}</span>
                                            </>
                                        ) : (
                                            <span>{editingCategory ? 'Save Changes' : 'Create Category'}</span>
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
