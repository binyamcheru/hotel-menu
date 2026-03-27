import api from '@/lib/api';

export interface Hotel {
    id: string;
    name: string;
    slug: string;
    address: string;
    contactEmail: string;
    logoUrl?: string;
    status: 'ACTIVE' | 'INACTIVE';
}

export const HotelService = {
    getHotels: async (): Promise<Hotel[]> => {
        // const response = await api.get('/hotels');
        return [
            { id: '1', name: 'Grand Plaza', slug: 'grand-plaza', address: '123 Main St', contactEmail: 'info@grandplaza.com', status: 'ACTIVE' },
            { id: '2', name: 'Ocean View', slug: 'ocean-view', address: '456 Beach Rd', contactEmail: 'contact@oceanview.com', status: 'ACTIVE' },
            { id: '3', name: 'Mountain Retreat', slug: 'mountain-retreat', address: '789 Cabin Ln', contactEmail: 'hello@mountain.com', status: 'INACTIVE' },
        ];
    },

    getHotelBySlug: async (slug: string): Promise<Hotel> => {
        // const response = await api.get(`/hotels/${slug}`);
        return { id: '1', name: 'Grand Plaza', slug, address: '123 Main St', contactEmail: 'info@grandplaza.com', status: 'ACTIVE' };
    },

    createHotel: async (data: Partial<Hotel>) => {
        // const response = await api.post('/hotels', data);
        return { success: true };
    },

    updateHotel: async (id: string, data: Partial<Hotel>) => {
        // const response = await api.patch(`/hotels/${id}`, data);
        return { success: true };
    },
};
