package repository

import (
	"context"

	"backend/internal/domain"

	"github.com/google/uuid"
)

// HotelRepository defines the interface for hotel data access.
type HotelRepository interface {
	Create(ctx context.Context, hotel *domain.Hotel) error
	GetByID(ctx context.Context, id uuid.UUID) (*domain.Hotel, error)
	GetAll(ctx context.Context) ([]domain.Hotel, error)
	Update(ctx context.Context, hotel *domain.Hotel) error
	Delete(ctx context.Context, id uuid.UUID) error
}

// UserRepository defines the interface for user data access.
type UserRepository interface {
	Create(ctx context.Context, user *domain.User) error
	GetByID(ctx context.Context, id uuid.UUID) (*domain.User, error)
	GetByPhoneNo(ctx context.Context, phoneNo string) (*domain.User, error)
	GetByHotelID(ctx context.Context, hotelID uuid.UUID) ([]domain.User, error)
	Update(ctx context.Context, user *domain.User) error
	Delete(ctx context.Context, id uuid.UUID) error
}

// CategoryRepository defines the interface for category data access.
type CategoryRepository interface {
	Create(ctx context.Context, category *domain.Category) error
	GetByID(ctx context.Context, id uuid.UUID) (*domain.Category, error)
	GetByHotelID(ctx context.Context, hotelID uuid.UUID) ([]domain.Category, error)
	Update(ctx context.Context, category *domain.Category) error
	Delete(ctx context.Context, id uuid.UUID) error
}

// ChefRepository defines the interface for chef data access.
type ChefRepository interface {
	Create(ctx context.Context, chef *domain.Chef) error
	GetByID(ctx context.Context, id uuid.UUID) (*domain.Chef, error)
	GetByHotelID(ctx context.Context, hotelID uuid.UUID) ([]domain.Chef, error)
	Update(ctx context.Context, chef *domain.Chef) error
	Delete(ctx context.Context, id uuid.UUID) error
}

// MenuItemRepository defines the interface for menu item data access.
type MenuItemRepository interface {
	Create(ctx context.Context, item *domain.MenuItem) error
	GetByID(ctx context.Context, id uuid.UUID) (*domain.MenuItem, error)
	GetBySlug(ctx context.Context, slug string) (*domain.MenuItem, error)
	GetByHotelID(ctx context.Context, hotelID uuid.UUID) ([]domain.MenuItem, error)
	GetByCategoryID(ctx context.Context, categoryID uuid.UUID) ([]domain.MenuItem, error)
	GetDetailByID(ctx context.Context, id uuid.UUID) (*domain.MenuItemDetail, error)
	GetDetailBySlug(ctx context.Context, slug string) (*domain.MenuItemDetail, error)
	Update(ctx context.Context, item *domain.MenuItem) error
	Delete(ctx context.Context, id uuid.UUID) error
	IncrementViewCount(ctx context.Context, id uuid.UUID) error
}

// IngredientRepository defines the interface for ingredient data access.
type IngredientRepository interface {
	Create(ctx context.Context, ingredient *domain.Ingredient) error
	GetByID(ctx context.Context, id uuid.UUID) (*domain.Ingredient, error)
	GetByHotelID(ctx context.Context, hotelID uuid.UUID) ([]domain.Ingredient, error)
	Delete(ctx context.Context, id uuid.UUID) error
}

// MenuItemIngredientRepository defines the interface for menu item ingredient join data.
type MenuItemIngredientRepository interface {
	Add(ctx context.Context, menuItemID, ingredientID uuid.UUID) error
	Remove(ctx context.Context, menuItemID, ingredientID uuid.UUID) error
	GetByMenuItemID(ctx context.Context, menuItemID uuid.UUID) ([]domain.Ingredient, error)
	Exists(ctx context.Context, menuItemID, ingredientID uuid.UUID) (bool, error)
}

// RatingRepository defines the interface for rating data access.
type RatingRepository interface {
	Create(ctx context.Context, rating *domain.Rating) error
	GetByMenuItemID(ctx context.Context, menuItemID uuid.UUID) ([]domain.Rating, error)
	GetByHotelID(ctx context.Context, hotelID uuid.UUID) ([]domain.Rating, error)
	GetAverageByMenuItemID(ctx context.Context, menuItemID uuid.UUID) (float64, int, error)
	Delete(ctx context.Context, id uuid.UUID) error
}

// DiscountRepository defines the interface for discount data access.
type DiscountRepository interface {
	Create(ctx context.Context, discount *domain.Discount) error
	GetByID(ctx context.Context, id uuid.UUID) (*domain.Discount, error)
	GetByHotelID(ctx context.Context, hotelID uuid.UUID) ([]domain.Discount, error)
	GetActiveByMenuItemID(ctx context.Context, menuItemID uuid.UUID) (*domain.Discount, error)
	Update(ctx context.Context, discount *domain.Discount) error
	Delete(ctx context.Context, id uuid.UUID) error
}

// HotelScanRepository defines the interface for hotel scan analytics data.
type HotelScanRepository interface {
	Create(ctx context.Context, scan *domain.HotelScan) error
	CountByHotelID(ctx context.Context, hotelID uuid.UUID) (int64, error)
}

// MenuViewRepository defines the interface for menu view analytics data.
type MenuViewRepository interface {
	Create(ctx context.Context, view *domain.MenuView) error
	CountByHotelID(ctx context.Context, hotelID uuid.UUID) (int64, error)
	CountByMenuItemID(ctx context.Context, menuItemID uuid.UUID) (int64, error)
}

// FeedbackRepository defines the interface for feedback data access.
type FeedbackRepository interface {
	Create(ctx context.Context, feedback *domain.Feedback) error
	GetByHotelID(ctx context.Context, hotelID uuid.UUID) ([]domain.Feedback, error)
	Delete(ctx context.Context, id uuid.UUID) error
}
