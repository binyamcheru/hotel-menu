import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { Scan, Download, Palette, Type, Share2, RefreshCw, Loader2 } from 'lucide-react';
import { ProtectedRoute } from '@/features/auth/components/protected-route';
import { getHotelById } from '@/lib/managerApi';
import { fetchSafe } from '@/lib/api';

export default function QRCodePage() {
    const { hotel } = useParams() as { hotel: string };
    const [hotelData, setHotelData] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    const menuUrl = typeof window !== 'undefined' ? `${window.location.origin}/${hotel}/menu` : `/${hotel}/menu`;

    useEffect(() => {
        const fetchHotel = async () => {
            try {
                const res = await fetchSafe(() => getHotelById(hotel));
                setHotelData(res.data);
            } catch (err) {
                console.error('Failed to fetch hotel:', err);
            } finally {
                setLoading(false);
            }
        };
        if (hotel) fetchHotel();
    }, [hotel]);

    if (loading) {
        return (
            <div className="flex justify-center items-center h-[60vh]">
                <Loader2 className="w-10 h-10 animate-spin text-indigo-600" />
            </div>
        );
    }

    return (
        <ProtectedRoute allowedRoles={['admin']} requireHotelMatch={true}>
            <div className="max-w-6xl mx-auto p-8 space-y-10">
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-3xl font-black text-gray-900 tracking-tight">
                            {hotelData?.name || 'Menu'} <span className="text-indigo-600 opacity-20">/</span> QR Code
                        </h1>
                        <p className="text-gray-500">Customize and download your digital menu QR code.</p>
                    </div>
                    <button className="flex items-center gap-2 bg-indigo-600 text-white px-6 py-3 rounded-2xl font-bold hover:bg-indigo-700 transition-all shadow-lg active:scale-95">
                        <Download className="w-5 h-5" />
                        Download SVG
                    </button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                    {/* Preview Side */}
                    <div className="lg:col-span-1 space-y-6">
                        <div className="bg-white p-10 rounded-[48px] border border-gray-100 shadow-2xl flex flex-col items-center gap-8 relative overflow-hidden group">
                            <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-indigo-600 to-purple-600"></div>
                            <div className="text-center">
                                <h3 className="text-2xl font-black text-gray-900 capitalize leading-none mb-2">{hotelData?.name || hotel.replace('-', ' ')}</h3>
                                <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">Digital Menu</p>
                            </div>

                            {/* Mock QR Code */}
                            <div className="w-64 h-64 bg-gray-50 rounded-[32px] border-4 border-gray-900 p-8 flex items-center justify-center relative group-hover:rotate-1 transition-transform">
                                <div className="grid grid-cols-4 gap-2 w-full h-full opacity-80">
                                    {[...Array(16)].map((_, i) => (
                                        <div key={i} className={`rounded-sm ${Math.random() > 0.5 ? 'bg-gray-900' : 'bg-transparent'}`}></div>
                                    ))}
                                </div>
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <div className="w-12 h-12 bg-white rounded-xl shadow-lg flex items-center justify-center font-black italic text-indigo-600 text-xl border border-gray-50">A</div>
                                </div>
                            </div>

                            <div className="text-center space-y-2">
                                <p className="text-gray-900 font-black text-sm">Scan to view menu</p>
                                <p className="text-xs text-indigo-500 font-bold underline truncate w-48 mx-auto">{menuUrl}</p>
                            </div>
                        </div>

                        <div className="bg-indigo-50 p-6 rounded-[32px] border border-indigo-100 flex items-center gap-4">
                            <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-indigo-600 shadow-sm">
                                <Share2 className="w-6 h-6" />
                            </div>
                            <div>
                                <p className="text-indigo-900 font-black text-sm">Direct Link</p>
                                <button className="text-xs text-indigo-400 font-bold hover:text-indigo-600 underline">Copy URL</button>
                            </div>
                        </div>
                    </div>

                    {/* Customization Side */}
                    <div className="lg:col-span-2 space-y-8">
                        <div className="bg-white p-8 rounded-[38px] border border-gray-100 shadow-sm space-y-8">
                            <h3 className="text-xl font-black text-gray-900 tracking-tight">Design Settings</h3>

                            <div className="space-y-6">
                                {/* Colors */}
                                <div className="space-y-3">
                                    <label className="text-xs font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                                        <Palette className="w-4 h-4" />
                                        Color Palette
                                    </label>
                                    <div className="flex gap-4">
                                        {['#4F46E5', '#111827', '#E11D48', '#059669'].map((color) => (
                                            <button key={color} className="w-12 h-12 rounded-2xl border-4 border-white shadow-md ring-1 ring-gray-100" style={{ backgroundColor: color }}></button>
                                        ))}
                                        <button className="w-12 h-12 rounded-2xl bg-gray-50 border-2 border-dashed border-gray-200 flex items-center justify-center text-gray-400">
                                            <Plus className="w-5 h-5" />
                                        </button>
                                    </div>
                                </div>

                                {/* Shapes */}
                                <div className="space-y-3">
                                    <label className="text-xs font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                                        <Scan className="w-4 h-4" />
                                        QR Pattern
                                    </label>
                                    <div className="grid grid-cols-3 gap-4">
                                        {['Rounded', 'Square', 'Dots'].map((shape) => (
                                            <button key={shape} className={`px-6 py-4 rounded-2xl font-bold border-2 transition-all ${shape === 'Rounded' ? 'bg-indigo-50 border-indigo-500 text-indigo-600' : 'bg-white border-gray-50 text-gray-400'}`}>
                                                {shape}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Logo Toggle */}
                                <div className="pt-6 border-t border-gray-50 flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-600">
                                            <Type className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <p className="font-bold text-gray-900 text-sm">Show Hotel Logo</p>
                                            <p className="text-[10px] text-gray-400 font-bold uppercase">Center branding</p>
                                        </div>
                                    </div>
                                    <div className="w-14 h-8 bg-indigo-600 rounded-full p-1 cursor-pointer flex justify-end transition-all">
                                        <div className="w-6 h-6 bg-white rounded-full shadow-md"></div>
                                    </div>
                                </div>
                            </div>

                            <div className="flex justify-end gap-4 pt-6">
                                <button className="flex items-center gap-2 px-6 py-3 bg-gray-50 rounded-2xl font-bold text-gray-500 hover:bg-gray-100 transition-all">
                                    <RefreshCw className="w-4 h-4" />
                                    Reset UI
                                </button>
                                <button className="px-10 py-3 bg-gray-900 text-white rounded-2xl font-bold hover:bg-gray-800 transition-all shadow-xl active:scale-95">
                                    Save Colors
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </ProtectedRoute>
    );
}
