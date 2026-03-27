package main

import (
	"context"
	"fmt"
	"log"

	"backend/internal/config"
	"backend/internal/database"
	"backend/internal/domain"
	"backend/internal/repository"
	"backend/internal/service"

	"github.com/google/uuid"
)

func main() {
	cfg := config.Load()

	db := database.Connect(cfg.DatabaseURL())
	defer db.Close()

	rdb := database.ConnectRedis(cfg.RedisAddr(), cfg.RedisPassword)

	userRepo := repository.NewUserRepository(db)
	hotelRepo := repository.NewHotelRepository(db)
	authService := service.NewAuthService(userRepo, rdb, cfg.JWTSecret, cfg.AccessTokenExpiry, cfg.RefreshTokenExpiry)
	hotelService := service.NewHotelService(hotelRepo)

	ctx := context.Background()

	// 1. Create a System Hotel if none exists (required for users)
	hotels, err := hotelService.GetAll(ctx)
	if err != nil {
		log.Fatalf("Failed to fetch hotels: %v", err)
	}

	var hotelID uuid.UUID
	if len(hotels) == 0 {
		fmt.Println("Creating initial system hotel...")
		h, err := hotelService.Create(ctx, domain.CreateHotelRequest{
			Name: "System Administrator Central",
		})
		if err != nil {
			log.Fatalf("Failed to create system hotel: %v", err)
		}
		hotelID = h.HotelID
	} else {
		hotelID = hotels[0].HotelID
	}

	// 2. Seed Superadmin
	fmt.Println("Seeding superadmin user...")
	req := domain.CreateUserRequest{
		HotelID:  hotelID,
		PhoneNo:  "0911223344",
		Email:    "superadmin@hotelmenu.com",
		Password: "superpassword123",
		Role:     "superadmin",
	}

	_, err = authService.Register(ctx, req)
	if err != nil {
		fmt.Printf("Superadmin might already exist: %v\n", err)
	} else {
		fmt.Println("Superadmin seeded successfully!")
		fmt.Printf("Phone: %s\nPassword: %s\n", req.PhoneNo, req.Password)
	}
}
