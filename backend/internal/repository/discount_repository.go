package repository

import (
	"context"

	"backend/internal/domain"

	"github.com/google/uuid"
	"github.com/jackc/pgx/v5/pgxpool"
)

type discountRepository struct {
	db *pgxpool.Pool
}

func NewDiscountRepository(db *pgxpool.Pool) DiscountRepository {
	return &discountRepository{db: db}
}

func (r *discountRepository) Create(ctx context.Context, d *domain.Discount) error {
	query := `INSERT INTO discounts (discount_id, menu_item_id, hotel_id, percentage, start_date, end_date, is_active, created_at)
			  VALUES ($1, $2, $3, $4, $5, $6, $7, NOW())
			  RETURNING discount_id, created_at`
	return r.db.QueryRow(ctx, query,
		d.DiscountID, d.MenuItemID, d.HotelID,
		d.Percentage, d.StartDate, d.EndDate, d.IsActive,
	).Scan(&d.DiscountID, &d.CreatedAt)
}

func (r *discountRepository) GetByID(ctx context.Context, id uuid.UUID) (*domain.Discount, error) {
	d := &domain.Discount{}
	query := `SELECT discount_id, menu_item_id, hotel_id, percentage, start_date, end_date, is_active, created_at
			  FROM discounts WHERE discount_id = $1`
	err := r.db.QueryRow(ctx, query, id).Scan(
		&d.DiscountID, &d.MenuItemID, &d.HotelID,
		&d.Percentage, &d.StartDate, &d.EndDate, &d.IsActive, &d.CreatedAt,
	)
	if err != nil {
		return nil, err
	}
	return d, nil
}

func (r *discountRepository) GetByHotelID(ctx context.Context, hotelID uuid.UUID) ([]domain.Discount, error) {
	query := `SELECT discount_id, menu_item_id, hotel_id, percentage, start_date, end_date, is_active, created_at
			  FROM discounts WHERE hotel_id = $1 ORDER BY created_at DESC`
	rows, err := r.db.Query(ctx, query, hotelID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var discounts []domain.Discount
	for rows.Next() {
		var d domain.Discount
		if err := rows.Scan(&d.DiscountID, &d.MenuItemID, &d.HotelID,
			&d.Percentage, &d.StartDate, &d.EndDate, &d.IsActive, &d.CreatedAt); err != nil {
			return nil, err
		}
		discounts = append(discounts, d)
	}
	return discounts, nil
}

func (r *discountRepository) GetActiveByMenuItemID(ctx context.Context, menuItemID uuid.UUID) (*domain.Discount, error) {
	d := &domain.Discount{}
	query := `SELECT discount_id, menu_item_id, hotel_id, percentage, start_date, end_date, is_active, created_at
			  FROM discounts WHERE menu_item_id = $1 AND is_active = true AND NOW() BETWEEN start_date AND end_date
			  ORDER BY created_at DESC LIMIT 1`
	err := r.db.QueryRow(ctx, query, menuItemID).Scan(
		&d.DiscountID, &d.MenuItemID, &d.HotelID,
		&d.Percentage, &d.StartDate, &d.EndDate, &d.IsActive, &d.CreatedAt,
	)
	if err != nil {
		return nil, err
	}
	return d, nil
}

func (r *discountRepository) Update(ctx context.Context, d *domain.Discount) error {
	query := `UPDATE discounts SET percentage=$2, start_date=$3, end_date=$4, is_active=$5
			  WHERE discount_id=$1`
	_, err := r.db.Exec(ctx, query,
		d.DiscountID, d.Percentage, d.StartDate, d.EndDate, d.IsActive,
	)
	return err
}

func (r *discountRepository) Delete(ctx context.Context, id uuid.UUID) error {
	_, err := r.db.Exec(ctx, `DELETE FROM discounts WHERE discount_id=$1`, id)
	return err
}
