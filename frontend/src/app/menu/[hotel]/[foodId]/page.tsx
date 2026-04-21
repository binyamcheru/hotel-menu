'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { FoodItem, FoodService } from '@/features/menu/services/food.service';
import { ReviewService } from '@/features/reviews/services/review.service';
import { X, Star, Utensils, Send, MessageSquare, CheckCircle, ArrowLeft, Play, Film } from 'lucide-react';
import { useToast } from '@/components/ui/toast';

import { Hotel, HotelService } from '@/features/hotels/services/hotel.service';

export default function DishDetailPage() {
    const params = useParams();
    const router = useRouter();
    const { showToast } = useToast();
    const hotelId = params?.hotel as string;
    const foodId = params?.foodId as string;

    const [item, setItem] = useState<FoodItem | null>(null);
    const [loading, setLoading] = useState(true);
    const [rating, setRating] = useState(0);
    const [feedback, setFeedback] = useState('');
    const [isSubmittingRating, setIsSubmittingRating] = useState(false);
    const [isSubmittingFeedback, setIsSubmittingFeedback] = useState(false);
    const [showSuccess, setShowSuccess] = useState<'rating' | 'feedback' | null>(null);
    const [brandColor, setBrandColor] = useState('#111827');

    useEffect(() => {
        const fetchDish = async () => {
            if (foodId) {
                try {
                    const data = await FoodService.getFoodById(foodId);
                    setItem(data);

                    // Fetch hotel to get logo for branding
                    if (hotelId) {
                        const hotelData = await HotelService.getHotelById(hotelId);
                        if (hotelData.logo) {
                            extractBrandColor(hotelData.logo);
                        }
                    }
                } catch (error) {
                    console.error('Failed to fetch dish:', error);
                } finally {
                    setLoading(false);
                }
            }
        };
        fetchDish();
    }, [foodId, hotelId]);

    const extractBrandColor = (url: string) => {
        const img = new Image();
        img.crossOrigin = "Anonymous";
        img.src = url;
        img.onload = () => {
            const canvas = document.createElement('canvas');
            const context = canvas.getContext('2d');
            if (!context) return;
            canvas.width = 1;
            canvas.height = 1;
            context.drawImage(img, 0, 0, 1, 1);
            const [r, g, b] = context.getImageData(0, 0, 1, 1).data;
            const hex = `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
            const brightness = (r * 299 + g * 587 + b * 114) / 1000;
            setBrandColor(brightness > 220 ? '#111827' : hex);
        };
    };

    const handleRating = async (value: number) => {
        if (!item) return;
        setRating(value);
        setIsSubmittingRating(true);
        try {
            await ReviewService.submitRating({
                menu_item_id: item.id,
                hotel_id: item.hotel_id,
                rating: value
            });
            setShowSuccess('rating');
            showToast('Thank you for your rating!');
        } catch (error: any) {
            console.error('Failed to submit rating:', error);
            const msg = error.response?.data?.message || "You have already rated this item";
            showToast(msg, 'error');
            // If they already rated, we should hide the UI too
            if (error.response?.status === 400) setShowSuccess('rating');
        } finally {
            setIsSubmittingRating(false);
        }
    };

    const handleFeedback = async () => {
        if (!item || !feedback.trim()) return;
        setIsSubmittingFeedback(true);
        try {
            await ReviewService.submitFeedback({
                menu_item_id: item.id,
                hotel_id: item.hotel_id,
                message: feedback
            });
            setFeedback('');
            setShowSuccess('feedback');
            showToast('Feedback submitted successfully!');
            setTimeout(() => setShowSuccess(null), 5000);
        } catch (error: any) {
            console.error('Failed to submit feedback:', error);
            const msg = error.response?.data?.message || "You have already submitted feedback for this item";
            showToast(msg, 'error');
        } finally {
            setIsSubmittingFeedback(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-white flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
            </div>
        );
    }

    if (!item) {
        return (
            <div className="min-h-screen bg-white flex flex-col items-center justify-center p-6 text-center">
                <Utensils className="w-16 h-16 text-gray-100 mb-4" />
                <h1 className="text-2xl font-serif font-bold text-gray-900 mb-2">Dish Not Found</h1>
                <p className="text-gray-500 mb-8">This item may have been removed from the menu.</p>
                <button
                    onClick={() => router.push(`/menu/${hotelId}`)}
                    className="flex items-center gap-2 font-bold text-indigo-600"
                >
                    <ArrowLeft className="w-5 h-5" />
                    Back to Menu
                </button>
            </div>
        );
    }

    const name = item.name.en || 'Untitled';
    const description = item.description.en || 'No description available.';

    return (
        <div className="min-h-screen bg-white font-sans max-w-lg mx-auto shadow-2xl overflow-hidden relative border-x border-gray-100 animate-in fade-in duration-500">
            {/* Navigation Header */}
            <div className="sticky top-0 z-10 bg-white/80 backdrop-blur-md border-b border-gray-100 px-6 py-4 flex items-center justify-between">
                <button
                    onClick={() => router.push(`/menu/${hotelId}`)}
                    className="flex items-center gap-2 text-gray-900 font-bold text-sm transition-colors"
                    style={{ color: brandColor }}
                >
                    <ArrowLeft className="w-5 h-5" />
                    Back to Menu
                </button>
                <div className="font-serif italic text-gray-400">Section: {item.category?.name.en || 'General'}</div>
            </div>

            <div className="pb-20">
                {/* Hero Section */}
                <div className="relative h-80 sm:h-96 bg-gray-50 flex-shrink-0">
                    {item.image_url ? (
                        <img src={item.image_url} alt={name} className="w-full h-full object-cover" />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-200">
                            <Utensils className="w-20 h-20" />
                        </div>
                    )}
                    {item.is_special && (
                        <div
                            className="absolute bottom-6 left-6 px-6 py-2 text-white font-serif italic text-sm shadow-2xl z-[1]"
                            style={{ backgroundColor: brandColor }}
                        >
                            Chef's Recommendation
                        </div>
                    )}
                </div>

                {/* Cinematic Video Section */}
                {item.video_url && (
                    <div className="px-6 -mt-10 relative z-[2]">
                        <div className="bg-white p-2 rounded-[32px] shadow-2xl shadow-black/5 border border-gray-100 overflow-hidden group">
                            <div className="relative aspect-video rounded-[24px] overflow-hidden bg-black flex items-center justify-center">
                                <video
                                    src={item.video_url}
                                    controls
                                    className="w-full h-full object-cover"
                                    poster={item.image_url}
                                />
                                <div className="absolute top-4 left-4 bg-black/40 backdrop-blur-md px-3 py-1.5 rounded-full flex items-center gap-2 text-white text-[10px] font-bold uppercase tracking-widest pointer-events-none">
                                    <Film className="w-3 h-3" />
                                    Cinematic View
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Content */}
                <div className="px-6 sm:px-12 py-12 space-y-12">
                    <div className="space-y-6 text-center">
                        <div className="space-y-2">
                            <h2 className="text-4xl sm:text-5xl font-serif font-bold text-gray-900 tracking-tight leading-tight">
                                {name}
                            </h2>
                            <div className="w-12 h-0.5 mx-auto rounded-full" style={{ backgroundColor: `${brandColor}40` }} />
                        </div>

                        <p className="text-2xl font-sans font-bold text-gray-900">
                            ${item.price.toFixed(2)}
                        </p>

                        <p className="text-gray-500 font-medium leading-relaxed text-lg max-w-lg mx-auto italic">
                            {description}
                        </p>
                    </div>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-3 gap-8 py-8 border-y border-gray-100">
                        <div className="text-center group">
                            <Star className="w-6 h-6 text-amber-500 fill-amber-500 mx-auto mb-2 group-hover:scale-110 transition-transform" />
                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Average Rating</p>
                            <p className="text-sm font-bold text-gray-900">{item.average_rating?.toFixed(1) || 'N/A'}</p>
                        </div>
                        <div className="text-center group">
                            <MessageSquare className="w-6 h-6 mx-auto mb-2 group-hover:scale-110 transition-transform" style={{ color: brandColor }} />
                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Guest Reviews</p>
                            <p className="text-sm font-bold text-gray-900">{item.rating_count || 0}</p>
                        </div>
                        <div className="text-center group">
                            <CheckCircle className={`w-6 h-6 ${item.is_available ? 'text-green-500' : 'text-red-400'} mx-auto mb-2 group-hover:scale-110 transition-transform`} />
                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Availability</p>
                            <p className="text-sm font-bold text-gray-900">{item.is_available ? 'Available' : 'Sold Out'}</p>
                        </div>
                    </div>

                    {/* Ingredients Section */}
                    {item.ingredients && item.ingredients.length > 0 && (
                        <div className="space-y-6 text-center">
                            <h4 className="font-serif italic text-xl text-gray-900">Ingredients</h4>
                            <div className="flex flex-wrap justify-center gap-3">
                                {item.ingredients.map(ing => (
                                    <span
                                        key={ing.id}
                                        className={`px-4 py-2 rounded-full text-xs font-bold border ${ing.is_allergen
                                            ? 'bg-amber-50 text-amber-700 border-amber-200'
                                            : 'bg-white text-gray-500 border-gray-200'
                                            }`}
                                    >
                                        {ing.name.en}
                                        {ing.is_allergen && ' *'}
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Interaction Section */}
                    <div className="space-y-12">
                        {showSuccess !== 'rating' ? (
                            <div className="text-center space-y-6 animate-in fade-in duration-500">
                                <h4 className="font-serif italic text-xl text-gray-900">Rate this Experience</h4>
                                <div className="flex justify-center gap-3">
                                    {[1, 2, 3, 4, 5].map((star) => (
                                        <button
                                            key={star}
                                            onClick={() => handleRating(star)}
                                            disabled={isSubmittingRating}
                                            className="transition-transform active:scale-75"
                                        >
                                            <Star
                                                className={`w-10 h-10 ${star <= rating
                                                    ? 'text-amber-500 fill-amber-500'
                                                    : 'text-gray-200 hover:text-amber-200 transition-colors'
                                                    }`}
                                            />
                                        </button>
                                    ))}
                                </div>
                            </div>
                        ) : (
                            <div className="text-center py-8 bg-gray-50 rounded-[32px] animate-in zoom-in duration-500">
                                <Star className="w-12 h-12 text-amber-500 fill-amber-500 mx-auto mb-4" />
                                <h4 className="font-serif italic text-2xl text-gray-900 mb-2">Thank You!</h4>
                                <p className="text-sm font-medium" style={{ color: brandColor }}>Your rating has been shared.</p>
                            </div>
                        )}

                        <div className="space-y-8 bg-gray-50 px-8 py-12 rounded-[40px]">
                            <div className="flex flex-col items-center gap-2 text-center">
                                <MessageSquare className="w-8 h-8 opacity-20" style={{ color: brandColor }} />
                                <h4 className="font-serif italic text-2xl text-gray-900">Guest Feedbacks</h4>
                            </div>

                            <div className="space-y-4">
                                {item.feedbacks && item.feedbacks.length > 0 ? (
                                    <div className="space-y-4">
                                        {item.feedbacks.slice(0, 3).map((fb, idx) => (
                                            <div key={idx} className="bg-white p-6 rounded-3xl border border-gray-100 flex gap-4 items-start">
                                                <div className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center flex-shrink-0 text-gray-300 font-bold italic">?</div>
                                                <div className="space-y-1">
                                                    <p className="text-sm font-medium text-gray-700 leading-relaxed italic">"{fb.message}"</p>
                                                    <p className="text-[10px] font-bold text-gray-300 uppercase tracking-widest">Anonymous Guest</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-sm text-gray-400 font-medium italic text-center py-8">Be the first to share your experience.</p>
                                )}
                            </div>

                            <div className="relative mt-8 group">
                                <textarea
                                    value={feedback}
                                    onChange={(e) => setFeedback(e.target.value)}
                                    placeholder="Add your note here..."
                                    className="w-full px-8 py-6 bg-white border-2 border-transparent rounded-[32px] transition-all font-medium text-sm resize-none h-32 shadow-sm placeholder:italic"
                                    style={{
                                        borderColor: feedback.trim() ? `${brandColor}20` : 'transparent'
                                    }}
                                />
                                <button
                                    onClick={handleFeedback}
                                    disabled={isSubmittingFeedback || !feedback.trim()}
                                    className="absolute bottom-6 right-6 p-4 text-white rounded-2xl shadow-xl active:scale-90 transition-transform disabled:opacity-30 disabled:grayscale"
                                    style={{ backgroundColor: brandColor }}
                                >
                                    <Send className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
