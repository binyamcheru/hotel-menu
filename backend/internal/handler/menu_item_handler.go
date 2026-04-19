package handler

import (
	"strconv"
	"strings"

	"backend/internal/domain"
	"backend/internal/service"
	"backend/internal/utils"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)

type MenuItemHandler struct {
	menuItemService *service.MenuItemService
	mediaService    *service.MediaService
}

func NewMenuItemHandler(menuItemService *service.MenuItemService, mediaService *service.MediaService) *MenuItemHandler {
	return &MenuItemHandler{
		menuItemService: menuItemService,
		mediaService:    mediaService,
	}
}

// uploadFileField is a helper that uploads a file from a form field and returns its URL.
// Returns empty string if no file is present for the given field name.
func (h *MenuItemHandler) uploadFileField(c *gin.Context, fieldName, fileType string) (string, error) {
	fileHeader, err := c.FormFile(fieldName)
	if err != nil {
		return "", nil // no file provided — not an error
	}

	file, err := fileHeader.Open()
	if err != nil {
		return "", err
	}
	defer file.Close()

	return h.mediaService.UploadMedia(c.Request.Context(), file, fileType)
}

// Create godoc
// @Summary      Create menu item
// @Description  Create a new menu item (admin/superadmin only). Accepts multipart form-data with optional image and video files.
// @Tags         Menu Items
// @Accept       multipart/form-data
// @Produce      json
// @Param        hotel_id       formData  string   true   "Hotel ID (UUID)"
// @Param        category_id    formData  string   true   "Category ID (UUID)"
// @Param        chef_id        formData  string   false  "Chef ID (UUID)"
// @Param        name_en        formData  string   true   "Name (English)"
// @Param        name_am        formData  string   false  "Name (Amharic)"
// @Param        description_en formData  string   false  "Description (English)"
// @Param        description_am formData  string   false  "Description (Amharic)"
// @Param        price          formData  number   true   "Price"
// @Param        is_special     formData  boolean  false  "Is special item"
// @Param        is_available   formData  boolean  false  "Is available (default: true)"
// @Param        image          formData  file     false  "Menu item image"
// @Param        video          formData  file     false  "Menu item video"
// @Success      201            {object}  utils.Response{data=domain.MenuItem}
// @Failure      400            {object}  utils.Response
// @Failure      401            {object}  utils.Response
// @Failure      500            {object}  utils.Response
// @Security     BearerAuth
// @Router       /menu-items [post]
func (h *MenuItemHandler) Create(c *gin.Context) {
	// Parse required UUID fields
	hotelID, err := uuid.Parse(c.PostForm("hotel_id"))
	if err != nil {
		utils.BadRequestResponse(c, "Valid hotel_id is required")
		return
	}
	categoryID, err := uuid.Parse(c.PostForm("category_id"))
	if err != nil {
		utils.BadRequestResponse(c, "Valid category_id is required")
		return
	}

	nameEN := c.PostForm("name_en")
	if nameEN == "" {
		utils.BadRequestResponse(c, "name_en is required")
		return
	}

	priceStr := c.PostForm("price")
	price, err := strconv.ParseFloat(priceStr, 64)
	if err != nil || price <= 0 {
		utils.BadRequestResponse(c, "Valid price greater than 0 is required")
		return
	}

	req := domain.CreateMenuItemRequest{
		HotelID:       hotelID,
		CategoryID:    categoryID,
		NameEN:        nameEN,
		NameAM:        c.PostForm("name_am"),
		DescriptionEN: c.PostForm("description_en"),
		DescriptionAM: c.PostForm("description_am"),
		Price:         price,
	}

	// Optional chef_id
	if chefIDStr := c.PostForm("chef_id"); chefIDStr != "" {
		chefID, err := uuid.Parse(chefIDStr)
		if err != nil {
			utils.BadRequestResponse(c, "Invalid chef_id format")
			return
		}
		req.ChefID = &chefID
	}

	// Optional boolean fields
	if v := c.PostForm("is_special"); v != "" {
		req.IsSpecial = strings.EqualFold(v, "true") || v == "1"
	}
	if v := c.PostForm("is_available"); v != "" {
		b := strings.EqualFold(v, "true") || v == "1"
		req.IsAvailable = &b
	}

	// Handle optional image file upload
	if imageURL, err := h.uploadFileField(c, "image", "image"); err != nil {
		utils.InternalErrorResponse(c, "Image upload failed: "+err.Error())
		return
	} else if imageURL != "" {
		req.ImageURL = imageURL
	}

	// Handle optional video file upload
	if videoURL, err := h.uploadFileField(c, "video", "video"); err != nil {
		utils.InternalErrorResponse(c, "Video upload failed: "+err.Error())
		return
	} else if videoURL != "" {
		req.VideoURL = videoURL
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
// @Description  Get a menu item's details (category, chef, ingredients) by its UUID
// @Tags         Menu Items
// @Produce      json
// @Param        id   path      string  true  "Menu Item ID (UUID)"
// @Success      200  {object}  utils.Response{data=domain.MenuItemDetail}
// @Failure      400  {object}  utils.Response
// @Failure      404  {object}  utils.Response
// @Router       /menu-items/{id} [get]
func (h *MenuItemHandler) GetByID(c *gin.Context) {
	id, err := uuid.Parse(c.Param("id"))
	if err != nil {
		utils.BadRequestResponse(c, "Invalid menu item ID")
		return
	}
	item, err := h.menuItemService.GetDetailByID(c.Request.Context(), id)
	if err != nil {
		utils.NotFoundResponse(c, "Menu item not found")
		return
	}
	utils.OKResponse(c, "Menu item retrieved", item)
}

// GetBySlug godoc
// @Summary      Get menu item by slug
// @Description  Get a menu item's details (category, chef, ingredients) by its URL-friendly slug
// @Tags         Menu
// @Produce      json
// @Param        slug  path      string  true  "Menu item slug"
// @Success      200   {object}  utils.Response{data=domain.MenuItemDetail}
// @Failure      404   {object}  utils.Response
// @Router       /menu/menu-items/slug/{slug} [get]
func (h *MenuItemHandler) GetBySlug(c *gin.Context) {
	slug := c.Param("slug")
	item, err := h.menuItemService.GetDetailBySlug(c.Request.Context(), slug)
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
// @Description  Update a menu item's details (admin/superadmin only). Accepts multipart form-data with optional image and video files.
// @Tags         Menu Items
// @Accept       multipart/form-data
// @Produce      json
// @Param        id             path      string   true   "Menu Item ID (UUID)"
// @Param        category_id    formData  string   false  "Category ID (UUID)"
// @Param        chef_id        formData  string   false  "Chef ID (UUID)"
// @Param        name_en        formData  string   false  "Name (English)"
// @Param        name_am        formData  string   false  "Name (Amharic)"
// @Param        description_en formData  string   false  "Description (English)"
// @Param        description_am formData  string   false  "Description (Amharic)"
// @Param        price          formData  number   false  "Price"
// @Param        is_special     formData  boolean  false  "Is special item"
// @Param        is_available   formData  boolean  false  "Is available"
// @Param        image          formData  file     false  "Menu item image"
// @Param        video          formData  file     false  "Menu item video"
// @Success      200            {object}  utils.Response{data=domain.MenuItem}
// @Failure      400            {object}  utils.Response
// @Failure      401            {object}  utils.Response
// @Failure      500            {object}  utils.Response
// @Security     BearerAuth
// @Router       /menu-items/{id} [put]
func (h *MenuItemHandler) Update(c *gin.Context) {
	id, err := uuid.Parse(c.Param("id"))
	if err != nil {
		utils.BadRequestResponse(c, "Invalid menu item ID")
		return
	}

	var req domain.UpdateMenuItemRequest

	if v := c.PostForm("category_id"); v != "" {
		catID, err := uuid.Parse(v)
		if err != nil {
			utils.BadRequestResponse(c, "Invalid category_id format")
			return
		}
		req.CategoryID = &catID
	}
	if v := c.PostForm("chef_id"); v != "" {
		chefID, err := uuid.Parse(v)
		if err != nil {
			utils.BadRequestResponse(c, "Invalid chef_id format")
			return
		}
		req.ChefID = &chefID
	}
	if v := c.PostForm("name_en"); v != "" {
		req.NameEN = &v
	}
	if v := c.PostForm("name_am"); v != "" {
		req.NameAM = &v
	}
	if v := c.PostForm("description_en"); v != "" {
		req.DescriptionEN = &v
	}
	if v := c.PostForm("description_am"); v != "" {
		req.DescriptionAM = &v
	}
	if v := c.PostForm("price"); v != "" {
		p, err := strconv.ParseFloat(v, 64)
		if err != nil {
			utils.BadRequestResponse(c, "Invalid price format")
			return
		}
		req.Price = &p
	}
	if v := c.PostForm("is_special"); v != "" {
		b := strings.EqualFold(v, "true") || v == "1"
		req.IsSpecial = &b
	}
	if v := c.PostForm("is_available"); v != "" {
		b := strings.EqualFold(v, "true") || v == "1"
		req.IsAvailable = &b
	}

	// Handle optional image file upload
	if imageURL, err := h.uploadFileField(c, "image", "image"); err != nil {
		utils.InternalErrorResponse(c, "Image upload failed: "+err.Error())
		return
	} else if imageURL != "" {
		req.ImageURL = &imageURL
	}

	// Handle optional video file upload
	if videoURL, err := h.uploadFileField(c, "video", "video"); err != nil {
		utils.InternalErrorResponse(c, "Video upload failed: "+err.Error())
		return
	} else if videoURL != "" {
		req.VideoURL = &videoURL
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
