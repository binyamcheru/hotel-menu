package service

import (
	"context"
	"errors"
	"time"

	"backend/internal/domain"
	"backend/internal/repository"
	"backend/internal/utils"

	"github.com/golang-jwt/jwt/v5"
	"github.com/google/uuid"
	"github.com/redis/go-redis/v9"
)

type AuthService struct {
	userRepo           repository.UserRepository
	rdb                *redis.Client
	jwtSecret          string
	accessTokenExpiry  time.Duration
	refreshTokenExpiry time.Duration
}

func NewAuthService(userRepo repository.UserRepository, rdb *redis.Client, jwtSecret string, accessExpiry, refreshExpiry time.Duration) *AuthService {
	return &AuthService{
		userRepo:           userRepo,
		rdb:                rdb,
		jwtSecret:          jwtSecret,
		accessTokenExpiry:  accessExpiry,
		refreshTokenExpiry: refreshExpiry,
	}
}

func (s *AuthService) Login(ctx context.Context, req domain.LoginRequest) (*domain.LoginResponse, error) {
	user, err := s.userRepo.GetByPhoneNo(ctx, req.PhoneNo)
	if err != nil {
		return nil, errors.New("invalid credentials")
	}

	if !user.IsActive {
		return nil, errors.New("account is deactivated")
	}

	if !utils.CheckPassword(req.Password, user.Password) {
		return nil, errors.New("invalid credentials")
	}

	pair, err := s.generateTokenPair(user)
	if err != nil {
		return nil, err
	}

	return &domain.LoginResponse{
		Token:        pair.AccessToken,
		RefreshToken: pair.RefreshToken,
		User:         *user,
	}, nil
}

func (s *AuthService) RefreshToken(ctx context.Context, refreshTokenString string) (*domain.TokenPair, error) {
	token, err := jwt.Parse(refreshTokenString, func(token *jwt.Token) (interface{}, error) {
		if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
			return nil, jwt.ErrSignatureInvalid
		}
		return []byte(s.jwtSecret), nil
	})

	if err != nil || !token.Valid {
		return nil, errors.New("invalid or expired refresh token")
	}

	claims, ok := token.Claims.(jwt.MapClaims)
	if !ok {
		return nil, errors.New("invalid token claims")
	}

	// Ensure it's a refresh token
	tokenType, _ := claims["type"].(string)
	if tokenType != "refresh" {
		return nil, errors.New("invalid token type: expected refresh token")
	}

	// Get user from DB to ensure they still exist and are active
	userIDStr, _ := claims["user_id"].(string)
	userID, err := uuid.Parse(userIDStr)
	if err != nil {
		return nil, errors.New("invalid user ID in token")
	}

	user, err := s.userRepo.GetByID(ctx, userID)
	if err != nil {
		return nil, errors.New("user not found")
	}

	if !user.IsActive {
		return nil, errors.New("account is deactivated")
	}

	return s.generateTokenPair(user)
}

func (s *AuthService) generateTokenPair(user *domain.User) (*domain.TokenPair, error) {
	// Access token (short-lived)
	accessClaims := jwt.MapClaims{
		"user_id":  user.UserID.String(),
		"hotel_id": user.HotelID.String(),
		"role":     user.Role,
		"type":     "access",
		"exp":      time.Now().Add(s.accessTokenExpiry).Unix(),
		"iat":      time.Now().Unix(),
	}
	accessToken := jwt.NewWithClaims(jwt.SigningMethodHS256, accessClaims)
	accessTokenString, err := accessToken.SignedString([]byte(s.jwtSecret))
	if err != nil {
		return nil, err
	}

	// Refresh token (long-lived)
	refreshClaims := jwt.MapClaims{
		"user_id": user.UserID.String(),
		"type":    "refresh",
		"exp":     time.Now().Add(s.refreshTokenExpiry).Unix(),
		"iat":     time.Now().Unix(),
	}
	refreshToken := jwt.NewWithClaims(jwt.SigningMethodHS256, refreshClaims)
	refreshTokenString, err := refreshToken.SignedString([]byte(s.jwtSecret))
	if err != nil {
		return nil, err
	}

	return &domain.TokenPair{
		AccessToken:  accessTokenString,
		RefreshToken: refreshTokenString,
	}, nil
}

func (s *AuthService) Register(ctx context.Context, req domain.CreateUserRequest) (*domain.User, error) {
	hashedPassword, err := utils.HashPassword(req.Password)
	if err != nil {
		return nil, err
	}

	user := &domain.User{
		UserID:   uuid.New(),
		HotelID:  req.HotelID,
		PhoneNo:  req.PhoneNo,
		Email:    req.Email,
		Password: hashedPassword,
		Role:     req.Role,
		IsActive: true,
	}

	if err := s.userRepo.Create(ctx, user); err != nil {
		return nil, err
	}

	return user, nil
}

func (s *AuthService) Logout(ctx context.Context, tokenString string) error {
	if s.rdb == nil {
		return nil // Redis is optional, but if not there, logout is just client-side
	}

	token, _, err := jwt.NewParser().ParseUnverified(tokenString, jwt.MapClaims{})
	if err != nil {
		return err
	}

	claims, ok := token.Claims.(jwt.MapClaims)
	if !ok {
		return errors.New("invalid claims")
	}

	exp, ok := claims["exp"].(float64)
	if !ok {
		return errors.New("expiration claim missing")
	}

	ttl := time.Until(time.Unix(int64(exp), 0))
	if ttl <= 0 {
		return nil
	}

	return s.rdb.Set(ctx, "blacklist:"+tokenString, "true", ttl).Err()
}

func (s *AuthService) IsTokenBlacklisted(ctx context.Context, tokenString string) (bool, error) {
	if s.rdb == nil {
		return false, nil
	}

	exists, err := s.rdb.Exists(ctx, "blacklist:"+tokenString).Result()
	if err != nil {
		return false, err
	}

	return exists > 0, nil
}

