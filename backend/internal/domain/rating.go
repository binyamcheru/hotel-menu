package domain

import (
	"time"

	"github.com/google/uuid"
	"errors"
)

var (
	ErrAlreadyRated   = errors.New("already_rated")
	ErrInvalidRating  = errors.New("invalid_rating")
)

type Rating struct {
	RatingID   uuid.UUID `json:"rating_id"`
	MenuItemID uuid.UUID `json:"menu_item_id"`
	HotelID    uuid.UUID `json:"hotel_id"`
	Rating     int       `json:"rating"`
	Comment    string    `json:"comment"`
	Language   string    `json:"language"`
	Fingerprint string    `json:"fingerprint"`
	CreatedAt  time.Time `json:"created_at"`
}

type CreateRatingRequest struct {
	MenuItemID uuid.UUID `json:"menu_item_id" binding:"required"`
	HotelID    uuid.UUID `json:"hotel_id" binding:"required"`
	Rating     int       `json:"rating" binding:"required,min=1,max=5"`
	Comment    string    `json:"comment"`
	Language   string    `json:"language"`

	Fingerprint string  `json:"-"`
}
