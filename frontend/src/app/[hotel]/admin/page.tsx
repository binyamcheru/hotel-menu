'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { getHotelAnalytics, getDiscountsByHotel, getChefsByHotel, getIngredientsByHotel, getUsersByHotel, getCategoriesByHotel, getHotelById } from '@/lib/managerApi';
import { fetchSafe } from '@/lib/api';
import { Utensils, Star, Scan, Users, TrendingUp, ChevronRight, MessageSquare, Tag, ChefHat, Percent, Info, Settings, AlertCircle } from 'lucide-react';
import { ProtectedRoute } from '@/features/auth/components/protected-route';
import { ErrorState } from '@/components/ErrorState';
import Link from 'next/link';

export default function HotelAdminDashboard() {
    const { hotel } = useParams() as { hotel: string };
    const [analytics, setAnalytics] = useState<any>(null);
    const [hotelData, setHotelData] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<{ message: string; status: number } | null>(null);
    const [counts, setCounts] = useState({
        chefs: 0,
        discounts: 0,
        ingredients: 0,
        categories: 0,
        users: 0
    });

    useEffect(() => {
        let isMounted = true;
        const fetchData = async () => {
            setError(null);
            setLoading(true);

            try {
                const [anaRes, chefsRes, discRes, ingRes, catRes, hotelRes] = await Promise.all([
                    fetchSafe(() => getHotelAnalytics(hotel)),
                    fetchSafe(() => getChefsByHotel(hotel)),
                    fetchSafe(() => getDiscountsByHotel(hotel)),
                    fetchSafe(() => getIngredientsByHotel(hotel)),
                    fetchSafe(() => getCategoriesByHotel(hotel)),
                    fetchSafe(() => getHotelById(hotel))
                ]);

                if (!isMounted) return;

                // Check for critical failures (e.g. 403 or analytics failure)
                if (anaRes.status === 403 || hotelRes.status === 403) {
                    setError({ message: "You don't have access to this hotel's admin dashboard.", status: 403 });
                    return;
                }

                if (anaRes.error && !anaRes.data) {
                    setError({ message: anaRes.error, status: anaRes.status });
                    return;
                }

                setHotelData(hotelRes.data);
                setAnalytics(anaRes.data);

                setCounts({
                    chefs: (chefsRes.data as any[])?.length || 0,
                    discounts: (discRes.data as any[])?.length || 0,
                    ingredients: (ingRes.data as any[])?.length || 0,
                    categories: (catRes.data as any[])?.length || 0,
                });
            } catch (err) {
                if (!isMounted) return;
                console.error('Failed to fetch dashboard data:', err);
                setError({ message: "An unexpected error occurred while loading your dashboard.", status: 500 });
            } finally {
                if (isMounted) setLoading(false);
            }
        };
        if (hotel) fetchData();
        return () => { isMounted = false; };
    }, [hotel]);

    if (loading) {
        return (
            <div className="flex flex-col justify-center items-center h-screen space-y-4">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
                <p className="text-gray-400 font-bold animate-pulse">Syncing your command center...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex justify-center items-center min-h-[80vh] p-8">
                <ErrorState
                    error={error.message}
                    status={error.status}
                    onRetry={() => window.location.reload()}
                />
            </div>
        );
    }

    const stats = [
        { label: 'Total Scans', value: analytics.total_scans, icon: Scan, color: 'text-blue-600', bg: 'bg-blue-50' },
        { label: 'Total Views', value: analytics.total_menu_views, icon: Utensils, color: 'text-indigo-600', bg: 'bg-indigo-50' },
        { label: 'Avg Rating', value: '4.8', icon: Star, color: 'text-amber-600', bg: 'bg-amber-50' },
    ];

    const managementLinks = [
        { name: 'Dishes', href: `/${hotel}/admin/foods`, icon: Utensils, count: 'Menu', color: 'bg-orange-500' },
        { name: 'Categories', href: `/${hotel}/admin/categories`, icon: Tag, count: counts.categories, color: 'bg-blue-500' },
        { name: 'Chefs', href: `/${hotel}/admin/chefs`, icon: ChefHat, count: counts.chefs, color: 'bg-indigo-500' },
        { name: 'Discounts', href: `/${hotel}/admin/discounts`, icon: Percent, count: counts.discounts, color: 'bg-rose-500' },
        { name: 'Ingredients', href: `/${hotel}/admin/ingredients`, icon: Info, count: counts.ingredients, color: 'bg-emerald-500' },
        { name: 'Reviews', href: `/${hotel}/admin/reviews`, icon: MessageSquare, count: 'Feedback', color: 'bg-amber-500' },
        { name: 'Settings', href: `/${hotel}/admin/settings`, icon: Settings, count: 'Menu Profile', color: 'bg-slate-700' },
    ];

    return (
        <ProtectedRoute allowedRoles={['admin']} requireHotelMatch={true}>
            <div className="p-8 space-y-12 max-w-7xl mx-auto pb-20">
                {/* Hero Section */}
                <div className="relative group">
                    <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-[48px] blur-3xl opacity-10 group-hover:opacity-20 transition-opacity"></div>
                    <div className="relative bg-white p-10 rounded-[48px] border border-gray-100 shadow-sm flex flex-col md:flex-row justify-between items-center gap-8">
                        <div>
                            <h1 className="text-4xl font-black text-gray-900 tracking-tight capitalize select-none">
                                {hotelData?.name || 'Menu'} <span className="text-indigo-600 opacity-30">/</span> Admin
                            </h1>
                            <p className="text-gray-500 font-medium mt-2 text-lg">Your automated digital dining experience command center.</p>
                        </div>
                        <div className="flex gap-4">
                            <Link href={`/menu/${hotel}`} target="_blank" className="flex items-center gap-3 bg-white text-gray-900 border-2 border-gray-50 px-8 py-4 rounded-[28px] font-black hover:bg-gray-50 hover:border-gray-100 transition-all shadow-xl shadow-gray-100 active:scale-95">
                                <Utensils className="w-5 h-5 text-indigo-600" />
                                Live View
                            </Link>
                            <Link href={`/${hotel}/admin/qr`} className="flex items-center gap-3 bg-indigo-600 text-white px-8 py-4 rounded-[28px] font-black hover:bg-indigo-700 transition-all shadow-2xl shadow-indigo-100 active:scale-95">
                                <Scan className="w-5 h-5" />
                                Get QR
                            </Link>
                        </div>
                    </div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                    {stats.map((stat, i) => (
                        <div key={i} className="bg-white p-8 rounded-[42px] border border-gray-50 shadow-sm transition-all hover:shadow-2xl hover:-translate-y-2 group overflow-hidden relative">
                            <div className={`absolute top-0 right-0 w-32 h-32 ${stat.bg} rounded-full -mr-16 -mt-16 opacity-0 group-hover:opacity-100 transition-all duration-500 scale-150`}></div>
                            <div className="relative">
                                <div className={`w-16 h-16 ${stat.bg} ${stat.color} rounded-[24px] flex items-center justify-center mb-6 group-hover:scale-110 group-hover:rotate-6 transition-transform`}>
                                    <stat.icon className="w-8 h-8" />
                                </div>
                                <p className="text-gray-400 text-xs font-black uppercase tracking-[0.2em]">{stat.label}</p>
                                <p className="text-4xl font-black text-gray-900 mt-2">{stat.value}</p>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Management Grid */}
                <div className="space-y-6">
                    <div className="flex items-center justify-between px-4">
                        <h2 className="text-2xl font-black text-gray-900 tracking-tight">Management Suite</h2>
                        <span className="text-xs font-black text-indigo-600 uppercase tracking-widest bg-indigo-50 px-4 py-2 rounded-full">7 Modules Active</span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        {managementLinks.map((link, i) => (
                            <Link
                                href={link.href}
                                key={i}
                                className="group bg-white p-2 rounded-[40px] border border-gray-50 shadow-sm hover:shadow-2xl transition-all hover:-translate-y-1 active:scale-95"
                            >
                                <div className="flex items-center gap-4 p-4">
                                    <div className={`w-14 h-14 ${link.color} text-white rounded-[24px] flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform`}>
                                        <link.icon className="w-6 h-6" />
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="font-black text-gray-900 text-lg">{link.name}</h3>
                                        <p className="text-xs font-bold text-gray-300 uppercase tracking-wider">{link.count} items</p>
                                    </div>
                                    <div className="w-10 h-10 bg-gray-50 rounded-full flex items-center justify-center text-gray-300 group-hover:bg-indigo-600 group-hover:text-white transition-all">
                                        <ChevronRight className="w-5 h-5" />
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>

            </div>
        </ProtectedRoute>
    );
}
