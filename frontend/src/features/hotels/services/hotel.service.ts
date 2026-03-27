import api from '@/lib/api';
import { GenericResponse } from '@/types/auth';

export interface Hotel {
    hotel_id: string;
    name: string;
    address: string;
    phone: string;
    logo: string;
    language_settings: string;
    created_at: string;
    updated_at: string;
}

export interface Manager {
    user_id: string;
    name: string;
    phone_no: string;
    email: string;
    hotel_id: string;
    role: string;
}

export interface CreateHotelRequest {
    name: string;
    address: string;
    phone: string;
    logo: string;
    language_settings: string;
}

export const HotelService = {
    getHotels: async (): Promise<Hotel[]> => {
        const response = await api.get<GenericResponse<Hotel[]>>('/hotels');
        return response.data.data;
    },
    getHotelById: async (id: string): Promise<Hotel> => {
        const response = await api.get<GenericResponse<Hotel>>(`menu/hotels/${id}`);
        return response.data.data;
    },
    getManagers: async (): Promise<Manager[]> => {
        const response = await api.get<GenericResponse<Manager[]>>('/auth/users');
        return response.data.data;
    },
    addHotel: async (hotel: CreateHotelRequest): Promise<Hotel> => {
        const response = await api.post<GenericResponse<Hotel>>('/hotels', hotel);
        return response.data.data;
    },
    updateHotel: async (id: string, hotel: any): Promise<Hotel> => {
        const response = await api.put<GenericResponse<Hotel>>(`/hotels/${id}`, hotel);
        return response.data.data;
    },
    deleteHotel: async (id: string): Promise<void> => {
        await api.delete(`/hotels/${id}`);
    }
};
