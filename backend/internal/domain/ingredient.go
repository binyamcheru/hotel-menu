package domain

import (
	"errors"
	"time"

	"github.com/google/uuid"
)

// Domain Errors 

var (
	ErrIngredientNotFound      = errors.New("ingredient not found")
	ErrMenuItemNotFound        = errors.New("menu item not found")
	ErrIngredientAlreadyLinked = errors.New("ingredient is already linked to this menu item")
	ErrHotelMismatch           = errors.New("ingredient and menu item must belong to the same hotel")
)


type Ingredient struct {
	IngredientID uuid.UUID `json:"ingredient_id"`
	HotelID      uuid.UUID `json:"hotel_id"`
	Name         string    `json:"name"`
	IsAllergen   bool      `json:"is_allergen"`
	CreatedAt    time.Time `json:"created_at"`
}

type MenuItemIngredient struct {
	MenuItemIngredientID uuid.UUID `json:"menu_item_ingredient_id"`
	MenuItemID           uuid.UUID `json:"menu_item_id"`
	IngredientID         uuid.UUID `json:"ingredient_id"`
}


type CreateIngredientRequest struct {
	HotelID    uuid.UUID `json:"hotel_id" binding:"required"`
	Name       string    `json:"name" binding:"required"`
	IsAllergen bool      `json:"is_allergen"`
}

type AddMenuItemIngredientRequest struct {
	MenuItemID   uuid.UUID `json:"menu_item_id" binding:"required"`
	IngredientID uuid.UUID `json:"ingredient_id" binding:"required"`
}

type BulkAddMenuItemIngredientsRequest struct {
	MenuItemID    uuid.UUID   `json:"menu_item_id" binding:"required"`
	IngredientIDs []uuid.UUID `json:"ingredient_ids" binding:"required,min=1"`
}


type BulkAddResult struct {
	Added   []uuid.UUID `json:"added"`
	Skipped []uuid.UUID `json:"skipped"`
}
