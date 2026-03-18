package domain

import (
	"time"

	"github.com/google/uuid"
)

type Category struct {
	CategoryID uuid.UUID `json:"category_id"`
	HotelID    uuid.UUID `json:"hotel_id"`
	NameEN     string    `json:"name_en"`
	NameAM     string    `json:"name_am"`
	IsActive   bool      `json:"is_active"`
	CreatedAt  time.Time `json:"created_at"`
	UpdatedAt  time.Time `json:"updated_at"`
}

type CreateCategoryRequest struct {
	HotelID  uuid.UUID `json:"hotel_id" binding:"required"`
	NameEN   string    `json:"name_en" binding:"required"`
	NameAM   string    `json:"name_am"`
	IsActive *bool     `json:"is_active"`
}

type UpdateCategoryRequest struct {
	NameEN   *string `json:"name_en"`
	NameAM   *string `json:"name_am"`
	IsActive *bool   `json:"is_active"`
}
