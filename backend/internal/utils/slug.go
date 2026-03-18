package utils

import (
	"fmt"
	"regexp"
	"strings"
	"time"
)

func GenerateSlug(name string) string {
	slug := strings.ToLower(name)

	reg := regexp.MustCompile(`[^a-z0-9\s-]`)
	slug = reg.ReplaceAllString(slug, "")

	slug = strings.TrimSpace(slug)
	slug = regexp.MustCompile(`[\s-]+`).ReplaceAllString(slug, "-")

	// append timestamp to avoid collision
	slug = fmt.Sprintf("%s-%d", slug, time.Now().UnixNano()%100000)

	return slug
}
