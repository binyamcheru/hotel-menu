package domain

import (
	"errors"
	"time"

	"github.com/google/uuid"
)

var (
	ErrAlreadySubmittedFeedback = errors.New("already_submitted_feedback")
)

type Feedback struct {
	FeedbackID  uuid.UUID `json:"feedback_id"`
	HotelID     uuid.UUID `json:"hotel_id"`
	MenuItemID  uuid.UUID `json:"menu_item_id"`
	Message     string    `json:"message"`
	Fingerprint string    `json:"fingerprint"`
	CreatedAt   time.Time `json:"created_at"`
}

type CreateFeedbackRequest struct {
	HotelID    uuid.UUID `json:"hotel_id" binding:"required"`
	MenuItemID uuid.UUID `json:"menu_item_id" binding:"required"`
	Message    string    `json:"message" binding:"required"`

	Fingerprint string `json:"-"`
}
