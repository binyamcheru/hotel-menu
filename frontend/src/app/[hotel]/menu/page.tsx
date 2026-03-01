'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { FoodItem, FoodService, Category } from '@/features/menu/services/food.service';
import { MenuItemCard } from '@/features/menu/components/menu-item-card';
import { Search, Info, Star, Clock, MapPin } from 'lucide-react';

export default function PublicMenuPage() {
    const params = useParams();
    const hotelSlug = params?.hotel as string;
    const [foods, setFoods] = useState<FoodItem[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [activeCategory, setActiveCategory] = useState<string>('All');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            if (hotelSlug) {
                const [f, c] = await Promise.all([
                    FoodService.getFoodsByHotel(hotelSlug),
                    FoodService.getCategoriesByHotel(hotelSlug)
                ]);
                setFoods(f);
                setCategories([{ id: 'all', name: 'All', hotelSlug }, ...c]);
            }
            setLoading(false);
        };
        fetchData();
    }, [hotelSlug]);

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
            </div>
        );
    }

    const filteredFoods = activeCategory === 'All'
        ? foods
        : foods.filter(f => f.category === activeCategory);

    return (
        <div className="min-h-screen bg-gray-50 pb-20 font-sans max-w-lg mx-auto shadow-2xl overflow-hidden relative border-x border-gray-100">
            {/* Hotel Header */}
            <div className="relative h-64 bg-gray-900">
                <img
                    src="https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?q=80&w=1000"
                    alt="Hotel"
                    className="w-full h-full object-cover opacity-60"
                />
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-gray-50 p-6 pt-20">
                    <div className="bg-white p-6 rounded-[32px] shadow-xl border border-gray-50 relative -mt-32">
                        <div className="flex justify-between items-start">
                            <div>
                                <h1 className="text-2xl font-black text-gray-900 capitalize tracking-tight">{hotelSlug.replace('-', ' ')}</h1>
                                <p className="text-xs text-gray-400 font-bold uppercase tracking-widest mt-1">International Cuisine</p>
                            </div>
                            <div className="w-14 h-14 bg-indigo-600 rounded-2xl flex items-center justify-center text-white font-black italic text-xl shadow-lg shadow-indigo-100">
                                {hotelSlug.charAt(0).toUpperCase()}
                            </div>
                        </div>

                        <div className="flex items-center gap-6 mt-6 border-t border-gray-50 pt-4">
                            <div className="flex items-center gap-1">
                                <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                                <span className="text-sm font-black text-gray-900">4.8</span>
                            </div>
                            <div className="flex items-center gap-1 text-gray-400">
                                <Clock className="w-3.5 h-3.5" />
                                <span className="text-[10px] font-bold uppercase">10am - 11pm</span>
                            </div>
                            <div className="flex items-center gap-1 text-gray-400">
                                <MapPin className="w-3.5 h-3.5" />
                                <span className="text-[10px] font-bold uppercase truncate w-20">Grand Plaza</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Menu Body */}
            <div className="px-6 space-y-8 mt-4">
                {/* Search */}
                <div className="relative">
                    <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-300" />
                    <input
                        type="text"
                        placeholder="Search for dishes..."
                        className="w-full pl-14 pr-5 py-4 bg-white border-none rounded-2xl shadow-sm focus:ring-2 focus:ring-indigo-500 transition-all font-medium"
                    />
                </div>

                {/* Categories Tabs */}
                <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide no-scrollbar -mx-6 px-6">
                    {categories.map((cat) => (
                        <button
                            key={cat.id}
                            onClick={() => setActiveCategory(cat.name)}
                            className={`px-6 py-3 rounded-2xl font-black whitespace-nowrap text-sm tracking-tight transition-all ${activeCategory === cat.name
                                    ? 'bg-gray-900 text-white shadow-lg'
                                    : 'bg-white text-gray-400 hover:text-gray-900'
                                }`}
                        >
                            {cat.name}
                        </button>
                    ))}
                </div>

                {/* Food List */}
                <div className="space-y-4">
                    <div className="flex justify-between items-center px-1">
                        <h2 className="text-xl font-black text-gray-900 tracking-tight">{activeCategory}</h2>
                        <span className="text-xs text-gray-400 font-bold uppercase">{filteredFoods.length} Items</span>
                    </div>
                    <div className="grid grid-cols-1 gap-4 pb-10">
                        {filteredFoods.map((food) => (
                            <MenuItemCard key={food.id} item={food} />
                        ))}
                    </div>
                </div>
            </div>

            {/* Mobile Sticky Footer */}
            <div className="fixed bottom-0 inset-x-0 bg-white/80 backdrop-blur-xl border-t border-gray-100 px-6 py-4 flex justify-between items-center z-50 max-w-lg mx-auto border-x">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-600">
                        <Info className="w-5 h-5" />
                    </div>
                    <div>
                        <p className="text-xs font-black text-gray-900 leading-none">Powered by</p>
                        <p className="text-[10px] text-indigo-500 font-bold uppercase tracking-widest mt-1">Antigravity</p>
                    </div>
                </div>
                <button className="bg-gray-900 text-white px-8 py-3.5 rounded-2xl font-black text-sm shadow-xl active:scale-95 transition-transform">
                    Give Feedback
                </button>
            </div>
        </div>
    );
}
