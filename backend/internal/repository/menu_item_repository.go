package repository

import (
	"context"
	"math"

	"backend/internal/domain"

	"github.com/google/uuid"
	"github.com/jackc/pgx/v5/pgxpool"
)

type menuItemRepository struct {
	db *pgxpool.Pool
}

func NewMenuItemRepository(db *pgxpool.Pool) MenuItemRepository {
	return &menuItemRepository{db: db}
}

func (r *menuItemRepository) Create(ctx context.Context, item *domain.MenuItem) error {
	query := `INSERT INTO menu_items (menu_item_id, hotel_id, category_id, chef_id, name_en, name_am,
			  description_en, description_am, price, image_url, video_url, is_special, is_available, view_count, slug, created_at, updated_at)
			  VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15, NOW(), NOW())
			  RETURNING menu_item_id, created_at, updated_at`
	return r.db.QueryRow(ctx, query,
		item.MenuItemID, item.HotelID, item.CategoryID, item.ChefID,
		item.NameEN, item.NameAM, item.DescriptionEN, item.DescriptionAM,
		item.Price, item.ImageURL, item.VideoURL,
		item.IsSpecial, item.IsAvailable, item.ViewCount, item.Slug,
	).Scan(&item.MenuItemID, &item.CreatedAt, &item.UpdatedAt)
}

func (r *menuItemRepository) GetByID(ctx context.Context, id uuid.UUID) (*domain.MenuItem, error) {
	item := &domain.MenuItem{}
	query := `SELECT menu_item_id, hotel_id, category_id, chef_id, name_en, name_am,
			  description_en, description_am, price, image_url, video_url,
			  is_special, is_available, view_count, slug, created_at, updated_at
			  FROM menu_items WHERE menu_item_id = $1`
	err := r.db.QueryRow(ctx, query, id).Scan(
		&item.MenuItemID, &item.HotelID, &item.CategoryID, &item.ChefID,
		&item.NameEN, &item.NameAM, &item.DescriptionEN, &item.DescriptionAM,
		&item.Price, &item.ImageURL, &item.VideoURL,
		&item.IsSpecial, &item.IsAvailable, &item.ViewCount, &item.Slug,
		&item.CreatedAt, &item.UpdatedAt,
	)
	if err != nil {
		return nil, err
	}
	return item, nil
}

func (r *menuItemRepository) GetBySlug(ctx context.Context, slug string) (*domain.MenuItem, error) {
	item := &domain.MenuItem{}
	query := `SELECT menu_item_id, hotel_id, category_id, chef_id, name_en, name_am,
			  description_en, description_am, price, image_url, video_url,
			  is_special, is_available, view_count, slug, created_at, updated_at
			  FROM menu_items WHERE slug = $1`
	err := r.db.QueryRow(ctx, query, slug).Scan(
		&item.MenuItemID, &item.HotelID, &item.CategoryID, &item.ChefID,
		&item.NameEN, &item.NameAM, &item.DescriptionEN, &item.DescriptionAM,
		&item.Price, &item.ImageURL, &item.VideoURL,
		&item.IsSpecial, &item.IsAvailable, &item.ViewCount, &item.Slug,
		&item.CreatedAt, &item.UpdatedAt,
	)
	if err != nil {
		return nil, err
	}
	return item, nil
}

