package domain

import (
	"time"

	"github.com/google/uuid"
)

type MenuItem struct {
	MenuItemID    uuid.UUID  `json:"menu_item_id"`
	HotelID       uuid.UUID  `json:"hotel_id"`
	CategoryID    uuid.UUID  `json:"category_id"`
	ChefID        *uuid.UUID `json:"chef_id"`
	NameEN        string     `json:"name_en"`
	NameAM        string     `json:"name_am"`
	DescriptionEN string     `json:"description_en"`
	DescriptionAM string     `json:"description_am"`
	Price         float64    `json:"price"`
	ImageURL      string     `json:"image_url"`
	VideoURL      string     `json:"video_url"`
	IsSpecial     bool       `json:"is_special"`
	IsAvailable   bool       `json:"is_available"`
	ViewCount     int        `json:"view_count"`
	Slug          string     `json:"slug"`
	CreatedAt     time.Time  `json:"created_at"`
	UpdatedAt     time.Time  `json:"updated_at"`
}

type CreateMenuItemRequest struct {
	HotelID       uuid.UUID  `json:"hotel_id" binding:"required"`
	CategoryID    uuid.UUID  `json:"category_id" binding:"required"`
	ChefID        *uuid.UUID `json:"chef_id"`
	NameEN        string     `json:"name_en" binding:"required"`
	NameAM        string     `json:"name_am"`
	DescriptionEN string     `json:"description_en"`
	DescriptionAM string     `json:"description_am"`
	Price         float64    `json:"price" binding:"required,gt=0"`
	ImageURL      string     `json:"image_url"`
	VideoURL      string     `json:"video_url"`
	IsSpecial     bool       `json:"is_special"`
	IsAvailable   *bool      `json:"is_available"`
}

type UpdateMenuItemRequest struct {
	CategoryID    *uuid.UUID `json:"category_id"`
	ChefID        *uuid.UUID `json:"chef_id"`
	NameEN        *string    `json:"name_en"`
	NameAM        *string    `json:"name_am"`
	DescriptionEN *string    `json:"description_en"`
	DescriptionAM *string    `json:"description_am"`
	Price         *float64   `json:"price"`
	ImageURL      *string    `json:"image_url"`
	VideoURL      *string    `json:"video_url"`
	IsSpecial     *bool      `json:"is_special"`
	IsAvailable   *bool      `json:"is_available"`
}
