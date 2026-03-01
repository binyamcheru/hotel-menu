'use client';

import { useEffect, useState } from 'react';
import { Hotel, HotelService } from '@/features/hotels/services/hotel-api';
import { HotelCard } from '@/features/hotels/components/hotel-card';

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
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
            </div>
        );
    }

    return (
        <div className="space-y-8">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900">Manage Hotels</h2>
                    <p className="text-gray-500 text-sm">Create, edit, and manage all hotel tenants.</p>
                </div>
                <button className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 transition-colors">
                    Add New Hotel
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {hotels.map((hotel) => (
                    <HotelCard key={hotel.id} hotel={hotel} />
                ))}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-lg border border-gray-100 shadow-sm transition hover:shadow-md">
                    <h3 className="text-gray-500 text-sm font-medium">Total Hotels</h3>
                    <p className="text-3xl font-bold text-indigo-600 mt-2">{hotels.length}</p>
                </div>
                <div className="bg-white p-6 rounded-lg border border-gray-100 shadow-sm transition hover:shadow-md">
                    <h3 className="text-gray-500 text-sm font-medium">Active Menus</h3>
                    <p className="text-3xl font-bold text-green-600 mt-2">45</p>
                </div>
                <div className="bg-white p-6 rounded-lg border border-gray-100 shadow-sm transition hover:shadow-md">
                    <h3 className="text-gray-500 text-sm font-medium">Monthly scans</h3>
                    <p className="text-3xl font-bold text-blue-600 mt-2">1,240</p>
                </div>
            </div>
        </div>
    );
}
