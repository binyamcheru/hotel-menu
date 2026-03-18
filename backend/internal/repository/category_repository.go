package repository

import (
	"context"

	"backend/internal/domain"

	"github.com/google/uuid"
	"github.com/jackc/pgx/v5/pgxpool"
)

type categoryRepository struct {
	db *pgxpool.Pool
}

func NewCategoryRepository(db *pgxpool.Pool) CategoryRepository {
	return &categoryRepository{db: db}
}

func (r *categoryRepository) Create(ctx context.Context, cat *domain.Category) error {
	query := `INSERT INTO categories (category_id, hotel_id, name_en, name_am, is_active, created_at, updated_at)
			  VALUES ($1, $2, $3, $4, $5, NOW(), NOW())
			  RETURNING category_id, created_at, updated_at`
	return r.db.QueryRow(ctx, query,
		cat.CategoryID, cat.HotelID, cat.NameEN, cat.NameAM, cat.IsActive,
	).Scan(&cat.CategoryID, &cat.CreatedAt, &cat.UpdatedAt)
}

func (r *categoryRepository) GetByID(ctx context.Context, id uuid.UUID) (*domain.Category, error) {
	cat := &domain.Category{}
	query := `SELECT category_id, hotel_id, name_en, name_am, is_active, created_at, updated_at
			  FROM categories WHERE category_id = $1`
	err := r.db.QueryRow(ctx, query, id).Scan(
		&cat.CategoryID, &cat.HotelID, &cat.NameEN, &cat.NameAM,
		&cat.IsActive, &cat.CreatedAt, &cat.UpdatedAt,
	)
	if err != nil {
		return nil, err
	}
	return cat, nil
}

func (r *categoryRepository) GetByHotelID(ctx context.Context, hotelID uuid.UUID) ([]domain.Category, error) {
	query := `SELECT category_id, hotel_id, name_en, name_am, is_active, created_at, updated_at
			  FROM categories WHERE hotel_id = $1 ORDER BY created_at DESC`
	rows, err := r.db.Query(ctx, query, hotelID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var cats []domain.Category
	for rows.Next() {
		var c domain.Category
		if err := rows.Scan(&c.CategoryID, &c.HotelID, &c.NameEN, &c.NameAM,
			&c.IsActive, &c.CreatedAt, &c.UpdatedAt); err != nil {
			return nil, err
		}
		cats = append(cats, c)
	if err := rows.Err(); err != nil {
		return nil, err
	}
	}
	return cats, nil
}

func (r *categoryRepository) Update(ctx context.Context, cat *domain.Category) error {
	query := `UPDATE categories SET name_en=$2, name_am=$3, is_active=$4, updated_at=NOW()
			  WHERE category_id=$1 RETURNING updated_at`
	return r.db.QueryRow(ctx, query,
		cat.CategoryID, cat.NameEN, cat.NameAM, cat.IsActive,
	).Scan(&cat.UpdatedAt)
}

func (r *categoryRepository) Delete(ctx context.Context, id uuid.UUID) error {
	_, err := r.db.Exec(ctx, `DELETE FROM categories WHERE category_id=$1`, id)
	return err
}
