package handler

import (
	"backend/internal/domain"
	"backend/internal/service"
	"backend/internal/utils"

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
// @Tags         Menu
// @Accept       json
// @Produce      json
// @Param        request  body      domain.CreateFeedbackRequest  true  "Feedback data"
// @Success      201      {object}  utils.Response{data=domain.Feedback}
// @Failure      400      {object}  utils.Response
// @Router       /menu/feedback [post]
func (h *FeedbackHandler) Create(c *gin.Context) {
	var req domain.CreateFeedbackRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		utils.BadRequestResponse(c, err.Error())
		return
	}
	fb, err := h.feedbackService.Create(c.Request.Context(), req)
	if err != nil {
		utils.InternalErrorResponse(c, err.Error())
		return
	}
	utils.CreatedResponse(c, "Feedback created", fb)
}

// GetByHotelID godoc
// @Summary      List feedback by hotel
// @Tags         Feedback
// @Param        id   path  string  true  "Hotel ID"
// @Success      200  {object}  utils.Response{data=[]domain.Feedback}
// @Failure      400  {object}  utils.Response
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
// @Tags         Feedback
// @Param        id   path  string  true  "Feedback ID"
// @Success      200  {object}  utils.Response
// @Failure      400  {object}  utils.Response
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
