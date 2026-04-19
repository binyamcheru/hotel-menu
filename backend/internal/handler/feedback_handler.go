package handler

import (
	"backend/internal/domain"
	"backend/internal/service"
	"backend/internal/utils"
	"errors"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)

type FeedbackHandler struct {
	feedbackService *service.FeedbackService
}

func NewFeedbackHandler(feedbackService *service.FeedbackService) *FeedbackHandler {
	return &FeedbackHandler{feedbackService: feedbackService}
}

// Create godoc
// @Summary      Submit feedback
// @Description  Submit feedback for a menu item
// @Tags         Menu
// @Accept       json
// @Produce      json
// @Param        request  body      domain.CreateFeedbackRequest  true  "Feedback data"
// @Success      201      {object}  utils.Response{data=domain.Feedback}
// @Failure      400      {object}  utils.Response
// @Failure      500      {object}  utils.Response
// @Router       /menu/feedback [post]
func (h *FeedbackHandler) Create(c *gin.Context) {
	var req domain.CreateFeedbackRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		utils.BadRequestResponse(c, err.Error())
		return
	}

	// Get fingerprint from middleware
	fp, exists := c.Get("fingerprint")
	if !exists {
		utils.InternalErrorResponse(c, "fingerprint missing")
		return
	}
	req.Fingerprint = fp.(string)

	fb, err := h.feedbackService.Create(c.Request.Context(), req)
	if err != nil {
		if errors.Is(err, domain.ErrAlreadySubmittedFeedback) {
			utils.BadRequestResponse(c, "You have already submitted feedback for this item")
			return
		}
		utils.InternalErrorResponse(c, err.Error())
		return
	}
	utils.CreatedResponse(c, "Feedback created", fb)
}

// GetByMenuItemID godoc
// @Summary      List feedback for a menu item
// @Description  Get all feedback entries for a specific menu item (public)
// @Tags         Menu
// @Produce      json
// @Param        id   path      string  true  "Menu Item ID (UUID)"
// @Success      200  {object}  utils.Response{data=[]domain.Feedback}
// @Failure      400  {object}  utils.Response
// @Failure      500  {object}  utils.Response
// @Router       /menu/menu-items/{id}/feedbacks [get]
func (h *FeedbackHandler) GetByMenuItemID(c *gin.Context) {
	menuItemID, err := uuid.Parse(c.Param("id"))
	if err != nil {
		utils.BadRequestResponse(c, "Invalid menu item ID")
		return
	}
	fbs, err := h.feedbackService.GetByMenuItemID(c.Request.Context(), menuItemID)
	if err != nil {
		utils.InternalErrorResponse(c, err.Error())
		return
	}
	utils.OKResponse(c, "Feedback retrieved", fbs)
}

// GetByHotelID godoc
// @Summary      List feedback by hotel
// @Description  Get all feedback for a specific hotel (admin/superadmin only)
// @Tags         Feedback
// @Produce      json
// @Param        id   path      string  true  "Hotel ID (UUID)"
// @Success      200  {object}  utils.Response{data=[]domain.Feedback}
// @Failure      400  {object}  utils.Response
// @Failure      401  {object}  utils.Response
// @Failure      500  {object}  utils.Response
// @Security     BearerAuth
// @Router       /hotels/{id}/feedback [get]
func (h *FeedbackHandler) GetByHotelID(c *gin.Context) {
	hotelID, err := uuid.Parse(c.Param("id"))
	if err != nil {
		utils.BadRequestResponse(c, "Invalid hotel ID")
		return
	}
	fbs, err := h.feedbackService.GetByHotelID(c.Request.Context(), hotelID)
	if err != nil {
		utils.InternalErrorResponse(c, err.Error())
		return
	}
	utils.OKResponse(c, "Feedback retrieved", fbs)
}

// Delete godoc
// @Summary      Delete feedback
// @Description  Delete a feedback entry (admin/superadmin only)
// @Tags         Feedback
// @Produce      json
// @Param        id   path      string  true  "Feedback ID (UUID)"
// @Success      200  {object}  utils.Response
// @Failure      400  {object}  utils.Response
// @Failure      401  {object}  utils.Response
// @Failure      500  {object}  utils.Response
// @Security     BearerAuth
// @Router       /feedback/{id} [delete]
func (h *FeedbackHandler) Delete(c *gin.Context) {
	id, err := uuid.Parse(c.Param("id"))
	if err != nil {
		utils.BadRequestResponse(c, "Invalid feedback ID")
		return
	}
	if err := h.feedbackService.Delete(c.Request.Context(), id); err != nil {
		utils.InternalErrorResponse(c, err.Error())
		return
	}
	utils.OKResponse(c, "Feedback deleted", nil)
}
