package domain

import (
	"time"

	"github.com/google/uuid"
)

type HotelScan struct {
	HotelScanID uuid.UUID `json:"hotel_scan_id"`
	HotelID     uuid.UUID `json:"hotel_id"`
	CreatedAt   time.Time `json:"created_at"`
}
