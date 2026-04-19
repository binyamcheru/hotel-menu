package cloudinary

import (
	"context"
	"fmt"
	"mime/multipart"

	"github.com/cloudinary/cloudinary-go/v2/api/uploader"
)

// Upload uploads a file to Cloudinary and returns the secure URL.
// Files are organized into subfolders based on fileType (image/video).
func (c *CloudinaryStorage) Upload(ctx context.Context, file multipart.File, fileType string) (string, error) {
	folder := "hotel-menu/images"
	resourceType := "image"

	if fileType == "video" {
		folder = "hotel-menu/videos"
		resourceType = "video"
	}

	params := uploader.UploadParams{
		Folder:       folder,
		ResourceType: resourceType,
	}

	res, err := c.Client.Upload.Upload(ctx, file, params)
	if err != nil {
		return "", fmt.Errorf("cloudinary upload failed: %w", err)
	}

	return res.SecureURL, nil
}

// Delete removes a resource from Cloudinary by its public ID.
func (c *CloudinaryStorage) Delete(ctx context.Context, publicID string) error {
	_, err := c.Client.Upload.Destroy(ctx, uploader.DestroyParams{
		PublicID: publicID,
	})
	if err != nil {
		return fmt.Errorf("cloudinary delete failed: %w", err)
	}

	return nil
}