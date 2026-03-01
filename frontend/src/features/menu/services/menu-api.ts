import api from '@/lib/api';

export interface MenuItem {
    id: string;
    name: string;
    description: string;
    price: number;
    category: string;
    image?: string;
    available: boolean;
}

export interface Category {
    id: string;
    name: string;
}

export const MenuService = {
    getMenu: async (hotelSlug: string) => {
        // In a real app: const response = await api.get(`/${hotelSlug}/menu`);
        // Mock response
        return [
            { id: '1', name: 'Garlic Bread', description: 'Freshly baked with herbs', price: 5.99, category: 'Starters', available: true },
            { id: '2', name: 'Bruschetta', price: 7.50, description: 'Tomato, basil, and balsamic', category: 'Starters', available: true },
            { id: '3', name: 'Grilled Salmon', price: 18.99, description: 'With roasted vegetables', category: 'Main Course', available: true },
            { id: '4', name: 'Pasta Carbonara', price: 14.50, description: 'Classic creamy sauce', category: 'Main Course', available: false },
        ];
    },

    updateMenuItem: async (hotelSlug: string, itemId: string, data: Partial<MenuItem>) => {
        // const response = await api.patch(`/${hotelSlug}/menu/items/${itemId}`, data);
        return { success: true };
    },

    deleteMenuItem: async (hotelSlug: string, itemId: string) => {
        // const response = await api.delete(`/${hotelSlug}/menu/items/${itemId}`);
        return { success: true };
    },
};
