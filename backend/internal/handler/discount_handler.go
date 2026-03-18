package handler

import (
	"backend/internal/domain"
	"backend/internal/service"
	"backend/internal/utils"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)

type DiscountHandler struct {
	discountService *service.DiscountService
}

func NewDiscountHandler(discountService *service.DiscountService) *DiscountHandler {
	return &DiscountHandler{discountService: discountService}
}

// Create godoc
// @Summary      Create discount
// @Description  Create a new discount for a menu item (admin/superadmin only)
// @Tags         Discounts
// @Accept       json
// @Produce      json
// @Param        request  body      domain.CreateDiscountRequest  true  "Discount data"
// @Success      201      {object}  utils.Response{data=domain.Discount}
// @Failure      400      {object}  utils.Response
// @Failure      401      {object}  utils.Response
// @Failure      500      {object}  utils.Response
// @Security     BearerAuth
// @Router       /discounts [post]
func (h *DiscountHandler) Create(c *gin.Context) {
	var req domain.CreateDiscountRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		utils.BadRequestResponse(c, err.Error())
		return
	}
	discount, err := h.discountService.Create(c.Request.Context(), req)
	if err != nil {
		utils.InternalErrorResponse(c, err.Error())
		return
	}
	utils.CreatedResponse(c, "Discount created", discount)
}

// GetByID godoc
// @Summary      Get discount by ID
// @Description  Get a discount's details by its UUID
// @Tags         Discounts
// @Produce      json
// @Param        id   path      string  true  "Discount ID (UUID)"
// @Success      200  {object}  utils.Response{data=domain.Discount}
// @Failure      400  {object}  utils.Response
// @Failure      401  {object}  utils.Response
// @Failure      404  {object}  utils.Response
// @Security     BearerAuth
// @Router       /discounts/{id} [get]
func (h *DiscountHandler) GetByID(c *gin.Context) {
	id, err := uuid.Parse(c.Param("id"))
	if err != nil {
		utils.BadRequestResponse(c, "Invalid discount ID")
		return
	}
	discount, err := h.discountService.GetByID(c.Request.Context(), id)
	if err != nil {
		utils.NotFoundResponse(c, "Discount not found")
		return
	}
	utils.OKResponse(c, "Discount retrieved", discount)
}

// GetByHotelID godoc
// @Summary      List discounts by hotel
// @Description  Get all discounts for a specific hotel (admin/superadmin only)
// @Tags         Discounts
// @Produce      json
// @Param        id   path      string  true  "Hotel ID (UUID)"
// @Success      200  {object}  utils.Response{data=[]domain.Discount}
// @Failure      400  {object}  utils.Response
// @Failure      401  {object}  utils.Response
// @Failure      500  {object}  utils.Response
// @Security     BearerAuth
// @Router       /hotels/{id}/discounts [get]
func (h *DiscountHandler) GetByHotelID(c *gin.Context) {
	hotelID, err := uuid.Parse(c.Param("id"))
	if err != nil {
		utils.BadRequestResponse(c, "Invalid hotel ID")
		return
	}
	discounts, err := h.discountService.GetByHotelID(c.Request.Context(), hotelID)
	if err != nil {
		utils.InternalErrorResponse(c, err.Error())
		return
	}
	utils.OKResponse(c, "Discounts retrieved", discounts)
}

// Update godoc
// @Summary      Update discount
// @Description  Update a discount's details (admin/superadmin only)
// @Tags         Discounts
// @Accept       json
// @Produce      json
// @Param        id       path      string                        true  "Discount ID (UUID)"
// @Param        request  body      domain.UpdateDiscountRequest  true  "Discount update data"
// @Success      200      {object}  utils.Response{data=domain.Discount}
// @Failure      400      {object}  utils.Response
// @Failure      401      {object}  utils.Response
// @Failure      500      {object}  utils.Response
// @Security     BearerAuth
// @Router       /discounts/{id} [put]
func (h *DiscountHandler) Update(c *gin.Context) {
	id, err := uuid.Parse(c.Param("id"))
	if err != nil {
		utils.BadRequestResponse(c, "Invalid discount ID")
		return
	}
	var req domain.UpdateDiscountRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		utils.BadRequestResponse(c, err.Error())
		return
	}
	discount, err := h.discountService.Update(c.Request.Context(), id, req)
	if err != nil {
		utils.InternalErrorResponse(c, err.Error())
		return
	}
	utils.OKResponse(c, "Discount updated", discount)
}

// Delete godoc
// @Summary      Delete discount
// @Description  Delete a discount (admin/superadmin only)
// @Tags         Discounts
// @Produce      json
// @Param        id   path      string  true  "Discount ID (UUID)"
// @Success      200  {object}  utils.Response
// @Failure      400  {object}  utils.Response
// @Failure      401  {object}  utils.Response
// @Failure      500  {object}  utils.Response
// @Security     BearerAuth
// @Router       /discounts/{id} [delete]
func (h *DiscountHandler) Delete(c *gin.Context) {
	id, err := uuid.Parse(c.Param("id"))
	if err != nil {
		utils.BadRequestResponse(c, "Invalid discount ID")
		return
	}
	if err := h.discountService.Delete(c.Request.Context(), id); err != nil {
		utils.InternalErrorResponse(c, err.Error())
		return
	}
	utils.OKResponse(c, "Discount deleted", nil)
}
