import api from '@/lib/api';
import { GenericResponse } from '@/types/auth';

export interface Rating {
    id: string;
    menu_item_id: string;
    hotel_id: string;
    rating: number;
    comment: string;
    language: string;
    created_at: string;
}

export interface SubmitRatingRequest {
    rating: number;
    comment: string;
    menu_item_id: string;
    hotel_id: string;
    language: string;
}

export interface Analytics {
    total_scans: number;
    total_menu_views: number;
    totalScans?: number;
    uniqueVisitors?: number;
    averageRating?: number;
    popularItems: {
        name: string;
        count: number;
    }[];
}

export const ReviewService = {
    submitRating: async (data: SubmitRatingRequest): Promise<Rating> => {
        const response = await api.post<GenericResponse<any>>('/menu/ratings', data);
        const r = response.data.data;
        return {
            id: r.rating_id,
            menu_item_id: r.menu_item_id,
            hotel_id: r.hotel_id,
            rating: r.rating,
            comment: r.comment,
            language: r.language,
            created_at: r.created_at
        };
    },
    getMenuItemRatings: async (menuItemId: string): Promise<Rating[]> => {
        const response = await api.get<GenericResponse<any[]>>(`/menu/menu-items/${menuItemId}/ratings`);
        return response.data.data.map(r => ({
            id: r.rating_id,
            menu_item_id: r.menu_item_id,
            hotel_id: r.hotel_id,
            rating: r.rating,
            comment: r.comment,
            language: r.language,
            created_at: r.created_at
        }));
    },
    getAverageRating: async (menuItemId: string): Promise<{ average_rating: number }> => {
        const response = await api.get<GenericResponse<{ average_rating: number }>>(`/menu/menu-items/${menuItemId}/average-rating`);
        return response.data.data;
    },
    getAnalyticsByHotel: async (hotelId: string): Promise<Analytics> => {
        const response = await api.get<GenericResponse<any>>(`/hotels/${hotelId}/analytics`);
        const data = response.data.data;
        return {
            total_scans: data.total_scans,
            total_menu_views: data.total_menu_views,
            totalScans: data.total_scans,
            uniqueVisitors: 0, // Not provided by current backend
            averageRating: 0, // Not provided by current backend
            popularItems: [] // Not provided by current backend
        };
    },
    recordScan: async (hotelId: string): Promise<void> => {
        await api.post(`/menu/hotels/${hotelId}/scan`);
    },
    recordMenuItemView: async (hotelId: string, menuItemId: string): Promise<void> => {
        await api.post(`/menu/hotels/${hotelId}/menu-items/${menuItemId}/view`);
    },
    deleteRating: async (id: string): Promise<void> => {
        await api.delete(`/ratings/${id}`);
    }
};
