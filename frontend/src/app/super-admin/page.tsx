'use client';

import { useEffect, useState } from 'react';
import { Hotel, HotelService } from '@/features/hotels/services/hotel.service';
import { HotelCard } from '@/features/hotels/components/hotel-card';
import { LayoutDashboard, Hotel as HotelIcon, Users, Activity, Plus } from 'lucide-react';
import Link from 'next/link';

export default function SuperAdminPage() {
    const [hotels, setHotels] = useState<Hotel[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchHotels = async () => {
            const data = await HotelService.getHotels();
            setHotels(data);
            setLoading(false);
        };
        fetchHotels();
    }, []);

    if (loading) {
        return (
            <div className="flex justify-center items-center h-screen">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600"></div>
            </div>
        );
    }

    const stats = [
        { label: 'Total Hotels', value: hotels.length, icon: HotelIcon, color: 'text-indigo-600', bg: 'bg-indigo-50' },
        { label: 'Total Managers', value: hotels.length, icon: Users, color: 'text-purple-600', bg: 'bg-purple-50' },
        { label: 'Active Menus', value: hotels.length, icon: LayoutDashboard, color: 'text-green-600', bg: 'bg-green-50' },
        { label: 'Monthly Scans', value: '1,240', icon: Activity, color: 'text-blue-600', bg: 'bg-blue-50' },
    ];

    return (
        <div className="space-y-10 max-w-7xl mx-auto">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-black text-gray-900 tracking-tight">Platform Overview</h1>
                    <p className="text-gray-500">Welcome back, Super Admin. Here is what is happening today.</p>
                </div>
                <Link href="/super-admin/hotels/add" className="flex items-center gap-2 bg-indigo-600 text-white px-6 py-3 rounded-2xl font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100 active:scale-95">
                    <Plus className="w-5 h-5" />
                    Add New Hotel
                </Link>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {stats.map((stat, i) => (
                    <div key={i} className="bg-white p-6 rounded-[32px] border border-gray-100 shadow-sm transition-all hover:shadow-xl hover:-translate-y-1 group">
                        <div className={`w-14 h-14 ${stat.bg} ${stat.color} rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                            <stat.icon className="w-6 h-6" />
                        </div>
                        <p className="text-gray-500 text-sm font-medium">{stat.label}</p>
                        <p className="text-3xl font-black text-gray-900 mt-1">{stat.value}</p>
                    </div>
                ))}
            </div>

            {/* Recent Hotels Section */}
            <div className="space-y-6">
                <div className="flex justify-between items-end">
                    <h2 className="text-2xl font-black text-gray-900 tracking-tight">Registered Hotels</h2>
                    <Link href="/super-admin/hotels" className="text-indigo-600 font-bold text-sm hover:underline">View All Hotels</Link>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {hotels.map((hotel) => (
                        <HotelCard key={hotel.hotel_id} hotel={hotel} />
                    ))}
                </div>
            </div>
        </div>
    );
}