func (r *menuItemRepository) GetByHotelID(ctx context.Context, hotelID uuid.UUID) ([]domain.MenuItem, error) {
	query := `SELECT menu_item_id, hotel_id, category_id, chef_id, name_en, name_am,
			  description_en, description_am, price, image_url, video_url,
			  is_special, is_available, view_count, slug, created_at, updated_at
			  FROM menu_items WHERE hotel_id = $1 ORDER BY created_at DESC`
	rows, err := r.db.Query(ctx, query, hotelID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var items []domain.MenuItem
	for rows.Next() {
		var i domain.MenuItem
		if err := rows.Scan(&i.MenuItemID, &i.HotelID, &i.CategoryID, &i.ChefID,
			&i.NameEN, &i.NameAM, &i.DescriptionEN, &i.DescriptionAM,
			&i.Price, &i.ImageURL, &i.VideoURL,
			&i.IsSpecial, &i.IsAvailable, &i.ViewCount, &i.Slug,
			&i.CreatedAt, &i.UpdatedAt); err != nil {
			return nil, err
		}
		items = append(items, i)
	}
	return items, nil
}

func (r *menuItemRepository) GetByCategoryID(ctx context.Context, categoryID uuid.UUID) ([]domain.MenuItem, error) {
	query := `SELECT menu_item_id, hotel_id, category_id, chef_id, name_en, name_am,
			  description_en, description_am, price, image_url, video_url,
			  is_special, is_available, view_count, slug, created_at, updated_at
			  FROM menu_items WHERE category_id = $1 ORDER BY created_at DESC`
	rows, err := r.db.Query(ctx, query, categoryID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var items []domain.MenuItem
	for rows.Next() {
		var i domain.MenuItem
		if err := rows.Scan(&i.MenuItemID, &i.HotelID, &i.CategoryID, &i.ChefID,
			&i.NameEN, &i.NameAM, &i.DescriptionEN, &i.DescriptionAM,
			&i.Price, &i.ImageURL, &i.VideoURL,
			&i.IsSpecial, &i.IsAvailable, &i.ViewCount, &i.Slug,
			&i.CreatedAt, &i.UpdatedAt); err != nil {
			return nil, err
		}
		items = append(items, i)
	}
	return items, nil
}

func (r *menuItemRepository) Update(ctx context.Context, item *domain.MenuItem) error {
	query := `UPDATE menu_items SET category_id=$2, chef_id=$3, name_en=$4, name_am=$5,
			  description_en=$6, description_am=$7, price=$8, image_url=$9, video_url=$10,
			  is_special=$11, is_available=$12, slug=$13, updated_at=NOW()
			  WHERE menu_item_id=$1 RETURNING updated_at`
	return r.db.QueryRow(ctx, query,
		item.MenuItemID, item.CategoryID, item.ChefID, item.NameEN, item.NameAM,
		item.DescriptionEN, item.DescriptionAM, item.Price, item.ImageURL, item.VideoURL,
		item.IsSpecial, item.IsAvailable, item.Slug,
	).Scan(&item.UpdatedAt)
}

func (r *menuItemRepository) Delete(ctx context.Context, id uuid.UUID) error {
	_, err := r.db.Exec(ctx, `DELETE FROM menu_items WHERE menu_item_id=$1`, id)
	return err
}

func (r *menuItemRepository) IncrementViewCount(ctx context.Context, id uuid.UUID) error {
	_, err := r.db.Exec(ctx, `UPDATE menu_items SET view_count = view_count + 1 WHERE menu_item_id=$1`, id)
	return err
}

func (r *menuItemRepository) GetDetailByID(ctx context.Context, id uuid.UUID) (*domain.MenuItemDetail, error) {
	detail := &domain.MenuItemDetail{}
	detail.Category = &domain.Category{}

	// 1. Fetch MenuItem and Category
	query := `SELECT mi.menu_item_id, mi.hotel_id, mi.category_id, mi.chef_id, mi.name_en, mi.name_am,
			  mi.description_en, mi.description_am, mi.price, mi.image_url, mi.video_url,
			  mi.is_special, mi.is_available, mi.view_count, mi.slug, mi.created_at, mi.updated_at,
			  c.category_id, c.hotel_id, c.name_en, c.name_am, c.is_active, c.created_at, c.updated_at
			  FROM menu_items mi
			  JOIN categories c ON mi.category_id = c.category_id
			  WHERE mi.menu_item_id = $1`
	
	var chefID *uuid.UUID
	err := r.db.QueryRow(ctx, query, id).Scan(
		&detail.MenuItemID, &detail.HotelID, &detail.CategoryID, &chefID,
		&detail.NameEN, &detail.NameAM, &detail.DescriptionEN, &detail.DescriptionAM,
		&detail.Price, &detail.ImageURL, &detail.VideoURL,
		&detail.IsSpecial, &detail.IsAvailable, &detail.ViewCount, &detail.Slug,
		&detail.CreatedAt, &detail.UpdatedAt,
		&detail.Category.CategoryID, &detail.Category.HotelID, &detail.Category.NameEN, &detail.Category.NameAM, 
		&detail.Category.IsActive, &detail.Category.CreatedAt, &detail.Category.UpdatedAt,
	)
	if err != nil {
		return nil, err
	}
	detail.ChefID = chefID

	// 2. Fetch Chef if chef_id is not nil
	if chefID != nil {
		detail.Chef = &domain.Chef{}
		chefQuery := `SELECT chef_id, hotel_id, name, bio_en, bio_am, image_url, created_at, updated_at
					  FROM chefs WHERE chef_id = $1`
		err = r.db.QueryRow(ctx, chefQuery, *chefID).Scan(
			&detail.Chef.ChefID, &detail.Chef.HotelID, &detail.Chef.Name,
			&detail.Chef.BioEN, &detail.Chef.BioAM, &detail.Chef.ImageURL,
			&detail.Chef.CreatedAt, &detail.Chef.UpdatedAt,
		)
		if err != nil {
			// If chef not found for some reason, we can either return error or just leave it nil
			detail.Chef = nil
		}
	}

	// 3. Fetch Ingredients
	ingQuery := `SELECT i.ingredient_id, i.hotel_id, i.name, i.is_allergen, i.created_at
				 FROM ingredients i
				 JOIN menu_item_ingredients mii ON i.ingredient_id = mii.ingredient_id
				 WHERE mii.menu_item_id = $1`
	rows, err := r.db.Query(ctx, ingQuery, id)
	if err == nil {
		defer rows.Close()
		for rows.Next() {
			var ing domain.Ingredient
			if err := rows.Scan(&ing.IngredientID, &ing.HotelID, &ing.Name, &ing.IsAllergen, &ing.CreatedAt); err == nil {
				detail.Ingredients = append(detail.Ingredients, ing)
			}
		}
	}

	// 4. Fetch Active Discount
	discount := &domain.Discount{}
	discountQuery := `SELECT discount_id, menu_item_id, hotel_id, percentage, start_date, end_date, is_active, created_at
					  FROM discounts WHERE menu_item_id = $1 AND is_active = true AND NOW() BETWEEN start_date AND end_date
					  ORDER BY created_at DESC LIMIT 1`
	err = r.db.QueryRow(ctx, discountQuery, id).Scan(
		&discount.DiscountID, &discount.MenuItemID, &discount.HotelID,
		&discount.Percentage, &discount.StartDate, &discount.EndDate, &discount.IsActive, &discount.CreatedAt,
	)
	if err == nil {
		detail.Discount = discount
		discounted := math.Round(detail.Price*(1-discount.Percentage/100)*100) / 100
		detail.DiscountedPrice = &discounted
	}

	return detail, nil
}

func (r *menuItemRepository) GetDetailBySlug(ctx context.Context, slug string) (*domain.MenuItemDetail, error) {
	// First get the ID by slug
	var id uuid.UUID
	err := r.db.QueryRow(ctx, `SELECT menu_item_id FROM menu_items WHERE slug = $1`, slug).Scan(&id)
	if err != nil {
		return nil, err
	}
	return r.GetDetailByID(ctx, id)
}
