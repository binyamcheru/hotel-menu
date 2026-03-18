package middleware

import (
	"bytes"
	"context"
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/redis/go-redis/v9"
)

// cachedResponseWriter captures the response body for caching.
type cachedResponseWriter struct {
	gin.ResponseWriter
	body *bytes.Buffer
}

func (w *cachedResponseWriter) Write(b []byte) (int, error) {
	w.body.Write(b)
	return w.ResponseWriter.Write(b)
}

// CacheMiddleware caches GET request responses in Redis.
func CacheMiddleware(rdb *redis.Client, ttl time.Duration) gin.HandlerFunc {
	return func(c *gin.Context) {
		// Only cache GET requests
		if c.Request.Method != http.MethodGet {
			c.Next()
			return
		}

		// Skip if Redis is nil
		if rdb == nil {
			c.Next()
			return
		}

		key := "cache:" + c.Request.URL.RequestURI()

		// Try to get from cache
		cached, err := rdb.Get(c.Request.Context(), key).Bytes()
		if err == nil {
			c.Header("X-Cache", "HIT")
			c.Header("Content-Type", "application/json; charset=utf-8")
			c.Writer.WriteHeader(http.StatusOK)
			c.Writer.Write(cached)
			c.Abort()
			return
		}

		// Cache miss — capture the response
		c.Header("X-Cache", "MISS")
		writer := &cachedResponseWriter{
			ResponseWriter: c.Writer,
			body:           bytes.NewBufferString(""),
		}
		c.Writer = writer

		c.Next()

		// Only cache successful responses
		if c.Writer.Status() == http.StatusOK {
			rdb.Set(c.Request.Context(), key, writer.body.Bytes(), ttl)
		}
	}
}

// InvalidateCache deletes cache entries matching a pattern.
func InvalidateCache(ctx context.Context, rdb *redis.Client, pattern string) {
	if rdb == nil {
		return
	}

	iter := rdb.Scan(ctx, 0, "cache:"+pattern, 100).Iterator()
	for iter.Next(ctx) {
		rdb.Del(ctx, iter.Val())
	}
}
