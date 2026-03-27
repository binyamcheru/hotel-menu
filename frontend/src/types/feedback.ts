export interface Feedback {
    feedback_id: string;
    hotel_id: string;
    menu_item_id?: string;
    category?: string;
    message: string;
    created_at: string;
}

export interface CreateFeedbackRequest {
    hotel_id: string;
    menu_item_id?: string;
    category?: string;
    message: string;
}
