package repository

import (
	"context"

	"backend/internal/domain"

	"github.com/google/uuid"
	"github.com/jackc/pgx/v5/pgxpool"
)

type ratingRepository struct {
	db *pgxpool.Pool
}

func NewRatingRepository(db *pgxpool.Pool) RatingRepository {
	return &ratingRepository{db: db}
}

func (r *ratingRepository) Create(ctx context.Context, rating *domain.Rating) error {
	query := `INSERT INTO ratings (rating_id, menu_item_id, hotel_id, rating, comment, language, fingerprint, created_at)
			  VALUES ($1, $2, $3, $4, $5, $6, $7, NOW())
			  RETURNING rating_id, created_at`
	return r.db.QueryRow(ctx, query,
		rating.RatingID, rating.MenuItemID, rating.HotelID,
		rating.Rating, rating.Comment, rating.Language, rating.Fingerprint,
	).Scan(&rating.RatingID, &rating.CreatedAt)
}

func (r *ratingRepository) GetByMenuItemID(ctx context.Context, menuItemID uuid.UUID) ([]domain.Rating, error) {
	query := `SELECT rating_id, menu_item_id, hotel_id, rating, comment, language, created_at
			  FROM ratings WHERE menu_item_id = $1 ORDER BY created_at DESC`
	rows, err := r.db.Query(ctx, query, menuItemID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var ratings []domain.Rating
	for rows.Next() {
		var rt domain.Rating
		if err := rows.Scan(&rt.RatingID, &rt.MenuItemID, &rt.HotelID,
			&rt.Rating, &rt.Comment, &rt.Language, &rt.CreatedAt); err != nil {
			return nil, err
		}
		ratings = append(ratings, rt)
	}
	return ratings, nil
}

func (r *ratingRepository) GetByHotelID(ctx context.Context, hotelID uuid.UUID) ([]domain.Rating, error) {
	query := `SELECT rating_id, menu_item_id, hotel_id, rating, comment, language, created_at
			  FROM ratings WHERE hotel_id = $1 ORDER BY created_at DESC`
	rows, err := r.db.Query(ctx, query, hotelID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var ratings []domain.Rating
	for rows.Next() {
		var rt domain.Rating
		if err := rows.Scan(&rt.RatingID, &rt.MenuItemID, &rt.HotelID,
			&rt.Rating, &rt.Comment, &rt.Language, &rt.CreatedAt); err != nil {
			return nil, err
		}
		ratings = append(ratings, rt)
	}
	return ratings, nil
}

func (r *ratingRepository) GetAverageByMenuItemID(ctx context.Context, menuItemID uuid.UUID) (float64, int, error) {
	var avg float64
	var count int
	query := `SELECT COALESCE(AVG(rating), 0), COUNT(*) FROM ratings WHERE menu_item_id = $1`
	err := r.db.QueryRow(ctx, query, menuItemID).Scan(&avg, &count)
	return avg, count, err
}

func (r *ratingRepository) Delete(ctx context.Context, id uuid.UUID) error {
	_, err := r.db.Exec(ctx, `DELETE FROM ratings WHERE rating_id=$1`, id)
	return err
}
