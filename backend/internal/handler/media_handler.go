package handler

import (
	"strings"

	"backend/internal/service"
	"backend/internal/utils"

	"github.com/gin-gonic/gin"
)

// MediaHandler handles HTTP requests for media upload operations.
type MediaHandler struct {
	mediaService *service.MediaService
}

// NewMediaHandler creates a new MediaHandler with the given MediaService.
func NewMediaHandler(mediaService *service.MediaService) *MediaHandler {
	return &MediaHandler{mediaService: mediaService}
}

// Upload godoc
// @Summary      Upload media file
// @Description  Upload an image or video file to cloud storage and get the public URL back
// @Tags         Media
// @Accept       multipart/form-data
// @Produce      json
// @Param        file  formData  file  true  "Media file (image or video)"
// @Success      200   {object}  utils.Response{data=object{url=string}}
// @Failure      400   {object}  utils.Response
// @Failure      401   {object}  utils.Response
// @Failure      500   {object}  utils.Response
// @Security     BearerAuth
// @Router       /upload [post]
func (h *MediaHandler) Upload(c *gin.Context) {
	fileHeader, err := c.FormFile("file")
	if err != nil {
		utils.BadRequestResponse(c, "File is required")
		return
	}

	file, err := fileHeader.Open()
	if err != nil {
		utils.InternalErrorResponse(c, "Failed to open uploaded file")
		return
	}
	defer file.Close()

	// Detect file type from Content-Type header
	fileType := "image"
	contentType := fileHeader.Header.Get("Content-Type")
	if strings.HasPrefix(contentType, "video") {
		fileType = "video"
	}

	url, err := h.mediaService.UploadMedia(c.Request.Context(), file, fileType)
	if err != nil {
		utils.InternalErrorResponse(c, "Media upload failed: "+err.Error())
		return
	}

	utils.OKResponse(c, "Media uploaded successfully", gin.H{
		"url": url,
	})
}
