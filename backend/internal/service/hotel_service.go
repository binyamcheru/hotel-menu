package service

import (
	"context"

	"backend/internal/domain"
	"backend/internal/repository"

	"github.com/google/uuid"
)

type HotelService struct {
	repo repository.HotelRepository
}

func NewHotelService(repo repository.HotelRepository) *HotelService {
	return &HotelService{repo: repo}
}

func (s *HotelService) Create(ctx context.Context, req domain.CreateHotelRequest) (*domain.Hotel, error) {
	hotel := &domain.Hotel{
		HotelID:          uuid.New(),
		Name:             req.Name,
		Logo:             req.Logo,
		Address:          req.Address,
		Phone:            req.Phone,
		LanguageSettings: req.LanguageSettings,
	}
	if hotel.LanguageSettings == "" {
		hotel.LanguageSettings = "en"
	}
	if err := s.repo.Create(ctx, hotel); err != nil {
		return nil, err
	}
	return hotel, nil
}

func (s *HotelService) GetByID(ctx context.Context, id uuid.UUID) (*domain.Hotel, error) {
	return s.repo.GetByID(ctx, id)
}

func (s *HotelService) GetAll(ctx context.Context) ([]domain.Hotel, error) {
	return s.repo.GetAll(ctx)
}

func (s *HotelService) Update(ctx context.Context, id uuid.UUID, req domain.UpdateHotelRequest) (*domain.Hotel, error) {
	hotel, err := s.repo.GetByID(ctx, id)
	if err != nil {
		return nil, err
	}
	if req.Name != nil {
		hotel.Name = *req.Name
	}
	if req.Logo != nil {
		hotel.Logo = *req.Logo
	}
	if req.Address != nil {
		hotel.Address = *req.Address
	}
	if req.Phone != nil {
		hotel.Phone = *req.Phone
	}
	if req.LanguageSettings != nil {
		hotel.LanguageSettings = *req.LanguageSettings
	}
	if err := s.repo.Update(ctx, hotel); err != nil {
		return nil, err
	}
	return hotel, nil
}

func (s *HotelService) Delete(ctx context.Context, id uuid.UUID) error {
	return s.repo.Delete(ctx, id)
}
