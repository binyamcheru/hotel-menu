package domain

import (
	"time"

	"github.com/google/uuid"
)

type MenuView struct {
	MenuViewID uuid.UUID `json:"menu_view_id"`
	HotelID    uuid.UUID `json:"hotel_id"`
	MenuItemID uuid.UUID `json:"menu_item_id"`
	CreatedAt  time.Time `json:"created_at"`
}
