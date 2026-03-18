package repository

import (
	"context"

	"backend/internal/domain"

	"github.com/google/uuid"
	"github.com/jackc/pgx/v5/pgxpool"
)

type chefRepository struct {
	db *pgxpool.Pool
}

func NewChefRepository(db *pgxpool.Pool) ChefRepository {
	return &chefRepository{db: db}
}

func (r *chefRepository) Create(ctx context.Context, chef *domain.Chef) error {
	query := `INSERT INTO chefs (chef_id, hotel_id, name, bio_en, bio_am, image_url, created_at, updated_at)
			  VALUES ($1, $2, $3, $4, $5, $6, NOW(), NOW())
			  RETURNING chef_id, created_at, updated_at`
	return r.db.QueryRow(ctx, query,
		chef.ChefID, chef.HotelID, chef.Name, chef.BioEN, chef.BioAM, chef.ImageURL,
	).Scan(&chef.ChefID, &chef.CreatedAt, &chef.UpdatedAt)
}

func (r *chefRepository) GetByID(ctx context.Context, id uuid.UUID) (*domain.Chef, error) {
	chef := &domain.Chef{}
	query := `SELECT chef_id, hotel_id, name, bio_en, bio_am, image_url, created_at, updated_at
			  FROM chefs WHERE chef_id = $1`
	err := r.db.QueryRow(ctx, query, id).Scan(
		&chef.ChefID, &chef.HotelID, &chef.Name, &chef.BioEN,
		&chef.BioAM, &chef.ImageURL, &chef.CreatedAt, &chef.UpdatedAt,
	)
	if err != nil {
		return nil, err
	}
	return chef, nil
}

func (r *chefRepository) GetByHotelID(ctx context.Context, hotelID uuid.UUID) ([]domain.Chef, error) {
	query := `SELECT chef_id, hotel_id, name, bio_en, bio_am, image_url, created_at, updated_at
			  FROM chefs WHERE hotel_id = $1 ORDER BY created_at DESC`
	rows, err := r.db.Query(ctx, query, hotelID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var chefs []domain.Chef
	for rows.Next() {
		var c domain.Chef
		if err := rows.Scan(&c.ChefID, &c.HotelID, &c.Name, &c.BioEN,
			&c.BioAM, &c.ImageURL, &c.CreatedAt, &c.UpdatedAt); err != nil {
			return nil, err
		}
		chefs = append(chefs, c)
	}
	return chefs, nil
}

func (r *chefRepository) Update(ctx context.Context, chef *domain.Chef) error {
	query := `UPDATE chefs SET name=$2, bio_en=$3, bio_am=$4, image_url=$5, updated_at=NOW()
			  WHERE chef_id=$1 RETURNING updated_at`
	return r.db.QueryRow(ctx, query,
		chef.ChefID, chef.Name, chef.BioEN, chef.BioAM, chef.ImageURL,
	).Scan(&chef.UpdatedAt)
}

func (r *chefRepository) Delete(ctx context.Context, id uuid.UUID) error {
	_, err := r.db.Exec(ctx, `DELETE FROM chefs WHERE chef_id=$1`, id)
	return err
}
