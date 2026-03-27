import api from '@/lib/api';
import { GenericResponse } from '@/types/auth';
import { Category, CreateCategoryRequest, UpdateCategoryRequest } from '@/types/category';

export const CategoryService = {
    getCategories: async (hotelId: string): Promise<Category[]> => {
        const response = await api.get<GenericResponse<Category[]>>(`/menu/hotels/${hotelId}/categories`);
        return response.data.data;
    },

    createCategory: async (data: CreateCategoryRequest): Promise<Category> => {
        const response = await api.post<GenericResponse<Category>>('/categories', data);
        return response.data.data;
    },

    updateCategory: async (id: string, data: UpdateCategoryRequest): Promise<Category> => {
        const response = await api.put<GenericResponse<Category>>(`/categories/${id}`, data);
        return response.data.data;
    },

    deleteCategory: async (id: string): Promise<void> => {
        await api.delete<GenericResponse<any>>(`/categories/${id}`);
    }
};
