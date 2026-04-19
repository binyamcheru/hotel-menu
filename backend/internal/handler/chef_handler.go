package handler

import (
	"strings"

	"backend/internal/domain"
	"backend/internal/service"
	"backend/internal/utils"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)

type ChefHandler struct {
	chefService  *service.ChefService
	mediaService *service.MediaService
}

func NewChefHandler(chefService *service.ChefService, mediaService *service.MediaService) *ChefHandler {
	return &ChefHandler{
		chefService:  chefService,
		mediaService: mediaService,
	}
}

// Create godoc
// @Summary      Create chef
// @Description  Create a new chef profile (admin/superadmin only). Accepts multipart form-data with an optional image file.
// @Tags         Chefs
// @Accept       multipart/form-data
// @Produce      json
// @Param        hotel_id  formData  string  true   "Hotel ID (UUID)"
// @Param        name      formData  string  true   "Chef name"
// @Param        bio_en    formData  string  false  "Chef bio (English)"
// @Param        bio_am    formData  string  false  "Chef bio (Amharic)"
// @Param        image     formData  file    false  "Chef profile image"
// @Success      201       {object}  utils.Response{data=domain.Chef}
// @Failure      400       {object}  utils.Response
// @Failure      401       {object}  utils.Response
// @Failure      500       {object}  utils.Response
// @Security     BearerAuth
// @Router       /chefs [post]
func (h *ChefHandler) Create(c *gin.Context) {
	hotelIDStr := c.PostForm("hotel_id")
	hotelID, err := uuid.Parse(hotelIDStr)
	if err != nil {
		utils.BadRequestResponse(c, "Valid hotel_id is required")
		return
	}

	name := c.PostForm("name")
	if name == "" {
		utils.BadRequestResponse(c, "name is required")
		return
	}

	req := domain.CreateChefRequest{
		HotelID: hotelID,
		Name:    name,
		BioEN:   c.PostForm("bio_en"),
		BioAM:   c.PostForm("bio_am"),
	}

	// Handle optional image file upload
	if fileHeader, err := c.FormFile("image"); err == nil {
		file, err := fileHeader.Open()
		if err != nil {
			utils.InternalErrorResponse(c, "Failed to open image file")
			return
		}
		defer file.Close()

		contentType := fileHeader.Header.Get("Content-Type")
		if !strings.HasPrefix(contentType, "image") {
			utils.BadRequestResponse(c, "File must be an image")
			return
		}

		url, err := h.mediaService.UploadMedia(c.Request.Context(), file, "image")
		if err != nil {
			utils.InternalErrorResponse(c, "Image upload failed: "+err.Error())
			return
		}
		req.ImageURL = url
	}

	chef, err := h.chefService.Create(c.Request.Context(), req)
	if err != nil {
		utils.InternalErrorResponse(c, err.Error())
		return
	}
	utils.CreatedResponse(c, "Chef created", chef)
}

// GetByID godoc
// @Summary      Get chef by ID
// @Description  Get a chef's details by their UUID (admin/superadmin only)
// @Tags         Chefs
// @Produce      json
// @Param        id   path      string  true  "Chef ID (UUID)"
// @Success      200  {object}  utils.Response{data=domain.Chef}
// @Failure      400  {object}  utils.Response
// @Failure      401  {object}  utils.Response
// @Failure      404  {object}  utils.Response
// @Security     BearerAuth
// @Router       /chefs/{id} [get]
func (h *ChefHandler) GetByID(c *gin.Context) {
	id, err := uuid.Parse(c.Param("id"))
	if err != nil {
		utils.BadRequestResponse(c, "Invalid chef ID")
		return
	}
	chef, err := h.chefService.GetByID(c.Request.Context(), id)
	if err != nil {
		utils.NotFoundResponse(c, "Chef not found")
		return
	}
	utils.OKResponse(c, "Chef retrieved", chef)
}

