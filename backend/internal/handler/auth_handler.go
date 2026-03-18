package handler

import (
	"backend/internal/domain"
	"backend/internal/service"
	"backend/internal/utils"

	"github.com/gin-gonic/gin"
)

type AuthHandler struct {
	authService *service.AuthService
}

func NewAuthHandler(authService *service.AuthService) *AuthHandler {
	return &AuthHandler{authService: authService}
}

// Login godoc
// @Summary      Login user
// @Description  Authenticate a user with phone number and password, returns access and refresh tokens
// @Tags         Auth
// @Accept       json
// @Produce      json
// @Param        request  body      domain.LoginRequest  true  "Login credentials"
// @Success      200      {object}  utils.Response{data=domain.LoginResponse}
// @Failure      400      {object}  utils.Response
// @Failure      401      {object}  utils.Response
// @Router       /auth/login [post]
func (h *AuthHandler) Login(c *gin.Context) {
	var req domain.LoginRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		utils.BadRequestResponse(c, err.Error())
		return
	}

	resp, err := h.authService.Login(c.Request.Context(), req)
	if err != nil {
		utils.UnauthorizedResponse(c, err.Error())
		return
	}

	utils.OKResponse(c, "Login successful", resp)
}

// Register godoc
// @Summary      Register user
// @Description  Register a new admin or superadmin user
// @Tags         Auth
// @Accept       json
// @Produce      json
// @Param        request  body      domain.CreateUserRequest  true  "User registration data"
// @Success      201      {object}  utils.Response{data=domain.User}
// @Failure      400      {object}  utils.Response
// @Failure      500      {object}  utils.Response
// @Router       /auth/register [post]
func (h *AuthHandler) Register(c *gin.Context) {
	var req domain.CreateUserRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		utils.BadRequestResponse(c, err.Error())
		return
	}

	user, err := h.authService.Register(c.Request.Context(), req)
	if err != nil {
		utils.InternalErrorResponse(c, err.Error())
		return
	}

	utils.CreatedResponse(c, "User registered successfully", user)
}

// Refresh godoc
// @Summary      Refresh access token
// @Description  Exchange a valid refresh token for a new access/refresh token pair
// @Tags         Auth
// @Accept       json
// @Produce      json
// @Param        request  body      domain.RefreshRequest  true  "Refresh token"
// @Success      200      {object}  utils.Response{data=domain.TokenPair}
// @Failure      400      {object}  utils.Response
// @Failure      401      {object}  utils.Response
// @Router       /auth/refresh [post]
func (h *AuthHandler) Refresh(c *gin.Context) {
	var req domain.RefreshRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		utils.BadRequestResponse(c, err.Error())
		return
	}

	pair, err := h.authService.RefreshToken(c.Request.Context(), req.RefreshToken)
	if err != nil {
		utils.UnauthorizedResponse(c, err.Error())
		return
	}

	utils.OKResponse(c, "Token refreshed successfully", pair)
}
