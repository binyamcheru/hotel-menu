package service

import (
	"context"

	"backend/internal/domain"
	"backend/internal/repository"

	"github.com/google/uuid"
)

type ChefService struct {
	repo repository.ChefRepository
}

func NewChefService(repo repository.ChefRepository) *ChefService {
	return &ChefService{repo: repo}
}

func (s *ChefService) Create(ctx context.Context, req domain.CreateChefRequest) (*domain.Chef, error) {
	chef := &domain.Chef{
		ChefID:   uuid.New(),
		HotelID:  req.HotelID,
		Name:     req.Name,
		BioEN:    req.BioEN,
		BioAM:    req.BioAM,
		ImageURL: req.ImageURL,
	}
	if err := s.repo.Create(ctx, chef); err != nil {
		return nil, err
	}
	return chef, nil
}

func (s *ChefService) GetByID(ctx context.Context, id uuid.UUID) (*domain.Chef, error) {
	return s.repo.GetByID(ctx, id)
}

func (s *ChefService) GetByHotelID(ctx context.Context, hotelID uuid.UUID) ([]domain.Chef, error) {
	return s.repo.GetByHotelID(ctx, hotelID)
}

func (s *ChefService) Update(ctx context.Context, id uuid.UUID, req domain.UpdateChefRequest) (*domain.Chef, error) {
	chef, err := s.repo.GetByID(ctx, id)
	if err != nil {
		return nil, err
	}
	if req.Name != nil {
		chef.Name = *req.Name
	}
	if req.BioEN != nil {
		chef.BioEN = *req.BioEN
	}
	if req.BioAM != nil {
		chef.BioAM = *req.BioAM
	}
	if req.ImageURL != nil {
		chef.ImageURL = *req.ImageURL
	}
	if err := s.repo.Update(ctx, chef); err != nil {
		return nil, err
	}
	return chef, nil
}

func (s *ChefService) Delete(ctx context.Context, id uuid.UUID) error {
	return s.repo.Delete(ctx, id)
}
