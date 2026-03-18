package middleware

import (
	"crypto/sha256"
	"encoding/hex"
	"strings"

	"github.com/gin-gonic/gin"
)

func FingerprintMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		ip := c.ClientIP()
		userAgent := c.GetHeader("User-Agent")

		raw := strings.Join([]string{ip, userAgent}, "|")

		hash := sha256.Sum256([]byte(raw))
		fingerprint := hex.EncodeToString(hash[:])

		c.Set("fingerprint", fingerprint)
		c.Next()
	}
	
}