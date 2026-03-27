'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { getHotelAnalytics, getMenuItemsByHotel, getHotelById } from '@/lib/managerApi';
import { Loader2, TrendingUp, BarChart3, PieChart, Users, Scan, Utensils, Star, ArrowUpRight, ArrowDownRight, Award } from 'lucide-react';
import { ProtectedRoute } from '@/features/auth/components/protected-route';
import { fetchSafe } from '@/lib/api';

export default function AnalyticsPage() {
    const { hotel } = useParams() as { hotel: string };
    const [analytics, setAnalytics] = useState<any>(null);
    const [foods, setFoods] = useState<any[]>([]);
    const [hotelData, setHotelData] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [anaRes, foodRes, hotelRes] = await Promise.all([
                    fetchSafe(() => getHotelAnalytics(hotel)),
                    fetchSafe(() => getMenuItemsByHotel(hotel)),
                    fetchSafe(() => getHotelById(hotel))
                ]);
                setAnalytics(anaRes.data);
                setFoods(foodRes.data);
                setHotelData(hotelRes.data);
            } catch (error) {
                console.error('Failed to fetch analytics:', error);
            } finally {
                setLoading(false);
            }
        };
        if (hotel) fetchData();
    }, [hotel]);

    if (loading || !analytics) {
        return (
            <div className="flex justify-center items-center h-[60vh]">
                <Loader2 className="w-10 h-10 animate-spin text-indigo-600" />
            </div>
        );
    }

    const metrics = [
        { label: 'Menu Scans', value: analytics.total_scans, growth: '+12%', icon: Scan, color: 'text-blue-600', bg: 'bg-blue-50' },
        { label: 'Item Views', value: analytics.total_menu_views, growth: '+18%', icon: Utensils, color: 'text-indigo-600', bg: 'bg-indigo-50' },
        { label: 'Avg Rating', value: '4.8', growth: '+0.2', icon: Star, color: 'text-amber-600', bg: 'bg-amber-50' },
        { label: 'Popularity Score', value: '92%', growth: '+5%', icon: TrendingUp, color: 'text-emerald-600', bg: 'bg-emerald-50' },
    ];

    return (
        <ProtectedRoute allowedRoles={['admin']} requireHotelMatch={true}>
            <div className="max-w-7xl mx-auto p-8 space-y-12">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                    <div>
                        <h1 className="text-4xl font-black text-gray-900 tracking-tight">
                            {hotelData?.name || 'Menu'} <span className="text-indigo-600 opacity-20">/</span> Insights
                        </h1>
                        <p className="text-gray-500 font-medium">Data-driven analysis of your digital guest experience.</p>
                    </div>
                </div>

                {/* Metric Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                    {metrics.map((m, i) => (
                        <div key={i} className="bg-white p-8 rounded-[42px] border border-gray-50 shadow-sm relative overflow-hidden group hover:shadow-2xl transition-all">
                            <div className="relative z-10">
                                <div className={`w-14 h-14 ${m.bg} ${m.color} rounded-[22px] flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                                    <m.icon className="w-7 h-7" />
                                </div>
                                <p className="text-gray-400 text-[10px] font-black uppercase tracking-[0.2em]">{m.label}</p>
                                <div className="flex items-end gap-3 mt-1">
                                    <span className="text-4xl font-black text-gray-900">{m.value}</span>
                                    <span className="flex items-center text-[10px] font-black text-green-500 bg-green-50 px-2 py-1 rounded-lg mb-1">
                                        <ArrowUpRight className="w-3 h-3 mr-0.5" />
                                        {m.growth}
                                    </span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                    {/* Popularity Ranking */}
                    <div className="lg:col-span-2 bg-white rounded-[56px] border border-gray-50 shadow-sm p-12 space-y-10">
                        <div className="flex justify-between items-center">
                            <div className="flex items-center gap-3 text-gray-900">
                                <BarChart3 className="w-6 h-6" />
                                <h2 className="text-2xl font-black tracking-tight">Performance Ranking</h2>
                            </div>
                        </div>
                        <div className="space-y-6">
                            {analytics.popular_items?.map((item: any, i: number) => {
                                const popularity = (item.count / analytics.total_scans) * 100;
                                return (
                                    <div key={i} className="space-y-3 group">
                                        <div className="flex justify-between items-end px-2">
                                            <div>
                                                <span className="text-[10px] font-black text-indigo-400 uppercase tracking-widest leading-none block mb-1">Rank #0{i + 1}</span>
                                                <span className="text-lg font-black text-gray-900 group-hover:text-indigo-600 transition-colors">{item.name}</span>
                                            </div>
                                            <span className="text-sm font-black text-gray-400">{item.count} Interations</span>
                                        </div>
                                        <div className="h-4 bg-gray-50 rounded-full overflow-hidden p-1 border border-gray-100/50">
                                            <div
                                                className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full transition-all duration-1000 ease-out"
                                                style={{ width: `${Math.min(popularity * 2, 100)}%` }}
                                            ></div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Quick Stats sidebar */}
                    <div className="space-y-10">
                        <div className="bg-indigo-600 p-10 rounded-[56px] text-white shadow-2xl shadow-indigo-100 relative overflow-hidden group">
                            <PieChart className="absolute top-0 right-0 w-32 h-32 text-white/5 -mr-10 -mt-10 group-hover:scale-125 transition-transform duration-1000" />
                            <div className="relative space-y-6">
                                <h3 className="text-xl font-black tracking-tight">Menu Diversity</h3>
                                <div className="space-y-4">
                                    <div className="flex justify-between items-center bg-white/10 p-4 rounded-2xl">
                                        <span className="text-sm font-bold">Menu Items</span>
                                        <span className="text-2xl font-black">{foods.length}</span>
                                    </div>
                                    <div className="flex justify-between items-center bg-white/10 p-4 rounded-2xl">
                                        <span className="text-sm font-bold">Featured Dish</span>
                                        <span className="text-2xl font-black">{foods.filter(f => f.is_special).length}</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="bg-slate-900 p-10 rounded-[56px] text-white overflow-hidden relative group">
                            <div className="absolute inset-0 bg-gradient-to-br from-indigo-600/20 to-transparent"></div>
                            <div className="relative space-y-6">
                                <div className="flex items-center gap-2">
                                    <div className="w-10 h-10 bg-indigo-500 rounded-xl flex items-center justify-center">
                                        <Award className="w-6 h-6" />
                                    </div>
                                    <h3 className="text-xl font-black tracking-tight">Best Review</h3>
                                </div>
                                <p className="text-indigo-100 font-medium text-sm leading-relaxed italic">
                                    &quot;The flavors were perfectly balanced, and the presentation was state of the art!&quot;
                                </p>
                                <div className="pt-4 border-t border-white/5 flex justify-between items-center">
                                    <span className="text-[10px] font-black uppercase text-indigo-400 tracking-widest">Guest Suggestion</span>
                                    <div className="flex gap-1">
                                        {[...Array(5)].map((_, i) => <Star key={i} className="w-3 h-3 text-amber-400 fill-amber-400" />)}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </ProtectedRoute>
    );
}
