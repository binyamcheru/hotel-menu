package repository

import (
	"context"

	"backend/internal/domain"

	"github.com/google/uuid"
	"github.com/jackc/pgx/v5/pgxpool"
)

type ingredientRepository struct {
	db *pgxpool.Pool
}

func NewIngredientRepository(db *pgxpool.Pool) IngredientRepository {
	return &ingredientRepository{db: db}
}

func (r *ingredientRepository) Create(ctx context.Context, ing *domain.Ingredient) error {
	query := `INSERT INTO ingredients (ingredient_id, hotel_id, name, is_allergen, created_at)
			  VALUES ($1, $2, $3, $4, NOW())
			  RETURNING ingredient_id, created_at`
	return r.db.QueryRow(ctx, query,
		ing.IngredientID, ing.HotelID, ing.Name, ing.IsAllergen,
	).Scan(&ing.IngredientID, &ing.CreatedAt)
}

func (r *ingredientRepository) GetByID(ctx context.Context, id uuid.UUID) (*domain.Ingredient, error) {
	ing := &domain.Ingredient{}
	query := `SELECT ingredient_id, hotel_id, name, is_allergen, created_at
			  FROM ingredients WHERE ingredient_id = $1`
	err := r.db.QueryRow(ctx, query, id).Scan(
		&ing.IngredientID, &ing.HotelID, &ing.Name, &ing.IsAllergen, &ing.CreatedAt,
	)
	if err != nil {
		return nil, err
	}
	return ing, nil
}

func (r *ingredientRepository) GetByHotelID(ctx context.Context, hotelID uuid.UUID) ([]domain.Ingredient, error) {
	query := `SELECT ingredient_id, hotel_id, name, is_allergen, created_at
			  FROM ingredients WHERE hotel_id = $1 ORDER BY name`
	rows, err := r.db.Query(ctx, query, hotelID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var ings []domain.Ingredient
	for rows.Next() {
		var i domain.Ingredient
		if err := rows.Scan(&i.IngredientID, &i.HotelID, &i.Name, &i.IsAllergen, &i.CreatedAt); err != nil {
			return nil, err
		}
		ings = append(ings, i)
	}
	return ings, nil
}

func (r *ingredientRepository) Delete(ctx context.Context, id uuid.UUID) error {
	_, err := r.db.Exec(ctx, `DELETE FROM ingredients WHERE ingredient_id=$1`, id)
	return err
}

// MenuItemIngredient repository

type menuItemIngredientRepository struct {
	db *pgxpool.Pool
}

func NewMenuItemIngredientRepository(db *pgxpool.Pool) MenuItemIngredientRepository {
	return &menuItemIngredientRepository{db: db}
}

func (r *menuItemIngredientRepository) Add(ctx context.Context, menuItemID, ingredientID uuid.UUID) error {
	query := `INSERT INTO menu_item_ingredients (menu_item_ingredient_id, menu_item_id, ingredient_id)
			  VALUES (uuid_generate_v4(), $1, $2)
			  ON CONFLICT (menu_item_id, ingredient_id) DO NOTHING`
	_, err := r.db.Exec(ctx, query, menuItemID, ingredientID)
	return err
}

func (r *menuItemIngredientRepository) Remove(ctx context.Context, menuItemID, ingredientID uuid.UUID) error {
	_, err := r.db.Exec(ctx,
		`DELETE FROM menu_item_ingredients WHERE menu_item_id=$1 AND ingredient_id=$2`,
		menuItemID, ingredientID,
	)
	return err
}

func (r *menuItemIngredientRepository) GetByMenuItemID(ctx context.Context, menuItemID uuid.UUID) ([]domain.Ingredient, error) {
	query := `SELECT i.ingredient_id, i.hotel_id, i.name, i.is_allergen, i.created_at
			  FROM ingredients i
			  JOIN menu_item_ingredients mii ON mii.ingredient_id = i.ingredient_id
			  WHERE mii.menu_item_id = $1
			  ORDER BY i.name`
	rows, err := r.db.Query(ctx, query, menuItemID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var ings []domain.Ingredient
	for rows.Next() {
		var i domain.Ingredient
		if err := rows.Scan(&i.IngredientID, &i.HotelID, &i.Name, &i.IsAllergen, &i.CreatedAt); err != nil {
			return nil, err
		}
		ings = append(ings, i)
	}
	return ings, nil
}

func (r *menuItemIngredientRepository) Exists(ctx context.Context, menuItemID, ingredientID uuid.UUID) (bool, error) {
	var exists bool
	query := `SELECT EXISTS(SELECT 1 FROM menu_item_ingredients WHERE menu_item_id=$1 AND ingredient_id=$2)`
	err := r.db.QueryRow(ctx, query, menuItemID, ingredientID).Scan(&exists)
	return exists, err
}
