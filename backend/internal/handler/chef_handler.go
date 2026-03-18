package handler

import (
	"backend/internal/domain"
	"backend/internal/service"
	"backend/internal/utils"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)

type ChefHandler struct {
	chefService *service.ChefService
}

func NewChefHandler(chefService *service.ChefService) *ChefHandler {
	return &ChefHandler{chefService: chefService}
}

// Create godoc
// @Summary      Create chef
// @Description  Create a new chef profile (admin/superadmin only)
// @Tags         Chefs
// @Accept       json
// @Produce      json
// @Param        request  body      domain.CreateChefRequest  true  "Chef data"
// @Success      201      {object}  utils.Response{data=domain.Chef}
// @Failure      400      {object}  utils.Response
// @Failure      401      {object}  utils.Response
// @Failure      500      {object}  utils.Response
// @Security     BearerAuth
// @Router       /chefs [post]
func (h *ChefHandler) Create(c *gin.Context) {
	var req domain.CreateChefRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		utils.BadRequestResponse(c, err.Error())
		return
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
// @Description  Update a chef's details (admin/superadmin only)
// @Tags         Chefs
// @Accept       json
// @Produce      json
// @Param        id       path      string                    true  "Chef ID (UUID)"
// @Param        request  body      domain.UpdateChefRequest  true  "Chef update data"
// @Success      200      {object}  utils.Response{data=domain.Chef}
// @Failure      400      {object}  utils.Response
// @Failure      401      {object}  utils.Response
// @Failure      500      {object}  utils.Response
// @Security     BearerAuth
// @Router       /chefs/{id} [put]
func (h *ChefHandler) Update(c *gin.Context) {
	id, err := uuid.Parse(c.Param("id"))
	if err != nil {
		utils.BadRequestResponse(c, "Invalid chef ID")
		return
	}
	var req domain.UpdateChefRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		utils.BadRequestResponse(c, err.Error())
		return
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
