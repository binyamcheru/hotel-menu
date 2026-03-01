'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { ReviewService, Review } from '@/features/reviews/services/review.service';
import { Star, MessageSquare, Calendar, User, Filter, MoreHorizontal } from 'lucide-react';
import { ProtectedRoute } from '@/features/auth/components/protected-route';

export default function ReviewsPage() {
    const { hotel } = useParams() as { hotel: string };
    const [reviews, setReviews] = useState<Review[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchReviews = async () => {
            const data = await ReviewService.getReviewsByHotel(hotel);
            setReviews(data);
            setLoading(false);
        };
        fetchReviews();
    }, [hotel]);

    return (
        <ProtectedRoute allowedRoles={['HOTEL_ADMIN']} requireHotelMatch={true}>
            <div className="space-y-10 max-w-6xl mx-auto p-8">
                <div className="flex justify-between items-center text-center sm:text-left">
                    <div>
                        <h1 className="text-3xl font-black text-gray-900 tracking-tight">Customer Reviews</h1>
                        <p className="text-gray-500">Listen to your guests and improve your menu.</p>
                    </div>
                    <div className="hidden sm:flex gap-4">
                        <div className="bg-white px-6 py-3 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-3">
                            <Star className="w-5 h-5 text-amber-400 fill-amber-400" />
                            <span className="text-xl font-black text-gray-900">4.7</span>
                            <span className="text-xs text-gray-400 font-bold uppercase">Avg Rating</span>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-[42px] border border-gray-100 shadow-xl overflow-hidden p-10">
                    <div className="flex justify-between items-center mb-10 pb-6 border-b border-gray-50">
                        <h2 className="text-xl font-black text-gray-900">Recent Feedback</h2>
                        <button className="flex items-center gap-2 text-indigo-600 font-bold text-sm hover:bg-indigo-50 px-4 py-2 rounded-xl transition-all">
                            <Filter className="w-4 h-4" />
                            Latest First
                        </button>
                    </div>

                    <div className="grid grid-cols-1 gap-12">
                        {reviews.map((review) => (
                            <div key={review.id} className="relative pl-2 sm:pl-10 space-y-4 group">
                                <div className="absolute left-0 top-0 bottom-0 w-1 bg-indigo-50 rounded-full group-hover:bg-indigo-500 transition-colors"></div>

                                <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 bg-gray-50 rounded-2xl flex items-center justify-center text-gray-400">
                                            <User className="w-6 h-6" />
                                        </div>
                                        <div>
                                            <p className="font-black text-gray-900 text-lg leading-none mb-1">{review.customerName}</p>
                                            <p className="text-xs text-gray-400 font-bold uppercase flex items-center gap-1">
                                                <MessageSquare className="w-3 h-3" />
                                                Commented on <span className="text-indigo-600 underline">{review.foodName}</span>
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-1 bg-amber-50 px-4 py-2 rounded-2xl border border-amber-100">
                                        {[...Array(5)].map((_, i) => (
                                            <Star key={i} className={`w-3.5 h-3.5 ${i < review.rating ? 'text-amber-500 fill-amber-500' : 'text-gray-200'}`} />
                                        ))}
                                        <span className="ml-2 font-black text-amber-700 text-xs">{review.rating}.0</span>
                                    </div>
                                </div>

                                <p className="text-gray-600 text-lg leading-relaxed font-medium italic">
                                    &quot;{review.comment}&quot;
                                </p>

                                <div className="flex items-center gap-6 pt-2">
                                    <div className="flex items-center gap-2 text-[10px] font-black uppercase text-gray-400 tracking-widest">
                                        <Calendar className="w-3.5 h-3.5" />
                                        {review.date}
                                    </div>
                                    <button className="text-[10px] font-black uppercase text-indigo-600 hover:underline tracking-widest">
                                        Reply to guest
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>

                    <button className="w-full mt-16 py-5 bg-gray-50 rounded-[28px] font-black text-gray-400 hover:bg-gray-100 hover:text-indigo-600 transition-all active:scale-95">
                        Load More Reviews
                    </button>
                </div>
            </div>
        </ProtectedRoute>
    );
}
