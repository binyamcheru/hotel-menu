export interface Ingredient {
    ingredient_id: string;
    hotel_id: string;
    name: string;
    is_allergen: boolean;
    created_at: string;
}

export interface CreateIngredientRequest {
    hotel_id: string;
    name: string;
    is_allergen?: boolean;
}

export interface AddMenuItemIngredientRequest {
    menu_item_id: string;
    ingredient_id: string;
}
