'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { getFeedbackByMenuItem, deleteFeedback, getMenuItemsByHotel, getHotelById } from '@/lib/managerApi';
import { fetchSafe } from '@/lib/api';
import { Feedback, MenuItem } from '@/types';
import { MessageSquare, Calendar, Trash2, Loader2, ChevronDown, Utensils, AlertTriangle } from 'lucide-react';
import { ProtectedRoute } from '@/features/auth/components/protected-route';
import { ErrorState } from '@/components/ErrorState';

export default function FeedbackPage() {
    const { hotel } = useParams() as { hotel: string };
    const [feedback, setFeedback] = useState<Feedback[]>([]);
    const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
    const [selectedMenuItemId, setSelectedMenuItemId] = useState<string>('');
    const [feedbackToDelete, setFeedbackToDelete] = useState<Feedback | null>(null);
    const [hotelData, setHotelData] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [fetchingFeedback, setFetchingFeedback] = useState(false);
    const [error, setError] = useState<{ message: string; status: number } | null>(null);
    const [retryCount, setRetryCount] = useState(0);

    // Initial fetch for hotel and menu items
    useEffect(() => {
        const fetchData = async () => {
            setError(null);
            setLoading(true);

            try {
                const [menuItemsRes, hotelRes] = await Promise.all([
                    fetchSafe<MenuItem[]>(() => getMenuItemsByHotel(hotel)),
                    fetchSafe(() => getHotelById(hotel))
                ]);

                if (hotelRes.error && hotelRes.status === 403) {
                    setError({ message: "You don't have access to this hotel's reviews.", status: 403 });
                    return;
                }

                const items = menuItemsRes.data || [];
                setMenuItems(items);
                setHotelData(hotelRes.data);

                // Set default selected item if menu items exist
                if (items.length > 0 && !selectedMenuItemId) {
                    setSelectedMenuItemId(items[0].menu_item_id);
                }

                if (menuItemsRes.error && !menuItemsRes.data && menuItemsRes.status !== 403) {
                    setError({
                        message: menuItemsRes.error || "Failed to load menu items.",
                        status: menuItemsRes.status || 500
                    });
                }
            } catch (err) {
                console.error('Failed to fetch initial data:', err);
                setError({ message: "An unexpected error occurred while loading reviews.", status: 500 });
            } finally {
                setLoading(false);
            }
        };
        if (hotel) fetchData();
    }, [hotel, retryCount, selectedMenuItemId]);

    // Fetch feedbacks when selected item changes
    useEffect(() => {
        const fetchFeedback = async () => {
            if (!selectedMenuItemId) return;

            setFetchingFeedback(true);
            try {
                const res = await fetchSafe<Feedback[]>(() => getFeedbackByMenuItem(selectedMenuItemId));
                setFeedback(res.data || []);
            } catch (err) {
                console.error('Failed to fetch feedbacks:', err);
            } finally {
                setFetchingFeedback(false);
            }
        };

        fetchFeedback();
    }, [selectedMenuItemId]);

    const handleRetry = () => setRetryCount(prev => prev + 1);

    const handleDeleteFeedback = async () => {
        if (!feedbackToDelete) return;
        try {
            await deleteFeedback(feedbackToDelete.feedback_id);
            setFeedback(prev => prev.filter(f => f.feedback_id !== feedbackToDelete.feedback_id));
            setFeedbackToDelete(null);
        } catch (error) {
            console.error('Failed to delete feedback:', error);
        }
    };

    const getSelectedMenuItem = () => menuItems.find(m => m.menu_item_id === selectedMenuItemId);

    if (loading) {
        return (
            <div className="flex justify-center items-center h-[60vh]">
                <Loader2 className="w-10 h-10 animate-spin text-indigo-600" />
            </div>
        );
    }

    return (
        <ProtectedRoute allowedRoles={['admin']} requireHotelMatch={true}>
            <div className="space-y-10 max-w-6xl mx-auto p-8">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                    <div>
                        <h1 className="text-4xl font-black text-gray-900 tracking-tight">
                            {hotelData?.name || 'Menu'} <span className="text-indigo-600 opacity-20">/</span> Reviews
                        </h1>
                        <p className="text-gray-500 font-medium">Manage feedbacks for specific items in your menu.</p>
                    </div>
                </div>

                {/* Dish Selector */}
                <div className="bg-white p-6 rounded-[32px] border border-gray-100 shadow-sm flex flex-col md:flex-row items-center gap-6">
                    <div className="flex items-center gap-4 flex-1 w-full text-indigo-600">
                        <Utensils className="w-6 h-6 " />
                        <div className="relative flex-1">
                            <select
                                value={selectedMenuItemId}
                                onChange={(e) => setSelectedMenuItemId(e.target.value)}
                                className="w-full pl-4 pr-10 py-3 bg-gray-50 border-none rounded-2xl font-black text-gray-900 appearance-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
                            >
                                <option value="" disabled>Select a dish...</option>
                                {menuItems.map((item) => (
                                    <option key={item.menu_item_id} value={item.menu_item_id}>
                                        {item.name_en}
                                    </option>
                                ))}
                            </select>
                            <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                        </div>
                    </div>

                    <div className="flex items-center gap-3 px-6 py-3 bg-indigo-50 rounded-2xl border border-indigo-100 shrink-0">
                        <span className="text-sm font-black text-indigo-600 uppercase tracking-wider">
                            {feedback.length} Feedbacks
                        </span>
                    </div>
                </div>

                <div className="bg-white rounded-[48px] border border-gray-100 shadow-xl overflow-hidden p-10 min-h-[400px] flex flex-col">
                    <div className="space-y-12 flex-1 relative">
                        {fetchingFeedback && (
                            <div className="absolute inset-0 bg-white/50 backdrop-blur-[2px] flex items-center justify-center z-10 rounded-[48px]">
                                <Loader2 className="w-10 h-10 animate-spin text-indigo-600" />
                            </div>
                        )}

                        {error ? (
                            <div className="h-full flex items-center justify-center">
                                <ErrorState error={error.message} status={error.status} onRetry={handleRetry} />
                            </div>
                        ) : feedback.length > 0 ? (
                            <div className="grid grid-cols-1 gap-12">
                                {feedback.map((f) => (
                                    <div key={f.feedback_id} className="relative pl-10 space-y-4 group">
                                        <div className="absolute left-0 top-0 bottom-0 w-1 bg-indigo-50 rounded-full group-hover:bg-indigo-500 transition-colors"></div>
                                        <div className="flex justify-between items-start">
                                            <div className="flex items-center gap-4">
                                                <div className="w-12 h-12 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-500">
                                                    <MessageSquare className="w-6 h-6" />
                                                </div>
                                                <div>
                                                    <p className="font-black text-gray-900 text-lg leading-none mb-1">Dish Feedback</p>
                                                    <p className="text-xs text-gray-400 font-bold uppercase">
                                                        Item: <span className="text-indigo-600">{getSelectedMenuItem()?.name_en}</span>
                                                    </p>
                                                </div>
                                            </div>
                                            <button
                                                onClick={() => setFeedbackToDelete(f)}
                                                className="p-3 bg-red-50 text-red-400 hover:text-red-600 hover:bg-red-100 rounded-xl transition-all active:scale-90"
                                            >
                                                <Trash2 className="w-5 h-5" />
                                            </button>
                                        </div>
                                        <p className="text-gray-600 text-lg leading-relaxed font-bold italic">
                                            &quot;{f.message}&quot;
                                        </p>
                                        <div className="flex items-center gap-4 text-[10px] font-black uppercase text-gray-400 tracking-widest pt-2">
                                            <Calendar className="w-3.5 h-3.5" />
                                            {new Date(f.created_at).toLocaleDateString()}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center py-20 text-center">
                                <MessageSquare className="w-16 h-16 text-gray-100 mb-4" />
                                <h3 className="text-2xl font-black text-gray-400">No Feedback Yet</h3>
                                <p className="text-gray-300 font-medium mt-2 max-w-xs">
                                    {selectedMenuItemId
                                        ? `Reviews for this specific dish will appear here once guests provide them.`
                                        : "Select a dish to view its feedbacks."}
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Delete Confirmation Modal */}
            {feedbackToDelete && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-gray-900/40 backdrop-blur-md animate-in fade-in duration-300">
                    <div className="bg-white w-full max-w-md rounded-[48px] shadow-2xl overflow-hidden p-10 text-center space-y-8 animate-in zoom-in-95 duration-300">
                        <div className="w-24 h-24 bg-red-50 rounded-[32px] flex items-center justify-center text-red-600 mx-auto shadow-sm">
                            <AlertTriangle className="w-12 h-12" />
                        </div>
                        <div className="space-y-3">
                            <h3 className="text-3xl font-black text-gray-900 tracking-tight">Clear Feedback?</h3>
                            <p className="text-gray-500 font-medium px-4">
                                You are about to permanently remove this guest feedback. This action cannot be reversed.
                            </p>
                        </div>
                        <div className="flex flex-col gap-3 pt-4">
                            <button
                                onClick={handleDeleteFeedback}
                                className="w-full py-5 bg-red-600 text-white rounded-[28px] font-black tracking-tight hover:bg-red-700 transition-all shadow-xl shadow-red-100 active:scale-95"
                            >
                                Yes, Delete It
                            </button>
                            <button
                                onClick={() => setFeedbackToDelete(null)}
                                className="w-full py-5 bg-white text-gray-500 border-2 border-gray-100 rounded-[28px] font-black tracking-tight hover:bg-gray-50 transition-all active:scale-95"
                            >
                                Keep Feedback
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </ProtectedRoute>
    );
}
