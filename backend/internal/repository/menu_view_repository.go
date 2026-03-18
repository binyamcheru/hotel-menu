package repository

import (
	"context"

	"backend/internal/domain"

	"github.com/google/uuid"
	"github.com/jackc/pgx/v5/pgxpool"
)

type menuViewRepository struct {
	db *pgxpool.Pool
}

func NewMenuViewRepository(db *pgxpool.Pool) MenuViewRepository {
	return &menuViewRepository{db: db}
}

func (r *menuViewRepository) Create(ctx context.Context, view *domain.MenuView) error {
	query := `INSERT INTO menu_views (menu_view_id, hotel_id, menu_item_id, created_at)
			  VALUES (uuid_generate_v4(), $1, $2, NOW())
			  RETURNING menu_view_id, created_at`
	return r.db.QueryRow(ctx, query, view.HotelID, view.MenuItemID).Scan(&view.MenuViewID, &view.CreatedAt)
}

func (r *menuViewRepository) CountByHotelID(ctx context.Context, hotelID uuid.UUID) (int64, error) {
	var count int64
	err := r.db.QueryRow(ctx, `SELECT COUNT(*) FROM menu_views WHERE hotel_id=$1`, hotelID).Scan(&count)
	return count, err
}

func (r *menuViewRepository) CountByMenuItemID(ctx context.Context, menuItemID uuid.UUID) (int64, error) {
	var count int64
	err := r.db.QueryRow(ctx, `SELECT COUNT(*) FROM menu_views WHERE menu_item_id=$1`, menuItemID).Scan(&count)
	return count, err
}
