package service

import (
	"context"
	"mime/multipart"

	"backend/internal/storage"
)

// MediaService provides a clean abstraction over the storage layer
// for all media upload and deletion operations.
type MediaService struct {
	storage storage.Storage
}

// NewMediaService creates a new MediaService with the given storage backend.
func NewMediaService(s storage.Storage) *MediaService {
	return &MediaService{storage: s}
}

// UploadMedia uploads a file to the storage backend and returns the public URL.
// fileType should be "image" or "video".
func (m *MediaService) UploadMedia(ctx context.Context, file multipart.File, fileType string) (string, error) {
	return m.storage.Upload(ctx, file, fileType)
}

// DeleteMedia removes a media resource from the storage backend by its public ID.
func (m *MediaService) DeleteMedia(ctx context.Context, publicID string) error {
	return m.storage.Delete(ctx, publicID)
}