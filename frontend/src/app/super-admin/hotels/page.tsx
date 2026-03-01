'use client';

import { useEffect, useState } from 'react';
import { Hotel, HotelService } from '@/features/hotels/services/hotel.service';
import { Search, Filter, MoreVertical, Edit, Trash2, Eye } from 'lucide-react';
import Link from 'next/link';

export default function HotelsListPage() {
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

    return (
        <div className="space-y-8 max-w-7xl mx-auto">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-black text-gray-900 tracking-tight">Hotels</h1>
                    <p className="text-gray-500">Manage all registered hotels and their statuses.</p>
                </div>
                <Link href="/super-admin/hotels/add" className="bg-indigo-600 text-white px-6 py-3 rounded-2xl font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100">
                    Add New Hotel
                </Link>
            </div>

            <div className="bg-white rounded-[32px] border border-gray-100 shadow-xl overflow-hidden">
                <div className="p-6 border-b border-gray-50 flex flex-col md:flex-row gap-4 justify-between items-center">
                    <div className="relative w-full md:w-96">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search hotels by name or slug..."
                            className="w-full pl-12 pr-4 py-3 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-indigo-500 transition-all"
                        />
                    </div>
                    <button className="flex items-center gap-2 px-6 py-3 bg-gray-50 rounded-2xl font-bold text-gray-600 hover:bg-gray-100 transition-all">
                        <Filter className="w-5 h-5" />
                        Filters
                    </button>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-gray-50/50">
                                <th className="px-6 py-4 text-sm font-bold text-gray-500 uppercase tracking-wider">Hotel Name</th>
                                <th className="px-6 py-4 text-sm font-bold text-gray-500 uppercase tracking-wider">Slug</th>
                                <th className="px-6 py-4 text-sm font-bold text-gray-500 uppercase tracking-wider">Manager</th>
                                <th className="px-6 py-4 text-sm font-bold text-gray-500 uppercase tracking-wider">Status</th>
                                <th className="px-6 py-4 text-sm font-bold text-gray-500 uppercase tracking-wider">Joined</th>
                                <th className="px-6 py-4 text-sm font-bold text-gray-500 uppercase tracking-wider text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {hotels.map((hotel) => (
                                <tr key={hotel.id} className="hover:bg-gray-50 transition-colors group">
                                    <td className="px-6 py-6 font-bold text-gray-900">{hotel.name}</td>
                                    <td className="px-6 py-6 text-gray-500 font-medium">{hotel.slug}</td>
                                    <td className="px-6 py-6 text-gray-500">{hotel.managerName}</td>
                                    <td className="px-6 py-6">
                                        <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase ${hotel.status === 'ACTIVE' ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'
                                            }`}>
                                            {hotel.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-6 text-gray-500">{hotel.createdAt}</td>
                                    <td className="px-6 py-6 text-right">
                                        <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button className="p-2 hover:bg-white rounded-xl shadow-sm border border-transparent hover:border-gray-100 text-gray-400 hover:text-indigo-600 transition-all">
                                                <Eye className="w-4 h-4" />
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
    );
}
