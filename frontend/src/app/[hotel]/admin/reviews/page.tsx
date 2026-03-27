'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { getFeedbackByHotel, getRatingsByHotel, deleteRating, getMenuItemsByHotel, getHotelById } from '@/lib/managerApi';
import { fetchSafe } from '@/lib/api';
import { Feedback, Rating, MenuItem } from '@/types';
import { Star, MessageSquare, Calendar, User, Trash2, Loader2, Filter, ChevronDown, Award, RefreshCw, AlertCircle } from 'lucide-react';
import { ProtectedRoute } from '@/features/auth/components/protected-route';
import { ErrorState } from '@/components/ErrorState';

export default function FeedbackPage() {
    const { hotel } = useParams() as { hotel: string };
    const [feedback, setFeedback] = useState<Feedback[]>([]);
    const [ratings, setRatings] = useState<Rating[]>([]);
    const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
    const [hotelData, setHotelData] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<{ message: string; status: number } | null>(null);
    const [activeTab, setActiveTab] = useState<'ratings' | 'feedback'>('ratings');
    const [retryCount, setRetryCount] = useState(0);

    useEffect(() => {
        const fetchData = async () => {
            setError(null);
            setLoading(true);

            try {
                const [feedbackRes, ratingsRes, menuItemsRes, hotelRes] = await Promise.all([
                    fetchSafe<Feedback[]>(() => getFeedbackByHotel(hotel)),
                    fetchSafe<Rating[]>(() => getRatingsByHotel(hotel)),
                    fetchSafe<MenuItem[]>(() => getMenuItemsByHotel(hotel)),
                    fetchSafe(() => getHotelById(hotel))
                ]);

                if (hotelRes.error && hotelRes.status === 403) {
                    setError({ message: "You don't have access to this hotel's reviews.", status: 403 });
                    return;
                }

                setFeedback(feedbackRes.data || []);
                setRatings(ratingsRes.data || []);
                setMenuItems(menuItemsRes.data || []);
                setHotelData(hotelRes.data);

                if ((feedbackRes.error && !feedbackRes.data && feedbackRes.status !== 403) ||
                    (ratingsRes.error && !ratingsRes.data && ratingsRes.status !== 403)) {
                    setError({
                        message: feedbackRes.error || ratingsRes.error || "Failed to load guest reviews.",
                        status: feedbackRes.status || ratingsRes.status || 500
                    });
                }
            } catch (err) {
                console.error('Failed to fetch feedback/ratings:', err);
                setError({ message: "An unexpected error occurred while loading reviews.", status: 500 });
            } finally {
                setLoading(false);
            }
        };
        if (hotel) fetchData();
    }, [hotel, retryCount]);

    const handleRetry = () => setRetryCount(prev => prev + 1);

    const handleDeleteRating = async (id: string) => {
        if (window.confirm('Delete this rating? This cannot be undone.')) {
            try {
                await deleteRating(id);
                setRatings(ratings.filter(r => r.rating_id !== id));
            } catch (error) {
                console.error('Failed to delete rating:', error);
            }
        }
    };

    const getMenuItemName = (id: string) => menuItems.find(m => m.menu_item_id === id)?.name_en || 'Unknown Item';

    const avgRating = ratings.length > 0
        ? (ratings.reduce((acc: number, r: Rating) => acc + r.rating, 0) / ratings.length).toFixed(1)
        : '0.0';

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
                        <p className="text-gray-500 font-medium">Analyze ratings and general feedback from your guests.</p>
                    </div>
                    <div className="flex gap-4">
                        <div className="bg-white px-8 py-4 rounded-[28px] border border-gray-100 shadow-sm flex items-center gap-4 group">
                            <div className="w-12 h-12 bg-amber-50 text-amber-500 rounded-[20px] flex items-center justify-center transition-transform group-hover:scale-110">
                                <Award className="w-6 h-6 fill-amber-500" />
                            </div>
                            <div>
                                <span className="text-2xl font-black text-gray-900">{avgRating}</span>
                                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest leading-none">Avg Score</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex p-2 bg-gray-50 rounded-[32px] w-fit">
                    <button
                        onClick={() => setActiveTab('ratings')}
                        className={`px-8 py-3 rounded-[24px] font-black tracking-tight text-sm transition-all ${activeTab === 'ratings' ? 'bg-white text-indigo-600 shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}
                    >
                        Menu Ratings ({ratings.length})
                    </button>
                    <button
                        onClick={() => setActiveTab('feedback')}
                        className={`px-8 py-3 rounded-[24px] font-black tracking-tight text-sm transition-all ${activeTab === 'feedback' ? 'bg-white text-indigo-600 shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}
                    >
                        General Feedback ({feedback.length})
                    </button>
                </div>

                <div className="bg-white rounded-[48px] border border-gray-100 shadow-xl overflow-hidden p-10 min-h-[400px] flex flex-col">
                    <div className="space-y-12 flex-1">
                        {error ? (
                            <div className="h-full flex items-center justify-center">
                                <ErrorState error={error.message} status={error.status} onRetry={handleRetry} />
                            </div>
                        ) : activeTab === 'ratings' ? (
                            ratings.length > 0 ? (
                                <div className="grid grid-cols-1 gap-12">
                                    {ratings.map((rating) => (
                                        <div key={rating.rating_id} className="relative pl-10 space-y-4 group">
                                            <div className="absolute left-0 top-0 bottom-0 w-1 bg-indigo-50 rounded-full group-hover:bg-indigo-500 transition-colors"></div>
                                            <div className="flex justify-between items-start">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-12 h-12 bg-gray-50 rounded-2xl flex items-center justify-center text-gray-300">
                                                        <User className="w-6 h-6" />
                                                    </div>
                                                    <div>
                                                        <p className="font-black text-gray-900 text-lg leading-none mb-1">Guest Review</p>
                                                        <p className="text-xs text-gray-400 font-bold uppercase">
                                                            Rated <span className="text-indigo-600 underline">{getMenuItemName(rating.menu_item_id)}</span>
                                                        </p>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-4">
                                                    <div className="flex items-center gap-1 bg-amber-50 px-4 py-2 rounded-2xl border border-amber-100">
                                                        {[...Array(5)].map((_, i) => (
                                                            <Star key={i} className={`w-3.5 h-3.5 ${i < rating.rating ? 'text-amber-500 fill-amber-500' : 'text-gray-200'}`} />
                                                        ))}
                                                        <span className="ml-2 font-black text-amber-700 text-xs">{rating.rating}.0</span>
                                                    </div>
                                                    <button onClick={() => handleDeleteRating(rating.rating_id)} className="p-2 text-gray-300 hover:text-red-500 transition-colors">
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </div>
                                            <p className="text-gray-600 text-lg leading-relaxed font-bold italic">
                                                &quot;{rating.comment || 'No comment provided'}&quot;
                                            </p>
                                            <div className="flex items-center gap-4 text-[10px] font-black uppercase text-gray-400 tracking-widest pt-2">
                                                <Calendar className="w-3.5 h-3.5" />
                                                {new Date(rating.created_at).toLocaleDateString()}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="flex flex-col items-center justify-center py-20 text-center">
                                    <Star className="w-16 h-16 text-gray-100 mb-4" />
                                    <h3 className="text-2xl font-black text-gray-400">No Ratings Yet</h3>
                                    <p className="text-gray-300 font-medium mt-2 max-w-xs">User ratings for specific dishes will appear here.</p>
                                </div>
                            )
                        ) : (
                            feedback.length > 0 ? (
                                <div className="grid grid-cols-1 gap-12">
                                    {feedback.map((f) => (
                                        <div key={f.feedback_id} className="relative pl-10 space-y-4 group">
                                            <div className="absolute left-0 top-0 bottom-0 w-1 bg-purple-50 rounded-full group-hover:bg-purple-500 transition-colors"></div>
                                            <div className="flex justify-between items-start">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-12 h-12 bg-purple-50 rounded-2xl flex items-center justify-center text-purple-300">
                                                        <MessageSquare className="w-6 h-6" />
                                                    </div>
                                                    <div>
                                                        <p className="font-black text-gray-900 text-lg leading-none mb-1">General Message</p>
                                                        <p className="text-xs text-gray-400 font-bold uppercase">Public Feedback</p>
                                                    </div>
                                                </div>
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
                                    <h3 className="text-2xl font-black text-gray-400">No General Feedback</h3>
                                    <p className="text-gray-300 font-medium mt-2 max-w-xs">Common messages or suggestions will be shown here.</p>
                                </div>
                            )
                        )}
                    </div>

                    <button className="w-full mt-16 py-5 bg-gray-50 rounded-[28px] font-black text-gray-400 hover:bg-gray-100 hover:text-indigo-600 transition-all active:scale-95 flex items-center justify-center gap-2 group">
                        Load Older Insights
                        <ChevronDown className="w-5 h-5 group-hover:translate-y-1 transition-transform" />
                    </button>
                </div>
            </div>
        </ProtectedRoute>
    );
}
