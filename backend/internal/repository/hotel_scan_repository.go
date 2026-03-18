package repository

import (
	"context"

	"backend/internal/domain"

	"github.com/google/uuid"
	"github.com/jackc/pgx/v5/pgxpool"
)

type hotelScanRepository struct {
	db *pgxpool.Pool
}

func NewHotelScanRepository(db *pgxpool.Pool) HotelScanRepository {
	return &hotelScanRepository{db: db}
}

func (r *hotelScanRepository) Create(ctx context.Context, scan *domain.HotelScan) error {
	query := `INSERT INTO hotel_scans (hotel_scan_id, hotel_id, created_at)
			  VALUES (uuid_generate_v4(), $1, NOW())
			  RETURNING hotel_scan_id, created_at`
	return r.db.QueryRow(ctx, query, scan.HotelID).Scan(&scan.HotelScanID, &scan.CreatedAt)
}

func (r *hotelScanRepository) CountByHotelID(ctx context.Context, hotelID uuid.UUID) (int64, error) {
	var count int64
	err := r.db.QueryRow(ctx, `SELECT COUNT(*) FROM hotel_scans WHERE hotel_id=$1`, hotelID).Scan(&count)
	return count, err
}
