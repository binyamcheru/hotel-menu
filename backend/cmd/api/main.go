package main

import (
	"context"
	"fmt"
	"log"
	"net/http"
	"os"
	"os/signal"
	"syscall"
	"time"

	"backend/internal/config"
	"backend/internal/database"
	"backend/internal/handler"
	"backend/internal/middleware"
	"backend/internal/repository"
	"backend/internal/service"

	_ "backend/docs" // Swagger generated docs

	"github.com/gin-gonic/gin"
	cors "github.com/rs/cors/wrapper/gin"
	swaggerFiles "github.com/swaggo/files"
	ginSwagger "github.com/swaggo/gin-swagger"
)

// @title           Hotel Menu API
// @version         1.0
// @description     A comprehensive API for hotel menu management, including hotels, categories, menu items, chefs, ratings, discounts, analytics, and feedback.
// @host            localhost:8080
// @BasePath        /api

// @securityDefinitions.apikey BearerAuth
// @in header
// @name Authorization
// @description Enter your bearer token in the format: Bearer {token}

func main() {
	// 1. Load configuration
	cfg := config.Load()

	// 2. Connect to database
	db := database.Connect(cfg.DatabaseURL())
	defer db.Close()

	// 3. Connect to Redis (graceful — returns nil if unavailable)
	rdb := database.ConnectRedis(cfg.RedisAddr(), cfg.RedisPassword)

	// 4. Initialize repositories
	hotelRepo := repository.NewHotelRepository(db)
	userRepo := repository.NewUserRepository(db)
	categoryRepo := repository.NewCategoryRepository(db)
	chefRepo := repository.NewChefRepository(db)
	menuItemRepo := repository.NewMenuItemRepository(db)
	ingredientRepo := repository.NewIngredientRepository(db)
	menuItemIngredientRepo := repository.NewMenuItemIngredientRepository(db)
	ratingRepo := repository.NewRatingRepository(db)
	discountRepo := repository.NewDiscountRepository(db)
	hotelScanRepo := repository.NewHotelScanRepository(db)
	menuViewRepo := repository.NewMenuViewRepository(db)
	feedbackRepo := repository.NewFeedbackRepository(db)

	// 5. Initialize services
	authService := service.NewAuthService(userRepo, rdb, cfg.JWTSecret, cfg.AccessTokenExpiry, cfg.RefreshTokenExpiry)
	hotelService := service.NewHotelService(hotelRepo)
	userService := service.NewUserService(userRepo)
	categoryService := service.NewCategoryService(categoryRepo)
	chefService := service.NewChefService(chefRepo)
	menuItemService := service.NewMenuItemService(menuItemRepo)
	ingredientService := service.NewIngredientService(ingredientRepo, menuItemIngredientRepo)
	ratingService := service.NewRatingService(ratingRepo)
	discountService := service.NewDiscountService(discountRepo)
	analyticsService := service.NewAnalyticsService(hotelScanRepo, menuViewRepo)
	feedbackService := service.NewFeedbackService(feedbackRepo)

	// 6. Initialize handlers
	authHandler := handler.NewAuthHandler(authService)
	hotelHandler := handler.NewHotelHandler(hotelService, cfg)
	userHandler := handler.NewUserHandler(userService)
	categoryHandler := handler.NewCategoryHandler(categoryService)
	chefHandler := handler.NewChefHandler(chefService)
	menuItemHandler := handler.NewMenuItemHandler(menuItemService)
	ingredientHandler := handler.NewIngredientHandler(ingredientService)
	ratingHandler := handler.NewRatingHandler(ratingService)
	discountHandler := handler.NewDiscountHandler(discountService)
	analyticsHandler := handler.NewAnalyticsHandler(analyticsService)
	feedbackHandler := handler.NewFeedbackHandler(feedbackService)

	// 7. Setup Gin Router
	r := gin.Default()

	// Global Middleware
	r.Use(cors.AllowAll())
	r.Use(gin.Recovery())
	r.Use(gin.Logger())
	r.Use(middleware.RateLimitMiddleware(cfg.RateLimitRPS, cfg.RateLimitBurst))

	// Swagger UI
	r.GET("/swagger/*any", ginSwagger.WrapHandler(swaggerFiles.Handler))

	// Public Routes
	api := r.Group("/api")
	{
		auth := api.Group("/auth")
		{
			auth.POST("/login", authHandler.Login)
			auth.POST("/register", authHandler.Register)
			auth.POST("/refresh", authHandler.Refresh)
			auth.POST("/logout", authHandler.Logout)
		}

		// Public Menu Viewing (with Redis caching)
		menu := api.Group("/menu")
		menu.Use(middleware.CacheMiddleware(rdb, 5*time.Minute))
		{
			menu.GET("/hotels/:id", hotelHandler.GetByID)
			menu.GET("/hotels/:id/qrcode", hotelHandler.QRCode)
			menu.GET("/hotels/:id/categories", categoryHandler.GetByHotelID)
			menu.GET("/hotels/:id/menu-items", menuItemHandler.GetByHotelID)
			menu.GET("/categories/:id/menu-items", menuItemHandler.GetByCategoryID)
			menu.GET("/menu-items/slug/:slug", menuItemHandler.GetBySlug)
			menu.GET("/menu-items/:id/ingredients", ingredientHandler.GetByMenuItemID)
			menu.GET("/menu-items/:id/ratings", ratingHandler.GetByMenuItemID)
			menu.GET("/menu-items/:id/average-rating", ratingHandler.GetAverage)
			menu.POST("/hotels/:id/scan", analyticsHandler.RecordScan)
			menu.POST("/hotels/:id/menu-items/:menu_item_id/view", analyticsHandler.RecordMenuView)
			menu.POST("/feedback", feedbackHandler.Create)
			menu.POST("/ratings", ratingHandler.Create)
		}
	}

	// Protected Routes (Required Auth)
	protected := api.Group("")
	protected.Use(middleware.AuthMiddleware(cfg.JWTSecret, authService))
	{
		// General Protected User Endpoints
		protected.GET("/me", userHandler.GetByID)

		// Admin & Superadmin only
		adminOnly := protected.Group("")
		adminOnly.Use(middleware.RoleMiddleware("admin", "superadmin"))
		{
			// Hotel Management
			adminOnly.GET("/hotels", hotelHandler.GetAll)
			adminOnly.PUT("/hotels/:id", hotelHandler.Update)

			// Category Management
			adminOnly.POST("/categories", categoryHandler.Create)
			adminOnly.PUT("/categories/:id", categoryHandler.Update)
			adminOnly.DELETE("/categories/:id", categoryHandler.Delete)

			// Chef Management
			adminOnly.POST("/chefs", chefHandler.Create)
			adminOnly.GET("/hotels/:id/chefs", chefHandler.GetByHotelID)
			adminOnly.GET("/chefs/:id", chefHandler.GetByID)
			adminOnly.PUT("/chefs/:id", chefHandler.Update)
			adminOnly.DELETE("/chefs/:id", chefHandler.Delete)

			// Menu Item Management
			adminOnly.POST("/menu-items", menuItemHandler.Create)
			adminOnly.PUT("/menu-items/:id", menuItemHandler.Update)
			adminOnly.DELETE("/menu-items/:id", menuItemHandler.Delete)

			// Ingredient Management
			adminOnly.POST("/ingredients", ingredientHandler.Create)
			adminOnly.GET("/hotels/:id/ingredients", ingredientHandler.GetByHotelID)
			adminOnly.DELETE("/ingredients/:id", ingredientHandler.Delete)
			adminOnly.POST("/menu-items/ingredients", ingredientHandler.AddToMenuItem)
			adminOnly.DELETE("/menu-items/:id/ingredients/:ingredient_id", ingredientHandler.RemoveFromMenuItem)

			// Discount Management
			adminOnly.POST("/discounts", discountHandler.Create)
			adminOnly.GET("/hotels/:id/discounts", discountHandler.GetByHotelID)
			adminOnly.PUT("/discounts/:id", discountHandler.Update)
			adminOnly.DELETE("/discounts/:id", discountHandler.Delete)

			// Analytics
			adminOnly.GET("/hotels/:id/analytics", analyticsHandler.GetSummary)

			// Feedback Management
			adminOnly.GET("/hotels/:id/feedback", feedbackHandler.GetByHotelID)
			adminOnly.DELETE("/feedback/:id", feedbackHandler.Delete)
		}

		// Superadmin only
		superAdminOnly := protected.Group("")
		superAdminOnly.Use(middleware.RoleMiddleware("superadmin"))
		{
			superAdminOnly.POST("/hotels", hotelHandler.Create)
			superAdminOnly.DELETE("/hotels/:id", hotelHandler.Delete)
			superAdminOnly.GET("/hotels/:id/users", userHandler.GetByHotelID)
			superAdminOnly.PUT("/users/:id", userHandler.Update)
			superAdminOnly.DELETE("/users/:id", userHandler.Delete)
		}
	}

	// 8. Start Server
	srv := &http.Server{
		Addr:    ":" + cfg.Port,
		Handler: r,
	}

	go func() {
		if err := srv.ListenAndServe(); err != nil && err != http.ErrServerClosed {
			log.Fatalf("listen: %s\n", err)
		}
	}()

	fmt.Printf("🚀 Server started on port %s\n", cfg.Port)
	fmt.Printf("📚 Swagger docs: http://localhost:%s/swagger/index.html\n", cfg.Port)

	// Wait for interrupt signal to gracefully shutdown the server
	quit := make(chan os.Signal, 1)
	signal.Notify(quit, syscall.SIGINT, syscall.SIGTERM)
	<-quit
	log.Println("Shutdown Server ...")

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()
	if err := srv.Shutdown(ctx); err != nil {
		log.Fatal("Server Shutdown:", err)
	}

	log.Println("Server exiting")
}
