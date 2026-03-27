export interface Discount {
    discount_id: string;
    hotel_id: string;
    menu_item_id: string;
    percentage: number;
    start_date: string;
    end_date: string;
    is_active: boolean;
    created_at: string;
}

export interface CreateDiscountRequest {
    hotel_id: string;
    menu_item_id: string;
    percentage: number;
    start_date: string;
    end_date: string;
    is_active?: boolean;
}

export interface UpdateDiscountRequest {
    percentage?: number;
    start_date?: string;
    end_date?: string;
    is_active?: boolean;
}
