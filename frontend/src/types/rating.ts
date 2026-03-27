export interface Rating {
    rating_id: string;
    hotel_id: string;
    menu_item_id: string;
    rating: number;
    comment?: string;
    language?: string;
    created_at: string;
}

export interface CreateRatingRequest {
    hotel_id: string;
    menu_item_id: string;
    rating: number;
    comment?: string;
    language?: string;
}
