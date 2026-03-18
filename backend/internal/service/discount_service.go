package service

import (
	"context"

	"backend/internal/domain"
	"backend/internal/repository"

	"github.com/google/uuid"
)

type DiscountService struct {
	repo repository.DiscountRepository
}

func NewDiscountService(repo repository.DiscountRepository) *DiscountService {
	return &DiscountService{repo: repo}
}

func (s *DiscountService) Create(ctx context.Context, req domain.CreateDiscountRequest) (*domain.Discount, error) {
	d := &domain.Discount{
		DiscountID: uuid.New(),
		MenuItemID: req.MenuItemID,
		HotelID:    req.HotelID,
		Percentage: req.Percentage,
		StartDate:  req.StartDate,
		EndDate:    req.EndDate,
		IsActive:   true,
	}
	if req.IsActive != nil {
		d.IsActive = *req.IsActive
	}
	if err := s.repo.Create(ctx, d); err != nil {
		return nil, err
	}
	return d, nil
}

func (s *DiscountService) GetByID(ctx context.Context, id uuid.UUID) (*domain.Discount, error) {
	return s.repo.GetByID(ctx, id)
}

func (s *DiscountService) GetByHotelID(ctx context.Context, hotelID uuid.UUID) ([]domain.Discount, error) {
	return s.repo.GetByHotelID(ctx, hotelID)
}

func (s *DiscountService) GetActiveByMenuItemID(ctx context.Context, menuItemID uuid.UUID) (*domain.Discount, error) {
	return s.repo.GetActiveByMenuItemID(ctx, menuItemID)
}

func (s *DiscountService) Update(ctx context.Context, id uuid.UUID, req domain.UpdateDiscountRequest) (*domain.Discount, error) {
	d, err := s.repo.GetByID(ctx, id)
	if err != nil {
		return nil, err
	}
	if req.Percentage != nil {
		d.Percentage = *req.Percentage
	}
	if req.StartDate != nil {
		d.StartDate = *req.StartDate
	}
	if req.EndDate != nil {
		d.EndDate = *req.EndDate
	}
	if req.IsActive != nil {
		d.IsActive = *req.IsActive
	}
	if err := s.repo.Update(ctx, d); err != nil {
		return nil, err
	}
	return d, nil
}

func (s *DiscountService) Delete(ctx context.Context, id uuid.UUID) error {
	return s.repo.Delete(ctx, id)
}
