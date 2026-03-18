package handler

import (
	"backend/internal/service"
	"backend/internal/utils"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)

type AnalyticsHandler struct {
	analyticsService *service.AnalyticsService
}

func NewAnalyticsHandler(analyticsService *service.AnalyticsService) *AnalyticsHandler {
	return &AnalyticsHandler{analyticsService: analyticsService}
}

// RecordScan godoc
// @Summary      Record hotel QR scan
// @Tags         Menu
// @Param        id   path      string  true  "Hotel ID"
// @Success      201  {object}  utils.Response
// @Failure      400  {object}  utils.Response
// @Router       /menu/hotels/{id}/scan [post]
func (h *AnalyticsHandler) RecordScan(c *gin.Context) {
	hotelID, err := uuid.Parse(c.Param("id"))
	if err != nil {
		utils.BadRequestResponse(c, "Invalid hotel ID")
		return
	}
	if err := h.analyticsService.RecordHotelScan(c.Request.Context(), hotelID); err != nil {
		utils.InternalErrorResponse(c, err.Error())
		return
	}
	utils.CreatedResponse(c, "Scan recorded", nil)
}

// RecordMenuView godoc
// @Summary      Record menu item view
// @Tags         Menu
// @Param        id            path  string  true  "Hotel ID"
// @Param        menu_item_id  path  string  true  "Menu Item ID"
// @Success      201  {object}  utils.Response
// @Failure      400  {object}  utils.Response
// @Router       /menu/hotels/{id}/menu-items/{menu_item_id}/view [post]
func (h *AnalyticsHandler) RecordMenuView(c *gin.Context) {
	hotelID, err := uuid.Parse(c.Param("id"))
	if err != nil {
		utils.BadRequestResponse(c, "Invalid hotel ID")
		return
	}
	menuItemID, err := uuid.Parse(c.Param("menu_item_id"))
	if err != nil {
		utils.BadRequestResponse(c, "Invalid menu item ID")
		return
	}
	if err := h.analyticsService.RecordMenuView(c.Request.Context(), hotelID, menuItemID); err != nil {
		utils.InternalErrorResponse(c, err.Error())
		return
	}
	utils.CreatedResponse(c, "View recorded", nil)
}

// GetSummary godoc
// @Summary      Get analytics summary
// @Tags         Analytics
// @Param        id   path  string  true  "Hotel ID"
// @Success      200  {object}  utils.Response
// @Failure      400  {object}  utils.Response
// @Security     BearerAuth
// @Router       /hotels/{id}/analytics [get]
func (h *AnalyticsHandler) GetSummary(c *gin.Context) {
	hotelID, err := uuid.Parse(c.Param("id"))
	if err != nil {
		utils.BadRequestResponse(c, "Invalid hotel ID")
		return
	}
	summary, err := h.analyticsService.GetSummary(c.Request.Context(), hotelID)
	if err != nil {
		utils.InternalErrorResponse(c, err.Error())
		return
	}
	utils.OKResponse(c, "Analytics summary", summary)
}
