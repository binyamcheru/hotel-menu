package service

import (
	"context"

	"backend/internal/domain"
	"backend/internal/repository"

	"github.com/google/uuid"
)

type FeedbackService struct {
	repo repository.FeedbackRepository
}

func NewFeedbackService(repo repository.FeedbackRepository) *FeedbackService {
	return &FeedbackService{repo: repo}
}

func (s *FeedbackService) Create(ctx context.Context, req domain.CreateFeedbackRequest) (*domain.Feedback, error) {
	fb := &domain.Feedback{
		FeedbackID: uuid.New(),
		HotelID:    req.HotelID,
		MenuItemID: req.MenuItemID,
		Message:    req.Message,
	}
	if err := s.repo.Create(ctx, fb); err != nil {
		return nil, err
	}
	return fb, nil
}

func (s *FeedbackService) GetByHotelID(ctx context.Context, hotelID uuid.UUID) ([]domain.Feedback, error) {
	return s.repo.GetByHotelID(ctx, hotelID)
}

func (s *FeedbackService) Delete(ctx context.Context, id uuid.UUID) error {
	return s.repo.Delete(ctx, id)
}
