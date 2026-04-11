package service

import (
	"context"

	"backend/internal/domain"
	"backend/internal/repository"
	"backend/internal/utils"

	"github.com/google/uuid"
)

type MenuItemService struct {
	repo repository.MenuItemRepository
}

func NewMenuItemService(repo repository.MenuItemRepository) *MenuItemService {
	return &MenuItemService{repo: repo}
}

func (s *MenuItemService) Create(ctx context.Context, req domain.CreateMenuItemRequest) (*domain.MenuItem, error) {
	item := &domain.MenuItem{
		MenuItemID:    uuid.New(),
		HotelID:       req.HotelID,
		CategoryID:    req.CategoryID,
		ChefID:        req.ChefID,
		NameEN:        req.NameEN,
		NameAM:        req.NameAM,
		DescriptionEN: req.DescriptionEN,
		DescriptionAM: req.DescriptionAM,
		Price:         req.Price,
		ImageURL:      req.ImageURL,
		VideoURL:      req.VideoURL,
		IsSpecial:     req.IsSpecial,
		IsAvailable:   true,
		ViewCount:     0,
		Slug:          utils.GenerateSlug(req.NameEN),
	}
	if req.IsAvailable != nil {
		item.IsAvailable = *req.IsAvailable
	}
	if err := s.repo.Create(ctx, item); err != nil {
		return nil, err
	}
	return item, nil
}

func (s *MenuItemService) GetByID(ctx context.Context, id uuid.UUID) (*domain.MenuItem, error) {
	return s.repo.GetByID(ctx, id)
}

func (s *MenuItemService) GetDetailBySlug(ctx context.Context, slug string) (*domain.MenuItemDetail, error) {
	return s.repo.GetDetailBySlug(ctx, slug)
}

func (s *MenuItemService) GetDetailByID(ctx context.Context, id uuid.UUID) (*domain.MenuItemDetail, error) {
	return s.repo.GetDetailByID(ctx, id)
}

func (s *MenuItemService) GetByHotelID(ctx context.Context, hotelID uuid.UUID) ([]domain.MenuItem, error) {
	return s.repo.GetByHotelID(ctx, hotelID)
}

func (s *MenuItemService) GetByCategoryID(ctx context.Context, categoryID uuid.UUID) ([]domain.MenuItem, error) {
	return s.repo.GetByCategoryID(ctx, categoryID)
}

func (s *MenuItemService) Update(ctx context.Context, id uuid.UUID, req domain.UpdateMenuItemRequest) (*domain.MenuItem, error) {
	item, err := s.repo.GetByID(ctx, id)
	if err != nil {
		return nil, err
	}
	if req.CategoryID != nil {
		item.CategoryID = *req.CategoryID
	}
	if req.ChefID != nil {
		item.ChefID = req.ChefID
	}
	if req.NameEN != nil {
		item.NameEN = *req.NameEN
		item.Slug = utils.GenerateSlug(*req.NameEN)
	}
	if req.NameAM != nil {
		item.NameAM = *req.NameAM
	}
	if req.DescriptionEN != nil {
		item.DescriptionEN = *req.DescriptionEN
	}
	if req.DescriptionAM != nil {
		item.DescriptionAM = *req.DescriptionAM
	}
	if req.Price != nil {
		item.Price = *req.Price
	}
	if req.ImageURL != nil {
		item.ImageURL = *req.ImageURL
	}
	if req.VideoURL != nil {
		item.VideoURL = *req.VideoURL
	}
	if req.IsSpecial != nil {
		item.IsSpecial = *req.IsSpecial
	}
	if req.IsAvailable != nil {
		item.IsAvailable = *req.IsAvailable
	}
	if err := s.repo.Update(ctx, item); err != nil {
		return nil, err
	}
	return item, nil
}

func (s *MenuItemService) Delete(ctx context.Context, id uuid.UUID) error {
	return s.repo.Delete(ctx, id)
}

func (s *MenuItemService) IncrementViewCount(ctx context.Context, id uuid.UUID) error {
	return s.repo.IncrementViewCount(ctx, id)
}
