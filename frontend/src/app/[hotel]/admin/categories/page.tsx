'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { FoodService, Category } from '@/features/menu/services/food.service';
import { Plus, Tag, Edit, Trash2, FolderPlus } from 'lucide-react';
import { ProtectedRoute } from '@/features/auth/components/protected-route';

export default function CategoriesPage() {
    const { hotel } = useParams() as { hotel: string };
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchCategories = async () => {
            const data = await FoodService.getCategoriesByHotel(hotel);
            setCategories(data);
            setLoading(false);
        };
        fetchCategories();
    }, [hotel]);

    return (
        <ProtectedRoute allowedRoles={['HOTEL_ADMIN']} requireHotelMatch={true}>
            <div className="space-y-8 max-w-5xl mx-auto p-8">
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-3xl font-black text-gray-900 tracking-tight">Categories</h1>
                        <p className="text-gray-500">Organize your food items into meaningful groups.</p>
                    </div>
                    <button className="bg-indigo-600 text-white px-6 py-3 rounded-2xl font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100 flex items-center gap-2">
                        <FolderPlus className="w-5 h-5" />
                        New Category
                    </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {categories.map((category) => (
                        <div key={category.id} className="bg-white p-6 rounded-[32px] border border-gray-100 shadow-sm hover:shadow-xl transition-all group flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className="w-14 h-14 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600 group-hover:scale-110 transition-transform">
                                    <Tag className="w-6 h-6" />
                                </div>
                                <div>
                                    <h3 className="text-xl font-black text-gray-900">{category.name}</h3>
                                    <p className="text-sm text-gray-400 font-bold uppercase tracking-widest">Active Category</p>
                                </div>
                            </div>
                            <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button className="p-3 hover:bg-indigo-50 rounded-xl text-gray-400 hover:text-indigo-600 transition-all">
                                    <Edit className="w-5 h-5" />
                                </button>
                                <button className="p-3 hover:bg-red-50 rounded-xl text-gray-400 hover:text-red-600 transition-all">
                                    <Trash2 className="w-5 h-5" />
                                </button>
                            </div>
                        </div>
                    ))}

                    {/* Empty State / Add New Placeholder */}
                    <button className="p-6 rounded-[32px] border-2 border-dashed border-gray-100 hover:border-indigo-200 hover:bg-indigo-50/30 transition-all group">
                        <div className="flex items-center gap-4">
                            <div className="w-14 h-14 bg-gray-50 rounded-2xl flex items-center justify-center text-gray-300 group-hover:text-indigo-400 transition-colors">
                                <Plus className="w-6 h-6" />
                            </div>
                            <div className="text-left">
                                <h3 className="text-xl font-black text-gray-300 group-hover:text-indigo-900 transition-colors">Add New...</h3>
                                <p className="text-sm text-gray-200 font-bold uppercase tracking-widest group-hover:text-indigo-400 transition-colors">Quick Entry</p>
                            </div>
                        </div>
                    </button>
                </div>
            </div>
        </ProtectedRoute>
    );
}