// GetByHotelID godoc
// @Summary      List chefs by hotel
// @Description  Get all chefs for a specific hotel (admin/superadmin only)
// @Tags         Chefs
// @Produce      json
// @Param        id   path      string  true  "Hotel ID (UUID)"
// @Success      200  {object}  utils.Response{data=[]domain.Chef}
// @Failure      400  {object}  utils.Response
// @Failure      401  {object}  utils.Response
// @Failure      500  {object}  utils.Response
// @Security     BearerAuth
// @Router       /hotels/{id}/chefs [get]
func (h *ChefHandler) GetByHotelID(c *gin.Context) {
	hotelID, err := uuid.Parse(c.Param("id"))
	if err != nil {
		utils.BadRequestResponse(c, "Invalid hotel ID")
		return
	}
	chefs, err := h.chefService.GetByHotelID(c.Request.Context(), hotelID)
	if err != nil {
		utils.InternalErrorResponse(c, err.Error())
		return
	}
	utils.OKResponse(c, "Chefs retrieved", chefs)
}

// Update godoc
// @Summary      Update chef
// @Description  Update a chef's details (admin/superadmin only). Accepts multipart form-data with an optional image file.
// @Tags         Chefs
// @Accept       multipart/form-data
// @Produce      json
// @Param        id     path      string  true   "Chef ID (UUID)"
// @Param        name   formData  string  false  "Chef name"
// @Param        bio_en formData  string  false  "Chef bio (English)"
// @Param        bio_am formData  string  false  "Chef bio (Amharic)"
// @Param        image  formData  file    false  "Chef profile image"
// @Success      200    {object}  utils.Response{data=domain.Chef}
// @Failure      400    {object}  utils.Response
// @Failure      401    {object}  utils.Response
// @Failure      500    {object}  utils.Response
// @Security     BearerAuth
// @Router       /chefs/{id} [put]
func (h *ChefHandler) Update(c *gin.Context) {
	id, err := uuid.Parse(c.Param("id"))
	if err != nil {
		utils.BadRequestResponse(c, "Invalid chef ID")
		return
	}

	var req domain.UpdateChefRequest

	if v := c.PostForm("name"); v != "" {
		req.Name = &v
	}
	if v := c.PostForm("bio_en"); v != "" {
		req.BioEN = &v
	}
	if v := c.PostForm("bio_am"); v != "" {
		req.BioAM = &v
	}

	// Handle optional image file upload
	if fileHeader, err := c.FormFile("image"); err == nil {
		file, err := fileHeader.Open()
		if err != nil {
			utils.InternalErrorResponse(c, "Failed to open image file")
			return
		}
		defer file.Close()

		contentType := fileHeader.Header.Get("Content-Type")
		if !strings.HasPrefix(contentType, "image") {
			utils.BadRequestResponse(c, "File must be an image")
			return
		}

		url, err := h.mediaService.UploadMedia(c.Request.Context(), file, "image")
		if err != nil {
			utils.InternalErrorResponse(c, "Image upload failed: "+err.Error())
			return
		}
		req.ImageURL = &url
	}

	chef, err := h.chefService.Update(c.Request.Context(), id, req)
	if err != nil {
		utils.InternalErrorResponse(c, err.Error())
		return
	}
	utils.OKResponse(c, "Chef updated", chef)
}

// Delete godoc
// @Summary      Delete chef
// @Description  Delete a chef profile (admin/superadmin only)
// @Tags         Chefs
// @Produce      json
// @Param        id   path      string  true  "Chef ID (UUID)"
// @Success      200  {object}  utils.Response
// @Failure      400  {object}  utils.Response
// @Failure      401  {object}  utils.Response
// @Failure      500  {object}  utils.Response
// @Security     BearerAuth
// @Router       /chefs/{id} [delete]
func (h *ChefHandler) Delete(c *gin.Context) {
	id, err := uuid.Parse(c.Param("id"))
	if err != nil {
		utils.BadRequestResponse(c, "Invalid chef ID")
		return
	}
	if err := h.chefService.Delete(c.Request.Context(), id); err != nil {
		utils.InternalErrorResponse(c, err.Error())
		return
	}
	utils.OKResponse(c, "Chef deleted", nil)
}
