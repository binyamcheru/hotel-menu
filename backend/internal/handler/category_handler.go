package handler

import (
	"backend/internal/domain"
	"backend/internal/service"
	"backend/internal/utils"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)

type CategoryHandler struct {
	categoryService *service.CategoryService
}

func NewCategoryHandler(categoryService *service.CategoryService) *CategoryHandler {
	return &CategoryHandler{categoryService: categoryService}
}

// Create godoc
// @Summary      Create category
// @Description  Create a new menu category (admin/superadmin only)
// @Tags         Categories
// @Accept       json
// @Produce      json
// @Param        request  body      domain.CreateCategoryRequest  true  "Category data"
// @Success      201      {object}  utils.Response{data=domain.Category}
// @Failure      400      {object}  utils.Response
// @Failure      401      {object}  utils.Response
// @Failure      500      {object}  utils.Response
// @Security     BearerAuth
// @Router       /categories [post]
func (h *CategoryHandler) Create(c *gin.Context) {
	var req domain.CreateCategoryRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		utils.BadRequestResponse(c, err.Error())
		return
	}
	cat, err := h.categoryService.Create(c.Request.Context(), req)
	if err != nil {
		utils.InternalErrorResponse(c, err.Error())
		return
	}
	utils.CreatedResponse(c, "Category created", cat)
}

// GetByID godoc
// @Summary      Get category by ID
// @Description  Get a category's details by its UUID
// @Tags         Categories
// @Produce      json
// @Param        id   path      string  true  "Category ID (UUID)"
// @Success      200  {object}  utils.Response{data=domain.Category}
// @Failure      400  {object}  utils.Response
// @Failure      404  {object}  utils.Response
// @Security     BearerAuth
// @Router       /categories/{id} [get]
func (h *CategoryHandler) GetByID(c *gin.Context) {
	id, err := uuid.Parse(c.Param("id"))
	if err != nil {
		utils.BadRequestResponse(c, "Invalid category ID")
		return
	}
	cat, err := h.categoryService.GetByID(c.Request.Context(), id)
	if err != nil {
		utils.NotFoundResponse(c, "Category not found")
		return
	}
	utils.OKResponse(c, "Category retrieved", cat)
}

// GetByHotelID godoc
// @Summary      List categories by hotel
// @Description  Get all categories for a specific hotel
// @Tags         Menu
// @Produce      json
// @Param        id   path      string  true  "Hotel ID (UUID)"
// @Success      200  {object}  utils.Response{data=[]domain.Category}
// @Failure      400  {object}  utils.Response
// @Failure      500  {object}  utils.Response
// @Router       /menu/hotels/{id}/categories [get]
func (h *CategoryHandler) GetByHotelID(c *gin.Context) {
	hotelID, err := uuid.Parse(c.Param("id"))
	if err != nil {
		utils.BadRequestResponse(c, "Invalid hotel ID")
		return
	}
	cats, err := h.categoryService.GetByHotelID(c.Request.Context(), hotelID)
	if err != nil {
		utils.InternalErrorResponse(c, err.Error())
		return
	}
	utils.OKResponse(c, "Categories retrieved", cats)
}

// Update godoc
// @Summary      Update category
// @Description  Update a category's details (admin/superadmin only)
// @Tags         Categories
// @Accept       json
// @Produce      json
// @Param        id       path      string                        true  "Category ID (UUID)"
// @Param        request  body      domain.UpdateCategoryRequest  true  "Category update data"
// @Success      200      {object}  utils.Response{data=domain.Category}
// @Failure      400      {object}  utils.Response
// @Failure      401      {object}  utils.Response
// @Failure      500      {object}  utils.Response
// @Security     BearerAuth
// @Router       /categories/{id} [put]
func (h *CategoryHandler) Update(c *gin.Context) {
	id, err := uuid.Parse(c.Param("id"))
	if err != nil {
		utils.BadRequestResponse(c, "Invalid category ID")
		return
	}
	var req domain.UpdateCategoryRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		utils.BadRequestResponse(c, err.Error())
		return
	}
	cat, err := h.categoryService.Update(c.Request.Context(), id, req)
	if err != nil {
		utils.InternalErrorResponse(c, err.Error())
		return
	}
	utils.OKResponse(c, "Category updated", cat)
}

// Delete godoc
// @Summary      Delete category
// @Description  Delete a category (admin/superadmin only)
// @Tags         Categories
// @Produce      json
// @Param        id   path      string  true  "Category ID (UUID)"
// @Success      200  {object}  utils.Response
// @Failure      400  {object}  utils.Response
// @Failure      401  {object}  utils.Response
// @Failure      500  {object}  utils.Response
// @Security     BearerAuth
// @Router       /categories/{id} [delete]
func (h *CategoryHandler) Delete(c *gin.Context) {
	id, err := uuid.Parse(c.Param("id"))
	if err != nil {
		utils.BadRequestResponse(c, "Invalid category ID")
		return
	}
	if err := h.categoryService.Delete(c.Request.Context(), id); err != nil {
		utils.InternalErrorResponse(c, err.Error())
		return
	}
	utils.OKResponse(c, "Category deleted", nil)
}
