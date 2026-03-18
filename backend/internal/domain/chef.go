package domain

import (
	"time"

	"github.com/google/uuid"
)

type Chef struct {
	ChefID    uuid.UUID `json:"chef_id"`
	HotelID   uuid.UUID `json:"hotel_id"`
	Name      string    `json:"name"`
	BioEN     string    `json:"bio_en"`
	BioAM     string    `json:"bio_am"`
	ImageURL  string    `json:"image_url"`
	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`
}

type CreateChefRequest struct {
	HotelID  uuid.UUID `json:"hotel_id" binding:"required"`
	Name     string    `json:"name" binding:"required"`
	BioEN    string    `json:"bio_en"`
	BioAM    string    `json:"bio_am"`
	ImageURL string    `json:"image_url"`
}

type UpdateChefRequest struct {
	Name     *string `json:"name"`
	BioEN    *string `json:"bio_en"`
	BioAM    *string `json:"bio_am"`
	ImageURL *string `json:"image_url"`
}
