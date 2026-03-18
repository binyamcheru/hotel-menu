package handler

import (
	"backend/internal/domain"
	"backend/internal/service"
	"backend/internal/utils"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"errors"
)

type RatingHandler struct {
	ratingService *service.RatingService
}

func NewRatingHandler(ratingService *service.RatingService) *RatingHandler {
	return &RatingHandler{ratingService: ratingService}
}

// Create godoc
// @Summary      Create rating
// @Description  Submit a rating for a menu item
// @Tags         Menu
// @Accept       json
// @Produce      json
// @Param        request  body      domain.CreateRatingRequest  true  "Rating data"
// @Success      201      {object}  utils.Response{data=domain.Rating}
// @Failure      400      {object}  utils.Response
// @Failure      500      {object}  utils.Response
// @Router       /menu/ratings [post]
func (h *RatingHandler) Create(c *gin.Context) {
	var req domain.CreateRatingRequest
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

	// attach fingerprint to request
	req.Fingerprint = fp.(string)
	rating, err := h.ratingService.Create(c.Request.Context(), req)
	if err != nil {
		// handle domain errors
		if errors.Is(err, domain.ErrAlreadyRated) {
			utils.BadRequestResponse(c, "You have already rated this item")
			return
		}
		if errors.Is(err, domain.ErrInvalidRating) {
			utils.BadRequestResponse(c, "Invalid rating value")
			return
		}

		utils.InternalErrorResponse(c, err.Error())
		return
	}
	utils.CreatedResponse(c, "Rating created", rating)
}

// GetByMenuItemID godoc
// @Summary      List ratings for menu item
// @Description  Get all ratings for a specific menu item
// @Tags         Menu
// @Produce      json
// @Param        id   path      string  true  "Menu Item ID (UUID)"
// @Success      200  {object}  utils.Response{data=[]domain.Rating}
// @Failure      400  {object}  utils.Response
// @Failure      500  {object}  utils.Response
// @Router       /menu/menu-items/{id}/ratings [get]
func (h *RatingHandler) GetByMenuItemID(c *gin.Context) {
	menuItemID, err := uuid.Parse(c.Param("id"))
	if err != nil {
		utils.BadRequestResponse(c, "Invalid menu item ID")
		return
	}
	ratings, err := h.ratingService.GetByMenuItemID(c.Request.Context(), menuItemID)
	if err != nil {
		utils.InternalErrorResponse(c, err.Error())
		return
	}
	utils.OKResponse(c, "Ratings retrieved", ratings)
}

// GetAverage godoc
// @Summary      Get average rating
// @Description  Get the average rating and total count for a menu item
// @Tags         Menu
// @Produce      json
// @Param        id   path      string  true  "Menu Item ID (UUID)"
// @Success      200  {object}  utils.Response
// @Failure      400  {object}  utils.Response
// @Failure      500  {object}  utils.Response
// @Router       /menu/menu-items/{id}/average-rating [get]
func (h *RatingHandler) GetAverage(c *gin.Context) {
	menuItemID, err := uuid.Parse(c.Param("id"))
	if err != nil {
		utils.BadRequestResponse(c, "Invalid menu item ID")
		return
	}
	avg, count, err := h.ratingService.GetAverage(c.Request.Context(), menuItemID)
	if err != nil {
		utils.InternalErrorResponse(c, err.Error())
		return
	}
	utils.OKResponse(c, "Average rating", gin.H{"average": avg, "count": count})
}

// Delete godoc
// @Summary      Delete rating
// @Description  Delete a rating (admin/superadmin only)
// @Tags         Ratings
// @Produce      json
// @Param        id   path      string  true  "Rating ID (UUID)"
// @Success      200  {object}  utils.Response
// @Failure      400  {object}  utils.Response
// @Failure      401  {object}  utils.Response
// @Failure      500  {object}  utils.Response
// @Security     BearerAuth
// @Router       /ratings/{id} [delete]
func (h *RatingHandler) Delete(c *gin.Context) {
	id, err := uuid.Parse(c.Param("id"))
	if err != nil {
		utils.BadRequestResponse(c, "Invalid rating ID")
		return
	}
	if err := h.ratingService.Delete(c.Request.Context(), id); err != nil {
		utils.InternalErrorResponse(c, err.Error())
		return
	}
	utils.OKResponse(c, "Rating deleted", nil)

}
