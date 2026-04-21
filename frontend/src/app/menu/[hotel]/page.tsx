'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { Hotel, HotelService } from '@/features/hotels/services/hotel.service';
import { FoodItem, Category, FoodService } from '@/features/menu/services/food.service';
import { ReviewService } from '@/features/reviews/services/review.service';
import { Star, Clock, MapPin, Search, Info, Plus } from 'lucide-react';
import { MenuItemCard } from '@/features/menu/components/menu-item-card';

import { useRouter } from 'next/navigation';

export default function PublicMenuPage() {
    const params = useParams();
    const router = useRouter();
    const hotelIdOrSlug = params?.hotel as string;
    const [foods, setFoods] = useState<FoodItem[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [hotel, setHotel] = useState<Hotel | null>(null);
    const [activeCategory, setActiveCategory] = useState<string>('All');
    const [searchQuery, setSearchQuery] = useState('');
    const [brandColor, setBrandColor] = useState('#111827'); // Default gray-900
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            if (hotelIdOrSlug) {
                try {
                    // Record scan
                    ReviewService.recordScan(hotelIdOrSlug).catch(console.error);

                    const [f, c, h] = await Promise.all([
                        FoodService.getFoodsByHotel(hotelIdOrSlug),
                        FoodService.getCategoriesByHotel(hotelIdOrSlug),
                        HotelService.getHotelById(hotelIdOrSlug)
                    ]);
                    setFoods(f);
                    const allCat: any = { id: 0, name: { en: 'All', am: 'ሁሉም' } };
                    setCategories([allCat, ...c]);
                    setHotel(h);

                    if (h.logo) {
                        extractBrandColor(h.logo);
                    }
                } catch (error) {
                    console.error('Error fetching menu data:', error);
                }
            }
            setLoading(false);
        };
        fetchData();
    }, [hotelIdOrSlug]);

    const extractBrandColor = (url: string) => {
        const img = new Image();
        img.crossOrigin = "Anonymous";
        img.src = url;
        img.onload = () => {
            const canvas = document.createElement('canvas');
            const context = canvas.getContext('2d');
            if (!context) return;
            canvas.width = 1;
            canvas.height = 1;
            context.drawImage(img, 0, 0, 1, 1);
            const [r, g, b] = context.getImageData(0, 0, 1, 1).data;
            const hex = `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;

            // Brightness check for visibility on white
            const brightness = (r * 299 + g * 587 + b * 114) / 1000;
            setBrandColor(brightness > 220 ? '#111827' : hex);
        };
    };

    const handleItemClick = (foodId: string) => {
        if (hotelIdOrSlug) {
            ReviewService.recordMenuItemView(hotelIdOrSlug, foodId).catch(console.error);
            router.push(`/menu/${hotelIdOrSlug}/${foodId}`);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-white flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
            </div>
        );
    }

    const hotelName = hotel?.name || hotelIdOrSlug.replace('-', ' ');

    // Filtering logic
    const filteredFoods = foods.filter(food => {
        const matchesCategory = activeCategory === 'All' ||
            categories.find(c => c.id === food.category_id)?.name.en === activeCategory;

        const matchesSearch = !searchQuery ||
            food.name.en.toLowerCase().includes(searchQuery.toLowerCase()) ||
            food.description?.en?.toLowerCase().includes(searchQuery.toLowerCase());

        return matchesCategory && matchesSearch;
    });

    return (
        <div
            className="min-h-screen bg-white font-sans max-w-lg mx-auto shadow-2xl overflow-hidden relative border-x border-gray-100"
            style={{ '--brand-color': brandColor } as React.CSSProperties}
        >
            <div className="animate-in fade-in duration-500">
                {/* Hotel Header */}
                <div className="relative h-72 sm:h-80 bg-gray-900 group">
                    <img
                        src={hotel?.logo || "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?q=80&w=1000"}
                        alt="Hotel"
                        className="w-full h-full object-cover opacity-60 group-hover:scale-105 transition-transform duration-700"
                    />
                    <div className="absolute inset-0 bg-gradient-to-b from-transparent via-gray-900/20 to-gray-50/10" />
                    <div className="absolute inset-x-0 bottom-0 p-6">
                        <div className="bg-white/80 backdrop-blur-2xl p-6 rounded-[32px] shadow-2xl border border-white/20 relative animate-in slide-in-from-bottom-8 duration-500">
                            <div className="flex justify-between items-start">
                                <div className="space-y-1">
                                    <h1 className="text-3xl font-serif font-bold text-gray-900 capitalize tracking-tight leading-tight">{hotelName}</h1>
                                    <div className="flex items-center gap-2">
                                        <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
                                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Fine Dining • Open</p>
                                    </div>
                                </div>
                                <div
                                    className="w-16 h-16 border rounded-full flex items-center justify-center font-serif italic text-2xl shadow-sm bg-white"
                                    style={{ borderColor: brandColor, color: brandColor }}
                                >
                                    {hotelName.charAt(0).toUpperCase()}
                                </div>
                            </div>

                            <div className="flex items-center justify-between mt-6 border-t border-gray-100 pt-4">
                                <div className="flex items-center gap-1.5">
                                    <div className="flex items-center gap-1 bg-amber-50 px-2 py-1 rounded-lg">
                                        <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                                        <span className="text-xs font-black text-amber-700">4.8</span>
                                    </div>
                                    <span className="text-[10px] font-bold text-gray-300 uppercase tracking-widest">High Rated</span>
                                </div>
                                <div className="flex items-center gap-4">
                                    <div className="flex flex-col items-end">
                                        <p className="text-[9px] font-black text-gray-300 uppercase tracking-widest leading-none mb-1">Hours</p>
                                        <p className="text-[10px] font-bold text-gray-600">10am-11pm</p>
                                    </div>
                                    <div className="w-px h-6 bg-gray-100" />
                                    <div className="flex flex-col items-end max-w-[80px]">
                                        <p className="text-[9px] font-black text-gray-300 uppercase tracking-widest leading-none mb-1">Location</p>
                                        <p className="text-[10px] font-bold text-gray-600 truncate">{hotel?.address || 'Downtown'}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Search Bar */}
                <div className="px-6 mt-8">
                    <div className="relative group">
                        <div className="absolute inset-y-0 left-6 flex items-center pointer-events-none">
                            <Search
                                className="w-4 h-4 transition-colors"
                                style={{ color: searchQuery ? brandColor : '#9ca3af' }}
                            />
                        </div>
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Find your favorite dish..."
                            className="w-full pl-14 pr-6 py-4 bg-gray-50 border-2 border-transparent rounded-2xl focus:bg-white focus:ring-0 transition-all font-medium text-sm placeholder:italic placeholder:text-gray-300"
                            style={{
                                focusBorderColor: brandColor,
                                borderColor: searchQuery ? `${brandColor}20` : 'transparent'
                            } as any}
                        />
                    </div>
                </div>

                {/* Menu Body */}
                <div className="px-6 space-y-12 mt-8">
                    {/* Categories Navigation */}
                    <div className="flex gap-6 overflow-x-auto pb-4 scrollbar-hide no-scrollbar -mx-6 px-6 border-b border-gray-50">
                        {categories.map((cat) => (
                            <button
                                key={cat.id}
                                onClick={() => setActiveCategory(cat.name.en)}
                                className={`font-serif italic text-sm whitespace-nowrap transition-all pb-1`}
                                style={{
                                    color: activeCategory === cat.name.en ? brandColor : '#9ca3af',
                                    borderBottom: activeCategory === cat.name.en ? `1px solid ${brandColor}` : 'none'
                                }}
                            >
                                {cat.name.en}
                            </button>
                        ))}
                    </div>

                    {/* Food Sections */}
                    <div className="space-y-16 pb-20">
                        {filteredFoods.length > 0 ? (
                            categories
                                .filter(cat => activeCategory === 'All' || cat.name.en === activeCategory)
                                .map(cat => {
                                    const categoryItems = filteredFoods.filter(f => f.category_id === cat.id);
                                    if (categoryItems.length === 0) return null;

                                    return (
                                        <div key={cat.id} className="space-y-8">
                                            <div className="flex items-center gap-6">
                                                <h2 className="font-serif text-2xl font-bold text-gray-900 italic">{cat.name.en}</h2>
                                                <div
                                                    className="flex-1 h-px"
                                                    style={{ backgroundColor: `${brandColor}20` }}
                                                />
                                            </div>
                                            <div className="divide-y divide-gray-50">
                                                {categoryItems.map((food) => (
                                                    <MenuItemCard
                                                        key={food.id}
                                                        item={food}
                                                        onClick={() => handleItemClick(food.id)}
                                                    />
                                                ))}
                                            </div>
                                        </div>
                                    );
                                })
                        ) : (
                            <div className="py-20 text-center space-y-4">
                                <Search className="w-12 h-12 text-gray-100 mx-auto" />
                                <h3 className="text-xl font-serif font-bold text-gray-900">No dishes found</h3>
                                <p className="text-gray-500 text-sm max-w-[200px] mx-auto italic">We couldn't find anything matching your search. Try a different dish!</p>
                                <button
                                    onClick={() => { setSearchQuery(''); setActiveCategory('All'); }}
                                    className="text-sm font-bold pt-4 transition-opacity hover:opacity-70"
                                    style={{ color: brandColor }}
                                >
                                    View Full Menu
                                </button>
                            </div>
                        )}
                    </div>
                </div>

                {/* Footer */}
                <div className="px-6 py-12 bg-white border-t border-gray-50 text-center space-y-4">
                    <div className="font-serif italic text-2xl text-gray-900">{hotelName}</div>
                    <p className="text-[10px] font-bold text-gray-300 uppercase tracking-[0.3em]">Thank you for visiting</p>
                    <div className="flex justify-center gap-6 pt-4">
                        <button className="text-gray-400 hover:text-gray-900 transition-colors">
                            <Info className="w-5 h-5" />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
