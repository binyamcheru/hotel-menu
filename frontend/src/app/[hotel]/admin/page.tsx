'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { ReviewService, Analytics } from '@/features/reviews/services/review.service';
import { Utensils, Star, Scan, Users, TrendingUp, ChevronRight, MessageSquare } from 'lucide-react';
import { ProtectedRoute } from '@/features/auth/components/protected-route';
import Link from 'next/link';

export default function HotelAdminPage() {
    const params = useParams();
    const hotel = params?.hotel as string;
    const [analytics, setAnalytics] = useState<Analytics | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchAnalytics = async () => {
            if (hotel) {
                const data = await ReviewService.getAnalyticsByHotel(hotel);
                setAnalytics(data);
            }
            setLoading(false);
        };
        fetchAnalytics();
    }, [hotel]);

    if (loading || !analytics) {
        return (
            <div className="flex justify-center items-center h-screen">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600"></div>
            </div>
        );
    }

    const stats = [
        { label: 'Total Scans', value: analytics.totalScans, icon: Scan, color: 'text-blue-600', bg: 'bg-blue-50' },
        { label: 'Unique Visitors', value: analytics.uniqueVisitors, icon: Users, color: 'text-indigo-600', bg: 'bg-indigo-50' },
        { label: 'Avg Rating', value: analytics.averageRating, icon: Star, color: 'text-amber-600', bg: 'bg-amber-50' },
        { label: 'Popular Dishes', value: analytics.popularItems.length, icon: Utensils, color: 'text-green-600', bg: 'bg-green-50' },
    ];

    return (
        <ProtectedRoute allowedRoles={['HOTEL_ADMIN']} requireHotelMatch={true}>
            <div className="p-8 space-y-10 max-w-7xl mx-auto">
                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <h1 className="text-3xl font-black text-gray-900 tracking-tight capitalize">{hotel.replace('-', ' ')} Dashboard</h1>
                        <p className="text-gray-500">Real-time performance metrics and menu management.</p>
                    </div>
                    <div className="flex gap-3">
                        <Link href={`/${hotel}/menu`} target="_blank" className="flex items-center gap-2 bg-white text-gray-900 border border-gray-100 px-6 py-3 rounded-2xl font-bold hover:bg-gray-50 transition-all shadow-sm active:scale-95">
                            Live Menu
                            <ChevronRight className="w-4 h-4" />
                        </Link>
                        <Link href={`/${hotel}/admin/qr`} className="flex items-center gap-2 bg-indigo-600 text-white px-6 py-3 rounded-2xl font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100 active:scale-95">
                            <Scan className="w-5 h-5" />
                            QR Code
                        </Link>
                    </div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {stats.map((stat, i) => (
                        <div key={i} className="bg-white p-8 rounded-[32px] border border-gray-100 shadow-sm transition-all hover:shadow-xl hover:-translate-y-1 group">
                            <div className={`w-14 h-14 ${stat.bg} ${stat.color} rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                                <stat.icon className="w-6 h-6" />
                            </div>
                            <p className="text-gray-500 text-sm font-bold uppercase tracking-wider">{stat.label}</p>
                            <p className="text-4xl font-black text-gray-900 mt-2">{stat.value}</p>
                        </div>
                    ))}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Popular Items */}
                    <div className="lg:col-span-2 bg-white p-8 rounded-[38px] border border-gray-100 shadow-sm space-y-8">
                        <div className="flex justify-between items-end">
                            <h2 className="text-2xl font-black text-gray-900 tracking-tight">Most Ordered Items</h2>
                            <Link href={`/${hotel}/admin/analytics`} className="text-indigo-600 font-bold text-sm hover:underline">Full Analytics</Link>
                        </div>
                        <div className="space-y-4">
                            {analytics.popularItems.map((item, i) => (
                                <div key={i} className="flex items-center justify-between p-5 bg-gray-50 rounded-[24px] hover:bg-indigo-50 transition-colors group">
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-indigo-600 font-bold shadow-sm">
                                            {i + 1}
                                        </div>
                                        <span className="font-bold text-gray-900 group-hover:text-indigo-600 transition-colors">{item.name}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <TrendingUp className="w-4 h-4 text-green-500" />
                                        <span className="font-black text-gray-900">{item.count}</span>
                                        <span className="text-xs text-gray-400 font-medium whitespace-nowrap">scans</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Quick Actions */}
                    <div className="bg-indigo-600 p-8 rounded-[38px] shadow-2xl shadow-indigo-200 text-white flex flex-col justify-between">
                        <div className="space-y-4">
                            <h2 className="text-2xl font-black tracking-tight">Quick Management</h2>
                            <p className="text-indigo-100 font-medium">Instantly update your menu or view latest feedback.</p>
                        </div>
                        <div className="space-y-3 mt-10">
                            <Link href={`/${hotel}/admin/foods`} className="flex items-center justify-between p-5 bg-white/10 hover:bg-white/20 rounded-2xl backdrop-blur-md transition-all group">
                                <span className="font-bold">Edit Food Items</span>
                                <Utensils className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                            </Link>
                            <Link href={`/${hotel}/admin/reviews`} className="flex items-center justify-between p-5 bg-white/10 hover:bg-white/20 rounded-2xl backdrop-blur-md transition-all group">
                                <span className="font-bold">View Reviews</span>
                                <MessageSquare className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </ProtectedRoute>
    );
}
