package handler

import (
	"fmt"
	"log"
	"backend/internal/domain"
	"backend/internal/service"
	"backend/internal/utils"
	"backend/internal/config"
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)

type HotelHandler struct {
	hotelService *service.HotelService
	cfg          *config.Config
}

func NewHotelHandler(hotelService *service.HotelService, cfg *config.Config) *HotelHandler {
	return &HotelHandler{
		hotelService: hotelService,
		cfg:          cfg,
	}
}

// Create godoc
// @Summary      Create hotel
// @Description  Create a new hotel (superadmin only)
// @Tags         Hotels
// @Accept       json
// @Produce      json
// @Param        request  body      domain.CreateHotelRequest  true  "Hotel data"
// @Success      201      {object}  utils.Response{data=domain.Hotel}
// @Failure      400      {object}  utils.Response
// @Failure      401      {object}  utils.Response
// @Failure      500      {object}  utils.Response
// @Security     BearerAuth
// @Router       /hotels [post]
func (h *HotelHandler) Create(c *gin.Context) {
	var req domain.CreateHotelRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		utils.BadRequestResponse(c, err.Error())
		return
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
// @Description  Update a hotel's details (admin/superadmin only)
// @Tags         Hotels
// @Accept       json
// @Produce      json
// @Param        id       path      string                     true  "Hotel ID (UUID)"
// @Param        request  body      domain.UpdateHotelRequest  true  "Hotel update data"
// @Success      200      {object}  utils.Response{data=domain.Hotel}
// @Failure      400      {object}  utils.Response
// @Failure      401      {object}  utils.Response
// @Failure      500      {object}  utils.Response
// @Security     BearerAuth
// @Router       /hotels/{id} [put]
func (h *HotelHandler) Update(c *gin.Context) {
	id, err := uuid.Parse(c.Param("id"))
	if err != nil {
		utils.BadRequestResponse(c, "Invalid hotel ID")
		return
	}
	var req domain.UpdateHotelRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		utils.BadRequestResponse(c, err.Error())
		return
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

	// Verify hotel exists
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
