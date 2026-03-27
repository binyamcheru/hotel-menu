export interface MenuItem {
    menu_item_id: string;
    hotel_id: string;
    category_id: string;
    chef_id?: string;
    name_en: string;
    name_am?: string;
    description_en?: string;
    description_am?: string;
    price: number;
    image_url?: string;
    video_url?: string;
    is_available: boolean;
    is_special: boolean;
    slug: string;
    view_count: number;
    created_at: string;
    updated_at: string;
}

export interface CreateMenuItemRequest {
    hotel_id: string;
    category_id: string;
    chef_id?: string;
    name_en: string;
    name_am?: string;
    description_en?: string;
    description_am?: string;
    price: number;
    image_url?: string;
    video_url?: string;
    is_available?: boolean;
    is_special?: boolean;
}

export interface UpdateMenuItemRequest {
    category_id?: string;
    chef_id?: string;
    name_en?: string;
    name_am?: string;
    description_en?: string;
    description_am?: string;
    price?: number;
    image_url?: string;
    video_url?: string;
    is_available?: boolean;
    is_special?: boolean;
}
