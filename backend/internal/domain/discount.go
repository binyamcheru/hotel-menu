package domain

import (
	"time"

	"github.com/google/uuid"
)

type Discount struct {
	DiscountID uuid.UUID `json:"discount_id"`
	MenuItemID uuid.UUID `json:"menu_item_id"`
	HotelID    uuid.UUID `json:"hotel_id"`
	Percentage float64   `json:"percentage"`
	StartDate  time.Time `json:"start_date"`
	EndDate    time.Time `json:"end_date"`
	IsActive   bool      `json:"is_active"`
	CreatedAt  time.Time `json:"created_at"`
}

type CreateDiscountRequest struct {
	MenuItemID uuid.UUID `json:"menu_item_id" binding:"required"`
	HotelID    uuid.UUID `json:"hotel_id" binding:"required"`
	Percentage float64   `json:"percentage" binding:"required,gt=0,lte=100"`
	StartDate  time.Time `json:"start_date" binding:"required"`
	EndDate    time.Time `json:"end_date" binding:"required"`
	IsActive   *bool     `json:"is_active"`
}

type UpdateDiscountRequest struct {
	Percentage *float64   `json:"percentage"`
	StartDate  *time.Time `json:"start_date"`
	EndDate    *time.Time `json:"end_date"`
	IsActive   *bool      `json:"is_active"`
}
