package handler

import (
	"backend/internal/domain"
	"backend/internal/service"
	"backend/internal/utils"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)

type MenuItemHandler struct {
	menuItemService *service.MenuItemService
}

func NewMenuItemHandler(menuItemService *service.MenuItemService) *MenuItemHandler {
	return &MenuItemHandler{menuItemService: menuItemService}
}

// Create godoc
// @Summary      Create menu item
// @Description  Create a new menu item (admin/superadmin only)
// @Tags         Menu Items
// @Accept       json
// @Produce      json
// @Param        request  body      domain.CreateMenuItemRequest  true  "Menu item data"
// @Success      201      {object}  utils.Response{data=domain.MenuItem}
// @Failure      400      {object}  utils.Response
// @Failure      401      {object}  utils.Response
// @Failure      500      {object}  utils.Response
// @Security     BearerAuth
// @Router       /menu-items [post]
func (h *MenuItemHandler) Create(c *gin.Context) {
	var req domain.CreateMenuItemRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		utils.BadRequestResponse(c, err.Error())
		return
	}
	item, err := h.menuItemService.Create(c.Request.Context(), req)
	if err != nil {
		utils.InternalErrorResponse(c, err.Error())
		return
	}
	utils.CreatedResponse(c, "Menu item created", item)
}

// GetByID godoc
// @Summary      Get menu item by ID
// @Description  Get a menu item's details by its UUID
// @Tags         Menu Items
// @Produce      json
// @Param        id   path      string  true  "Menu Item ID (UUID)"
// @Success      200  {object}  utils.Response{data=domain.MenuItem}
// @Failure      400  {object}  utils.Response
// @Failure      404  {object}  utils.Response
// @Router       /menu-items/{id} [get]
func (h *MenuItemHandler) GetByID(c *gin.Context) {
	id, err := uuid.Parse(c.Param("id"))
	if err != nil {
		utils.BadRequestResponse(c, "Invalid menu item ID")
		return
	}
	item, err := h.menuItemService.GetByID(c.Request.Context(), id)
	if err != nil {
		utils.NotFoundResponse(c, "Menu item not found")
		return
	}
	utils.OKResponse(c, "Menu item retrieved", item)
}

// GetBySlug godoc
// @Summary      Get menu item by slug
// @Description  Get a menu item's details by its URL-friendly slug
// @Tags         Menu
// @Produce      json
// @Param        slug  path      string  true  "Menu item slug"
// @Success      200   {object}  utils.Response{data=domain.MenuItem}
// @Failure      404   {object}  utils.Response
// @Router       /menu/menu-items/slug/{slug} [get]
func (h *MenuItemHandler) GetBySlug(c *gin.Context) {
	slug := c.Param("slug")
	item, err := h.menuItemService.GetBySlug(c.Request.Context(), slug)
	if err != nil {
		utils.NotFoundResponse(c, "Menu item not found")
		return
	}

	// Increment view count asynchronously
	go func() {
		_ = h.menuItemService.IncrementViewCount(c.Request.Context(), item.MenuItemID)
	}()

	utils.OKResponse(c, "Menu item retrieved", item)
}

// GetByHotelID godoc
// @Summary      List menu items by hotel
// @Description  Get all menu items for a specific hotel
// @Tags         Menu
// @Produce      json
// @Param        id   path      string  true  "Hotel ID (UUID)"
// @Success      200  {object}  utils.Response{data=[]domain.MenuItem}
// @Failure      400  {object}  utils.Response
// @Failure      500  {object}  utils.Response
// @Router       /menu/hotels/{id}/menu-items [get]
func (h *MenuItemHandler) GetByHotelID(c *gin.Context) {
	hotelID, err := uuid.Parse(c.Param("id"))
	if err != nil {
		utils.BadRequestResponse(c, "Invalid hotel ID")
		return
	}
	items, err := h.menuItemService.GetByHotelID(c.Request.Context(), hotelID)
	if err != nil {
		utils.InternalErrorResponse(c, err.Error())
		return
	}
	utils.OKResponse(c, "Menu items retrieved", items)
}

// GetByCategoryID godoc
// @Summary      List menu items by category
// @Description  Get all menu items for a specific category
// @Tags         Menu
// @Produce      json
// @Param        id   path      string  true  "Category ID (UUID)"
// @Success      200  {object}  utils.Response{data=[]domain.MenuItem}
// @Failure      400  {object}  utils.Response
// @Failure      500  {object}  utils.Response
// @Router       /menu/categories/{id}/menu-items [get]
func (h *MenuItemHandler) GetByCategoryID(c *gin.Context) {
	categoryID, err := uuid.Parse(c.Param("id"))
	if err != nil {
		utils.BadRequestResponse(c, "Invalid category ID")
		return
	}
	items, err := h.menuItemService.GetByCategoryID(c.Request.Context(), categoryID)
	if err != nil {
		utils.InternalErrorResponse(c, err.Error())
		return
	}
	utils.OKResponse(c, "Menu items retrieved", items)
}

// Update godoc
// @Summary      Update menu item
// @Description  Update a menu item's details (admin/superadmin only)
// @Tags         Menu Items
// @Accept       json
// @Produce      json
// @Param        id       path      string                        true  "Menu Item ID (UUID)"
// @Param        request  body      domain.UpdateMenuItemRequest  true  "Menu item update data"
// @Success      200      {object}  utils.Response{data=domain.MenuItem}
// @Failure      400      {object}  utils.Response
// @Failure      401      {object}  utils.Response
// @Failure      500      {object}  utils.Response
// @Security     BearerAuth
// @Router       /menu-items/{id} [put]
func (h *MenuItemHandler) Update(c *gin.Context) {
	id, err := uuid.Parse(c.Param("id"))
	if err != nil {
		utils.BadRequestResponse(c, "Invalid menu item ID")
		return
	}
	var req domain.UpdateMenuItemRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		utils.BadRequestResponse(c, err.Error())
		return
	}
	item, err := h.menuItemService.Update(c.Request.Context(), id, req)
	if err != nil {
		utils.InternalErrorResponse(c, err.Error())
		return
	}
	utils.OKResponse(c, "Menu item updated", item)
}

// Delete godoc
// @Summary      Delete menu item
// @Description  Delete a menu item (admin/superadmin only)
// @Tags         Menu Items
// @Produce      json
// @Param        id   path      string  true  "Menu Item ID (UUID)"
// @Success      200  {object}  utils.Response
// @Failure      400  {object}  utils.Response
// @Failure      401  {object}  utils.Response
// @Failure      500  {object}  utils.Response
// @Security     BearerAuth
// @Router       /menu-items/{id} [delete]
func (h *MenuItemHandler) Delete(c *gin.Context) {
	id, err := uuid.Parse(c.Param("id"))
	if err != nil {
		utils.BadRequestResponse(c, "Invalid menu item ID")
		return
	}
	if err := h.menuItemService.Delete(c.Request.Context(), id); err != nil {
		utils.InternalErrorResponse(c, err.Error())
		return
	}
	utils.OKResponse(c, "Menu item deleted", nil)
}
