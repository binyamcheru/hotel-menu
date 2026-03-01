'use client';

import { ProtectedRoute } from '@/features/auth/components/protected-route';
import { useParams } from 'next/navigation';

export default function HotelAdminPage() {
    const params = useParams();
    const hotel = params?.hotel as string;

    return (
        <ProtectedRoute allowedRoles={['HOTEL_ADMIN']} requireHotelMatch={true}>
            <div className="p-8 space-y-6">
                <div className="flex justify-between items-center">
                    <h1 className="text-2xl font-bold text-gray-900 capitalize">
                        {hotel.replace('-', ' ')} Admin
                    </h1>
                    <button className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700">
                        Add New Item
                    </button>
                </div>

                <div className="grid grid-cols-1 gap-6">
                    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                        <h2 className="text-lg font-semibold mb-4">Menu Overview</h2>
                        <div className="space-y-4">
                            <div className="flex justify-between items-center p-3 bg-gray-50 rounded-md">
                                <span>Total Categories</span>
                                <span className="font-bold">5</span>
                            </div>
                            <div className="flex justify-between items-center p-3 bg-gray-50 rounded-md">
                                <span>Total Items</span>
                                <span className="font-bold">24</span>
                            </div>
                            <div className="flex justify-between items-center p-3 bg-gray-50 rounded-md">
                                <span>Active Items</span>
                                <span className="font-bold">18</span>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                        <h2 className="text-lg font-semibold mb-4">QR Code</h2>
                        <div className="flex flex-col items-center gap-4 p-8 border-2 border-dashed border-gray-300 rounded-lg">
                            <div className="w-32 h-32 bg-gray-200 flex items-center justify-center text-gray-400">
                                QR Placeholder
                            </div>
                            <button className="text-indigo-600 font-medium">Download QR Code</button>
                        </div>
                    </div>
                </div>
            </div>
        </ProtectedRoute>
    );
}
