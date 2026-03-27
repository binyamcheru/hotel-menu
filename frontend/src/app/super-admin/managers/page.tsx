'use client';

import { useEffect, useState } from 'react';
import { HotelService, Manager } from '@/features/hotels/services/hotel.service';
import { Search, UserPlus, Shield, Mail, Hotel as HotelIcon, MoreHorizontal } from 'lucide-react';

export default function ManagersPage() {
    const [managers, setManagers] = useState<Manager[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchManagers = async () => {
            const data = await HotelService.getManagers();
            setManagers(data);
            setLoading(false);
        };
        fetchManagers();
    }, []);

    return (
        <div className="space-y-8 max-w-7xl mx-auto">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-black text-gray-900 tracking-tight">Hotel Managers</h1>
                    <p className="text-gray-500">Manage administrative accounts for all hotel properties.</p>
                </div>
                <button className="flex items-center gap-2 bg-indigo-600 text-white px-6 py-3 rounded-2xl font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100">
                    <UserPlus className="w-5 h-5" />
                    Create Manager
                </button>
            </div>

            <div className="bg-white rounded-[32px] border border-gray-100 shadow-xl overflow-hidden">
                <div className="p-6 border-b border-gray-50">
                    <div className="relative w-full md:w-96">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search managers by name or email..."
                            className="w-full pl-12 pr-4 py-3 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-indigo-500 transition-all"
                        />
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-gray-50/50">
                                <th className="px-6 py-4 text-sm font-bold text-gray-500 uppercase tracking-wider">Manager</th>
                                <th className="px-6 py-4 text-sm font-bold text-gray-500 uppercase tracking-wider">Role</th>
                                <th className="px-6 py-4 text-sm font-bold text-gray-500 uppercase tracking-wider">Hotel Attribution</th>
                                <th className="px-6 py-4 text-sm font-bold text-gray-500 uppercase tracking-wider text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {managers.map((manager) => (
                                <tr key={manager.id} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-6 py-6">
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-600 font-black">
                                                {manager.name.charAt(0)}
                                            </div>
                                            <div>
                                                <p className="font-bold text-gray-900">{manager.name}</p>
                                                <p className="text-sm text-gray-400 font-medium">{manager.email}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-6">
                                        <span className="inline-flex items-center gap-2 px-3 py-1 bg-purple-50 text-purple-600 border border-purple-100 rounded-full text-[10px] font-black uppercase tracking-wider">
                                            <Shield className="w-3 h-3" />
                                            {manager.role.replace('_', ' ')}
                                        </span>
                                    </td>
                                    <td className="px-6 py-6">
                                        <div className="flex items-center gap-2 text-gray-500 font-medium">
                                            <HotelIcon className="w-4 h-4 text-gray-300" />
                                            {manager.hotelName}
                                        </div>
                                    </td>
                                    <td className="px-6 py-6 text-right">
                                        <button className="p-2 hover:bg-white rounded-xl shadow-sm border border-transparent hover:border-gray-100 text-gray-400 hover:text-indigo-600 transition-all">
                                            <MoreHorizontal className="w-5 h-5" />
                                        </button>
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
