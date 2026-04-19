package handler

import (
	"fmt"
	"log"
	"net/http"
	"strings"

	"backend/internal/config"
	"backend/internal/domain"
	"backend/internal/service"
	"backend/internal/utils"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)

type HotelHandler struct {
	hotelService *service.HotelService
	mediaService *service.MediaService
	cfg          *config.Config
}

func NewHotelHandler(hotelService *service.HotelService, mediaService *service.MediaService, cfg *config.Config) *HotelHandler {
	return &HotelHandler{
		hotelService: hotelService,
		mediaService: mediaService,
		cfg:          cfg,
	}
}

// Create godoc
// @Summary      Create hotel
// @Description  Create a new hotel (superadmin only). Accepts multipart form-data with an optional logo file.
// @Tags         Hotels
// @Accept       multipart/form-data
// @Produce      json
// @Param        name              formData  string  true   "Hotel name"
// @Param        address           formData  string  false  "Hotel address"
// @Param        phone             formData  string  false  "Hotel phone"
// @Param        language_settings formData  string  false  "Language settings (default: en)"
// @Param        logo              formData  file    false  "Hotel logo image"
// @Success      201               {object}  utils.Response{data=domain.Hotel}
// @Failure      400               {object}  utils.Response
// @Failure      401               {object}  utils.Response
// @Failure      500               {object}  utils.Response
// @Security     BearerAuth
// @Router       /hotels [post]
func (h *HotelHandler) Create(c *gin.Context) {
	name := c.PostForm("name")
	if name == "" {
		utils.BadRequestResponse(c, "name is required")
		return
	}

	req := domain.CreateHotelRequest{
		Name:             name,
		Address:          c.PostForm("address"),
		Phone:            c.PostForm("phone"),
		LanguageSettings: c.PostForm("language_settings"),
	}

	// Handle optional logo file upload
	if fileHeader, err := c.FormFile("logo"); err == nil {
		file, err := fileHeader.Open()
		if err != nil {
			utils.InternalErrorResponse(c, "Failed to open logo file")
			return
		}
		defer file.Close()

		url, err := h.mediaService.UploadMedia(c.Request.Context(), file, "image")
		if err != nil {
			utils.InternalErrorResponse(c, "Logo upload failed: "+err.Error())
			return
		}
		req.Logo = url
	}

	hotel, err := h.hotelService.Create(c.Request.Context(), req)
	if err != nil {
		utils.InternalErrorResponse(c, err.Error())
		return
	}
	utils.CreatedResponse(c, "Hotel created successfully", hotel)
}

// GetByID godoc
// @Summary      Get hotel by ID
// @Description  Get a hotel's details by its UUID
// @Tags         Menu
// @Produce      json
// @Param        id   path      string  true  "Hotel ID (UUID)"
// @Success      200  {object}  utils.Response{data=domain.Hotel}
// @Failure      400  {object}  utils.Response
// @Failure      404  {object}  utils.Response
// @Router       /menu/hotels/{id} [get]
func (h *HotelHandler) GetByID(c *gin.Context) {
	id, err := uuid.Parse(c.Param("id"))
	if err != nil {
		utils.BadRequestResponse(c, "Invalid hotel ID")
		return
	}
	hotel, err := h.hotelService.GetByID(c.Request.Context(), id)
	if err != nil {
		utils.NotFoundResponse(c, "Hotel not found")
		return
	}
	utils.OKResponse(c, "Hotel retrieved", hotel)
}

// GetAll godoc
// @Summary      List all hotels
// @Description  Get all hotels (admin/superadmin only)
// @Tags         Hotels
// @Produce      json
// @Success      200  {object}  utils.Response{data=[]domain.Hotel}
// @Failure      401  {object}  utils.Response
// @Failure      500  {object}  utils.Response
// @Security     BearerAuth
// @Router       /hotels [get]
func (h *HotelHandler) GetAll(c *gin.Context) {
	hotels, err := h.hotelService.GetAll(c.Request.Context())
	if err != nil {
		utils.InternalErrorResponse(c, err.Error())
		return
	}
	utils.OKResponse(c, "Hotels retrieved", hotels)
}

