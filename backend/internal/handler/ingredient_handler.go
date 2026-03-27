package handler

import (
	"errors"

	"backend/internal/domain"
	"backend/internal/service"
	"backend/internal/utils"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)

type IngredientHandler struct {
	ingredientService *service.IngredientService
}

func NewIngredientHandler(ingredientService *service.IngredientService) *IngredientHandler {
	return &IngredientHandler{ingredientService: ingredientService}
}

// handleIngredientError maps domain errors to appropriate HTTP responses.
func handleIngredientError(c *gin.Context, err error) {
	switch {
	case errors.Is(err, domain.ErrIngredientNotFound):
		utils.NotFoundResponse(c, err.Error())
	case errors.Is(err, domain.ErrMenuItemNotFound):
		utils.NotFoundResponse(c, err.Error())
	case errors.Is(err, domain.ErrIngredientAlreadyLinked):
		utils.ConflictResponse(c, err.Error())
	case errors.Is(err, domain.ErrHotelMismatch):
		utils.BadRequestResponse(c, err.Error())
	default:
		utils.InternalErrorResponse(c, err.Error())
	}
}

// Create godoc
// @Summary      Create ingredient
// @Description  Create a new ingredient (admin/superadmin only)
// @Tags         Ingredients
// @Accept       json
// @Produce      json
// @Param        request  body      domain.CreateIngredientRequest  true  "Ingredient data"
// @Success      201      {object}  utils.Response{data=domain.Ingredient}
// @Failure      400      {object}  utils.Response
// @Failure      401      {object}  utils.Response
// @Failure      500      {object}  utils.Response
// @Security     BearerAuth
// @Router       /ingredients [post]
func (h *IngredientHandler) Create(c *gin.Context) {
	var req domain.CreateIngredientRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		utils.BadRequestResponse(c, err.Error())
		return
	}
	ing, err := h.ingredientService.Create(c.Request.Context(), req)
	if err != nil {
		handleIngredientError(c, err)
		return
	}
	utils.CreatedResponse(c, "Ingredient created", ing)
}

// GetByHotelID godoc
// @Summary      List ingredients by hotel
// @Description  Get all ingredients for a specific hotel (admin/superadmin only)
// @Tags         Ingredients
// @Produce      json
// @Param        id   path      string  true  "Hotel ID (UUID)"
// @Success      200  {object}  utils.Response{data=[]domain.Ingredient}
// @Failure      400  {object}  utils.Response
// @Failure      401  {object}  utils.Response
// @Failure      500  {object}  utils.Response
// @Security     BearerAuth
// @Router       /hotels/{id}/ingredients [get]
func (h *IngredientHandler) GetByHotelID(c *gin.Context) {
	hotelID, err := uuid.Parse(c.Param("id"))
	if err != nil {
		utils.BadRequestResponse(c, "Invalid hotel ID")
		return
	}
	ings, err := h.ingredientService.GetByHotelID(c.Request.Context(), hotelID)
	if err != nil {
		handleIngredientError(c, err)
		return
	}
	utils.OKResponse(c, "Ingredients retrieved", ings)
}

// Delete godoc
// @Summary      Delete ingredient
// @Description  Delete an ingredient (admin/superadmin only)
// @Tags         Ingredients
// @Produce      json
// @Param        id   path      string  true  "Ingredient ID (UUID)"
// @Success      200  {object}  utils.Response
// @Failure      400  {object}  utils.Response
// @Failure      401  {object}  utils.Response
// @Failure      404  {object}  utils.Response
// @Failure      500  {object}  utils.Response
// @Security     BearerAuth
// @Router       /ingredients/{id} [delete]
func (h *IngredientHandler) Delete(c *gin.Context) {
	id, err := uuid.Parse(c.Param("id"))
	if err != nil {
		utils.BadRequestResponse(c, "Invalid ingredient ID")
		return
	}
	if err := h.ingredientService.Delete(c.Request.Context(), id); err != nil {
		handleIngredientError(c, err)
		return
	}
	utils.OKResponse(c, "Ingredient deleted", nil)
}

