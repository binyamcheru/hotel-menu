'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { MenuItem, MenuService } from '@/features/menu/services/menu-api';
import { MenuItemCard } from '@/features/menu/components/menu-item-card';

export default function PublicMenuPage() {
    const params = useParams();
    const hotelSlug = params?.hotel as string;
    const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchMenu = async () => {
            const data = await MenuService.getMenu(hotelSlug);
            setMenuItems(data);
            setLoading(false);
        };
        fetchMenu();
    }, [hotelSlug]);

    const categories = Array.from(new Set(menuItems.map((item) => item.category)));

    if (loading) {
        return (
            <div className="flex justify-center items-center h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
            </div>
        );
    }

    return (
        <div className="p-4 space-y-8 pb-24 max-w-2xl mx-auto">
            <header className="text-center py-8">
                <h1 className="text-4xl font-black capitalize text-gray-900 mb-2">
                    {hotelSlug.replace('-', ' ')}
                </h1>
                <div className="h-1 w-12 bg-indigo-600 mx-auto rounded-full mb-4"></div>
                <p className="text-gray-500 font-medium">Digital Dining Experience</p>
            </header>

            <div className="space-y-12">
                {categories.map((category) => (
                    <section key={category} className="space-y-6">
                        <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-3">
                            <span className="w-2 h-8 bg-indigo-500 rounded-full"></span>
                            {category}
                        </h2>
                        <div className="grid grid-cols-1 gap-4">
                            {menuItems
                                .filter((item) => item.category === category)
                                .map((item) => (
                                    <MenuItemCard key={item.id} item={item} />
                                ))}
                        </div>
                    </section>
                ))}
            </div>

            <footer className="fixed bottom-6 left-4 right-4 bg-gray-900 text-white p-4 rounded-2xl shadow-2xl flex justify-between items-center max-w-2xl mx-auto border border-gray-800">
                <div>
                    <p className="text-xs text-gray-400">Powered by</p>
                    <p className="text-sm font-bold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
                        Antigravity Menus
                    </p>
                </div>
                <button className="bg-indigo-600 hover:bg-indigo-500 text-white px-8 py-3 rounded-xl font-bold shadow-lg transition-all active:scale-95">
                    View Cart
                </button>
            </footer>
        </div>
    );
}
