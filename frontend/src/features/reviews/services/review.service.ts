export interface Review {
    id: string;
    customerName: string;
    rating: number;
    comment: string;
    date: string;
    hotelSlug: string;
    foodId?: string;
    foodName?: string;
}

export interface Analytics {
    totalScans: number;
    uniqueVisitors: number;
    averageRating: number;
    popularItems: { name: string; count: number }[];
    scansPerDay: { date: string; count: number }[];
}

const mockReviews: Review[] = [
    {
        id: 'r1',
        customerName: 'Alice Thompson',
        rating: 5,
        comment: 'The salmon was absolutely delicious! Perfectly cooked and very flavorful.',
        date: '2024-03-10',
        hotelSlug: 'grand-plaza',
        foodId: 'f1',
        foodName: 'Grilled Atlantic Salmon',
    },
    {
        id: 'r2',
        customerName: 'Robert Wilson',
        rating: 4,
        comment: 'Great atmosphere and fast service. The margherita pizza was good but could use more basil.',
        date: '2024-03-08',
        hotelSlug: 'grand-plaza',
        foodId: 'f2',
        foodName: 'Classic Margherita Pizza',
    },
    {
        id: 'r3',
        customerName: 'Emily Davis',
        rating: 5,
        comment: 'Best dessert I have had in a long time. The chocolate mousse is a must-try!',
        date: '2024-03-05',
        hotelSlug: 'grand-plaza',
        foodId: 'f5',
        foodName: 'Triple Chocolate Mousse',
    },
];

const mockAnalytics: Record<string, Analytics> = {
    'grand-plaza': {
        totalScans: 1240,
        uniqueVisitors: 850,
        averageRating: 4.7,
        popularItems: [
            { name: 'Grilled Atlantic Salmon', count: 320 },
            { name: 'Classic Margherita Pizza', count: 280 },
            { name: 'Triple Chocolate Mousse', count: 210 },
        ],
        scansPerDay: [
            { date: '2024-03-01', count: 45 },
            { date: '2024-03-02', count: 52 },
            { date: '2024-03-03', count: 88 },
            { date: '2024-03-04', count: 65 },
            { date: '2024-03-05', count: 70 },
            { date: '2024-03-06', count: 110 },
            { date: '2024-03-07', count: 95 },
        ],
    },
};

export const ReviewService = {
    getReviewsByHotel: async (hotelSlug: string): Promise<Review[]> => {
        return new Promise((resolve) => setTimeout(() => resolve(mockReviews.filter(r => r.hotelSlug === hotelSlug)), 600));
    },
    getAnalyticsByHotel: async (hotelSlug: string): Promise<Analytics> => {
        return new Promise((resolve) => setTimeout(() => resolve(mockAnalytics[hotelSlug] || mockAnalytics['grand-plaza']), 800));
    },
    submitReview: async (review: Omit<Review, 'id' | 'date'>): Promise<Review> => {
        const newReview = { ...review, id: Math.random().toString(36).substr(2, 9), date: new Date().toISOString().split('T')[0] };
        return new Promise((resolve) => setTimeout(() => resolve(newReview), 1000));
    }
};