// AddToMenuItem godoc
// @Summary      Add ingredient to menu item
// @Description  Link an ingredient to a menu item (admin/superadmin only)
// @Tags         Ingredients
// @Accept       json
// @Produce      json
// @Param        request  body      domain.AddMenuItemIngredientRequest  true  "Menu item and ingredient IDs"
// @Success      201      {object}  utils.Response
// @Failure      400      {object}  utils.Response
// @Failure      401      {object}  utils.Response
// @Failure      404      {object}  utils.Response
// @Failure      409      {object}  utils.Response
// @Failure      500      {object}  utils.Response
// @Security     BearerAuth
// @Router       /menu-items/ingredients [post]
func (h *IngredientHandler) AddToMenuItem(c *gin.Context) {
	var req domain.AddMenuItemIngredientRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		utils.BadRequestResponse(c, err.Error())
		return
	}
	if err := h.ingredientService.AddToMenuItem(c.Request.Context(), req.MenuItemID, req.IngredientID); err != nil {
		handleIngredientError(c, err)
		return
	}
	utils.CreatedResponse(c, "Ingredient added to menu item", nil)
}

// BulkAddToMenuItem godoc
// @Summary      Bulk add ingredients to menu item
// @Description  Link multiple ingredients to a menu item at once (admin/superadmin only). Duplicates are skipped.
// @Tags         Ingredients
// @Accept       json
// @Produce      json
// @Param        request  body      domain.BulkAddMenuItemIngredientsRequest  true  "Menu item ID and ingredient IDs"
// @Success      201      {object}  utils.Response{data=domain.BulkAddResult}
// @Failure      400      {object}  utils.Response
// @Failure      401      {object}  utils.Response
// @Failure      404      {object}  utils.Response
// @Failure      500      {object}  utils.Response
// @Security     BearerAuth
// @Router       /menu-items/ingredients/bulk [post]
func (h *IngredientHandler) BulkAddToMenuItem(c *gin.Context) {
	var req domain.BulkAddMenuItemIngredientsRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		utils.BadRequestResponse(c, err.Error())
		return
	}
	result, err := h.ingredientService.BulkAddToMenuItem(c.Request.Context(), req.MenuItemID, req.IngredientIDs)
	if err != nil {
		handleIngredientError(c, err)
		return
	}
	utils.CreatedResponse(c, "Bulk ingredient assignment completed", result)
}

// RemoveFromMenuItem godoc
// @Summary      Remove ingredient from menu item
// @Description  Unlink an ingredient from a menu item (admin/superadmin only)
// @Tags         Ingredients
// @Produce      json
// @Param        id             path      string  true  "Menu Item ID (UUID)"
// @Param        ingredient_id  path      string  true  "Ingredient ID (UUID)"
// @Success      200            {object}  utils.Response
// @Failure      400            {object}  utils.Response
// @Failure      401            {object}  utils.Response
// @Failure      500            {object}  utils.Response
// @Security     BearerAuth
// @Router       /menu-items/{id}/ingredients/{ingredient_id} [delete]
func (h *IngredientHandler) RemoveFromMenuItem(c *gin.Context) {
	menuItemID, err := uuid.Parse(c.Param("id"))
	if err != nil {
		utils.BadRequestResponse(c, "Invalid menu item ID")
		return
	}
	ingredientID, err := uuid.Parse(c.Param("ingredient_id"))
	if err != nil {
		utils.BadRequestResponse(c, "Invalid ingredient ID")
		return
	}
	if err := h.ingredientService.RemoveFromMenuItem(c.Request.Context(), menuItemID, ingredientID); err != nil {
		handleIngredientError(c, err)
		return
	}
	utils.OKResponse(c, "Ingredient removed from menu item", nil)
}

// GetByMenuItemID godoc
// @Summary      List ingredients for menu item
// @Description  Get all ingredients for a specific menu item
// @Tags         Menu
// @Produce      json
// @Param        id   path      string  true  "Menu Item ID (UUID)"
// @Success      200  {object}  utils.Response{data=[]domain.Ingredient}
// @Failure      400  {object}  utils.Response
// @Failure      500  {object}  utils.Response
// @Router       /menu/menu-items/{id}/ingredients [get]
func (h *IngredientHandler) GetByMenuItemID(c *gin.Context) {
	menuItemID, err := uuid.Parse(c.Param("id"))
	if err != nil {
		utils.BadRequestResponse(c, "Invalid menu item ID")
		return
	}
	ings, err := h.ingredientService.GetByMenuItemID(c.Request.Context(), menuItemID)
	if err != nil {
		handleIngredientError(c, err)
		return
	}
	utils.OKResponse(c, "Ingredients retrieved", ings)
}
