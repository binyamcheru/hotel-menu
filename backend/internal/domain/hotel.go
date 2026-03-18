package domain

import (
	"time"

	"github.com/google/uuid"
)

type Hotel struct {
	HotelID          uuid.UUID `json:"hotel_id"`
	Name             string    `json:"name"`
	Logo             string    `json:"logo"`
	Address          string    `json:"address"`
	Phone            string    `json:"phone"`
	LanguageSettings string    `json:"language_settings"`
	CreatedAt        time.Time `json:"created_at"`
	UpdatedAt        time.Time `json:"updated_at"`
}

type CreateHotelRequest struct {
	Name             string `json:"name" binding:"required"`
	Logo             string `json:"logo"`
	Address          string `json:"address"`
	Phone            string `json:"phone"`
	LanguageSettings string `json:"language_settings"`
}

type UpdateHotelRequest struct {
	Name             *string `json:"name"`
	Logo             *string `json:"logo"`
	Address          *string `json:"address"`
	Phone            *string `json:"phone"`
	LanguageSettings *string `json:"language_settings"`
}
