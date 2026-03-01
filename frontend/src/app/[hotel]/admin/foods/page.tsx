'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { FoodItem, FoodService } from '@/features/menu/services/food.service';
import { Search, Plus, Filter, Edit, Trash2, Eye, EyeOff } from 'lucide-react';
import { ProtectedRoute } from '@/features/auth/components/protected-route';
import Link from 'next/link';

export default function FoodsPage() {
    const { hotel } = useParams() as { hotel: string };
    const [foods, setFoods] = useState<FoodItem[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchFoods = async () => {
            const data = await FoodService.getFoodsByHotel(hotel);
            setFoods(data);
            setLoading(false);
        };
        fetchFoods();
    }, [hotel]);

    return (
        <ProtectedRoute allowedRoles={['HOTEL_ADMIN']} requireHotelMatch={true}>
            <div className="space-y-8 max-w-7xl mx-auto p-8">
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-3xl font-black text-gray-900 tracking-tight">Food Menu</h1>
                        <p className="text-gray-500">Manage your dishes, prices, and availability.</p>
                    </div>
                    <Link href={`/${hotel}/admin/foods/add`} className="bg-indigo-600 text-white px-6 py-3 rounded-2xl font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100 flex items-center gap-2">
                        <Plus className="w-5 h-5" />
                        Add New Dish
                    </Link>
                </div>

                <div className="bg-white rounded-[32px] border border-gray-100 shadow-xl overflow-hidden">
                    <div className="p-6 border-b border-gray-50 flex flex-col md:flex-row gap-4 justify-between items-center">
                        <div className="relative w-full md:w-96">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search by dish name or category..."
                                className="w-full pl-12 pr-4 py-3 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-indigo-500 transition-all font-medium"
                            />
                        </div>
                        <button className="flex items-center gap-2 px-6 py-3 bg-gray-50 rounded-2xl font-bold text-gray-600 hover:bg-gray-100 transition-all">
                            <Filter className="w-5 h-5" />
                            Categories
                        </button>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-gray-50/50 text-gray-400">
                                    <th className="px-6 py-4 text-[11px] font-black uppercase tracking-widest text-center w-20">Icon</th>
                                    <th className="px-6 py-4 text-[11px] font-black uppercase tracking-widest">Dish Name</th>
                                    <th className="px-6 py-4 text-[11px] font-black uppercase tracking-widest text-center">Category</th>
                                    <th className="px-6 py-4 text-[11px] font-black uppercase tracking-widest text-center">Price</th>
                                    <th className="px-6 py-4 text-[11px] font-black uppercase tracking-widest text-center">Status</th>
                                    <th className="px-6 py-4 text-[11px] font-black uppercase tracking-widest text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {foods.map((food) => (
                                    <tr key={food.id} className="hover:bg-gray-50 transition-colors group">
                                        <td className="px-6 py-6">
                                            <div className="w-12 h-12 rounded-xl bg-gray-100 overflow-hidden flex-shrink-0 border border-gray-100">
                                                {food.image ? (
                                                    <img src={food.image} alt={food.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform" />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center text-gray-300 font-black italic text-lg">
                                                        {food.name.charAt(0)}
                                                    </div>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-6 py-6">
                                            <div>
                                                <p className="font-black text-gray-900 leading-tight group-hover:text-indigo-600 transition-colors">{food.name}</p>
                                                {food.isPopular && <span className="text-[10px] font-black text-amber-600 uppercase tracking-tighter">★ Popular</span>}
                                            </div>
                                        </td>
                                        <td className="px-6 py-6 text-center">
                                            <span className="px-3 py-1 bg-indigo-50 text-indigo-600 rounded-full text-[10px] font-black uppercase tracking-wider">
                                                {food.category}
                                            </span>
                                        </td>
                                        <td className="px-6 py-6 text-center font-black text-gray-900">${food.price.toFixed(2)}</td>
                                        <td className="px-6 py-6 text-center">
                                            <div className="flex flex-col items-center gap-1">
                                                <span className={`px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${food.available ? 'bg-green-50 text-green-600 border border-green-100' : 'bg-red-50 text-red-600 border border-red-100'
                                                    }`}>
                                                    {food.available ? 'Available' : 'Sold Out'}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-6 text-right">
                                            <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button className="p-2 hover:bg-white rounded-xl shadow-sm border border-transparent hover:border-gray-100 text-gray-400 hover:text-indigo-600 transition-all">
                                                    {food.available ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                                                </button>
                                                <button className="p-2 hover:bg-white rounded-xl shadow-sm border border-transparent hover:border-gray-100 text-gray-400 hover:text-indigo-600 transition-all">
                                                    <Edit className="w-4 h-4" />
                                                </button>
                                                <button className="p-2 hover:bg-white rounded-xl shadow-sm border border-transparent hover:border-gray-100 text-gray-400 hover:text-red-600 transition-all">
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </ProtectedRoute>
    );
}
