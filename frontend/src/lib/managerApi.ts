import api from './api';
import {
    Category, CreateCategoryRequest, UpdateCategoryRequest,
    Chef, CreateChefRequest, UpdateChefRequest,
    Discount, CreateDiscountRequest, UpdateDiscountRequest,
    Feedback, CreateFeedbackRequest,
    Ingredient, CreateIngredientRequest, AddMenuItemIngredientRequest,
    MenuItem, CreateMenuItemRequest, UpdateMenuItemRequest,
    Rating, CreateRatingRequest,
    User, CreateUserRequest, UpdateUserRequest,
    GenericResponse
} from '../types';

// Categories
export const getCategoriesByHotel = (hotelId: string) => api.get<GenericResponse<Category[]>>(`/menu/hotels/${hotelId}/categories`);
export const getCategoryById = (id: string) => api.get<GenericResponse<Category>>(`/categories/${id}`);
export const createCategory = (data: CreateCategoryRequest) => api.post<GenericResponse<Category>>('/categories', data);
export const updateCategory = (id: string, data: UpdateCategoryRequest) => api.put<GenericResponse<Category>>(`/categories/${id}`, data);
export const deleteCategory = (id: string) => api.delete<GenericResponse<void>>(`/categories/${id}`);

// Chefs
export const getChefsByHotel = (hotelId: string) => api.get<GenericResponse<Chef[]>>(`/hotels/${hotelId}/chefs`);
export const getChefById = (id: string) => api.get<GenericResponse<Chef>>(`/chefs/${id}`);
export const createChef = (data: CreateChefRequest) => api.post<GenericResponse<Chef>>(`/hotels/${data.hotel_id}/chefs`, data);
export const updateChef = (id: string, data: UpdateChefRequest) => api.put<GenericResponse<Chef>>(`/chefs/${id}`, data);
export const deleteChef = (id: string) => api.delete<GenericResponse<void>>(`/chefs/${id}`);

// Discounts
export const getDiscountsByHotel = (hotelId: string) => api.get<GenericResponse<Discount[]>>(`/hotels/${hotelId}/discounts`);
export const getDiscountById = (id: string) => api.get<GenericResponse<Discount>>(`/discounts/${id}`);
export const createDiscount = (data: CreateDiscountRequest) => api.post<GenericResponse<Discount>>(`/hotels/${data.hotel_id}/discounts`, data);
export const updateDiscount = (id: string, data: UpdateDiscountRequest) => api.put<GenericResponse<Discount>>(`/discounts/${id}`, data);
export const deleteDiscount = (id: string) => api.delete<GenericResponse<void>>(`/discounts/${id}`);

// Feedback
export const getFeedbackByHotel = (hotelId: string) => api.get<GenericResponse<Feedback[]>>(`/hotels/${hotelId}/feedback`);
export const deleteFeedback = (id: string) => api.delete<GenericResponse<void>>(`/feedback/${id}`);

// Ingredients
export const getIngredientsByHotel = (hotelId: string) => api.get<GenericResponse<Ingredient[]>>(`/hotels/${hotelId}/ingredients`);
export const createIngredient = (data: CreateIngredientRequest) => api.post<GenericResponse<Ingredient>>(`/hotels/${data.hotel_id}/ingredients`, data);
export const deleteIngredient = (id: string) => api.delete<GenericResponse<void>>(`/ingredients/${id}`);
export const getMenuItemIngredients = (id: string) => api.get<GenericResponse<Ingredient[]>>(`/menu/menu-items/${id}/ingredients`);
export const addIngredientToMenuItem = (data: { menu_item_id: string, ingredient_id: string }) => api.post<GenericResponse<void>>('/menu/menu-items/ingredients', data);
export const removeIngredientFromMenuItem = (menuItemId: string, ingredientId: string) => api.delete<GenericResponse<void>>(`/menu/menu-items/${menuItemId}/ingredients/${ingredientId}`);

// Menu Items
export const getMenuItemsByHotel = (hotelId: string) => api.get<GenericResponse<MenuItem[]>>(`/menu/hotels/${hotelId}/menu-items`);
export const getMenuItemById = (id: string) => api.get<GenericResponse<MenuItem>>(`/menu/menu-items/${id}`);
export const createMenuItem = (data: CreateMenuItemRequest) => api.post<GenericResponse<MenuItem>>(`/menu/hotels/${data.hotel_id}/menu-items`, data);
export const updateMenuItem = (id: string, data: UpdateMenuItemRequest) => api.put<GenericResponse<MenuItem>>(`/menu/menu-items/${id}`, data);
export const deleteMenuItem = (id: string) => api.delete<GenericResponse<void>>(`/menu/menu-items/${id}`);

// Users
export const getUsersByHotel = (hotelId: string) => api.get<GenericResponse<User[]>>(`/hotels/${hotelId}/users`);
export const createUser = (data: CreateUserRequest) => api.post<GenericResponse<User>>('/auth/register', data);
export const updateUser = (id: string, data: UpdateUserRequest) => api.put<GenericResponse<User>>(`/users/${id}`, data);
export const deleteUser = (id: string) => api.delete<GenericResponse<void>>(`/users/${id}`);

// Ratings
// Note: Swagger only has per-item ratings. We use analytics or feedback for general listing if available.
// If /hotels/{id}/ratings returns 403/404, we'll gracefully handle it in the UI.
export const getRatingsByHotel = (hotelId: string) => api.get<GenericResponse<Rating[]>>(`/hotels/${hotelId}/ratings`);
export const deleteRating = (id: string) => api.delete<GenericResponse<void>>(`/ratings/${id}`);

// Hotels / Menu Profile
export const getHotelById = (id: string) => api.get<GenericResponse<any>>(`menu/hotels/${id}`);
export const updateHotel = (id: string, data: any) => api.put<GenericResponse<any>>(`/hotels/${id}`, data);

// Analytics
export const getHotelAnalytics = (hotelId: string) => api.get<GenericResponse<any>>(`/hotels/${hotelId}/analytics`);
