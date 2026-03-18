package domain

import (
	"time"

	"github.com/google/uuid"
)

type User struct {
	UserID    uuid.UUID `json:"user_id"`
	HotelID   uuid.UUID `json:"hotel_id"`
	PhoneNo   string    `json:"phone_no"`
	Email     string    `json:"email"`
	Password  string    `json:"-"`
	Role      string    `json:"role"`
	IsActive  bool      `json:"is_active"`
	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`
}

type CreateUserRequest struct {
	HotelID  uuid.UUID `json:"hotel_id" binding:"required"`
	PhoneNo  string    `json:"phone_no" binding:"required"`
	Email    string    `json:"email"`
	Password string    `json:"password" binding:"required,min=6"`
	Role     string    `json:"role" binding:"required,oneof=superadmin admin"`
}

type UpdateUserRequest struct {
	PhoneNo  *string `json:"phone_no"`
	Email    *string `json:"email"`
	Password *string `json:"password"`
	Role     *string `json:"role"`
	IsActive *bool   `json:"is_active"`
}

type LoginRequest struct {
	PhoneNo  string `json:"phone_no" binding:"required"`
	Password string `json:"password" binding:"required"`
}

type LoginResponse struct {
	Token        string `json:"token"`
	RefreshToken string `json:"refresh_token"`
	User         User   `json:"user"`
}

type RefreshRequest struct {
	RefreshToken string `json:"refresh_token" binding:"required"`
}

type TokenPair struct {
	AccessToken  string `json:"token"`
	RefreshToken string `json:"refresh_token"`
}

