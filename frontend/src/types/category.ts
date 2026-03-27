export interface Category {
    category_id: string;
    hotel_id: string;
    name_en: string;
    name_am: string;
    is_active: boolean;
    created_at: string;
    updated_at: string;
}

export interface CreateCategoryRequest {
    hotel_id: string;
    name_en: string;
    name_am?: string;
}

export interface UpdateCategoryRequest {
    name_en?: string;
    name_am?: string;
    is_active?: boolean;
}
