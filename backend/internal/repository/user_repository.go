package repository

import (
	"context"

	"backend/internal/domain"

	"github.com/google/uuid"
	"github.com/jackc/pgx/v5/pgxpool"
)

type userRepository struct {
	db *pgxpool.Pool
}

func NewUserRepository(db *pgxpool.Pool) UserRepository {
	return &userRepository{db: db}
}

func (r *userRepository) Create(ctx context.Context, user *domain.User) error {
	query := `INSERT INTO users (user_id, hotel_id, phone_no, email, password, role, is_active, created_at, updated_at)
			  VALUES ($1, $2, $3, $4, $5, $6, $7, NOW(), NOW())
			  RETURNING user_id, created_at, updated_at`
	return r.db.QueryRow(ctx, query,
		user.UserID, user.HotelID, user.PhoneNo, user.Email, user.Password, user.Role, user.IsActive,
	).Scan(&user.UserID, &user.CreatedAt, &user.UpdatedAt)
}

func (r *userRepository) GetByID(ctx context.Context, id uuid.UUID) (*domain.User, error) {
	user := &domain.User{}
	query := `SELECT user_id, hotel_id, phone_no, email, password, role, is_active, created_at, updated_at
			  FROM users WHERE user_id = $1`
	err := r.db.QueryRow(ctx, query, id).Scan(
		&user.UserID, &user.HotelID, &user.PhoneNo, &user.Email,
		&user.Password, &user.Role, &user.IsActive, &user.CreatedAt, &user.UpdatedAt,
	)
	if err != nil {
		return nil, err
	}
	return user, nil
}

func (r *userRepository) GetByPhoneNo(ctx context.Context, phoneNo string) (*domain.User, error) {
	user := &domain.User{}
	query := `SELECT user_id, hotel_id, phone_no, email, password, role, is_active, created_at, updated_at
			  FROM users WHERE phone_no = $1`
	err := r.db.QueryRow(ctx, query, phoneNo).Scan(
		&user.UserID, &user.HotelID, &user.PhoneNo, &user.Email,
		&user.Password, &user.Role, &user.IsActive, &user.CreatedAt, &user.UpdatedAt,
	)
	if err != nil {
		return nil, err
	}
	return user, nil
}

func (r *userRepository) GetByHotelID(ctx context.Context, hotelID uuid.UUID) ([]domain.User, error) {
	query := `SELECT user_id, hotel_id, phone_no, email, password, role, is_active, created_at, updated_at
			  FROM users WHERE hotel_id = $1 ORDER BY created_at DESC`
	rows, err := r.db.Query(ctx, query, hotelID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var users []domain.User
	for rows.Next() {
		var u domain.User
		if err := rows.Scan(&u.UserID, &u.HotelID, &u.PhoneNo, &u.Email,
			&u.Password, &u.Role, &u.IsActive, &u.CreatedAt, &u.UpdatedAt); err != nil {
			return nil, err
		}
		users = append(users, u)
	}
	return users, nil
}

func (r *userRepository) Update(ctx context.Context, user *domain.User) error {
	query := `UPDATE users SET phone_no=$2, email=$3, password=$4, role=$5, is_active=$6, updated_at=NOW()
			  WHERE user_id=$1 RETURNING updated_at`
	return r.db.QueryRow(ctx, query,
		user.UserID, user.PhoneNo, user.Email, user.Password, user.Role, user.IsActive,
	).Scan(&user.UpdatedAt)
}

func (r *userRepository) Delete(ctx context.Context, id uuid.UUID) error {
	_, err := r.db.Exec(ctx, `DELETE FROM users WHERE user_id=$1`, id)
	return err
}
