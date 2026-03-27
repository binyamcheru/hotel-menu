import { z } from 'zod';

// Category
export const createCategorySchema = z.object({
    hotel_id: z.string().uuid('Invalid Hotel ID'),
    name_en: z.string().min(1, 'English name is required'),
    name_am: z.string().optional(),
    is_active: z.boolean().optional(),
});

export const updateCategorySchema = z.object({
    name_en: z.string().min(1, 'English name is required').optional(),
    name_am: z.string().optional(),
    is_active: z.boolean().optional(),
});

// Chef
export const createChefSchema = z.object({
    hotel_id: z.string().uuid('Invalid Hotel ID'),
    name: z.string().min(1, 'Name is required'),
    bio_en: z.string().optional(),
    bio_am: z.string().optional(),
    image_url: z.string().url('Invalid image URL').optional().or(z.literal('')),
});

export const updateChefSchema = z.object({
    name: z.string().min(1, 'Name is required').optional(),
    bio_en: z.string().optional(),
    bio_am: z.string().optional(),
    image_url: z.string().url('Invalid image URL').optional().or(z.literal('')),
});

// Discount
export const createDiscountSchema = z.object({
    hotel_id: z.string().uuid('Invalid Hotel ID'),
    menu_item_id: z.string().uuid('Invalid Menu Item ID'),
    percentage: z.number().min(0, 'Percentage cannot be negative').max(100, 'Percentage cannot exceed 100'),
    start_date: z.string().min(1, 'Start date is required'),
    end_date: z.string().min(1, 'End date is required'),
    is_active: z.boolean().optional(),
});

export const updateDiscountSchema = z.object({
    percentage: z.number().min(0, 'Percentage cannot be negative').max(100, 'Percentage cannot exceed 100').optional(),
    start_date: z.string().optional(),
    end_date: z.string().optional(),
    is_active: z.boolean().optional(),
});

// Ingredient
export const createIngredientSchema = z.object({
    hotel_id: z.string().uuid('Invalid Hotel ID'),
    name: z.string().min(1, 'Name is required'),
    is_allergen: z.boolean().optional(),
});

// Menu Item
export const createMenuItemSchema = z.object({
    hotel_id: z.string().uuid('Invalid Hotel ID'),
    category_id: z.string().uuid('Invalid Category ID'),
    chef_id: z.string().uuid('Invalid Chef ID').optional().or(z.literal('')),
    name_en: z.string().min(1, 'English name is required'),
    name_am: z.string().optional(),
    description_en: z.string().optional(),
    description_am: z.string().optional(),
    price: z.number().min(0, 'Price cannot be negative'),
    image_url: z.string().url('Invalid image URL').optional().or(z.literal('')),
    video_url: z.string().url('Invalid video URL').optional().or(z.literal('')),
    is_available: z.boolean().optional(),
    is_special: z.boolean().optional(),
});

export const updateMenuItemSchema = z.object({
    category_id: z.string().uuid('Invalid Category ID').optional(),
    chef_id: z.string().uuid('Invalid Chef ID').optional().or(z.literal('')),
    name_en: z.string().min(1, 'English name is required').optional(),
    name_am: z.string().optional(),
    description_en: z.string().optional(),
    description_am: z.string().optional(),
    price: z.number().min(0, 'Price cannot be negative').optional(),
    image_url: z.string().url('Invalid image URL').optional().or(z.literal('')),
    video_url: z.string().url('Invalid video URL').optional().or(z.literal('')),
    is_available: z.boolean().optional(),
    is_special: z.boolean().optional(),
});

// User
export const createUserSchema = z.object({
    hotel_id: z.string().uuid('Invalid Hotel ID'),
    phone_no: z.string().min(10, 'Invalid phone number'),
    email: z.string().email('Invalid email address').optional().or(z.literal('')),
    password: z.string().min(6, 'Password must be at least 6 characters'),
    role: z.enum(['admin', 'superadmin']),
});

export const updateUserSchema = z.object({
    phone_no: z.string().min(10, 'Invalid phone number').optional(),
    email: z.string().email('Invalid email address').optional().or(z.literal('')),
    password: z.string().min(6, 'Password must be at least 6 characters').optional(),
    role: z.string().optional(),
    is_active: z.boolean().optional(),
});
