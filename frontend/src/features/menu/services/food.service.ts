import api from '@/lib/api';
import { MultilingualText, GenericResponse } from '@/types/auth';

export interface Ingredient {
    id: number;
    name: MultilingualText;
    is_allergen: boolean;
}

export interface FoodItem {
    id: string;
    hotel_id: string;
    category_id: string;
    name: MultilingualText;
    description: MultilingualText;
    price: number;
    image_url: string;
    is_available: boolean;
    is_special: boolean;
    rating?: number;
    slug: string;
    created_at: string;
    updated_at: string;
}

export interface Category {
    id: string;
    hotel_id: string;
    name: MultilingualText;
    is_active: boolean;
    created_at: string;
    updated_at: string;
}

export interface CreateMenuItemRequest {
    category_id: number;
    name: MultilingualText;
    description: MultilingualText;
    price: number;
    image_url: string;
    is_available: boolean;
    is_special: boolean;
}

export interface CreateCategoryRequest {
    name: MultilingualText;
}

export const FoodService = {
    getFoodsByHotel: async (hotelId: string): Promise<FoodItem[]> => {
        const response = await api.get<GenericResponse<any[]>>(`/menu/hotels/${hotelId}/menu-items`);
        return response.data.data.map(item => ({
            id: item.menu_item_id,
            hotel_id: item.hotel_id,
            category_id: item.category_id,
            name: { en: item.name_en, am: item.name_am },
            description: { en: item.description_en, am: item.description_am },
            price: item.price,
            image_url: item.image_url,
            is_available: item.is_available,
            is_special: item.is_special,
            slug: item.slug,
            created_at: item.created_at,
            updated_at: item.updated_at
        }));
    },
    getCategoriesByHotel: async (hotelId: string): Promise<Category[]> => {
        const response = await api.get<GenericResponse<any[]>>(`/menu/hotels/${hotelId}/categories`);
        return response.data.data.map(cat => ({
            id: cat.category_id,
            hotel_id: cat.hotel_id,
            name: { en: cat.name_en, am: cat.name_am },
            is_active: cat.is_active,
            created_at: cat.created_at,
            updated_at: cat.updated_at
        }));
    },
    getFoodBySlug: async (slug: string): Promise<FoodItem> => {
        const response = await api.get<GenericResponse<any>>(`/menu/menu-items/slug/${slug}`);
        const item = response.data.data;
        return {
            id: item.menu_item_id,
            hotel_id: item.hotel_id,
            category_id: item.category_id,
            name: { en: item.name_en, am: item.name_am },
            description: { en: item.description_en, am: item.description_am },
            price: item.price,
            image_url: item.image_url,
            is_available: item.is_available,
            is_special: item.is_special,
            slug: item.slug,
            created_at: item.created_at,
            updated_at: item.updated_at
        };
    },
    getFoodById: async (id: string): Promise<FoodItem> => {
        const response = await api.get<GenericResponse<any>>(`/menu/menu-items/${id}`);
        const item = response.data.data;
        return {
            id: item.menu_item_id,
            hotel_id: item.hotel_id,
            category_id: item.category_id,
            name: { en: item.name_en, am: item.name_am },
            description: { en: item.description_en, am: item.description_am },
            price: item.price,
            image_url: item.image_url,
            is_available: item.is_available,
            is_special: item.is_special,
            slug: item.slug,
            created_at: item.created_at,
            updated_at: item.updated_at
        };
    },
    addFoodItem: async (hotelId: string, food: any): Promise<FoodItem> => {
        // Map frontend CreateMenuItemRequest to backend flattened fields
        const backendFood = {
            hotel_id: hotelId,
            category_id: food.category_id,
            name_en: food.name.en,
            name_am: food.name.am,
            description_en: food.description.en,
            description_am: food.description.am,
            price: food.price,
            image_url: food.image_url,
            is_available: food.is_available,
            is_special: food.is_special
        };
        const response = await api.post<GenericResponse<any>>(`/menu/hotels/${hotelId}/menu-items`, backendFood);
        const item = response.data.data;
        return {
            id: item.menu_item_id,
            hotel_id: item.hotel_id,
            category_id: item.category_id,
            name: { en: item.name_en, am: item.name_am },
            description: { en: item.description_en, am: item.description_am },
            price: item.price,
            image_url: item.image_url,
            is_available: item.is_available,
            is_special: item.is_special,
            slug: item.slug,
            created_at: item.created_at,
            updated_at: item.updated_at
        };
    },
    addCategory: async (hotelId: string, category: any): Promise<Category> => {
        const backendCat = {
            hotel_id: hotelId,
            name_en: category.name.en,
            name_am: category.name.am,
            is_active: true
        };
        const response = await api.post<GenericResponse<any>>(`/menu/hotels/${hotelId}/categories`, backendCat);
        const cat = response.data.data;
        return {
            id: cat.category_id,
            hotel_id: cat.hotel_id,
            name: { en: cat.name_en, am: cat.name_am },
            is_active: cat.is_active,
            created_at: cat.created_at,
            updated_at: cat.updated_at
        };
    },
    deleteFoodItem: async (id: string): Promise<void> => {
        await api.delete(`/menu/menu-items/${id}`);
    },
    deleteCategory: async (id: string): Promise<void> => {
        await api.delete(`/menu/categories/${id}`);
    }
};