// Update godoc
// @Summary      Update hotel
// @Description  Update a hotel's details (admin/superadmin only). Accepts multipart form-data with an optional logo file.
// @Tags         Hotels
// @Accept       multipart/form-data
// @Produce      json
// @Param        id                path      string  true   "Hotel ID (UUID)"
// @Param        name              formData  string  false  "Hotel name"
// @Param        address           formData  string  false  "Hotel address"
// @Param        phone             formData  string  false  "Hotel phone"
// @Param        language_settings formData  string  false  "Language settings"
// @Param        logo              formData  file    false  "Hotel logo image"
// @Success      200               {object}  utils.Response{data=domain.Hotel}
// @Failure      400               {object}  utils.Response
// @Failure      401               {object}  utils.Response
// @Failure      500               {object}  utils.Response
// @Security     BearerAuth
// @Router       /hotels/{id} [put]
func (h *HotelHandler) Update(c *gin.Context) {
	id, err := uuid.Parse(c.Param("id"))
	if err != nil {
		utils.BadRequestResponse(c, "Invalid hotel ID")
		return
	}

	var req domain.UpdateHotelRequest

	if v := c.PostForm("name"); v != "" {
		req.Name = &v
	}
	if v := c.PostForm("address"); v != "" {
		req.Address = &v
	}
	if v := c.PostForm("phone"); v != "" {
		req.Phone = &v
	}
	if v := c.PostForm("language_settings"); v != "" {
		req.LanguageSettings = &v
	}

	// Handle optional logo file upload
	if fileHeader, err := c.FormFile("logo"); err == nil {
		file, err := fileHeader.Open()
		if err != nil {
			utils.InternalErrorResponse(c, "Failed to open logo file")
			return
		}
		defer file.Close()

		contentType := fileHeader.Header.Get("Content-Type")
		if !strings.HasPrefix(contentType, "image") {
			utils.BadRequestResponse(c, "Logo must be an image file")
			return
		}

		url, err := h.mediaService.UploadMedia(c.Request.Context(), file, "image")
		if err != nil {
			utils.InternalErrorResponse(c, "Logo upload failed: "+err.Error())
			return
		}
		req.Logo = &url
	}

	hotel, err := h.hotelService.Update(c.Request.Context(), id, req)
	if err != nil {
		utils.InternalErrorResponse(c, err.Error())
		return
	}
	utils.OKResponse(c, "Hotel updated", hotel)
}

// Delete godoc
// @Summary      Delete hotel
// @Description  Delete a hotel (superadmin only)
// @Tags         Hotels
// @Produce      json
// @Param        id   path      string  true  "Hotel ID (UUID)"
// @Success      200  {object}  utils.Response
// @Failure      400  {object}  utils.Response
// @Failure      401  {object}  utils.Response
// @Failure      500  {object}  utils.Response
// @Security     BearerAuth
// @Router       /hotels/{id} [delete]
func (h *HotelHandler) Delete(c *gin.Context) {
	id, err := uuid.Parse(c.Param("id"))
	if err != nil {
		utils.BadRequestResponse(c, "Invalid hotel ID")
		return
	}
	if err := h.hotelService.Delete(c.Request.Context(), id); err != nil {
		utils.InternalErrorResponse(c, err.Error())
		return
	}
	utils.OKResponse(c, "Hotel deleted", nil)
}

// QRCode godoc
// @Summary      Generate hotel QR code
// @Description  Generate a QR code for the hotel menu
// @Tags         Hotels
// @Produce      png
// @Param        id   path      string  true  "Hotel ID (UUID)"
// @Success      200  {string}  string  "QR code PNG"
// @Failure      400  {object}  utils.Response
// @Failure      500  {object}  utils.Response
// @Router       /hotels/{id}/qrcode [get]
func (h *HotelHandler) QRCode(c *gin.Context) {
	hotelID, err := uuid.Parse(c.Param("id"))
	log.Println("QR CODE HIT")
	if err != nil {
		utils.BadRequestResponse(c, "Invalid hotel ID")
		return
	}

	_, err = h.hotelService.GetByID(c.Request.Context(), hotelID)
	if err != nil {
		utils.NotFoundResponse(c, "Hotel not found")
		return
	}

	url := fmt.Sprintf("%s/menu/%s", h.cfg.FrontendURL, hotelID.String())

	png, err := utils.GenerateQRCode(url, 256)
	if err != nil {
		utils.InternalErrorResponse(c, "QR code generation failed")
		return
	}

	c.Data(http.StatusOK, "image/png", png)
}