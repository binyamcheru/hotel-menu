export interface Hotel {
    id: string;
    name: string;
    slug: string;
    address: string;
    contactEmail: string;
    logoUrl?: string;
    status: 'ACTIVE' | 'INACTIVE';
    managerName: string;
    createdAt: string;
}

export interface Manager {
    id: string;
    name: string;
    email: string;
    hotelId: string;
    hotelName: string;
    role: 'HOTEL_ADMIN';
}

const mockHotels: Hotel[] = [
    {
        id: '1',
        name: 'Grand Plaza Hotel',
        slug: 'grand-plaza',
        address: '123 Luxury Ave, Downtown',
        contactEmail: 'admin@grandplaza.com',
        status: 'ACTIVE',
        managerName: 'John Doe',
        createdAt: '2024-01-15',
    },
    {
        id: '2',
        name: 'Ocean Breeze Resort',
        slug: 'ocean-breeze',
        address: '456 Shoreline Dr, Beachside',
        contactEmail: 'manager@oceanbreeze.com',
        status: 'ACTIVE',
        managerName: 'Sarah Smith',
        createdAt: '2024-02-10',
    },
    {
        id: '3',
        name: 'Mountain Retreat',
        slug: 'mountain-retreat',
        address: '789 Peak Rd, Highlands',
        contactEmail: 'info@mountainretreat.com',
        status: 'INACTIVE',
        managerName: 'Mike Johnson',
        createdAt: '2024-03-05',
    },
];

const mockManagers: Manager[] = [
    { id: '101', name: 'John Doe', email: 'john@grandplaza.com', hotelId: '1', hotelName: 'Grand Plaza Hotel', role: 'HOTEL_ADMIN' },
    { id: '102', name: 'Sarah Smith', email: 'sarah@oceanbreeze.com', hotelId: '2', hotelName: 'Ocean Breeze Resort', role: 'HOTEL_ADMIN' },
    { id: '103', name: 'Mike Johnson', email: 'mike@mountainretreat.com', hotelId: '3', hotelName: 'Mountain Retreat', role: 'HOTEL_ADMIN' },
];

export const HotelService = {
    getHotels: async (): Promise<Hotel[]> => {
        return new Promise((resolve) => setTimeout(() => resolve(mockHotels), 500));
    },
    getHotelBySlug: async (slug: string): Promise<Hotel | undefined> => {
        return new Promise((resolve) => setTimeout(() => resolve(mockHotels.find(h => h.slug === slug)), 300));
    },
    getManagers: async (): Promise<Manager[]> => {
        return new Promise((resolve) => setTimeout(() => resolve(mockManagers), 400));
    },
    addHotel: async (hotel: Omit<Hotel, 'id' | 'createdAt'>): Promise<Hotel> => {
        const newHotel = { ...hotel, id: Math.random().toString(36).substr(2, 9), createdAt: new Date().toISOString().split('T')[0] };
        return new Promise((resolve) => setTimeout(() => resolve(newHotel), 800));
    }
};
