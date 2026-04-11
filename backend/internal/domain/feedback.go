package domain

import (
	"time"

	"github.com/google/uuid"
)

type Feedback struct {
	FeedbackID uuid.UUID `json:"feedback_id"`
	HotelID    uuid.UUID `json:"hotel_id"`
	MenuItemID uuid.UUID `json:"menu_item_id"`
	Message    string    `json:"message"`
	CreatedAt  time.Time `json:"created_at"`
}

type CreateFeedbackRequest struct {
	HotelID    uuid.UUID `json:"hotel_id" binding:"required"`
	MenuItemID uuid.UUID `json:"menu_item_id" binding:"required"`
	Message    string    `json:"message" binding:"required"`
}
