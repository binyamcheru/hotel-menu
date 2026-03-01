export interface FoodItem {
    id: string;
    name: string;
    description: string;
    price: number;
    category: string;
    image: string;
    available: boolean;
    hotelSlug: string;
    isPopular?: boolean;
    calories?: string;
}

export interface Category {
    id: string;
    name: string;
    hotelSlug: string;
}

const mockFoods: FoodItem[] = [
    {
        id: 'f1',
        name: 'Grilled Atlantic Salmon',
        description: 'Fresh Atlantic salmon fillet, grilled to perfection with a lemon butter glaze and seasonal vegetables.',
        price: 24.50,
        category: 'Main Courses',
        image: 'https://images.unsplash.com/photo-1485921325833-c519f76c4927?q=80&w=800',
        available: true,
        hotelSlug: 'grand-plaza',
        isPopular: true,
        calories: '450 kcal',
    },
    {
        id: 'f2',
        name: 'Classic Margherita Pizza',
        description: 'Hand-stretched dough, San Marzano tomato sauce, fresh buffalo mozzarella, and basil peaks.',
        price: 18.00,
        category: 'Pizzas',
        image: 'https://images.unsplash.com/photo-1574071318508-1cdbad80ad38?q=80&w=800',
        available: true,
        hotelSlug: 'grand-plaza',
        isPopular: true,
    },
    {
        id: 'f3',
        name: 'Truffle Mushroom Risotto',
        description: 'Creamy Arborio rice with wild mushrooms, parmesan cheese, and a drizzle of white truffle oil.',
        price: 21.00,
        category: 'Main Courses',
        image: 'https://images.unsplash.com/photo-1476124369491-e7addf5db371?q=80&w=800',
        available: true,
        hotelSlug: 'grand-plaza',
    },
    {
        id: 'f4',
        name: 'Caesar Salad with Chicken',
        description: 'Crisp romaine lettuce, herb croutons, parmesan flakes, grilled chicken breast, and creamy Caesar dressing.',
        price: 15.50,
        category: 'Salads',
        image: 'https://images.unsplash.com/photo-1550304943-4f24f54ddde9?q=80&w=800',
        available: true,
        hotelSlug: 'grand-plaza',
        calories: '320 kcal',
    },
    {
        id: 'f5',
        name: 'Triple Chocolate Mousse',
        description: 'Rich dark, milk, and white chocolate layers served with fresh berries and raspberry coulis.',
        price: 10.50,
        category: 'Desserts',
        image: 'https://images.unsplash.com/photo-1511911063855-2bf39afa5b2e?q=80&w=800',
        available: true,
        hotelSlug: 'grand-plaza',
        isPopular: true,
    },
    {
        id: 'f6',
        name: 'Signature Beef Burger',
        description: 'Aged beef patty, caramelized onions, cheddar cheese, brioche bun, and secret house sauce.',
        price: 19.50,
        category: 'Main Courses',
        image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?q=80&w=800',
        available: false,
        hotelSlug: 'grand-plaza',
    },
];

const mockCategories: Category[] = [
    { id: 'c1', name: 'Main Courses', hotelSlug: 'grand-plaza' },
    { id: 'c2', name: 'Pizzas', hotelSlug: 'grand-plaza' },
    { id: 'c3', name: 'Salads', hotelSlug: 'grand-plaza' },
    { id: 'c4', name: 'Desserts', hotelSlug: 'grand-plaza' },
];

export const FoodService = {
    getFoodsByHotel: async (hotelSlug: string): Promise<FoodItem[]> => {
        return new Promise((resolve) => setTimeout(() => resolve(mockFoods.filter(f => f.hotelSlug === hotelSlug)), 600));
    },
    getCategoriesByHotel: async (hotelSlug: string): Promise<Category[]> => {
        return new Promise((resolve) => setTimeout(() => resolve(mockCategories.filter(c => c.hotelSlug === hotelSlug)), 400));
    },
    addFoodItem: async (food: Omit<FoodItem, 'id'>): Promise<FoodItem> => {
        const newFood = { ...food, id: Math.random().toString(36).substr(2, 9) };
        return new Promise((resolve) => setTimeout(() => resolve(newFood), 800));
    },
    updateFoodItem: async (id: string, food: Partial<FoodItem>): Promise<FoodItem> => {
        return new Promise((resolve) => setTimeout(() => resolve({ ...mockFoods[0], ...food, id }), 700));
    },
    deleteFoodItem: async (id: string): Promise<boolean> => {
        return new Promise((resolve) => setTimeout(() => resolve(true), 500));
    }
};
