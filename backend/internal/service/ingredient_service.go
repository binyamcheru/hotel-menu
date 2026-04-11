package service

import (
	"context"
	"fmt"
	"strings"

	"backend/internal/domain"
	"backend/internal/repository"

	"github.com/google/uuid"
)

type IngredientService struct {
	ingredientRepo         repository.IngredientRepository
	menuItemIngredientRepo repository.MenuItemIngredientRepository
	menuItemRepo           repository.MenuItemRepository
}

func NewIngredientService(
	ingredientRepo repository.IngredientRepository,
	menuItemIngredientRepo repository.MenuItemIngredientRepository,
	menuItemRepo repository.MenuItemRepository,
) *IngredientService {
	return &IngredientService{
		ingredientRepo:         ingredientRepo,
		menuItemIngredientRepo: menuItemIngredientRepo,
		menuItemRepo:           menuItemRepo,
	}
}

// Create validates and persists a new ingredient.
func (s *IngredientService) Create(ctx context.Context, req domain.CreateIngredientRequest) (*domain.Ingredient, error) {
	name := strings.TrimSpace(req.Name)
	if name == "" {
		return nil, fmt.Errorf("ingredient name cannot be empty")
	}

	ing := &domain.Ingredient{
		IngredientID: uuid.New(),
		HotelID:      req.HotelID,
		Name:         name,
		IsAllergen:   req.IsAllergen,
	}
	if err := s.ingredientRepo.Create(ctx, ing); err != nil {
		return nil, err
	}
	return ing, nil
}

// GetByHotelID returns all ingredients for a given hotel.
func (s *IngredientService) GetByHotelID(ctx context.Context, hotelID uuid.UUID) ([]domain.Ingredient, error) {
	return s.ingredientRepo.GetByHotelID(ctx, hotelID)
}

// Delete verifies the ingredient exists and then removes it.
func (s *IngredientService) Delete(ctx context.Context, id uuid.UUID) error {
	if _, err := s.ingredientRepo.GetByID(ctx, id); err != nil {
		return domain.ErrIngredientNotFound
	}
	return s.ingredientRepo.Delete(ctx, id)
}

// AddToMenuItem links an ingredient to a menu item after full validation.
func (s *IngredientService) AddToMenuItem(ctx context.Context, menuItemID, ingredientID uuid.UUID) error {
	// 1. Verify ingredient exists
	ingredient, err := s.ingredientRepo.GetByID(ctx, ingredientID)
	if err != nil {
		return domain.ErrIngredientNotFound
	}

	// 2. Verify menu item exists
	menuItem, err := s.menuItemRepo.GetByID(ctx, menuItemID)
	if err != nil {
		return domain.ErrMenuItemNotFound
	}

	// 3. Ensure both belong to the same hotel
	if ingredient.HotelID != menuItem.HotelID {
		return domain.ErrHotelMismatch
	}

	// 4. Check for duplicate relation
	exists, err := s.menuItemIngredientRepo.Exists(ctx, menuItemID, ingredientID)
	if err != nil {
		return fmt.Errorf("failed to check existing relation: %w", err)
	}
	if exists {
		return domain.ErrIngredientAlreadyLinked
	}

	// 5. Create the link
	return s.menuItemIngredientRepo.Add(ctx, menuItemID, ingredientID)
}

// BulkAddToMenuItem links multiple ingredients to a menu item, skipping duplicates.
func (s *IngredientService) BulkAddToMenuItem(ctx context.Context, menuItemID uuid.UUID, ingredientIDs []uuid.UUID) (*domain.BulkAddResult, error) {
	// 1. Verify menu item exists
	menuItem, err := s.menuItemRepo.GetByID(ctx, menuItemID)
	if err != nil {
		return nil, domain.ErrMenuItemNotFound
	}

	result := &domain.BulkAddResult{}

	for _, ingredientID := range ingredientIDs {
		// 2. Verify ingredient exists
		ingredient, err := s.ingredientRepo.GetByID(ctx, ingredientID)
		if err != nil {
			return nil, domain.ErrIngredientNotFound
		}

		// 3. Ensure same hotel
		if ingredient.HotelID != menuItem.HotelID {
			return nil, fmt.Errorf("ingredient %s does not belong to the same hotel as the menu item", ingredientID)
		}

		// 4. Check duplicate — skip if already linked
		exists, err := s.menuItemIngredientRepo.Exists(ctx, menuItemID, ingredientID)
		if err != nil {
			return nil, fmt.Errorf("failed to check relation for ingredient %s: %w", ingredientID, err)
		}
		if exists {
			result.Skipped = append(result.Skipped, ingredientID)
			continue
		}

		// 5. Add the link
		if err := s.menuItemIngredientRepo.Add(ctx, menuItemID, ingredientID); err != nil {
			return nil, fmt.Errorf("failed to add ingredient %s: %w", ingredientID, err)
		}
		result.Added = append(result.Added, ingredientID)
	}

	return result, nil
}

// RemoveFromMenuItem removes the link between an ingredient and a menu item.
func (s *IngredientService) RemoveFromMenuItem(ctx context.Context, menuItemID, ingredientID uuid.UUID) error {
	return s.menuItemIngredientRepo.Remove(ctx, menuItemID, ingredientID)
}

// GetByMenuItemID returns all ingredients linked to a menu item.
func (s *IngredientService) GetByMenuItemID(ctx context.Context, menuItemID uuid.UUID) ([]domain.Ingredient, error) {
	return s.menuItemIngredientRepo.GetByMenuItemID(ctx, menuItemID)
}
