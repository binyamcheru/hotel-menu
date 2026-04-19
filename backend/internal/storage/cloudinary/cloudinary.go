package cloudinary

import (
	"fmt"

	cld "github.com/cloudinary/cloudinary-go/v2"
)

// CloudinaryStorage implements the storage.Storage interface
// using Cloudinary as the backing media store.
type CloudinaryStorage struct {
	Client *cld.Cloudinary
}

// NewCloudinaryStorage creates a new CloudinaryStorage instance from
// the provided credentials. Returns an error if initialization fails.
func NewCloudinaryStorage(cloudName, apiKey, apiSecret string) (*CloudinaryStorage, error) {
	c, err := cld.NewFromParams(cloudName, apiKey, apiSecret)
	if err != nil {
		return nil, fmt.Errorf("cloudinary init failed: %w", err)
	}

	return &CloudinaryStorage{Client: c}, nil
}