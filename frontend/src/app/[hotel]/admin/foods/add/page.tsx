'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { FoodService, Category } from '@/features/menu/services/food.service';
import { ArrowLeft, Utensils, Tag, DollarSign, Image as ImageIcon, CheckCircle2, Star } from 'lucide-react';
import { ProtectedRoute } from '@/features/auth/components/protected-route';
import Link from 'next/link';

const foodSchema = z.object({
    name: z.string().min(3, 'Dish name must be at least 3 characters'),
    description: z.string().min(10, 'Description must be at least 10 characters'),
    price: z.number().min(0.01, 'Price must be greater than 0'),
    category_id: z.string().min(1, 'Category is required'),
    image_url: z.string().url('Invalid image URL').or(z.string().length(0)),
    is_available: z.boolean(),
    is_special: z.boolean(),
});

type FoodFormValues = z.infer<typeof foodSchema>;

export default function AddFoodPage() {
    const { hotel } = useParams() as { hotel: string };
    const router = useRouter();
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);

    const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FoodFormValues>({
        resolver: zodResolver(foodSchema),
        defaultValues: { is_available: true, is_special: false, price: 0 },
    });

    useEffect(() => {
        const fetchCategories = async () => {
            const data = await FoodService.getCategoriesByHotel(hotel);
            setCategories(data);
            setLoading(false);
        };
        fetchCategories();
    }, [hotel]);

    const onSubmit = async (data: FoodFormValues) => {
        try {
            await FoodService.addFoodItem(hotel, {
                ...data,
                name: { en: data.name, am: '' }, // Defaulting Amharic to empty for now
                description: { en: data.description, am: '' },
                image_url: data.image_url || ''
            });
            router.push(`/${hotel}/admin/foods`);
        } catch (error) {
            console.error('Failed to add food item:', error);
        }
    };

    return (
        <ProtectedRoute allowedRoles={['admin']} requireHotelMatch={true}>
            <div className="max-w-4xl mx-auto space-y-8 p-8">
                <Link href={`/${hotel}/admin/foods`} className="inline-flex items-center gap-2 text-sm font-bold text-gray-400 hover:text-indigo-600 transition-colors">
                    <ArrowLeft className="w-4 h-4" />
                    Back to Food Menu
                </Link>

                <div>
                    <h1 className="text-3xl font-black text-gray-900 tracking-tight">Add New Dish</h1>
                    <p className="text-gray-500">Create a new entry for your digital menu.</p>
                </div>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
                    <div className="bg-white p-8 rounded-[38px] border border-gray-100 shadow-xl space-y-8">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="space-y-2 md:col-span-2">
                                <label className="text-sm font-black text-gray-700 uppercase tracking-widest flex items-center gap-2">
                                    <Utensils className="w-4 h-4 text-indigo-400" />
                                    Dish Name (English)
                                </label>
                                <input
                                    {...register('name')}
                                    placeholder="e.g. Truffle Mushroom Risotto"
                                    className="w-full px-6 py-4 bg-gray-50 border-none rounded-[20px] focus:ring-2 focus:ring-indigo-500 transition-all font-bold text-lg"
                                />
                                {errors.name && <p className="text-xs text-red-500 font-bold ml-2">{errors.name.message}</p>}
                            </div>

                            <div className="space-y-4 md:col-span-2">
                                <label className="text-sm font-black text-gray-700 uppercase tracking-widest flex items-center gap-2">
                                    Description (English)
                                </label>
                                <textarea
                                    {...register('description')}
                                    rows={3}
                                    placeholder="Describe the ingredients and taste..."
                                    className="w-full px-6 py-4 bg-gray-50 border-none rounded-[20px] focus:ring-2 focus:ring-indigo-500 transition-all font-medium resize-none"
                                />
                                {errors.description && <p className="text-xs text-red-500 font-bold ml-2">{errors.description.message}</p>}
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-black text-gray-700 uppercase tracking-widest flex items-center gap-2">
                                    <Tag className="w-4 h-4 text-indigo-400" />
                                    Category
                                </label>
                                <select
                                    {...register('category_id')}
                                    className="w-full px-6 py-4 bg-gray-50 border-none rounded-[20px] focus:ring-2 focus:ring-indigo-500 transition-all font-bold appearance-none"
                                >
                                    <option value="">Select Category</option>
                                    {categories.map(c => <option key={c.id} value={c.id}>{c.name.en}</option>)}
                                </select>
                                {errors.category_id && <p className="text-xs text-red-500 font-bold ml-2">{errors.category_id.message}</p>}
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-black text-gray-700 uppercase tracking-widest flex items-center gap-2">
                                    <DollarSign className="w-4 h-4 text-indigo-400" />
                                    Price
                                </label>
                                <input
                                    type="number"
                                    step="0.01"
                                    {...register('price', { valueAsNumber: true })}
                                    placeholder="19.50"
                                    className="w-full px-6 py-4 bg-gray-50 border-none rounded-[20px] focus:ring-2 focus:ring-indigo-500 transition-all font-bold"
                                />
                                {errors.price && <p className="text-xs text-red-500 font-bold ml-2">{errors.price.message}</p>}
                            </div>

                            <div className="space-y-2 md:col-span-2">
                                <label className="text-sm font-black text-gray-700 uppercase tracking-widest flex items-center gap-2">
                                    <ImageIcon className="w-4 h-4 text-indigo-400" />
                                    Image URL
                                </label>
                                <input
                                    {...register('image_url')}
                                    placeholder="https://images.unsplash.com/..."
                                    className="w-full px-6 py-4 bg-gray-50 border-none rounded-[20px] focus:ring-2 focus:ring-indigo-500 transition-all font-medium"
                                />
                                {errors.image_url && <p className="text-xs text-red-500 font-bold ml-2">{errors.image_url.message}</p>}
                            </div>

                            <div className="flex gap-4 md:col-span-2">
                                <label className="flex-1 flex items-center justify-between p-5 bg-gray-50 rounded-[24px] border-2 border-transparent has-[:checked]:border-indigo-600 has-[:checked]:bg-indigo-50 transition-all cursor-pointer group">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-green-500 group-has-[:checked]:scale-110 transition-transform">
                                            <CheckCircle2 className="w-6 h-6" />
                                        </div>
                                        <div>
                                            <p className="font-black text-gray-900 leading-none">Available</p>
                                            <p className="text-[10px] text-gray-400 font-bold uppercase mt-1">In Stock</p>
                                        </div>
                                    </div>
                                    <input type="checkbox" {...register('is_available')} className="w-6 h-6 rounded-lg border-gray-100 text-indigo-600 focus:ring-indigo-500" />
                                </label>

                                <label className="flex-1 flex items-center justify-between p-5 bg-gray-50 rounded-[24px] border-2 border-transparent has-[:checked]:border-amber-600 has-[:checked]:bg-amber-50 transition-all cursor-pointer group">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-amber-500 group-has-[:checked]:scale-110 transition-transform">
                                            <Star className="w-6 h-6" />
                                        </div>
                                        <div>
                                            <p className="font-black text-gray-900 leading-none">Special</p>
                                            <p className="text-[10px] text-gray-400 font-bold uppercase mt-1">Featured</p>
                                        </div>
                                    </div>
                                    <input type="checkbox" {...register('is_special')} className="w-6 h-6 rounded-lg border-gray-100 text-amber-600 focus:ring-amber-500" />
                                </label>
                            </div>
                        </div>

                        <div className="flex justify-end gap-4 pt-4">
                            <Link href={`/${hotel}/admin/foods`} className="px-10 py-5 bg-gray-100 text-gray-500 rounded-[20px] font-black hover:bg-gray-200 transition-all">
                                Cancel
                            </Link>
                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="px-12 py-5 bg-indigo-600 text-white rounded-[20px] font-black hover:bg-indigo-700 shadow-xl shadow-indigo-100 transition-all flex items-center gap-3 active:scale-95 disabled:opacity-50"
                            >
                                {isSubmitting && <div className="animate-spin w-4 h-4 border-2 border-white/20 border-b-white rounded-full"></div>}
                                Create Item
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        </ProtectedRoute>
    );
}
