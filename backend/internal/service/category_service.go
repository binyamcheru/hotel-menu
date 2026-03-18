package service

import (
	"context"

	"backend/internal/domain"
	"backend/internal/repository"

	"github.com/google/uuid"
)

type CategoryService struct {
	repo repository.CategoryRepository
}

func NewCategoryService(repo repository.CategoryRepository) *CategoryService {
	return &CategoryService{repo: repo}
}

func (s *CategoryService) Create(ctx context.Context, req domain.CreateCategoryRequest) (*domain.Category, error) {
	cat := &domain.Category{
		CategoryID: uuid.New(),
		HotelID:    req.HotelID,
		NameEN:     req.NameEN,
		NameAM:     req.NameAM,
		IsActive:   true,
	}
	if req.IsActive != nil {
		cat.IsActive = *req.IsActive
	}
	if err := s.repo.Create(ctx, cat); err != nil {
		return nil, err
	}
	return cat, nil
}

func (s *CategoryService) GetByID(ctx context.Context, id uuid.UUID) (*domain.Category, error) {
	return s.repo.GetByID(ctx, id)
}

func (s *CategoryService) GetByHotelID(ctx context.Context, hotelID uuid.UUID) ([]domain.Category, error) {
	return s.repo.GetByHotelID(ctx, hotelID)
}

func (s *CategoryService) Update(ctx context.Context, id uuid.UUID, req domain.UpdateCategoryRequest) (*domain.Category, error) {
	cat, err := s.repo.GetByID(ctx, id)
	if err != nil {
		return nil, err
	}
	if req.NameEN != nil {
		cat.NameEN = *req.NameEN
	}
	if req.NameAM != nil {
		cat.NameAM = *req.NameAM
	}
	if req.IsActive != nil {
		cat.IsActive = *req.IsActive
	}
	if err := s.repo.Update(ctx, cat); err != nil {
		return nil, err
	}
	return cat, nil
}

func (s *CategoryService) Delete(ctx context.Context, id uuid.UUID) error {
	return s.repo.Delete(ctx, id)
}
