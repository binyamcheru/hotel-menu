package service

import (
	"context"

	"backend/internal/domain"
	"backend/internal/repository"

	"github.com/google/uuid"
	"github.com/jackc/pgconn"
)

type RatingService struct {
	repo repository.RatingRepository
}

func NewRatingService(repo repository.RatingRepository) *RatingService {
	return &RatingService{repo: repo}
}

func (s *RatingService) Create(ctx context.Context, req domain.CreateRatingRequest) (*domain.Rating, error) {
	if req.Rating < 1 || req.Rating > 5 {
		return nil, domain.ErrInvalidRating
	}

	rating := &domain.Rating{
		RatingID:    uuid.New(),
		MenuItemID:  req.MenuItemID,
		HotelID:     req.HotelID,
		Rating:      req.Rating,
		Fingerprint: req.Fingerprint,
	}

	err := s.repo.Create(ctx, rating)
	if err != nil {
		if isUniqueViolation(err) {
			return nil, domain.ErrAlreadyRated
		}
		return nil, err
	}
	return rating, nil
}

func isUniqueViolation(err error) bool {
	if pgErr, ok := err.(*pgconn.PgError); ok {
		return pgErr.Code == "23505"
	}
	return false
}

func (s *RatingService) GetByMenuItemID(ctx context.Context, menuItemID uuid.UUID) ([]domain.Rating, error) {
	return s.repo.GetByMenuItemID(ctx, menuItemID)
}

func (s *RatingService) GetByHotelID(ctx context.Context, hotelID uuid.UUID) ([]domain.Rating, error) {
	return s.repo.GetByHotelID(ctx, hotelID)
}

func (s *RatingService) GetAverage(ctx context.Context, menuItemID uuid.UUID) (float64, int, error) {
	return s.repo.GetAverageByMenuItemID(ctx, menuItemID)
}

func (s *RatingService) Delete(ctx context.Context, id uuid.UUID) error {
	return s.repo.Delete(ctx, id)
}
