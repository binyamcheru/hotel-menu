package handler

import (
	"backend/internal/domain"
	"backend/internal/service"
	"backend/internal/utils"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)

type UserHandler struct {
	userService *service.UserService
}

func NewUserHandler(userService *service.UserService) *UserHandler {
	return &UserHandler{userService: userService}
}

// GetByID godoc
// @Summary      Get current user
// @Tags         Users
// @Produce      json
// @Success      200  {object}  utils.Response{data=domain.User}
// @Failure      400  {object}  utils.Response
// @Failure      401  {object}  utils.Response
// @Security     BearerAuth
// @Router       /me [get]
func (h *UserHandler) GetByID(c *gin.Context) {
	id, err := uuid.Parse(c.Param("id"))
	if err != nil {
		utils.BadRequestResponse(c, "Invalid user ID")
		return
	}
	user, err := h.userService.GetByID(c.Request.Context(), id)
	if err != nil {
		utils.NotFoundResponse(c, "User not found")
		return
	}
	utils.OKResponse(c, "User retrieved", user)
}

// GetByHotelID godoc
// @Summary      List users by hotel
// @Tags         Users
// @Param        id   path  string  true  "Hotel ID"
// @Success      200  {object}  utils.Response{data=[]domain.User}
// @Failure      400  {object}  utils.Response
// @Security     BearerAuth
// @Router       /hotels/{id}/users [get]
func (h *UserHandler) GetByHotelID(c *gin.Context) {
	hotelID, err := uuid.Parse(c.Param("id"))
	if err != nil {
		utils.BadRequestResponse(c, "Invalid hotel ID")
		return
	}
	users, err := h.userService.GetByHotelID(c.Request.Context(), hotelID)
	if err != nil {
		utils.InternalErrorResponse(c, err.Error())
		return
	}
	utils.OKResponse(c, "Users retrieved", users)
}

// Update godoc
// @Summary      Update user
// @Tags         Users
// @Accept       json
// @Produce      json
// @Param        id       path  string                    true  "User ID"
// @Param        request  body  domain.UpdateUserRequest   true  "User data"
// @Success      200  {object}  utils.Response{data=domain.User}
// @Failure      400  {object}  utils.Response
// @Security     BearerAuth
// @Router       /users/{id} [put]
func (h *UserHandler) Update(c *gin.Context) {
	id, err := uuid.Parse(c.Param("id"))
	if err != nil {
		utils.BadRequestResponse(c, "Invalid user ID")
		return
	}
	var req domain.UpdateUserRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		utils.BadRequestResponse(c, err.Error())
		return
	}
	user, err := h.userService.Update(c.Request.Context(), id, req)
	if err != nil {
		utils.InternalErrorResponse(c, err.Error())
		return
	}
	utils.OKResponse(c, "User updated", user)
}

// Delete godoc
// @Summary      Delete user
// @Tags         Users
// @Param        id   path  string  true  "User ID"
// @Success      200  {object}  utils.Response
// @Failure      400  {object}  utils.Response
// @Security     BearerAuth
// @Router       /users/{id} [delete]
func (h *UserHandler) Delete(c *gin.Context) {
	id, err := uuid.Parse(c.Param("id"))
	if err != nil {
		utils.BadRequestResponse(c, "Invalid user ID")
		return
	}
	if err := h.userService.Delete(c.Request.Context(), id); err != nil {
		utils.InternalErrorResponse(c, err.Error())
		return
	}
	utils.OKResponse(c, "User deleted", nil)
}
