package service

import (
	"context"

	"backend/internal/domain"
	"backend/internal/repository"
	"backend/internal/utils"

	"github.com/google/uuid"
)

type UserService struct {
	repo repository.UserRepository
}

func NewUserService(repo repository.UserRepository) *UserService {
	return &UserService{repo: repo}
}

func (s *UserService) GetByID(ctx context.Context, id uuid.UUID) (*domain.User, error) {
	return s.repo.GetByID(ctx, id)
}

func (s *UserService) GetByHotelID(ctx context.Context, hotelID uuid.UUID) ([]domain.User, error) {
	return s.repo.GetByHotelID(ctx, hotelID)
}

func (s *UserService) Update(ctx context.Context, id uuid.UUID, req domain.UpdateUserRequest) (*domain.User, error) {
	user, err := s.repo.GetByID(ctx, id)
	if err != nil {
		return nil, err
	}
	if req.PhoneNo != nil {
		user.PhoneNo = *req.PhoneNo
	}
	if req.Email != nil {
		user.Email = *req.Email
	}
	if req.Password != nil {
		hashed, err := utils.HashPassword(*req.Password)
		if err != nil {
			return nil, err
		}
		user.Password = hashed
	}
	if req.Role != nil {
		user.Role = *req.Role
	}
	if req.IsActive != nil {
		user.IsActive = *req.IsActive
	}
	if err := s.repo.Update(ctx, user); err != nil {
		return nil, err
	}
	return user, nil
}

func (s *UserService) Delete(ctx context.Context, id uuid.UUID) error {
	return s.repo.Delete(ctx, id)
}
