package domain

import (
	"time"

	"github.com/google/uuid"
)

type Ingredient struct {
	IngredientID uuid.UUID `json:"ingredient_id"`
	HotelID      uuid.UUID `json:"hotel_id"`
	Name         string    `json:"name"`
	IsAllergen   bool      `json:"is_allergen"`
	CreatedAt    time.Time `json:"created_at"`
}

type CreateIngredientRequest struct {
	HotelID    uuid.UUID `json:"hotel_id" binding:"required"`
	Name       string    `json:"name" binding:"required"`
	IsAllergen bool      `json:"is_allergen"`
}

type MenuItemIngredient struct {
	MenuItemIngredientID uuid.UUID `json:"menu_item_ingredient_id"`
	MenuItemID           uuid.UUID `json:"menu_item_id"`
	IngredientID         uuid.UUID `json:"ingredient_id"`
}

type AddMenuItemIngredientRequest struct {
	MenuItemID   uuid.UUID `json:"menu_item_id" binding:"required"`
	IngredientID uuid.UUID `json:"ingredient_id" binding:"required"`
}
