package repository

import (
	"context"

	"backend/internal/domain"

	"github.com/google/uuid"
	"github.com/jackc/pgx/v5/pgxpool"
)

type hotelRepository struct {
	db *pgxpool.Pool
}

func NewHotelRepository(db *pgxpool.Pool) HotelRepository {
	return &hotelRepository{db: db}
}

func (r *hotelRepository) Create(ctx context.Context, hotel *domain.Hotel) error {
	query := `INSERT INTO hotels (hotel_id, name, logo, address, phone, language_settings, created_at, updated_at)
			  VALUES ($1, $2, $3, $4, $5, $6, NOW(), NOW())
			  RETURNING hotel_id, created_at, updated_at`
	return r.db.QueryRow(ctx, query,
		hotel.HotelID, hotel.Name, hotel.Logo, hotel.Address, hotel.Phone, hotel.LanguageSettings,
	).Scan(&hotel.HotelID, &hotel.CreatedAt, &hotel.UpdatedAt)
}

func (r *hotelRepository) GetByID(ctx context.Context, id uuid.UUID) (*domain.Hotel, error) {
	hotel := &domain.Hotel{}
	query := `SELECT hotel_id, name, logo, address, phone, language_settings, created_at, updated_at
			  FROM hotels WHERE hotel_id = $1`
	err := r.db.QueryRow(ctx, query, id).Scan(
		&hotel.HotelID, &hotel.Name, &hotel.Logo, &hotel.Address,
		&hotel.Phone, &hotel.LanguageSettings, &hotel.CreatedAt, &hotel.UpdatedAt,
	)
	if err != nil {
		return nil, err
	}
	return hotel, nil
}

func (r *hotelRepository) GetAll(ctx context.Context) ([]domain.Hotel, error) {
	query := `SELECT hotel_id, name, logo, address, phone, language_settings, created_at, updated_at
			  FROM hotels ORDER BY created_at DESC`
	rows, err := r.db.Query(ctx, query)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var hotels []domain.Hotel
	for rows.Next() {
		var h domain.Hotel
		if err := rows.Scan(&h.HotelID, &h.Name, &h.Logo, &h.Address,
			&h.Phone, &h.LanguageSettings, &h.CreatedAt, &h.UpdatedAt); err != nil {
			return nil, err
		}
		hotels = append(hotels, h)
	}
	return hotels, nil
}

func (r *hotelRepository) Update(ctx context.Context, hotel *domain.Hotel) error {
	query := `UPDATE hotels SET name=$2, logo=$3, address=$4, phone=$5, language_settings=$6, updated_at=NOW()
			  WHERE hotel_id=$1 RETURNING updated_at`
	return r.db.QueryRow(ctx, query,
		hotel.HotelID, hotel.Name, hotel.Logo, hotel.Address, hotel.Phone, hotel.LanguageSettings,
	).Scan(&hotel.UpdatedAt)
}

func (r *hotelRepository) Delete(ctx context.Context, id uuid.UUID) error {
	_, err := r.db.Exec(ctx, `DELETE FROM hotels WHERE hotel_id=$1`, id)
	return err
}
