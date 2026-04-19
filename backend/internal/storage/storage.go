package storage

import (
	"context"
	"mime/multipart"
)

// Storage defines the contract for media storage operations.
// Implementations must handle upload and deletion of media files.
type Storage interface {
	Upload(ctx context.Context, file multipart.File, fileType string) (string, error)
	Delete(ctx context.Context, publicID string) error
}