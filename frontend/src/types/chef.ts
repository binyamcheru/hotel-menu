export interface Chef {
    chef_id: string;
    hotel_id: string;
    name: string;
    bio_en?: string;
    bio_am?: string;
    image_url?: string;
    created_at: string;
    updated_at: string;
}

export interface CreateChefRequest {
    hotel_id: string;
    name: string;
    bio_en?: string;
    bio_am?: string;
    image_url?: string;
}

export interface UpdateChefRequest {
    name?: string;
    bio_en?: string;
    bio_am?: string;
    image_url?: string;
}
