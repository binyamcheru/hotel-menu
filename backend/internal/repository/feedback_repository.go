package repository

import (
	"context"

	"backend/internal/domain"

	"github.com/google/uuid"
	"github.com/jackc/pgx/v5/pgxpool"
)

type feedbackRepository struct {
	db *pgxpool.Pool
}

func NewFeedbackRepository(db *pgxpool.Pool) FeedbackRepository {
	return &feedbackRepository{db: db}
}

func (r *feedbackRepository) Create(ctx context.Context, fb *domain.Feedback) error {
	query := `INSERT INTO feedback (feedback_id, hotel_id, menu_item_id, message, created_at)
			  VALUES ($1, $2, $3, $4, NOW())
			  RETURNING feedback_id, created_at`
	return r.db.QueryRow(ctx, query,
		fb.FeedbackID, fb.HotelID, fb.MenuItemID, fb.Message,
	).Scan(&fb.FeedbackID, &fb.CreatedAt)
}

func (r *feedbackRepository) GetByHotelID(ctx context.Context, hotelID uuid.UUID) ([]domain.Feedback, error) {
	query := `SELECT feedback_id, hotel_id, menu_item_id, message, created_at
			  FROM feedback WHERE hotel_id = $1 ORDER BY created_at DESC`
	rows, err := r.db.Query(ctx, query, hotelID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var fbs []domain.Feedback
	for rows.Next() {
		var f domain.Feedback
		if err := rows.Scan(&f.FeedbackID, &f.HotelID, &f.MenuItemID,
			&f.Message, &f.CreatedAt); err != nil {
			return nil, err
		}
		fbs = append(fbs, f)
	}
	return fbs, nil
}

func (r *feedbackRepository) Delete(ctx context.Context, id uuid.UUID) error {
	_, err := r.db.Exec(ctx, `DELETE FROM feedback WHERE feedback_id=$1`, id)
	return err
}
