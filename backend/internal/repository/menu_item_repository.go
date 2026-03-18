package repository

import (
	"context"

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
