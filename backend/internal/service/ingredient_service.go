package service

import (
	"context"

	"backend/internal/domain"
	"backend/internal/repository"

	"github.com/google/uuid"
)

type IngredientService struct {
	ingredientRepo         repository.IngredientRepository
	menuItemIngredientRepo repository.MenuItemIngredientRepository
}

func NewIngredientService(
	ingredientRepo repository.IngredientRepository,
	menuItemIngredientRepo repository.MenuItemIngredientRepository,
) *IngredientService {
	return &IngredientService{
		ingredientRepo:         ingredientRepo,
		menuItemIngredientRepo: menuItemIngredientRepo,
	}
}

func (s *IngredientService) Create(ctx context.Context, req domain.CreateIngredientRequest) (*domain.Ingredient, error) {
	ing := &domain.Ingredient{
		IngredientID: uuid.New(),
		HotelID:      req.HotelID,
		Name:         req.Name,
		IsAllergen:   req.IsAllergen,
	}
	if err := s.ingredientRepo.Create(ctx, ing); err != nil {
		return nil, err
	}
	return ing, nil
}

func (s *IngredientService) GetByHotelID(ctx context.Context, hotelID uuid.UUID) ([]domain.Ingredient, error) {
	return s.ingredientRepo.GetByHotelID(ctx, hotelID)
}

func (s *IngredientService) Delete(ctx context.Context, id uuid.UUID) error {
	return s.ingredientRepo.Delete(ctx, id)
}

func (s *IngredientService) AddToMenuItem(ctx context.Context, menuItemID, ingredientID uuid.UUID) error {
	return s.menuItemIngredientRepo.Add(ctx, menuItemID, ingredientID)
}

func (s *IngredientService) RemoveFromMenuItem(ctx context.Context, menuItemID, ingredientID uuid.UUID) error {
	return s.menuItemIngredientRepo.Remove(ctx, menuItemID, ingredientID)
}

func (s *IngredientService) GetByMenuItemID(ctx context.Context, menuItemID uuid.UUID) ([]domain.Ingredient, error) {
	return s.menuItemIngredientRepo.GetByMenuItemID(ctx, menuItemID)
}
